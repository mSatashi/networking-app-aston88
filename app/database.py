import sqlite3
import os
from contextlib import contextmanager
from typing import Generator
from app.config import settings

def get_db_path() -> str:
    return settings.DATABASE_PATH

def init_db(db_path: str = None) -> None:
    path = db_path or get_db_path()
    dir_name = os.path.dirname(path)
    if dir_name:
        os.makedirs(dir_name, exist_ok=True)
    conn = sqlite3.connect(path)
    cursor = conn.cursor()

    # Create contacts table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        job_title TEXT,
        role TEXT NOT NULL DEFAULT 'General',
        company TEXT,
        email TEXT,
        phone TEXT,
        mobile TEXT,
        website TEXT,
        address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Create indexes for efficient filtering and duplicate checking
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_contacts_role ON contacts(role)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_contacts_phone ON contacts(phone)")

    conn.commit()
    conn.close()

@contextmanager
def get_db(db_path: str = None) -> Generator[sqlite3.Connection, None, None]:
    path = db_path or get_db_path()
    dir_name = os.path.dirname(path)
    if dir_name:
        os.makedirs(dir_name, exist_ok=True)
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()
