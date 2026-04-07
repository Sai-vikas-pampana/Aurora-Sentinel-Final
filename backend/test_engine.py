import pytest
import json
from sentiment_engine import AuroraSentimentModel
from main import app
from fastapi.testclient import TestClient
from fastapi.websockets import WebSocket

# 🧠 UNIT TEST: Sentiment Engine Integrity
def test_engine_preprocessing():
    engine = AuroraSentimentModel()
    raw_text = "Check out https://google.com for NEWS!!! 😊"
    processed = engine.preprocess(raw_text)
    # Industry Requirement: URLs removed, special chars cleaned, emoji-friendly
    assert "https://google.com" not in processed
    assert "news" in processed
    assert "!!!" not in processed

def test_engine_prediction_ranges():
    engine = AuroraSentimentModel()
    prediction = engine.predict()
    # Industry Requirement: Strict probability bounds [0, 1]
    assert 0 <= prediction["intensity"] <= 1
    assert "audit_trail" in prediction
    assert "l1_vader_baseline" in prediction["audit_trail"]

def test_engine_calibration_fallback():
    # Test behavior when dataset is missing/corrupt
    engine = AuroraSentimentModel(data_path="NON_EXISTENT_FILE.json")
    prediction = engine.predict()
    # Core logic must remain resilient via fallbacks
    assert prediction["sentiment"] in ["positive", "negative", "neutral"]

# 📡 INTEGRATION TEST: API & Schema Validation
client = TestClient(app)

def get_secure_token():
    # Helper: Access the HS256 JWT Node
    response = client.post("/token", data={"username": "admin", "password": "sentinel2024"})
    return response.json()["access_token"]

def test_api_health_check():
    response = client.get("/")
    assert response.status_code == 200
    assert "Aurora Sentinel" in response.json()["title"]

def test_websocket_analytical_payload_sync():
    # Industry Requirement: Verify 14-Section Stats Convergence
    token = get_secure_token()
    with client.websocket_connect(f"/ws?token={token}") as websocket:
        # Loop until we receive the first STATS_UPDATE packet (sent every 5 signals)
        stats_packet = None
        for _ in range(10):
            data_raw = websocket.receive_text()
            data = json.loads(data_raw)
            if data.get("type") == "STATS_UPDATE":
                stats_packet = data["stats"]
                break
        
        assert stats_packet is not None, "Error: STATS_UPDATE packet not received within 10 frames."
        
        # Verify Dynamic Analytics Fields
        assert "total" in stats_packet
        assert "topics_ranking" in stats_packet, "Error: Trending Vectors (Topic Ranking) missing from stats."
        assert "risk_thermal" in stats_packet, "Error: Risk Heatmap mappings missing from stats."
        assert len(stats_packet["risk_thermal"]) == 24, "Error: Risk Thermal grid must exactly match the 24-pulse architecture."
        assert "controversy_count" in stats_packet

def test_bi_directional_purge_command():
    token = get_secure_token()
    with client.websocket_connect(f"/ws?token={token}") as websocket:
        # Send a Control Signal to the Backend
        websocket.send_text(json.dumps({"type": "PURGE_CACHE"}))
        # Ensure the backend remains stable and continues to broadcast
        data_raw = websocket.receive_text()
        assert json.loads(data_raw) is not None
