import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    ROBOFLOW_API_KEY: str = os.getenv("ROBOFLOW_API_KEY", "")
    ROBOFLOW_WORKSPACE: str = os.getenv("ROBOFLOW_WORKSPACE", "muhammad-sayyid-tsabit-anfaresi")
    ROBOFLOW_WORKFLOW_ID: str = os.getenv("ROBOFLOW_WORKFLOW_ID", "business-card-information-extractor-1787034042585")
    ROBOFLOW_API_URL: str = os.getenv("ROBOFLOW_API_URL", "https://serverless.roboflow.com")
    DATABASE_PATH: str = os.getenv("DATABASE_PATH", "contacts.db")

settings = Settings()
