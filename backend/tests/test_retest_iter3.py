"""Iteration 3 retest — brute-force lockout (X-Forwarded-For fix) only."""
import os
import uuid
import requests
import pytest
from pymongo import MongoClient

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
assert BASE_URL, "REACT_APP_BACKEND_URL missing"


@pytest.fixture(autouse=True, scope="module")
def _clear_attempts():
    MongoClient("mongodb://localhost:27017")["igadget_service"].login_attempts.delete_many({})
    yield
    MongoClient("mongodb://localhost:27017")["igadget_service"].login_attempts.delete_many({})


def test_brute_force_lockout_after_5_fails():
    """6th wrong-password login against same email should return 429 with lockout message."""
    email = f"TEST_bf_{uuid.uuid4().hex[:8]}@example.com"
    # Ensure nothing crosses over from other tests: use a never-registered email
    codes = []
    for i in range(6):
        r = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": email, "password": "WrongPass123!"},
            timeout=15,
        )
        codes.append(r.status_code)
    # first 5 should be 401, 6th should be 429
    assert codes[:5] == [401, 401, 401, 401, 401], f"first 5 codes: {codes}"
    assert codes[5] == 429, f"6th attempt should be 429 lockout, got {codes[5]}; body={r.text}"
    body = r.json()
    detail = body.get("detail", "")
    assert "menit" in detail.lower() or "coba lagi" in detail.lower(), f"Unexpected lockout msg: {detail}"


def test_admin_login_still_works_when_not_locked():
    """Ensure admin login still succeeds with correct credentials (no global lockout)."""
    r = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": "admin@igadget.id", "password": "Admin123!"},
        timeout=15,
    )
    assert r.status_code == 200, r.text
    data = r.json()
    assert "token" in data or "access_token" in data
