# 🛡️ Aurora Sentinel Enterprise
### Real-Time Social Media Sentiment Intelligence Engine (v2.0)

Aurora Sentinel is a high-fidelity intelligence dashboard designed to monitor and analyze social media sentiment at scale. This project combines modern deep learning logic with a premium "Command Center" dashboard aesthetic.

---

## 🏗️ Architecture Overview

- **Backend (Python 3.10+):** 
  - **FastAPI**: Core logic and high-performance WebSocket streaming.
  - **Social Logic Engine**: Handles data synthesis and sentiment scoring metrics.
  - **Neural Architecture**: Prepared for `DistilBERT` (Transformers) for production-grade NLP.

- **Frontend (Vite/React):**
  - **Framer Motion**: Premium micro-animations and stream synchronization.
  - **Recharts**: Live data visualization for sentiment velocity and bias tracking.
  - **Glassmorphism UI**: High-fidelity dark mode with neon indigo accents.

---

## ⚡ Quick Start

### 1. Initialize the Neural Core (Backend)
Navigate to the `backend` directory and start the FastAPI service:
```bash
cd backend
pip install -r requirements.txt
python main.py
```
*The backend will start at `http://localhost:8000`*

### 2. Launch the Intelligence Hub (Frontend)
Navigate to the `frontend` directory and start the dev server:
```bash
cd frontend
npm install
npm run dev
```
*The dashboard will be active at `http://localhost:3000` (or the port specified in your terminal).*

---

## 📊 Features
- **Live Sentiment Velocity**: Real-time graph of sentiment confidence scores. 
- **Neural Stream**: Direct feed of social media posts being processed by the ML engine.
- **Sentiment Bias**: Real-time distribution of Positive, Negative, and Neutral sectors.
- **Trending Vectors**: Mock analysis of current high-growth social media topics.

---
**Developed by Antigravity AI**
