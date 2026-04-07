import sqlite3
import json
from datetime import datetime
from pathlib import Path

# 🏛️ INDUSTRY STANDARDS: Relational Persistence (v2.5)
DB_PATH = Path("aurora_intelligence.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Store Intelligence Signals with relational integrity
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS signals (
            id TEXT PRIMARY KEY,
            username TEXT,
            text TEXT,
            sentiment TEXT,
            emotion TEXT,
            intensity REAL,
            topic TEXT,
            timestamp TEXT,
            audit_trail TEXT,
            source TEXT,
            model_version TEXT
        )
    ''')
    conn.commit()
    conn.close()

def save_signal(signal_data: dict):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Convert 'audit' dict to JSON string for persistence
    audit_json = json.dumps(signal_data.get("audit", {}))
    
    cursor.execute('''
        INSERT OR IGNORE INTO signals VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        signal_data["id"],
        signal_data["username"],
        signal_data["text"],
        signal_data["sentiment"],
        signal_data["emotion"],
        signal_data["intensity"],
        signal_data["topic"],
        signal_data["timestamp"],
        audit_json,
        signal_data["source"],
        signal_data["model_version"]
    ))
    conn.commit()
    conn.close()

def clear_all_intelligence():
    """Purge Database (Triggered by Global Purge)"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM signals")
    conn.commit()
    conn.close()

def get_stats():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Polarity Distribution
    cursor.execute("SELECT sentiment, COUNT(*) FROM signals GROUP BY sentiment")
    stats = dict(cursor.fetchall())
    
    # Emotional Decomposition (The WOW factor)
    cursor.execute("SELECT emotion, COUNT(*) FROM signals GROUP BY emotion")
    emotions = dict(cursor.fetchall())
    stats.update(emotions)
    
    # Topic Momentum (Trending Vectors)
    cursor.execute("SELECT topic, COUNT(*) FROM signals GROUP BY topic ORDER BY COUNT(*) DESC LIMIT 5")
    topics = dict(cursor.fetchall())
    stats["topics_ranking"] = topics
    
    # Risk Thermal Analytics (Mapping last 24 pulses)
    cursor.execute("SELECT intensity FROM signals ORDER BY timestamp DESC LIMIT 24")
    risk_pulses = [row[0] for row in cursor.fetchall()]
    stats["risk_thermal"] = risk_pulses + [0] * (24 - len(risk_pulses))
    
    # Global Negative Count for Active Controversies
    stats["controversy_count"] = stats.get("negative", 0)
    
    # Total Secured Intelligence (Pulse Count)
    cursor.execute("SELECT COUNT(*) FROM signals")
    stats["total"] = cursor.fetchone()[0]
    
    conn.close()
    return stats
