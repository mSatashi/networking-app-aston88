from fastapi import APIRouter, HTTPException, UploadFile, File, Query, status
from typing import List, Optional, Dict, Any
from app.models import (
    ContactCreate,
    ContactResponse,
    ExtractURLRequest,
    ExtractOCRResponse,
    RoleGroupResponse
)
from app.services.roboflow_client import (
    RoboflowClient,
    RoboflowOCRError,
    RoboflowTimeoutError,
    RoboflowAPIKeyError
)
from app.services import contact_service

router = APIRouter(prefix="/api/contacts", tags=["Contacts & OCR"])

PROMPT_KEYWORDS = [
    "transcribe", "return an empty string", "never guess",
    "absent or unreadable", "character-for-character", "separately identified"
]

def is_valid_text(val: Optional[str]) -> bool:
    if not val:
        return False
    val_str = str(val).strip()
    val_lower = val_str.lower()
    if not val_lower or val_lower in ["unknown", "none", "null", "n/a", "test"]:
        return False
    for kw in PROMPT_KEYWORDS:
        if kw in val_lower:
            return False
    return True

def is_valid_business_card(extracted: Dict[str, Any]) -> bool:
    """Strictly validate if extracted data belongs to an actual business card."""
    name = extracted.get("full_name")
    company = extracted.get("company")
    email = extracted.get("email")
    phone = extracted.get("phone")
    job_title = extracted.get("job_title")
    website = extracted.get("website")

    valid_name = is_valid_text(name)
    valid_company = is_valid_text(company)
    valid_email = is_valid_text(email) and "@" in str(email)
    valid_phone = is_valid_text(phone) and any(c.isdigit() for c in str(phone))
    valid_title = is_valid_text(job_title)
    valid_website = is_valid_text(website)

    has_identity = valid_name or valid_company
    has_contact = valid_phone or valid_email or valid_website or valid_title

    return bool(has_identity and has_contact)

def is_valid_image(content: bytes) -> bool:
    """Validate image bytes using magic byte signatures (JPEG, PNG, WebP, GIF, BMP)."""
    if len(content) < 12:
        return False
    if content.startswith(b"\xff\xd8\xff"):
        return True
    if content.startswith(b"\x89PNG\r\n\x1a\n"):
        return True
    if content.startswith(b"RIFF") and content[8:12] == b"WEBP":
        return True
    if content.startswith(b"GIF87a") or content.startswith(b"GIF89a"):
        return True
    if content.startswith(b"BM"):
        return True
    return False

@router.post("/extract-url", response_model=ExtractOCRResponse, status_code=status.HTTP_201_CREATED)
def extract_contact_from_url(payload: ExtractURLRequest):
    """
    Extract contact details from image URL via Roboflow OCR Workflow.
    """
    try:
        client = RoboflowClient()
        extracted = client.run_workflow_image_url(payload.image_url)
    except RoboflowAPIKeyError as e:
        raise HTTPException(status_code=500, detail=f"Roboflow Configuration Error: {str(e)}")
    except RoboflowTimeoutError as e:
        raise HTTPException(status_code=504, detail=f"OCR Gateway Timeout: {str(e)}")
    except RoboflowOCRError as e:
        raise HTTPException(status_code=502, detail=f"OCR Service Error: {str(e)}")

    if not is_valid_business_card(extracted):
        raise HTTPException(
            status_code=422,
            detail="Bukan Kartu Nama yang valid! Objek yang dipindai tidak mengandung informasi kontak kartu nama (Nama, Telepon, Email, atau Jabatan). Harap foto kartu nama dengan jelas."
        )

    contact, is_dup, msg = contact_service.save_contact(extracted)
    return ExtractOCRResponse(
        status="duplicate_ignored" if is_dup else "inserted",
        message=msg,
        is_duplicate=is_dup,
        contact=contact
    )

@router.post("/extract-file", response_model=ExtractOCRResponse, status_code=status.HTTP_201_CREATED)
async def extract_contact_from_file(file: UploadFile = File(...)):
    """
    Extract contact details from uploaded image file via Roboflow OCR Workflow.
    """
    if file.content_type and not (file.content_type.startswith("image/") or file.content_type == "application/octet-stream"):
        raise HTTPException(status_code=400, detail="Uploaded file must be a valid image (JPEG, PNG, WebP)")

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Empty image file uploaded")

    if len(image_bytes) > 15 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image file size exceeds 15MB limit")

    if not is_valid_image(image_bytes):
        raise HTTPException(status_code=400, detail="Uploaded file is not a valid image format (JPEG, PNG, WebP, BMP, GIF)")

    try:
        client = RoboflowClient()
        extracted = client.run_workflow_bytes(image_bytes)
    except RoboflowAPIKeyError as e:
        raise HTTPException(status_code=500, detail=f"Roboflow Configuration Error: {str(e)}")
    except RoboflowTimeoutError as e:
        raise HTTPException(status_code=504, detail=f"OCR Gateway Timeout: {str(e)}")
    except RoboflowOCRError as e:
        raise HTTPException(status_code=502, detail=f"OCR Service Error: {str(e)}")

    if not is_valid_business_card(extracted):
        raise HTTPException(
            status_code=422,
            detail="Bukan Kartu Nama yang valid! Objek yang dipindai tidak mengandung informasi kontak kartu nama (Nama, Telepon, Email, atau Jabatan). Harap foto kartu nama dengan jelas."
        )

    contact, is_dup, msg = contact_service.save_contact(extracted)
    return ExtractOCRResponse(
        status="duplicate_ignored" if is_dup else "inserted",
        message=msg,
        is_duplicate=is_dup,
        contact=contact
    )

@router.post("", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
def create_contact_manually(payload: ContactCreate, force: bool = Query(False, description="Force insertion even if duplicate detected")):
    """Manually add or confirm a contact record."""
    contact_dict = payload.model_dump()
    contact, is_dup, msg = contact_service.save_contact(contact_dict, force_insert=force)
    return contact

@router.get("", response_model=List[ContactResponse])
def list_contacts(
    role: Optional[str] = Query(None, description="Filter contacts by role"),
    company: Optional[str] = Query(None, description="Filter contacts by company name"),
    search: Optional[str] = Query(None, description="Search term for name, title, or email")
):
    """Retrieve contacts with optional filtering by role, company, or search term."""
    return contact_service.get_contacts(role=role, company=company, search=search)

@router.get("/by-role", response_model=List[RoleGroupResponse])
def list_contacts_by_role():
    """Retrieve contacts grouped by role category."""
    return contact_service.get_contacts_grouped_by_role()

@router.get("/{contact_id}", response_model=ContactResponse)
def get_contact(contact_id: int):
    """Retrieve contact details by ID."""
    contact = contact_service.get_contact_by_id(contact_id)
    if not contact:
        raise HTTPException(status_code=404, detail=f"Contact ID {contact_id} not found")
    return contact

@router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contact(contact_id: int):
    """Delete a contact by ID."""
    deleted = contact_service.delete_contact(contact_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Contact ID {contact_id} not found")
    return None
