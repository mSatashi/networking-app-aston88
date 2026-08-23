import base64
import time
import logging
from typing import Dict, Any, Union, Optional
import httpx
from app.config import settings

logger = logging.getLogger(__name__)

class RoboflowOCRError(Exception):
    """Base exception for Roboflow OCR failures."""
    pass

class RoboflowTimeoutError(RoboflowOCRError):
    """Raised when request to Roboflow times out."""
    pass

class RoboflowAPIKeyError(RoboflowOCRError):
    """Raised when API key is missing or invalid."""
    pass


class RoboflowClient:
    def __init__(
        self,
        api_key: Optional[str] = None,
        workspace_name: Optional[str] = None,
        workflow_id: Optional[str] = None,
        api_url: Optional[str] = None,
        timeout: float = 30.0,
        max_retries: int = 3
    ):
        self.api_key = api_key or settings.ROBOFLOW_API_KEY
        self.workspace_name = workspace_name or settings.ROBOFLOW_WORKSPACE
        self.workflow_id = workflow_id or settings.ROBOFLOW_WORKFLOW_ID
        self.api_url = (api_url or settings.ROBOFLOW_API_URL).rstrip("/")
        self.timeout = timeout
        self.max_retries = max_retries

        if not self.api_key:
            raise RoboflowAPIKeyError("ROBOFLOW_API_KEY environment variable is not set")

    def run_workflow_image_url(self, image_url: str) -> Dict[str, Any]:
        """Run Roboflow OCR workflow using image URL."""
        payload = {
            "api_key": self.api_key,
            "inputs": {
                "image": {
                    "type": "url",
                    "value": image_url
                }
            }
        }
        return self._execute_request(payload)

    def run_workflow_base64(self, base64_image: str) -> Dict[str, Any]:
        """Run Roboflow OCR workflow using base64 image data."""
        payload = {
            "api_key": self.api_key,
            "inputs": {
                "image": {
                    "type": "base64",
                    "value": base64_image
                }
            }
        }
        return self._execute_request(payload)

    def run_workflow_bytes(self, image_bytes: bytes) -> Dict[str, Any]:
        """Run Roboflow OCR workflow using raw image bytes."""
        base64_encoded = base64.b64encode(image_bytes).decode("utf-8")
        return self.run_workflow_base64(base64_encoded)

    def _execute_request(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Execute REST API POST call with retries, backoff, and defensive error parsing."""
        endpoint = f"{self.api_url}/{self.workspace_name}/workflows/{self.workflow_id}"
        
        last_exception = None
        for attempt in range(1, self.max_retries + 1):
            try:
                with httpx.Client(timeout=self.timeout) as client:
                    response = client.post(endpoint, json=payload)

                if response.status_code == 401 or response.status_code == 403:
                    raise RoboflowAPIKeyError(f"Roboflow API Authentication failed (status {response.status_code})")

                response.raise_for_status()
                data = response.json()
                return self.parse_workflow_response(data)

            except httpx.TimeoutException as e:
                last_exception = RoboflowTimeoutError(f"Roboflow request timed out after {self.timeout}s: {e}")
                logger.warning(f"Attempt {attempt}/{self.max_retries} failed with timeout. Retrying...")
            except httpx.HTTPStatusError as e:
                last_exception = RoboflowOCRError(f"Roboflow HTTP error {e.response.status_code}: {e.response.text}")
                logger.warning(f"Attempt {attempt}/{self.max_retries} failed with HTTP status: {e}")
            except Exception as e:
                if isinstance(e, RoboflowOCRError):
                    raise e
                last_exception = RoboflowOCRError(f"Failed to communicate with Roboflow: {str(e)}")
                logger.warning(f"Attempt {attempt}/{self.max_retries} failed: {e}")

            if attempt < self.max_retries:
                time.sleep(2 ** (attempt - 1))  # Exponential backoff (1s, 2s, 4s...)

        raise last_exception or RoboflowOCRError("Failed to execute Roboflow workflow after retries")

    def parse_workflow_response(self, response_data: Dict[str, Any]) -> Dict[str, Any]:
        """Defensively parse the workflow response to extract record dictionary."""
        outputs = response_data.get("outputs", [])
        if not outputs or not isinstance(outputs, list):
            raise RoboflowOCRError("Invalid or empty outputs received from Roboflow workflow")

        first_output = outputs[0]
        if not isinstance(first_output, dict):
            raise RoboflowOCRError("Unexpected output structure in Roboflow response")

        # Defensive extraction of parsed record fields
        record = first_output.get("record", {})
        if isinstance(record, dict) and record:
            return {
                "full_name": record.get("full_name", "").strip(),
                "job_title": record.get("job_title", "").strip(),
                "company": record.get("company", "").strip(),
                "email": record.get("email", "").strip().lower(),
                "phone": record.get("phone", "").strip(),
                "mobile": record.get("mobile", "").strip(),
                "website": record.get("website", "").strip(),
                "address": record.get("address", "").strip(),
                "parse_error": first_output.get("parse_error", False)
            }

        # Fallback if record dictionary is missing
        extracted_text = first_output.get("extracted_data", "")
        return {
            "full_name": "",
            "job_title": "",
            "company": "",
            "email": "",
            "phone": "",
            "mobile": "",
            "website": "",
            "address": "",
            "parse_error": True,
            "raw_output": str(extracted_text)
        }
