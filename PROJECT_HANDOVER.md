# 🏛️ Aurora Sentinel Enterprise (v2.5-Final) Project Handover

This document serves as the high-level architectural map for the **Aurora Sentinel** intelligence engine. It defines the structural integrity, security protocols, and data-flows established during the v2.2 restoration and v2.5 hardening phase.

## 📡 1. High-Fidelity Infrastructure
The engine operates on a three-layer "Pulse" architecture designed for low-latency, high-accuracy inference:
*   **L1 (VADER Layer)**: Real-time kinetic sentiment auditing (Intensity & Polarity).
*   **L2 (RoBERTa-L Layer)**: Deep-learning emotional decomposition (GSI Emotional Corpus).
*   **L3 (Ollama Audit)**: Human-intelligence simulation for "Neural Entropy" verification.

## 🔐 2. Security & Handshake Protocol
The dashboard is secured by an industry-standard **JWT (JSON Web Token)** authentication system:
*   **Authentication Hub**: `HS256` Cryptographic signing for all bearer tokens.
*   **Bearer Handshake**: Every WebSocket bridge (`/ws`) requires an encrypted `?token=` parameter for connection authorization.
*   **Access Credentials**: Restricted to the **Operator ID: `admin`** and **Access Key: `sentinel2024`**.

## 📊 3. Relational Persistence Node (SQLite)
Unlike earlier versions, v2.5 utilizes a persistent **SQL Data Warehouse** (`aurora_intelligence.db`):
*   **Database Schema**: Relational storage for signal IDs, Text, Sentiment, Emotion, Intensity, and Audit Trails.
*   **Persistence Sync**: Every Alpha Stream pulse is archived to the warehouse before rendering.
*   **Session Portability**: Data is exportable as a CSV briefing for secondary analytical review.

## 🛠️ 4. Functional Suite (Terminal Manual)
*   **Alpha Stream Intelligence**: Dynamic real-time signal flow with intensity bars.
*   **Neural Sandbox**: Interactive inference sandbox for manual signal decomposition.
*   **Fuzzy Search Bridge**: High-performance stream filtering by keyword or topic.
*   **Trending Vectors**: Kinetic momentum tracking for topic velocities.
*   **Global Intelligence Purge**: Nuclear-reset trigger for both frontend state and SQL database.

---

## 🚥 Final Launch Sequence
To initialize the full enterprise suite:
**Backend**: `cd backend; python main.py`
**Frontend**: `cd frontend; npx vite --port 3000 --host 127.0.0.1`
**Terminal**: [http://127.0.0.1:3000](http://127.0.0.1:3000)

**Project officially stabilized and ready for documentation/handover.**
