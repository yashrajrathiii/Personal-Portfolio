"""Backend API tests for Yash Raj Rathi portfolio app."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://yash-product-first.preview.emergentagent.com').rstrip('/')
ADMIN_EMAIL = "rathiyash12@gmail.com"
ADMIN_PASSWORD = "Bhopal@123"


@pytest.fixture(scope="session")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def token(api):
    r = api.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "token" in data and "user" in data
    assert data["user"]["email"] == ADMIN_EMAIL
    assert data["user"].get("role") == "admin"
    return data["token"]


@pytest.fixture(scope="session")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


# ---------- Public portfolio ----------
def test_get_portfolio_returns_seeded_content(api):
    r = api.get(f"{BASE_URL}/api/portfolio")
    assert r.status_code == 200
    d = r.json()
    for k in ["hero", "about", "skills", "contact", "experience", "projects"]:
        assert k in d, f"missing {k}"
    assert d["hero"]["name"] == "YASH RAJ RATHI"
    assert d["hero"]["overline"] == "PRODUCT MANAGER @ RESHUFFLE"
    assert isinstance(d["experience"], list) and len(d["experience"]) >= 1
    assert isinstance(d["projects"], list) and len(d["projects"]) >= 1
    assert "_id" not in d


# ---------- Auth ----------
def test_login_wrong_password(api):
    r = api.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": "WRONG"})
    assert r.status_code == 401


def test_me_without_token(api):
    r = api.get(f"{BASE_URL}/api/auth/me")
    assert r.status_code == 401


def test_me_with_token(api, auth_headers):
    r = api.get(f"{BASE_URL}/api/auth/me", headers=auth_headers)
    assert r.status_code == 200
    assert r.json()["email"] == ADMIN_EMAIL


# ---------- Section updates ----------
def test_update_hero_requires_auth(api):
    r = api.put(f"{BASE_URL}/api/portfolio/section/hero", json={})
    assert r.status_code == 401


def test_update_hero_section(api, auth_headers):
    cur = api.get(f"{BASE_URL}/api/portfolio").json()["hero"]
    new_hook = f"Test hook {uuid.uuid4().hex[:6]}"
    payload = {**cur, "hook": new_hook}
    r = api.put(f"{BASE_URL}/api/portfolio/section/hero", json=payload, headers=auth_headers)
    assert r.status_code == 200, r.text
    assert r.json()["hero"]["hook"] == new_hook
    # GET verify
    g = api.get(f"{BASE_URL}/api/portfolio").json()
    assert g["hero"]["hook"] == new_hook
    # restore
    api.put(f"{BASE_URL}/api/portfolio/section/hero", json=cur, headers=auth_headers)


def test_update_about_section(api, auth_headers):
    cur = api.get(f"{BASE_URL}/api/portfolio").json()["about"]
    payload = {**cur, "label": "THE MINDSET TEST"}
    r = api.put(f"{BASE_URL}/api/portfolio/section/about", json=payload, headers=auth_headers)
    assert r.status_code == 200
    assert r.json()["about"]["label"] == "THE MINDSET TEST"
    api.put(f"{BASE_URL}/api/portfolio/section/about", json=cur, headers=auth_headers)


def test_update_skills_section(api, auth_headers):
    cur = api.get(f"{BASE_URL}/api/portfolio").json()["skills"]
    payload = {"groups": [{"category": "Test", "items": ["a", "b"]}]}
    r = api.put(f"{BASE_URL}/api/portfolio/section/skills", json=payload, headers=auth_headers)
    assert r.status_code == 200, r.text
    assert r.json()["skills"]["groups"][0]["category"] == "Test"
    api.put(f"{BASE_URL}/api/portfolio/section/skills", json=cur, headers=auth_headers)


def test_update_contact_section(api, auth_headers):
    cur = api.get(f"{BASE_URL}/api/portfolio").json()["contact"]
    payload = {**cur, "cta": "Test CTA"}
    r = api.put(f"{BASE_URL}/api/portfolio/section/contact", json=payload, headers=auth_headers)
    assert r.status_code == 200
    assert r.json()["contact"]["cta"] == "Test CTA"
    api.put(f"{BASE_URL}/api/portfolio/section/contact", json=cur, headers=auth_headers)


def test_update_invalid_section(api, auth_headers):
    r = api.put(f"{BASE_URL}/api/portfolio/section/invalid", json={}, headers=auth_headers)
    assert r.status_code == 400


# ---------- Projects CRUD ----------
def test_project_crud(api, auth_headers):
    payload = {"title": "TEST_Project", "summary": "test summary", "impact": "x", "tags": ["t"]}
    r = api.post(f"{BASE_URL}/api/portfolio/projects", json=payload, headers=auth_headers)
    assert r.status_code == 200, r.text
    projects = r.json()["projects"]
    new = [p for p in projects if p["title"] == "TEST_Project"][0]
    pid = new["id"]

    r = api.put(f"{BASE_URL}/api/portfolio/projects/{pid}", json={"title": "TEST_Project2"}, headers=auth_headers)
    assert r.status_code == 200
    found = [p for p in r.json()["projects"] if p["id"] == pid][0]
    assert found["title"] == "TEST_Project2"

    r = api.delete(f"{BASE_URL}/api/portfolio/projects/{pid}", headers=auth_headers)
    assert r.status_code == 200
    assert not any(p["id"] == pid for p in r.json()["projects"])


def test_project_create_requires_auth(api):
    r = api.post(f"{BASE_URL}/api/portfolio/projects", json={"title": "x", "summary": "y"})
    assert r.status_code == 401


# ---------- Experience CRUD ----------
def test_experience_crud(api, auth_headers):
    payload = {"role": "TEST_Role", "company": "TestCo", "duration": "2025", "bullets": ["b1"]}
    r = api.post(f"{BASE_URL}/api/portfolio/experience", json=payload, headers=auth_headers)
    assert r.status_code == 200
    new = [e for e in r.json()["experience"] if e["role"] == "TEST_Role"][0]
    eid = new["id"]

    r = api.put(f"{BASE_URL}/api/portfolio/experience/{eid}", json={"role": "TEST_Role2"}, headers=auth_headers)
    assert r.status_code == 200
    assert [e for e in r.json()["experience"] if e["id"] == eid][0]["role"] == "TEST_Role2"

    r = api.delete(f"{BASE_URL}/api/portfolio/experience/{eid}", headers=auth_headers)
    assert r.status_code == 200
    assert not any(e["id"] == eid for e in r.json()["experience"])
