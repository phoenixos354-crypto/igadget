from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import uuid
import logging
import secrets
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Literal

import bcrypt
import jwt
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response, status
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict


# ---------- Config ----------
MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGORITHM = "HS256"
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@igadget.id")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "Admin123!")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="iGadget Service API")
api = APIRouter(prefix="/api")

logger = logging.getLogger("igadget")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")


# ---------- Helpers: password & JWT ----------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=12),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "refresh",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def set_auth_cookies(response: Response, access: str, refresh: str):
    response.set_cookie("access_token", access, httponly=True, secure=True, samesite="none", max_age=43200, path="/")
    response.set_cookie("refresh_token", refresh, httponly=True, secure=True, samesite="none", max_age=604800, path="/")


def clear_auth_cookies(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return user


# ---------- Models ----------
class RegisterBody(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = Field(min_length=1)
    phone: Optional[str] = None


class LoginBody(BaseModel):
    email: EmailStr
    password: str


class PublicUser(BaseModel):
    id: str
    email: str
    name: str
    phone: Optional[str] = None
    role: str
    created_at: str


class EstimateBody(BaseModel):
    device_type: Literal["smartphone", "tv"]
    brand: str
    model: str
    damage: str


class BookingCreateBody(BaseModel):
    service_type: Literal["on_store", "pickup_delivery", "home_service"]
    device_type: Literal["smartphone", "tv"]
    brand: str
    model: str
    damage: str
    description: Optional[str] = ""
    scheduled_date: str  # YYYY-MM-DD
    scheduled_time: str  # HH:MM
    customer_name: str
    customer_phone: str
    address: Optional[str] = ""
    city: Optional[str] = "Bojonegoro"


class StatusUpdateBody(BaseModel):
    status: Literal["received", "diagnosed", "repairing", "testing", "ready", "completed", "cancelled"]
    note: Optional[str] = ""


class DiagnosticItem(BaseModel):
    label: str
    price: int


class DiagnosticBody(BaseModel):
    problem_summary: str
    findings: str
    items: List[DiagnosticItem]
    labor_cost: int = 0
    notes: Optional[str] = ""


# ---------- Catalog (seed) ----------
CATALOG = [
    {
        "device_type": "smartphone",
        "brand": "Apple",
        "models": ["iPhone 11", "iPhone 12", "iPhone 13", "iPhone 14", "iPhone 15"],
        "damages": [
            {"key": "lcd_replacement", "label": "Ganti LCD / Layar", "base_price": 1500000},
            {"key": "battery_replacement", "label": "Ganti Baterai", "base_price": 450000},
            {"key": "charging_port", "label": "Perbaikan Port Charger", "base_price": 350000},
            {"key": "water_damage", "label": "Kena Air (Liquid Damage)", "base_price": 650000},
            {"key": "speaker_issue", "label": "Masalah Speaker / Mic", "base_price": 300000},
        ],
    },
    {
        "device_type": "smartphone",
        "brand": "Samsung",
        "models": ["Galaxy A52", "Galaxy A54", "Galaxy S21", "Galaxy S22", "Galaxy S23"],
        "damages": [
            {"key": "lcd_replacement", "label": "Ganti LCD / Layar", "base_price": 900000},
            {"key": "battery_replacement", "label": "Ganti Baterai", "base_price": 350000},
            {"key": "charging_port", "label": "Perbaikan Port Charger", "base_price": 250000},
            {"key": "water_damage", "label": "Kena Air (Liquid Damage)", "base_price": 500000},
            {"key": "speaker_issue", "label": "Masalah Speaker / Mic", "base_price": 250000},
        ],
    },
    {
        "device_type": "smartphone",
        "brand": "Xiaomi",
        "models": ["Redmi Note 10", "Redmi Note 12", "Redmi 12", "Poco X5", "Poco F5"],
        "damages": [
            {"key": "lcd_replacement", "label": "Ganti LCD / Layar", "base_price": 550000},
            {"key": "battery_replacement", "label": "Ganti Baterai", "base_price": 250000},
            {"key": "charging_port", "label": "Perbaikan Port Charger", "base_price": 200000},
            {"key": "water_damage", "label": "Kena Air (Liquid Damage)", "base_price": 400000},
            {"key": "speaker_issue", "label": "Masalah Speaker / Mic", "base_price": 200000},
        ],
    },
    {
        "device_type": "smartphone",
        "brand": "Oppo",
        "models": ["A57", "A77", "Reno 8", "Reno 10", "Find X5"],
        "damages": [
            {"key": "lcd_replacement", "label": "Ganti LCD / Layar", "base_price": 600000},
            {"key": "battery_replacement", "label": "Ganti Baterai", "base_price": 275000},
            {"key": "charging_port", "label": "Perbaikan Port Charger", "base_price": 200000},
            {"key": "water_damage", "label": "Kena Air (Liquid Damage)", "base_price": 425000},
            {"key": "speaker_issue", "label": "Masalah Speaker / Mic", "base_price": 225000},
        ],
    },
    {
        "device_type": "tv",
        "brand": "Samsung",
        "models": ['32"', '43"', '50"', '55"', '65"'],
        "damages": [
            {"key": "panel_crack", "label": "Panel Retak / Pecah", "base_price": 2500000},
            {"key": "no_display", "label": "TV Tidak Menyala", "base_price": 700000},
            {"key": "backlight", "label": "Backlight Mati", "base_price": 850000},
            {"key": "sound_issue", "label": "Masalah Audio", "base_price": 400000},
            {"key": "smart_feature", "label": "Smart TV / Software", "base_price": 300000},
        ],
    },
    {
        "device_type": "tv",
        "brand": "LG",
        "models": ['32"', '43"', '49"', '55"', '65"'],
        "damages": [
            {"key": "panel_crack", "label": "Panel Retak / Pecah", "base_price": 2400000},
            {"key": "no_display", "label": "TV Tidak Menyala", "base_price": 700000},
            {"key": "backlight", "label": "Backlight Mati", "base_price": 800000},
            {"key": "sound_issue", "label": "Masalah Audio", "base_price": 400000},
            {"key": "smart_feature", "label": "Smart TV / Software", "base_price": 300000},
        ],
    },
    {
        "device_type": "tv",
        "brand": "Sony",
        "models": ['43"', '50"', '55"', '65"', '75"'],
        "damages": [
            {"key": "panel_crack", "label": "Panel Retak / Pecah", "base_price": 3200000},
            {"key": "no_display", "label": "TV Tidak Menyala", "base_price": 900000},
            {"key": "backlight", "label": "Backlight Mati", "base_price": 1000000},
            {"key": "sound_issue", "label": "Masalah Audio", "base_price": 500000},
            {"key": "smart_feature", "label": "Smart TV / Software", "base_price": 350000},
        ],
    },
]

SERVICE_FEES = {
    "on_store": 0,
    "pickup_delivery": 35000,
    "home_service": 75000,
}


STATUS_FLOW = ["received", "diagnosed", "repairing", "testing", "ready", "completed"]


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _gen_tracking_code() -> str:
    return "IGS-" + secrets.token_hex(3).upper()


# ---------- Auth endpoints ----------
@api.post("/auth/register")
async def register(body: RegisterBody, response: Response):
    email = body.email.lower().strip()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email sudah terdaftar")
    user_id = str(uuid.uuid4())
    doc = {
        "id": user_id,
        "email": email,
        "password_hash": hash_password(body.password),
        "name": body.name.strip(),
        "phone": body.phone,
        "role": "customer",
        "created_at": _now_iso(),
    }
    await db.users.insert_one(doc)
    access = create_access_token(user_id, email, "customer")
    refresh = create_refresh_token(user_id)
    set_auth_cookies(response, access, refresh)
    return {
        "id": user_id, "email": email, "name": body.name, "phone": body.phone,
        "role": "customer", "created_at": doc["created_at"], "token": access,
    }


@api.post("/auth/login")
async def login(body: LoginBody, response: Response):
    email = body.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Email atau password salah")
    access = create_access_token(user["id"], user["email"], user["role"])
    refresh = create_refresh_token(user["id"])
    set_auth_cookies(response, access, refresh)
    return {
        "id": user["id"], "email": user["email"], "name": user["name"],
        "phone": user.get("phone"), "role": user["role"],
        "created_at": user["created_at"], "token": access,
    }


@api.post("/auth/logout")
async def logout(response: Response):
    clear_auth_cookies(response)
    return {"success": True}


@api.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user


# ---------- Catalog & calculator ----------
@api.get("/catalog")
async def get_catalog():
    return {"catalog": CATALOG, "service_fees": SERVICE_FEES}


@api.post("/estimate")
async def estimate(body: EstimateBody):
    brand = next(
        (b for b in CATALOG if b["device_type"] == body.device_type and b["brand"].lower() == body.brand.lower()),
        None,
    )
    if not brand:
        raise HTTPException(status_code=404, detail="Brand tidak ditemukan")
    if body.model not in brand["models"]:
        raise HTTPException(status_code=404, detail="Model tidak ditemukan")
    damage = next((d for d in brand["damages"] if d["key"] == body.damage or d["label"] == body.damage), None)
    if not damage:
        raise HTTPException(status_code=404, detail="Jenis kerusakan tidak ditemukan")
    base = damage["base_price"]
    low = int(base * 0.9)
    high = int(base * 1.15)
    return {
        "device_type": body.device_type, "brand": body.brand, "model": body.model,
        "damage": damage["label"], "estimate_min": low, "estimate_max": high,
        "base_price": base, "currency": "IDR",
        "note": "Estimasi awal. Harga final setelah diagnosa teknisi.",
    }


# ---------- Bookings ----------
@api.post("/bookings")
async def create_booking(body: BookingCreateBody, user: dict = Depends(get_current_user)):
    brand_entry = next(
        (b for b in CATALOG if b["device_type"] == body.device_type and b["brand"].lower() == body.brand.lower()),
        None,
    )
    base = 0
    damage_label = body.damage
    if brand_entry:
        d = next((d for d in brand_entry["damages"] if d["key"] == body.damage or d["label"] == body.damage), None)
        if d:
            base = d["base_price"]
            damage_label = d["label"]

    service_fee = SERVICE_FEES.get(body.service_type, 0)
    booking_id = str(uuid.uuid4())
    tracking = _gen_tracking_code()
    now = _now_iso()
    timeline = [{"status": "received", "note": "Booking diterima", "at": now}]
    doc = {
        "id": booking_id,
        "tracking_code": tracking,
        "user_id": user["id"],
        "customer_name": body.customer_name,
        "customer_phone": body.customer_phone,
        "service_type": body.service_type,
        "device_type": body.device_type,
        "brand": body.brand,
        "model": body.model,
        "damage_key": body.damage,
        "damage_label": damage_label,
        "description": body.description,
        "scheduled_date": body.scheduled_date,
        "scheduled_time": body.scheduled_time,
        "address": body.address,
        "city": body.city,
        "base_estimate": base,
        "service_fee": service_fee,
        "estimate_min": int(base * 0.9) + service_fee,
        "estimate_max": int(base * 1.15) + service_fee,
        "current_status": "received",
        "timeline": timeline,
        "diagnostic": None,
        "created_at": now,
        "updated_at": now,
    }
    await db.bookings.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api.get("/bookings/my")
async def my_bookings(user: dict = Depends(get_current_user)):
    cursor = db.bookings.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1)
    return await cursor.to_list(200)


@api.get("/bookings/{booking_id}")
async def get_booking(booking_id: str, user: dict = Depends(get_current_user)):
    booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking tidak ditemukan")
    if user["role"] != "admin" and booking["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Akses ditolak")
    return booking


@api.get("/track/{tracking_code}")
async def public_track(tracking_code: str):
    booking = await db.bookings.find_one({"tracking_code": tracking_code.upper()}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Kode tracking tidak ditemukan")
    # Limit public data
    return {
        "tracking_code": booking["tracking_code"],
        "customer_name": booking["customer_name"],
        "device_type": booking["device_type"],
        "brand": booking["brand"],
        "model": booking["model"],
        "damage_label": booking["damage_label"],
        "service_type": booking["service_type"],
        "current_status": booking["current_status"],
        "timeline": booking["timeline"],
        "diagnostic": booking.get("diagnostic"),
        "estimate_min": booking["estimate_min"],
        "estimate_max": booking["estimate_max"],
        "created_at": booking["created_at"],
        "updated_at": booking["updated_at"],
    }


# ---------- Admin ----------
@api.get("/admin/bookings")
async def admin_list_bookings(_: dict = Depends(require_admin)):
    cursor = db.bookings.find({}, {"_id": 0}).sort("created_at", -1)
    return await cursor.to_list(500)


@api.get("/admin/stats")
async def admin_stats(_: dict = Depends(require_admin)):
    total = await db.bookings.count_documents({})
    active = await db.bookings.count_documents({"current_status": {"$in": STATUS_FLOW[:-1]}})
    completed = await db.bookings.count_documents({"current_status": "completed"})
    customers = await db.users.count_documents({"role": "customer"})
    return {"total_bookings": total, "active": active, "completed": completed, "customers": customers}


@api.patch("/admin/bookings/{booking_id}/status")
async def admin_update_status(booking_id: str, body: StatusUpdateBody, admin: dict = Depends(require_admin)):
    booking = await db.bookings.find_one({"id": booking_id})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking tidak ditemukan")
    now = _now_iso()
    entry = {"status": body.status, "note": body.note or "", "at": now}
    await db.bookings.update_one(
        {"id": booking_id},
        {"$set": {"current_status": body.status, "updated_at": now}, "$push": {"timeline": entry}},
    )
    updated = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    return updated


@api.put("/admin/bookings/{booking_id}/diagnostic")
async def admin_set_diagnostic(booking_id: str, body: DiagnosticBody, admin: dict = Depends(require_admin)):
    booking = await db.bookings.find_one({"id": booking_id})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking tidak ditemukan")
    items_total = sum(i.price for i in body.items)
    total = items_total + body.labor_cost
    diagnostic = {
        "problem_summary": body.problem_summary,
        "findings": body.findings,
        "items": [i.model_dump() for i in body.items],
        "labor_cost": body.labor_cost,
        "total": total,
        "notes": body.notes or "",
        "technician": admin["name"],
        "created_at": _now_iso(),
    }
    await db.bookings.update_one(
        {"id": booking_id}, {"$set": {"diagnostic": diagnostic, "updated_at": _now_iso()}}
    )
    return diagnostic


# ---------- Startup ----------
@app.on_event("startup")
async def on_startup():
    try:
        await db.users.create_index("email", unique=True)
        await db.users.create_index("id", unique=True)
        await db.bookings.create_index("id", unique=True)
        await db.bookings.create_index("tracking_code", unique=True)
        await db.bookings.create_index("user_id")
    except Exception as e:
        logger.warning(f"index create: {e}")

    existing = await db.users.find_one({"email": ADMIN_EMAIL.lower()})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": ADMIN_EMAIL.lower(),
            "password_hash": hash_password(ADMIN_PASSWORD),
            "name": "Admin iGadget",
            "phone": "+62-000-0000",
            "role": "admin",
            "created_at": _now_iso(),
        })
        logger.info("Admin user seeded")
    elif not verify_password(ADMIN_PASSWORD, existing["password_hash"]):
        await db.users.update_one(
            {"email": ADMIN_EMAIL.lower()},
            {"$set": {"password_hash": hash_password(ADMIN_PASSWORD)}},
        )
        logger.info("Admin password synced")


@app.on_event("shutdown")
async def on_shutdown():
    client.close()


@api.get("/")
async def root():
    return {"service": "iGadget Service API", "status": "ok"}


app.include_router(api)

# CORS
origins = [FRONTEND_URL, "http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
