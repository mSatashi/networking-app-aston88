import pytest
from app.services.roboflow_client import RoboflowClient, RoboflowOCRError

SAMPLE_CARD_URL = "https://source.roboflow.com/CbcUSfOENQWXY8E9gFyZFQ95fO63/ZMRAvwbtUV6f9EUDTlS7/original.jpg"

def test_roboflow_ocr_smoke_test():
    """
    Smoke test for Roboflow OCR Workflow 'Business Card Information Extractor'.
    Ensures that calling the workflow returns expected parsed fields.
    """
    client = RoboflowClient()
    result = client.run_workflow_image_url(SAMPLE_CARD_URL)
    
    # Assert result is a dictionary containing extracted keys
    assert isinstance(result, dict)
    assert "full_name" in result
    assert "job_title" in result
    assert "company" in result
    assert "email" in result
    assert "phone" in result
    assert "mobile" in result
    assert "website" in result
    assert "address" in result

    # Assert parsed sample card data match expected values
    assert "Efo Akmal" in result["full_name"]
    assert "KAMAR DAGANG" in result["company"]
    assert "hr@ptars.tch" in result["email"]
    assert "+62 819 0505 4148" in result["phone"]
