import sqlite3
import re
from typing import List, Optional, Tuple, Dict
from app.database import get_db
from app.models import ContactCreate, ContactResponse

def categorize_role(job_title: Optional[str]) -> str:
    """Categorize role based on job_title keywords."""
    if not job_title:
        return "General"
    
    title_lower = job_title.lower()
    
    if any(kw in title_lower for kw in ["ceo", "cto", "cfo", "coo", "founder", "co-founder", "director", "president", "vp", "vice president", "head of", "chairman", "board", "committee"]):
        return "Executive"
    elif any(kw in title_lower for kw in ["manager", "lead", "supervisor", "head", "chief", "principal"]):
        return "Management"
    elif any(kw in title_lower for kw in ["engineer", "developer", "architect", "software", "programmer", "devops", "data", "tech"]):
        return "Engineering"
    elif any(kw in title_lower for kw in ["sales", "business development", "marketing", "account", "growth"]):
        return "Sales & Marketing"
    elif any(kw in title_lower for kw in ["designer", "ux", "ui", "product"]):
        return "Product & Design"
    elif any(kw in title_lower for kw in ["hr", "finance", "legal", "admin", "recruiter", "operations"]):
        return "Operations & Admin"
    else:
        return "General"

def find_duplicate_contact(conn: sqlite3.Connection, contact_data: Dict) -> Optional[sqlite3.Row]:
    """Find existing contact if email or phone or (name + company) matches."""
    email = (contact_data.get("email") or "").strip().lower()
    phone = (contact_data.get("phone") or "").strip()
    full_name = (contact_data.get("full_name") or "").strip().lower()
    company = (contact_data.get("company") or "").strip().lower()

    cursor = conn.cursor()

    # 1. Match by non-empty email
    if email:
        cursor.execute("SELECT * FROM contacts WHERE LOWER(email) = ?", (email,))
        match = cursor.fetchone()
        if match:
            return match

    # 2. Match by non-empty phone (stripped of non-digit characters for robust comparison)
    if phone:
        clean_phone = re.sub(r"\D", "", phone)
        if len(clean_phone) >= 7:
            cursor.execute("SELECT * FROM contacts WHERE phone IS NOT NULL AND phone != ''")
            for row in cursor.fetchall():
                row_phone = re.sub(r"\D", "", row["phone"] or "")
                if row_phone and (clean_phone == row_phone or clean_phone.endswith(row_phone) or row_phone.endswith(clean_phone)):
                    return row

    # 3. Match by full_name and company
    if full_name and company:
        cursor.execute("SELECT * FROM contacts WHERE LOWER(full_name) = ? AND LOWER(company) = ?", (full_name, company))
        match = cursor.fetchone()
        if match:
            return match

    return None

def save_contact(contact_data: Dict, db_path: Optional[str] = None) -> Tuple[ContactResponse, bool, str]:
    """
    Saves a contact into SQLite database.
    If duplicate exists, ignores insertion and returns existing contact.
    Returns (ContactResponse, is_duplicate, status_message)
    """
    full_name = contact_data.get("full_name") or "Unknown"
    job_title = contact_data.get("job_title") or ""
    
    given_role = contact_data.get("role")
    if not given_role or given_role == "General":
        role = categorize_role(job_title)
    else:
        role = given_role

    company = contact_data.get("company") or ""
    email = contact_data.get("email") or ""
    phone = contact_data.get("phone") or ""
    mobile = contact_data.get("mobile") or ""
    website = contact_data.get("website") or ""
    address = contact_data.get("address") or ""

    with get_db(db_path) as conn:
        existing = find_duplicate_contact(conn, contact_data)
        if existing:
            contact = ContactResponse(
                id=existing["id"],
                full_name=existing["full_name"],
                job_title=existing["job_title"],
                role=existing["role"],
                company=existing["company"],
                email=existing["email"],
                phone=existing["phone"],
                mobile=existing["mobile"],
                website=existing["website"],
                address=existing["address"],
                created_at=str(existing["created_at"]),
                updated_at=str(existing["updated_at"])
            )
            return contact, True, "Duplicate data ignored. Existing contact returned."

        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO contacts (full_name, job_title, role, company, email, phone, mobile, website, address)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (full_name, job_title, role, company, email, phone, mobile, website, address))
        conn.commit()
        
        contact_id = cursor.lastrowid
        cursor.execute("SELECT * FROM contacts WHERE id = ?", (contact_id,))
        row = cursor.fetchone()

        contact = ContactResponse(
            id=row["id"],
            full_name=row["full_name"],
            job_title=row["job_title"],
            role=row["role"],
            company=row["company"],
            email=row["email"],
            phone=row["phone"],
            mobile=row["mobile"],
            website=row["website"],
            address=row["address"],
            created_at=str(row["created_at"]),
            updated_at=str(row["updated_at"])
        )
        return contact, False, "Contact successfully extracted and saved."

def get_contacts(
    role: Optional[str] = None,
    company: Optional[str] = None,
    search: Optional[str] = None,
    db_path: Optional[str] = None
) -> List[ContactResponse]:
    """Retrieve contacts with optional filtering by role, company, or search term."""
    query = "SELECT * FROM contacts WHERE 1=1"
    params = []

    if role:
        query += " AND LOWER(role) = LOWER(?)"
        params.append(role)
    if company:
        query += " AND LOWER(company) LIKE LOWER(?)"
        params.append(f"%{company}%")
    if search:
        query += " AND (LOWER(full_name) LIKE LOWER(?) OR LOWER(job_title) LIKE LOWER(?) OR LOWER(email) LIKE LOWER(?))"
        pattern = f"%{search}%"
        params.extend([pattern, pattern, pattern])

    query += " ORDER BY created_at DESC"

    with get_db(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute(query, params)
        rows = cursor.fetchall()
        return [
            ContactResponse(
                id=r["id"],
                full_name=r["full_name"],
                job_title=r["job_title"],
                role=r["role"],
                company=r["company"],
                email=r["email"],
                phone=r["phone"],
                mobile=r["mobile"],
                website=r["website"],
                address=r["address"],
                created_at=str(r["created_at"]),
                updated_at=str(r["updated_at"])
            )
            for r in rows
        ]

def get_contacts_grouped_by_role(db_path: Optional[str] = None) -> List[Dict]:
    """Retrieve contacts categorized and grouped by role."""
    all_contacts = get_contacts(db_path=db_path)
    grouped: Dict[str, List[ContactResponse]] = {}
    
    for c in all_contacts:
        role_name = c.role or "General"
        if role_name not in grouped:
            grouped[role_name] = []
        grouped[role_name].append(c)

    return [
        {
            "role": role_name,
            "count": len(contacts_list),
            "contacts": contacts_list
        }
        for role_name, contacts_list in grouped.items()
    ]

def get_contact_by_id(contact_id: int, db_path: Optional[str] = None) -> Optional[ContactResponse]:
    """Retrieve a single contact by ID."""
    with get_db(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM contacts WHERE id = ?", (contact_id,))
        r = cursor.fetchone()
        if not r:
            return None
        return ContactResponse(
            id=r["id"],
            full_name=r["full_name"],
            job_title=r["job_title"],
            role=r["role"],
            company=r["company"],
            email=r["email"],
            phone=r["phone"],
            mobile=r["mobile"],
            website=r["website"],
            address=r["address"],
            created_at=str(r["created_at"]),
            updated_at=str(r["updated_at"])
        )

def delete_contact(contact_id: int, db_path: Optional[str] = None) -> bool:
    """Delete a contact by ID."""
    with get_db(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM contacts WHERE id = ?", (contact_id,))
        conn.commit()
        return cursor.rowcount > 0
