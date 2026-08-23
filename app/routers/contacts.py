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

def is_valid_image(content: bytes) -> bool:
    """Validate image bytes using magic byte signatures (JPEG, PNG, WebP, GIF, BMP)."""
    if len(content) < 12:
        return False
    # JPEG
    if content.startswith(b"\xff\xd8\xff"):
        return True
    # PNG
    if content.startswith(b"\x89PNG\r\n\x1a\n"):
        return True
    # WebP (RIFF + WEBP)
    if content.startswith(b"RIFF") and content[8:12] == b"WEBP":
        return True
    # GIF
    if content.startswith(b"GIF87a") or content.startswith(b"GIF89a"):
        return True
    # BMP
    if content.startswith(b"BM"):
        return True
    return False

@router.post("/extract-url", response_model=ExtractOCRResponse, status_code=status.HTTP_201_CREATED)
def extract_contact_from_url(payload: ExtractURLRequest):
    """
    Extract contact details from image URL via Roboflow OCR Workflow.
    Extracted data is categorized by role and saved to SQLite DB.
    If contact already exists (duplicate email/phone), duplicate insertion is ignored.
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

    # Ensure meaningful contact data was detected
    has_name = bool(extracted.get("full_name") and extracted.get("full_name") != "Unknown")
    has_contact_info = bool(extracted.get("email") or extracted.get("phone") or extracted.get("company") or extracted.get("job_title"))
    
    if not has_name and not has_contact_info:
        raise HTTPException(
            status_code=422,
            detail="Unable to detect business card or extract contact details from this image. Please upload a clear business card photo."
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
    Extracted data is categorized by role and saved to SQLite DB.
    If contact already exists (duplicate email/phone), duplicate insertion is ignored.
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

    # Ensure meaningful contact data was detected
    has_name = bool(extracted.get("full_name") and extracted.get("full_name") != "Unknown")
    has_contact_info = bool(extracted.get("email") or extracted.get("phone") or extracted.get("company") or extracted.get("job_title"))

    if not has_name and not has_contact_info:
        raise HTTPException(
            status_code=422,
            detail="Unable to detect business card or extract contact details from this image. Please upload a clear business card photo."
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
    role: Optional[str] = Query(None, description="Filter contacts by role (e.g. Executive, Engineering, Management, Sales & Marketing)"),
    company: Optional[str] = Query(None, description="Filter contacts by company name"),
    search: Optional[str] = Query(None, description="Search term for name, title, or email")
):
    """Retrieve contacts with optional filtering by role, company, or search term."""
    return contact_service.get_contacts(role=role, company=company, search=search)

@router.get("/by-role", response_model=List[RoleGroupResponse])
def get_contacts_by_role():
    """Retrieve contacts grouped by role category."""
    return contact_service.get_contacts_grouped_by_role()

@router.get("/{contact_id}", response_model=ContactResponse)
def get_contact_detail(contact_id: int):
    """Get single contact by ID."""
    contact = contact_service.get_contact_by_id(contact_id)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    return contact

@router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_contact(contact_id: int):
    """Delete contact by ID."""
    success = contact_service.delete_contact(contact_id)
    if not success:
        raise HTTPException(status_code=404, detail="Contact not found")
    return None
