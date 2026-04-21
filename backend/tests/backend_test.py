"""Backend API tests for iGadget Service."""
import os
import uuid
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://device-clinic-10.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@igadget.id"
ADMIN_PASS = "Admin123!"


# ---------- Shared state ----------
state = {
    "customer_email": f"TEST_cust_{uuid.uuid4().hex[:8]}@test.com",
    "customer_pass": "Customer123!",
    "customer_token": None,
    "customer_id": None,
    "admin_token": None,
    "booking_id": None,
    "tracking_code": None,
    "second_customer_token": None,
}


# ---------- Health ----------
def test_health():
    r = requests.get(f"{API}/")
    assert r.status_code == 200
    data = r.json()
    assert data.get("status") == "ok"
    assert data.get("service") == "iGadget Service API"


# ---------- Auth ----------
def test_register_customer():
    r = requests.post(f"{API}/auth/register", json={
        "email": state["customer_email"],
        "password": state["customer_pass"],
        "name": "Test Customer",
        "phone": "+62-812-000-0001",
    })
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["email"] == state["customer_email"].lower()
    assert data["role"] == "customer"
    assert "token" in data and len(data["token"]) > 10
    assert "id" in data
    state["customer_token"] = data["token"]
    state["customer_id"] = data["id"]
    # cookie set
    assert "access_token" in r.cookies.get_dict() or "access_token" in r.headers.get("set-cookie", "")


def test_register_duplicate_email():
    r = requests.post(f"{API}/auth/register", json={
        "email": state["customer_email"],
        "password": "whatever",
        "name": "dup",
    })
    assert r.status_code == 400


def test_login_admin():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASS})
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["role"] == "admin"
    assert "token" in data
    state["admin_token"] = data["token"]


def test_login_wrong_password():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrongwrong"})
    assert r.status_code == 401


def test_auth_me_bearer():
    assert state["customer_token"]
    r = requests.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {state['customer_token']}"})
    assert r.status_code == 200
    data = r.json()
    assert data["email"] == state["customer_email"].lower()
    assert "password_hash" not in data


def test_auth_me_cookie():
    # Login via session to get cookie
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASS})
    assert r.status_code == 200
    # Cookie-based /me call
    r2 = s.get(f"{API}/auth/me")
    assert r2.status_code == 200, r2.text
    assert r2.json()["role"] == "admin"


def test_auth_me_no_token():
    r = requests.get(f"{API}/auth/me")
    assert r.status_code == 401


def test_auth_logout():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASS})
    assert r.status_code == 200
    r2 = s.post(f"{API}/auth/logout")
    assert r2.status_code == 200
    assert r2.json().get("success") is True


# ---------- Catalog & estimate ----------
def test_catalog():
    r = requests.get(f"{API}/catalog")
    assert r.status_code == 200
    data = r.json()
    assert "catalog" in data and "service_fees" in data
    sp = [c for c in data["catalog"] if c["device_type"] == "smartphone"]
    tv = [c for c in data["catalog"] if c["device_type"] == "tv"]
    assert len(sp) >= 1 and len(tv) >= 1
    # check iPhone 13 apple exists with base_price
    apple = next(c for c in sp if c["brand"] == "Apple")
    assert "iPhone 13" in apple["models"]
    assert any(d["key"] == "lcd_replacement" and d["base_price"] > 0 for d in apple["damages"])


def test_estimate():
    r = requests.post(f"{API}/estimate", json={
        "device_type": "smartphone", "brand": "Apple",
        "model": "iPhone 13", "damage": "lcd_replacement",
    })
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["base_price"] == 1500000
    assert d["estimate_min"] == int(1500000 * 0.9)
    assert d["estimate_max"] == int(1500000 * 1.15)
    assert d["currency"] == "IDR"


def test_estimate_invalid_brand():
    r = requests.post(f"{API}/estimate", json={
        "device_type": "smartphone", "brand": "NoBrand",
        "model": "x", "damage": "lcd_replacement",
    })
    assert r.status_code == 404


# ---------- Bookings ----------
def _auth_h(token):
    return {"Authorization": f"Bearer {token}"}


def test_create_booking():
    assert state["customer_token"]
    payload = {
        "service_type": "pickup_delivery",
        "device_type": "smartphone",
        "brand": "Apple",
        "model": "iPhone 13",
        "damage": "lcd_replacement",
        "description": "layar retak",
        "scheduled_date": "2026-02-01",
        "scheduled_time": "10:00",
        "customer_name": "Test Customer",
        "customer_phone": "+62-812-000-0001",
        "address": "Jl. Bojonegoro",
        "city": "Bojonegoro",
    }
    r = requests.post(f"{API}/bookings", json=payload, headers=_auth_h(state["customer_token"]))
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["tracking_code"].startswith("IGS-")
    assert d["current_status"] == "received"
    assert len(d["timeline"]) >= 1 and d["timeline"][0]["status"] == "received"
    # estimate includes service_fee (35000 for pickup_delivery)
    assert d["service_fee"] == 35000
    assert d["estimate_min"] == int(1500000 * 0.9) + 35000
    assert d["estimate_max"] == int(1500000 * 1.15) + 35000
    state["booking_id"] = d["id"]
    state["tracking_code"] = d["tracking_code"]


def test_my_bookings():
    r = requests.get(f"{API}/bookings/my", headers=_auth_h(state["customer_token"]))
    assert r.status_code == 200
    items = r.json()
    assert isinstance(items, list)
    assert any(b["id"] == state["booking_id"] for b in items)


def test_get_booking_owner():
    r = requests.get(f"{API}/bookings/{state['booking_id']}", headers=_auth_h(state["customer_token"]))
    assert r.status_code == 200
    assert r.json()["id"] == state["booking_id"]


def test_get_booking_admin_access():
    r = requests.get(f"{API}/bookings/{state['booking_id']}", headers=_auth_h(state["admin_token"]))
    assert r.status_code == 200


def test_get_booking_other_user_forbidden():
    # register a second user and try to fetch
    email = f"TEST_other_{uuid.uuid4().hex[:8]}@test.com"
    r = requests.post(f"{API}/auth/register", json={
        "email": email, "password": "Customer123!", "name": "Other",
    })
    assert r.status_code == 200
    other_tok = r.json()["token"]
    state["second_customer_token"] = other_tok
    r2 = requests.get(f"{API}/bookings/{state['booking_id']}", headers=_auth_h(other_tok))
    assert r2.status_code == 403


def test_my_bookings_isolation():
    r = requests.get(f"{API}/bookings/my", headers=_auth_h(state["second_customer_token"]))
    assert r.status_code == 200
    assert all(b["id"] != state["booking_id"] for b in r.json())


def test_public_track_no_auth():
    r = requests.get(f"{API}/track/{state['tracking_code']}")
    assert r.status_code == 200
    d = r.json()
    assert d["tracking_code"] == state["tracking_code"]
    # Should not leak user_id or address
    assert "user_id" not in d
    assert "address" not in d


def test_public_track_invalid():
    r = requests.get(f"{API}/track/IGS-NOPE99")
    assert r.status_code == 404


# ---------- Admin ----------
def test_admin_bookings_list():
    r = requests.get(f"{API}/admin/bookings", headers=_auth_h(state["admin_token"]))
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_admin_bookings_forbidden_for_customer():
    r = requests.get(f"{API}/admin/bookings", headers=_auth_h(state["customer_token"]))
    assert r.status_code == 403


def test_admin_stats():
    r = requests.get(f"{API}/admin/stats", headers=_auth_h(state["admin_token"]))
    assert r.status_code == 200
    d = r.json()
    for k in ("total_bookings", "active", "completed", "customers"):
        assert k in d


def test_admin_update_status():
    r = requests.patch(
        f"{API}/admin/bookings/{state['booking_id']}/status",
        json={"status": "diagnosed", "note": "cek fisik"},
        headers=_auth_h(state["admin_token"]),
    )
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["current_status"] == "diagnosed"
    assert any(t["status"] == "diagnosed" for t in d["timeline"])


def test_admin_set_diagnostic():
    body = {
        "problem_summary": "LCD pecah",
        "findings": "Panel rusak, butuh ganti",
        "items": [
            {"label": "LCD Apple iPhone 13", "price": 1500000},
            {"label": "Adhesive", "price": 50000},
        ],
        "labor_cost": 100000,
        "notes": "garansi 30 hari",
    }
    r = requests.put(
        f"{API}/admin/bookings/{state['booking_id']}/diagnostic",
        json=body, headers=_auth_h(state["admin_token"]),
    )
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["total"] == 1500000 + 50000 + 100000
    assert len(d["items"]) == 2

    # verify persisted via GET
    g = requests.get(f"{API}/bookings/{state['booking_id']}", headers=_auth_h(state["admin_token"]))
    assert g.status_code == 200
    assert g.json()["diagnostic"]["total"] == 1650000
