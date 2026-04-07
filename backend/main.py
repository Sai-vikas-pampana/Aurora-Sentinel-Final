from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from jose import JWTError, jwt
import asyncio
import json
import random
import logging
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from sentiment_engine import AuroraSentimentModel
import database

# 🛡️ SECURITY SCHEMA: v2.5 Hardened
SECRET_KEY = "AURORA_SENTINEL_Ω_PROD_KEY"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Initialize Subsystems
database.init_db()
logging.basicConfig(
    filename="system_audit.log",
    level=logging.INFO,
    format='%(asctime)s | %(levelname)s | %(message)s'
)
logger = logging.getLogger("AuroraAudit")

class IntelligenceSignal(BaseModel):
    id: str
    username: str
    text: str
    sentiment: str
    emotion: str
    intensity: float
    topic: str
    timestamp: str
    audit: Dict[str, Any]
    source: str
    model_version: str

class Token(BaseModel):
    access_token: str
    token_type: str

app = FastAPI(title="Aurora Sentinel Enterprise v2.5")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔐 AUTHENTICATION LOGIC: JWT & OAuth2
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@app.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # Enterprise Check (Simple Simulation)
    if form_data.username == "admin" and form_data.password == "sentinel2024":
        access_token = create_access_token(data={"sub": form_data.username})
        logger.info(f"Admin Access Granted: {form_data.username}")
        return {"access_token": access_token, "token_type": "bearer"}
    raise HTTPException(status_code=400, detail="INVALID_INTEL_CREDENTIALS")

@app.get("/")
def health_check():
    return {
        "status": "SECURED",
        "title": "Aurora Sentinel Enterprise API",
        "version": "v2.5-Handover",
        "persistence": "SQLite/aurora_intelligence.db"
    }

# 📡 INTELLIGENCE STREAM: Persistence-Backed
MESSAGES = {
    "Happy": ["Significant market surge in tech sector! 🚀 #Bullish", "Record-breaking adoption rates for the new AI protocols!", "Positive community feedback on the latest transparency report."],
    "Joy": ["I'm so excited about the new space launch results! 🌌", "Incredible energy at the global tech summit today!", "Celebrating a major milestone in decentralized finance! ✨"],
    "Angry": ["Unexpected regulatory pushback on AI protocols. #Frustrated", "Everything is breaking in the new update, super disappointed.", "Lack of action on data privacy is deeply concerning. 😡"],
    "Fear": ["The lack of action on climate is deeply worrying. 🌍", "Security breach detected in some early-access nodes. #StaySafe", "Market volatility reaching unprecedented levels—proceed with caution."],
    "Surprise": ["Interesting points made in the latest research paper on quantum computing.", "Wait, the model accuracy just jumped by 15% overnight?! 😮", "Did not expect this market pivot after the recent earnings call."],
    "Neutral": ["Minor system delay in data ingestion pipelines. #Maintenance", "Just another quiet day in the venture capital world.", "Regulatory review for the new GSI standards is ongoing."],
    "Inspired": ["The vision for 2050 sustainable cities is truly transformative.", "New leadership in the AI space is promising for ethical development.", "The power of collaborative intelligence is finally being realized."],
    "Sad": ["Rising concerns about AI job displacement in the manufacturing sector.", "Economic signals are quite worrying for the next quarter. 📉", "Another extreme weather event reported—urgent action required."],
    "Disgust": ["Unethical data harvesting practices are being exposed daily. 🤮", "The level of corporate greed in the latest leak is sickening.", "Gross negligence in the safety protocols for the new chemical plant."],
    "Excited": ["Pre-orders for the next-gen neural link are through the roof!", "Can't wait to see the impact of this new decentralization model! ⚡", "The energy in the startup ecosystem is absolutely electric!"],
    "Observant": ["Noticing a subtle shift in market sentiment towards green energy.", "Observing standard patterns in the global emotional corpus today.", "Taking note of the increasing adoption of privacy-first technologies."]
}

TOPICS = ["Tech", "Climate Change", "AI Ethics", "Space Exploration", "Venture Capital", "Cryptocurrency", "Global Economy"]
USERS = ["@cyber_pulse", "@stella_maris", "@quantum_leaper", "@green_earth", "@fin_future", "@atlas_tech"]

engine = AuroraSentimentModel()

from fastapi.responses import StreamingResponse
import io
import csv

@app.post("/sandbox")
async def manual_audit(text: str):
    # Industry Requirement: Interactive Model Testing
    prediction = engine.predict_custom(text) if hasattr(engine, 'predict_custom') else engine.predict()
    logger.info(f"Manual Audit Executed: {text[:30]}...")
    return prediction

@app.get("/export")
async def export_intelligence():
    # Industry Requirement: Global Intelligence Portability (CSV)
    import sqlite3
    conn = sqlite3.connect("aurora_intelligence.db")
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM signals")
    rows = cursor.fetchall()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Username", "Text", "Sentiment", "Emotion", "Intensity", "Topic", "Timestamp", "Audit", "Source", "Model"])
    writer.writerows(rows)
    
    response = StreamingResponse(iter([output.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=aurora_session_briefing.csv"
    return response

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    # Industrial Hardening: JWT Verification from Query Param
    token = websocket.query_params.get("token")
    try:
        if not token: raise Exception()
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        logger.info(f"Stream Access Verified: {payload.get('sub')}")
    except:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        logger.warning(f"UNAUTHORIZED_STREAM_ATTEMPT BLOCKED")
        return

    await websocket.accept()
    try:
        count = 0
        while True:
            prediction = engine.predict()
            count += 1
            
            # Periodically broadcast global intelligence stats
            if count % 5 == 0:
                stats = database.get_stats()
                await websocket.send_text(json.dumps({
                    "type": "STATS_UPDATE",
                    "stats": stats
                }))
            try:
                client_raw = await asyncio.wait_for(websocket.receive_text(), timeout=0.001)
                client_cmd = json.loads(client_raw)
                if client_cmd.get("type") == "PURGE_CACHE":
                    database.clear_all_intelligence()
                    logger.info("Global Intelligence Purge Triggered.")
            except: pass

            emotion = prediction["emotion"]
            raw_text = prediction["text"]
            if not raw_text:
                raw_text = random.choice(MESSAGES.get(emotion, MESSAGES["Neutral"]))
            
            processed_text = engine.preprocess(raw_text)
            signal_data = {
                "id": f"GSI-{random.randint(1000, 9999)}-Ω",
                "username": random.choice(USERS),
                "text": processed_text,
                "sentiment": prediction["sentiment"],
                "emotion": prediction["emotion"],
                "intensity": prediction["intensity"],
                "topic": random.choice(TOPICS),
                "timestamp": datetime.now().isoformat(),
                "audit": prediction["audit_trail"],
                "source": "GSI Emotional Corpus (v2.5 Enterprise)",
                "model_version": "RoBERTa-L / Calibrated v2.5"
            }
            
            # Archive to Persistence Layer
            database.save_signal(signal_data)
            
            await websocket.send_text(json.dumps(signal_data))
            await asyncio.sleep(random.uniform(0.8, 2.5))
    except WebSocketDisconnect: 
        logger.info("Intelligence Terminal Disconnected.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
