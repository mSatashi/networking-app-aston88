import pytest
import os
import tempfile
from fastapi.testclient import TestClient
from app.main import app
from app.database import init_db
from app.services import contact_service

@pytest.fixture(autouse=True)
def setup_test_db(monkeypatch):
    """Fixture creating a temporary SQLite database for isolated test execution."""
    db_fd, db_path = tempfile.mkstemp(suffix=".db")
    os.close(db_fd)
    
    init_db(db_path)
    monkeypatch.setattr("app.config.settings.DATABASE_PATH", db_path)
    monkeypatch.setattr("app.database.get_db_path", lambda: db_path)

    yield db_path

    if os.path.exists(db_path):
        os.remove(db_path)

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

def test_manual_contact_creation():
    payload = {
        "full_name": "Jane Doe",
        "job_title": "Senior Software Engineer",
        "company": "Tech Corp",
        "email": "jane.doe@techcorp.com",
        "phone": "+62 812 3456 7890"
    }
    response = client.post("/api/contacts", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["full_name"] == "Jane Doe"
    assert data["role"] == "Engineering"

def test_duplicate_contact_prevention():
    payload = {
        "full_name": "John Smith",
        "job_title": "Chief Executive Officer",
        "company": "Enterprise Ltd",
        "email": "john@enterprise.com",
        "phone": "+62 811 9876 5432"
    }
    # First insert
    resp1 = client.post("/api/contacts", json=payload)
    assert resp1.status_code == 201
    contact1 = resp1.json()

    # Second insert via contact_service save_contact to test duplicate detection
    saved_contact, is_dup, msg = contact_service.save_contact(payload)
    assert is_dup is True
    assert saved_contact.id == contact1["id"]
    assert "Duplicate data ignored" in msg

def test_role_based_filtering():
    # Insert contacts with different roles
    c1 = {
        "full_name": "Alice Executive",
        "job_title": "CEO",
        "company": "Alpha Inc",
        "email": "alice@alpha.com"
    }
    c2 = {
        "full_name": "Bob Developer",
        "job_title": "Full Stack Developer",
        "company": "Beta LLC",
        "email": "bob@beta.com"
    }
    client.post("/api/contacts", json=c1)
    client.post("/api/contacts", json=c2)

    # Filter by role Executive
    exec_resp = client.get("/api/contacts?role=Executive")
    assert exec_resp.status_code == 200
    exec_data = exec_resp.json()
    assert len(exec_data) == 1
    assert exec_data[0]["full_name"] == "Alice Executive"

    # Filter by role Engineering
    eng_resp = client.get("/api/contacts?role=Engineering")
    assert eng_resp.status_code == 200
    eng_data = eng_resp.json()
    assert len(eng_data) == 1
    assert eng_data[0]["full_name"] == "Bob Developer"

def test_get_contacts_by_role_grouping():
    client.post("/api/contacts", json={
        "full_name": "Carol VP",
        "job_title": "Vice President",
        "email": "carol@corp.com"
    })
    client.post("/api/contacts", json={
        "full_name": "Dave Manager",
        "job_title": "Operations Manager",
        "email": "dave@corp.com"
    })

    resp = client.get("/api/contacts/by-role")
    assert resp.status_code == 200
    grouped = resp.json()
    assert isinstance(grouped, list)
    role_names = [g["role"] for g in grouped]
    assert "Executive" in role_names or "Operations & Admin" in role_names or "Management" in role_names

def test_openapi_schema_endpoint():
    response = client.get("/openapi.json")
    assert response.status_code == 200
    schema = response.json()
    assert schema["openapi"].startswith("3.")
    assert "/api/contacts" in schema["paths"]
    assert "/api/contacts/extract-url" in schema["paths"]
    assert "/api/contacts/extract-file" in schema["paths"]

def test_invalid_image_upload_validation():
    # Upload plain text disguised as image
    response = client.post(
        "/api/contacts/extract-file",
        files={"file": ("fake.jpg", b"This is not a real image", "image/jpeg")}
    )
    assert response.status_code == 400
    assert "not a valid image format" in response.json()["detail"]

def test_empty_image_upload_validation():
    response = client.post(
        "/api/contacts/extract-file",
        files={"file": ("empty.jpg", b"", "image/jpeg")}
    )
    assert response.status_code == 400
    assert "Empty image file uploaded" in response.json()["detail"]


