# Networking App - Business Card OCR & Contact Management Backend API

A high-performance RESTful Backend API built with **Python**, **FastAPI**, **SQLite**, and **Roboflow Workflows** for automated business card extraction, contact persistence, duplicate detection, and role-based categorization.

---

## 🌟 Key Features

1. **OCR Data Retrieval via Roboflow**:
   - Integrates the Roboflow Workflow `business-card-information-extractor-1787034042585` (Workspace: `muhammad-sayyid-tsabit-anfaresi`).
   - Supports OCR processing from **Image URLs** and **Direct File Uploads (JPEG, PNG, WebP)**.
   - Built-in defensive response parsing, exponential backoff retries, and custom error handling.

2. **Database Storage**:
   - Persists contact details (`full_name`, `job_title`, `role`, `company`, `email`, `phone`, `mobile`, `website`, `address`) into SQLite database (`contacts.db`).

3. **Duplicate Data Prevention**:
   - Automatically detects duplicates based on `email`, `phone`, or `full_name + company`.
   - Ignores duplicate insertions (`status: "duplicate_ignored"`) while returning the existing contact record.

4. **Role-Based Contact Organization**:
   - Auto-categorizes contact roles based on job title (e.g., `Executive`, `Management`, `Engineering`, `Sales & Marketing`, `Product & Design`, `Operations & Admin`, `General`).
   - Provides API endpoints to filter contacts by role (`GET /api/contacts?role=Executive`) and get contacts grouped by role (`GET /api/contacts/by-role`).

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+** (Tested on Python 3.12)
- Roboflow API Key

### Installation

1. Clone or navigate to the repository:
   ```bash
   cd /Users/dendi/gdg/networking-app-aston88
   ```

2. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure Environment Variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Ensure `.env` contains your Roboflow credentials:
   ```env
   ROBOFLOW_API_KEY=your_roboflow_api_key_here
   ROBOFLOW_WORKSPACE=muhammad-sayyid-tsabit-anfaresi
   ROBOFLOW_WORKFLOW_ID=business-card-information-extractor-1787034042585
   ROBOFLOW_API_URL=https://serverless.roboflow.com
   DATABASE_PATH=contacts.db
   ```

---

## 🏃 Running the Backend Server

Start the Uvicorn development server:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- **Interactive API Documentation (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 📑 API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/contacts/extract-url` | Perform OCR on image URL and save contact to DB (Ignores duplicates) |
| `POST` | `/api/contacts/extract-file` | Perform OCR on uploaded image file and save contact to DB (Ignores duplicates) |
| `POST` | `/api/contacts` | Manually add a contact record |
| `GET` | `/api/contacts` | Retrieve contacts (Supports `?role=`, `?company=`, `?search=`) |
| `GET` | `/api/contacts/by-role` | Retrieve contacts grouped by role category |
| `GET` | `/api/contacts/{id}` | Get contact details by ID |
| `DELETE` | `/api/contacts/{id}` | Delete contact by ID |
| `GET` | `/` | Service health check |

---

## 💡 Usage Examples (cURL)

### 1. Extract Contact from Business Card Image URL

```bash
curl -X POST "http://localhost:8000/api/contacts/extract-url" \
  -H "Content-Type: application/json" \
  -d '{
    "image_url": "https://source.roboflow.com/CbcUSfOENQWXY8E9gFyZFQ95fO63/ZMRAvwbtUV6f9EUDTlS7/original.jpg"
  }'
```

**Response**:
```json
{
  "status": "inserted",
  "message": "Contact successfully extracted and saved.",
  "is_duplicate": false,
  "contact": {
    "id": 1,
    "full_name": "Ir. Efo Akmal",
    "job_title": "Deputy Head of Indonesia Libya Bilateral Committee",
    "role": "Executive",
    "company": "KAMAR DAGANG DAN INDUSTRI INDONESIA",
    "email": "hr@ptars.tch",
    "phone": "+62 819 0505 4148",
    "mobile": "",
    "website": "www.kadin.id",
    "address": "",
    "created_at": "2026-08-23 15:00:00",
    "updated_at": "2026-08-23 15:00:00"
  }
}
```

### 2. Duplicate Detection (Subsequent Request)

Re-sending the same request will return:

```json
{
  "status": "duplicate_ignored",
  "message": "Duplicate data ignored. Existing contact returned.",
  "is_duplicate": true,
  "contact": {
    "id": 1,
    ...
  }
}
```

### 3. Extract Contact from Uploaded File

```bash
curl -X POST "http://localhost:8000/api/contacts/extract-file" \
  -F "file=@/path/to/business_card.jpg"
```

### 4. Query Contacts by Role

```bash
curl -X GET "http://localhost:8000/api/contacts?role=Executive"
```

### 5. Get Contacts Grouped by Role

```bash
curl -X GET "http://localhost:8000/api/contacts/by-role"
```

---

## 🧪 Testing

Run the test suite with `pytest`:

```bash
python3 -m pytest tests/ -v
```

Tests include:
- `tests/test_roboflow_ocr.py`: Roboflow OCR Workflow smoke test using sample business card image.
- `tests/test_api.py`: API integration tests for CRUD, duplicate prevention, and role-based filtering.
