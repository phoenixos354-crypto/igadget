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


# =====================================================================
# ITERATION 2 TESTS — ongkir, lockout, password reset, photo upload
# =====================================================================

import io
import time


# ---------- Ongkir ----------
def test_ongkir_autocomplete_bojonegoro():
    r = requests.get(f"{API}/ongkir/autocomplete", params={"q": "bojonegoro"})
    assert r.status_code == 200, r.text
    d = r.json()
    assert "results" in d and isinstance(d["results"], list)
    # Accept empty list (if provider down), but if non-empty, validate shape
    if d["results"]:
        sample = d["results"][0]
        # RapidAPI autocomplete returns items with value + text typically
        assert isinstance(sample, dict)
        state["ongkir_area_id"] = sample.get("value") or sample.get("id") or "30028"


def test_ongkir_autocomplete_too_short():
    r = requests.get(f"{API}/ongkir/autocomplete", params={"q": "b"})
    # min_length=2 -> 422 from fastapi validator
    assert r.status_code == 422


def test_ongkir_estimate_fallback_or_live():
    # Provider shipping-cost returns 500 consistently per problem statement;
    # backend must gracefully return fallback shape.
    r = requests.post(f"{API}/ongkir/estimate", json={
        "destination_area_id": "30028", "weight_kg": 1,
    })
    assert r.status_code == 200, r.text
    d = r.json()
    assert "estimate_min" in d and "estimate_max" in d
    assert "available" in d
    assert isinstance(d["estimate_min"], int) and isinstance(d["estimate_max"], int)
    assert d["estimate_min"] <= d["estimate_max"]
    # In fallback, source should be 'fallback'
    if not d["available"]:
        assert d.get("source") == "fallback"


# ---------- Brute-force lockout ----------
def test_brute_force_lockout_and_clear_on_success():
    # Use a unique email so we don't pollute shared state lock
    email = f"TEST_bf_{uuid.uuid4().hex[:8]}@test.com"
    pwd = "Customer123!"
    rr = requests.post(f"{API}/auth/register", json={
        "email": email, "password": pwd, "name": "BF Test",
    })
    assert rr.status_code == 200

    # 3 failed logins, then successful login should CLEAR attempts
    for _ in range(3):
        r = requests.post(f"{API}/auth/login", json={"email": email, "password": "wrongpass"})
        assert r.status_code == 401
    r_ok = requests.post(f"{API}/auth/login", json={"email": email, "password": pwd})
    assert r_ok.status_code == 200, "Successful login before 5 fails should still work"

    # Now do 6 failed logins — 6th should return 429
    email2 = f"TEST_bf2_{uuid.uuid4().hex[:8]}@test.com"
    rr2 = requests.post(f"{API}/auth/register", json={
        "email": email2, "password": pwd, "name": "BF2",
    })
    assert rr2.status_code == 200

    last_status = None
    last_text = ""
    for i in range(6):
        r = requests.post(f"{API}/auth/login", json={"email": email2, "password": "badpass"})
        last_status = r.status_code
        last_text = r.text
    # After 5 recorded fails, the next attempt should be locked out (429).
    # Depending on impl, the 6th fail is recorded THEN check blocks on next call,
    # so try one more request to be safe.
    if last_status != 429:
        r = requests.post(f"{API}/auth/login", json={"email": email2, "password": "badpass"})
        last_status = r.status_code
        last_text = r.text
    assert last_status == 429, f"Expected 429 lockout, got {last_status}: {last_text}"
    assert "Terlalu banyak percobaan" in last_text


# ---------- Password reset ----------
def test_forgot_password_always_success():
    # Known email
    r = requests.post(f"{API}/auth/forgot-password", json={"email": ADMIN_EMAIL})
    assert r.status_code == 200
    assert r.json().get("success") is True

    # Unknown email — same response (no enumeration)
    r2 = requests.post(f"{API}/auth/forgot-password", json={
        "email": f"TEST_nope_{uuid.uuid4().hex[:6]}@nobody.com"
    })
    assert r2.status_code == 200
    assert r2.json().get("success") is True


def test_reset_password_flow():
    # Create a user to reset
    email = f"TEST_reset_{uuid.uuid4().hex[:8]}@test.com"
    pwd = "Customer123!"
    rr = requests.post(f"{API}/auth/register", json={
        "email": email, "password": pwd, "name": "Reset Test",
    })
    assert rr.status_code == 200

    # Trigger forgot-password (token is only logged; fetch directly from DB via a helper endpoint is not available)
    r = requests.post(f"{API}/auth/forgot-password", json={"email": email})
    assert r.status_code == 200

    # We need the token — read via mongo directly
    from pymongo import MongoClient
    mc = MongoClient(os.environ.get("MONGO_URL", "mongodb://localhost:27017"))
    db_ = mc[os.environ.get("DB_NAME", "igadget_service")]
    u = db_.users.find_one({"email": email.lower()})
    assert u is not None
    rec = db_.password_reset_tokens.find_one({"user_id": u["id"], "used": False}, sort=[("created_at", -1)])
    assert rec is not None, "Reset token not created"
    token = rec["token"]

    # Invalid token -> 400
    r_bad = requests.post(f"{API}/auth/reset-password", json={
        "token": "invalid-token-xxx", "new_password": "NewPass123!"
    })
    assert r_bad.status_code == 400

    # Valid reset
    new_pwd = "NewPassword456!"
    r_ok = requests.post(f"{API}/auth/reset-password", json={
        "token": token, "new_password": new_pwd
    })
    assert r_ok.status_code == 200, r_ok.text
    assert r_ok.json().get("success") is True

    # Old password no longer works
    r_old = requests.post(f"{API}/auth/login", json={"email": email, "password": pwd})
    assert r_old.status_code == 401

    # New password works
    r_new = requests.post(f"{API}/auth/login", json={"email": email, "password": new_pwd})
    assert r_new.status_code == 200

    # Token reuse rejected
    r_reuse = requests.post(f"{API}/auth/reset-password", json={
        "token": token, "new_password": "AnotherPass789!"
    })
    assert r_reuse.status_code == 400


# ---------- Diagnostic photo upload ----------
def _make_png_bytes():
    # Minimal 1x1 PNG
    import base64
    return base64.b64decode(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
    )


def test_upload_diagnostic_photo_before_and_after():
    assert state.get("admin_token") and state.get("booking_id")
    png = _make_png_bytes()

    # Upload BEFORE
    r1 = requests.post(
        f"{API}/admin/bookings/{state['booking_id']}/diagnostic/photos",
        params={"kind": "before"},
        files={"file": ("before.png", png, "image/png")},
        headers=_auth_h(state["admin_token"]),
    )
    assert r1.status_code == 200, r1.text
    d1 = r1.json()
    assert d1["kind"] == "before"
    assert "id" in d1 and "path" in d1
    state["photo_before_path"] = d1["path"]

    # Upload AFTER
    r2 = requests.post(
        f"{API}/admin/bookings/{state['booking_id']}/diagnostic/photos",
        params={"kind": "after"},
        files={"file": ("after.png", png, "image/png")},
        headers=_auth_h(state["admin_token"]),
    )
    assert r2.status_code == 200, r2.text
    assert r2.json()["kind"] == "after"

    # Fetch booking and verify both arrays present (and not overwritten)
    g = requests.get(f"{API}/bookings/{state['booking_id']}", headers=_auth_h(state["admin_token"]))
    assert g.status_code == 200
    diag = g.json().get("diagnostic") or {}
    assert len(diag.get("photos_before", [])) >= 1
    assert len(diag.get("photos_after", [])) >= 1


def test_diagnostic_put_preserves_photos():
    assert state.get("admin_token") and state.get("booking_id")
    # PUT new diagnostic — should NOT wipe existing photos_before/after
    body = {
        "problem_summary": "LCD pecah (updated)",
        "findings": "update test",
        "items": [{"label": "LCD", "price": 1500000}],
        "labor_cost": 100000,
        "notes": "test preserve photos",
    }
    r = requests.put(
        f"{API}/admin/bookings/{state['booking_id']}/diagnostic",
        json=body, headers=_auth_h(state["admin_token"]),
    )
    assert r.status_code == 200, r.text
    d = r.json()
    assert len(d.get("photos_before", [])) >= 1, "photos_before should be preserved after diagnostic PUT"
    assert len(d.get("photos_after", [])) >= 1, "photos_after should be preserved after diagnostic PUT"


def test_upload_rejects_non_image():
    assert state.get("admin_token") and state.get("booking_id")
    r = requests.post(
        f"{API}/admin/bookings/{state['booking_id']}/diagnostic/photos",
        params={"kind": "before"},
        files={"file": ("doc.txt", b"hello world", "text/plain")},
        headers=_auth_h(state["admin_token"]),
    )
    assert r.status_code == 400, f"Expected 400 for non-image, got {r.status_code}: {r.text}"


def test_upload_rejects_oversize():
    assert state.get("admin_token") and state.get("booking_id")
    big = b"\x89PNG\r\n\x1a\n" + b"0" * (8 * 1024 * 1024 + 100)
    r = requests.post(
        f"{API}/admin/bookings/{state['booking_id']}/diagnostic/photos",
        params={"kind": "before"},
        files={"file": ("huge.png", big, "image/png")},
        headers=_auth_h(state["admin_token"]),
    )
    assert r.status_code == 400, f"Expected 400 for >8MB file, got {r.status_code}"


def test_file_proxy_requires_auth():
    assert state.get("photo_before_path")
    path = state["photo_before_path"]
    # No auth -> 401
    r_noauth = requests.get(f"{API}/files/{path}")
    assert r_noauth.status_code == 401

    # With ?auth=<token> -> 200 + image content-type
    r_ok = requests.get(f"{API}/files/{path}", params={"auth": state["admin_token"]})
    assert r_ok.status_code == 200, r_ok.text
    ct = r_ok.headers.get("content-type", "")
    assert "image" in ct.lower(), f"Expected image content-type, got {ct}"
    assert len(r_ok.content) > 0
