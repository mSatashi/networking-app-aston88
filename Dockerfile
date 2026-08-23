FROM python:3.12-slim

# Prevent Python from writing .pyc files and enable unbuffered output
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies if required
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create data directory for SQLite persistence
RUN mkdir -p /app/data

# Copy application source code
COPY app/ ./app/
COPY export_openapi.py .

# Default environment variable for SQLite database path inside container
ENV DATABASE_PATH=/app/data/contacts.db

# Expose FastAPI default port
EXPOSE 8000

# Run Uvicorn server in production mode
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
