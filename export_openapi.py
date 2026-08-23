import json
from app.main import app

def generate_openapi_json(output_file: str = "openapi.json"):
    """
    Generates and saves the OpenAPI spec JSON from FastAPI app.
    Can be imported into Postman, Insomnia, Swagger UI, or API gateways.
    """
    openapi_schema = app.openapi()
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(openapi_schema, f, indent=2)
    print(f"✅ OpenAPI specification exported to '{output_file}' successfully!")

if __name__ == "__main__":
    generate_openapi_json()
