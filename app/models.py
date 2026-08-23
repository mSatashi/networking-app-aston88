from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict
from datetime import datetime

class ContactBase(BaseModel):
    full_name: str = Field(..., description="Full name of contact", examples=["Jane Doe"])
    job_title: Optional[str] = Field(None, description="Job title / position", examples=["Senior Software Engineer"])
    role: Optional[str] = Field("General", description="Derived role category (e.g. Executive, Engineering, Management)", examples=["Engineering"])
    company: Optional[str] = Field(None, description="Company or organization", examples=["Tech Corp"])
    email: Optional[str] = Field(None, description="Email address", examples=["jane.doe@techcorp.com"])
    phone: Optional[str] = Field(None, description="Phone number", examples=["+62 812 3456 7890"])
    mobile: Optional[str] = Field(None, description="Mobile number", examples=["+62 812 3456 7890"])
    website: Optional[str] = Field(None, description="Website URL", examples=["https://techcorp.com"])
    address: Optional[str] = Field(None, description="Physical address", examples=["Jakarta, Indonesia"])

class ContactCreate(ContactBase):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "full_name": "Jane Doe",
                "job_title": "Chief Technology Officer",
                "company": "Tech Innovations Inc.",
                "email": "jane.doe@techinnovations.com",
                "phone": "+62 812 9876 5432",
                "website": "https://techinnovations.com"
            }
        }
    )

class ContactResponse(ContactBase):
    id: int = Field(..., examples=[1])
    created_at: str = Field(..., examples=["2026-08-23T15:00:00"])
    updated_at: str = Field(..., examples=["2026-08-23T15:00:00"])

    model_config = ConfigDict(from_attributes=True)

class ExtractURLRequest(BaseModel):
    image_url: str = Field(..., description="URL of business card image to extract", examples=["https://images.unsplash.com/photo-1589829545856-d10d557cf95f"])

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "image_url": "https://images.unsplash.com/photo-1589829545856-d10d557cf95f"
            }
        }
    )

class ExtractOCRResponse(BaseModel):
    status: str = Field(..., description="'inserted' or 'duplicate_ignored'", examples=["inserted"])
    message: str = Field(..., examples=["Contact successfully created and assigned to Engineering role."])
    is_duplicate: bool = Field(..., examples=[False])
    contact: ContactResponse

class RoleGroupResponse(BaseModel):
    role: str = Field(..., examples=["Engineering"])
    count: int = Field(..., examples=[5])
    contacts: List[ContactResponse]


