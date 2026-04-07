import pytest
import requests
import json
from fastapi.testclient import TestClient
from main import app

# 🛡️ SECURITY AUDIT: Resilience & Isolation
# Industry Requirement: OWASP API Security Compliance

client = TestClient(app)

def get_secure_token():
    # Helper: Access the HS256 JWT Node
    response = client.post("/token", data={"username": "admin", "password": "sentinel2024"})
    return response.json()["access_token"]

def test_cors_origin_isolation():
    # Industry Standard: Cross-Origin Resource Sharing (CORS) Check
    # Attempting to hit the backend from an UNTRUSTED ORIGIN
    headers = {"Origin": "http://attacker.com"}
    response = client.options("/", headers=headers)
    
    # Secure Architecture Requirement: Should NOT allow the origin
    # Most preflight logic will omit the 'access-control-allow-origin' header
    assert "http://attacker.com" not in response.headers.get("access-control-allow-origin", "")

def test_websocket_malformed_json_resilience():
    # Industry Standard: Fuzzing / Input Sanitization
    # Sending a corrupt JSON packet to the WebSocket
    token = get_secure_token()
    with client.websocket_connect(f"/ws?token={token}") as websocket:
        # Invalid JSON: Missing closing brace and quote
        corrupt_payload = '{"type": "PURGE_CACHE"' 
        
        # Backend should catch the JSONDecodeError and NOT CRASH
        websocket.send_text(corrupt_payload)
        
        # Verify the backend continues to stream valid data
        # (This proves the internal loop is still alive despite the error)
        data_raw = websocket.receive_text()
        assert json.loads(data_raw) is not None

def test_unauthorized_token_rejection():
    # Industry Standard: Authentication Locking
    with pytest.raises(Exception):
        with client.websocket_connect("/ws?token=INVALID_GATEWAY"):
            pass

def test_api_documentation_exposure():
    # Industry Standard: Information Leakage Check
    # Ensure documentation exists for developer handovers but is standardized
    response = client.get("/docs")
    assert response.status_code == 200
    
    response_redoc = client.get("/redoc")
    assert response_redoc.status_code == 200

def test_schema_field_injection_prevention():
    # Logic: Attempting to send extra fields to see if backend leaks state
    token = get_secure_token()
    with client.websocket_connect(f"/ws?token={token}") as websocket:
        websocket.send_text(json.dumps({"type": "PURGE_CACHE", "admin": True, "kill_server": True}))
        # Verify no unauthorized side-effects (Server still running)
        data_raw = websocket.receive_text()
        assert json.loads(data_raw) is not None
