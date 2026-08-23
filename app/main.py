from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import init_db
from app.routers import contacts

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database
    init_db()
    yield
    # Shutdown logic if any

app = FastAPI(
    title="Networking App - Business Card OCR Backend API",
    description="Backend API for retrieving business card data via Roboflow OCR, storing in database, ignoring duplicate records, and keeping contacts categorized by role.",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS so any frontend (React, Vue, mobile app, Next.js, etc.) can connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(contacts.router)

@app.get("/", tags=["Health"])
def health_check():
    return {
        "status": "online",
        "service": "Business Card OCR & Contact Management Backend API",
        "version": "1.0.0",
        "docs": "/docs"
    }
