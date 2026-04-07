# 🛡️ Aurora Sentinel Enterprise (v2.5) Operator's High-Fidelity Guide

This manual defines the interaction procedures for the **Aurora Sentinel** intelligence platform. 

## 🚥 1. Dashboard Handshake (Login)
To access the secure **Alpha Stream**, you must first initialize an **HS256 Bearer Session**:
1.  **Operator ID**: `admin`
2.  **Access Key**: `sentinel2024`
3.  **Logic**: The backend node will generate a 30-minute JWT token. If the stream disconnects, perform a **Sign Out** and re-authorize to refresh the token.

## 📡 2. Neural Sandbox (Interactive Inference)
The **Neural Sandbox** (at the bottom-left) allows you to manually "Inject" custom intelligence into the inference engine:
1.  **Usage**: Type any raw signal (e.g., *"This market pivot is absolutely insane! 🚀"*) into the sandbox terminal.
2.  **Logic**: Clicking **"Run Neural Audit"** will trigger an L2/L3 audit on your input.
3.  **Fidelity**: The system will return a **Prediction (Emotion | Sentiment)** and an **Intensity Score (%)**, reflecting the model's confidence in the input's emotional bias.

## 🔎 3. Fuzzy-Search Bridge (Keyword Isolation)
The search bridge is located at the top of the **Alpha Stream Intelligence** feed:
1.  **Usage**: Enter keywords (e.g., *"Crypto"*, *"Climate"*, or *"@stella"*) to live-filter the intelligence stream.
2.  **Efficiency**: The frontend filters the 50 most recent signals in real-time, allowing for instant isolation of specific topics or users.

## 📊 4. Global Export & Data Persistence
The **Aurora Sentinel** archives every incoming signal to a **SQLite Data Warehouse**:
1.  **Export Briefing**: Click **"Download Session Briefing"** in the header to generate a **CSV file** of the entire intelligence database. This includes IDs, Timestamps, and Audit Trails.
2.  **Global Purge**: Clicking **"Global Intelligence Purge"** will permanently clear all records from both the dashboard and the underlying SQL database for a fresh intelligence cycle.

---

## 🚥 Quick-Launch Checklist
*   **Active Directory**: [http://127.0.0.1:3000](http://127.0.0.1:3000)
*   **Node Integrity**: Green dot lit in header.
*   **Security Bridge**: Token active (Bearer Session).
*   **Infrastructure Pulse**: Header indicators showing 'Active Tensor DB' and 'Node US-EAST'.

**The intelligence platform is officially mission-capable and documented for final handover.**
