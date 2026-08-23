from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict
from datetime import datetime

class ContactBase(BaseModel):
    full_name: str = Field(..., description="Full name of contact")
    job_title: Optional[str] = Field(None, description="Job title / position")
    role: Optional[str] = Field("General", description="Derived role category (e.g. Executive, Engineering, Management)")
    company: Optional[str] = Field(None, description="Company or organization")
    email: Optional[str] = Field(None, description="Email address")
    phone: Optional[str] = Field(None, description="Phone number")
    mobile: Optional[str] = Field(None, description="Mobile number")
    website: Optional[str] = Field(None, description="Website URL")
    address: Optional[str] = Field(None, description="Physical address")

class ContactCreate(ContactBase):
    pass

class ContactResponse(ContactBase):
    id: int
    created_at: str
    updated_at: str

    model_config = ConfigDict(from_attributes=True)

class ExtractURLRequest(BaseModel):
    image_url: str = Field(..., description="URL of business card image to extract")

class ExtractOCRResponse(BaseModel):
    status: str = Field(..., description="'inserted' or 'duplicate_ignored'")
    message: str
    is_duplicate: bool
    contact: ContactResponse

class RoleGroupResponse(BaseModel):
    role: str
    count: int
    contacts: List[ContactResponse]
