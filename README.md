# Credentia AI

A full-stack, AI-powered B2B commerce intelligence platform designed to give platforms real-time, explainable visibility into merchant health, creditworthiness, and growth opportunities.

## Getting Started

Follow these steps to spin up the entire Credentia AI ecosystem locally.

### Architecture & Tech Stack
- **Infrastructure**: Docker-based deployment of PostgreSQL (System of Record), MongoDB (Document Store), Redis (Feature Store), Kafka (Event Streaming), Metabase (BI), and Prometheus/Grafana (Monitoring).
- **Backend**: FastAPI (Python) with WebSocket support for real-time AI agent streaming, Celery for background tasks, and Confluent Kafka for event processing.
- **Frontend**: React + Vite + TypeScript + Tailwind CSS, featuring a dark-themed glassmorphism UI, Zustand for state management, and embedded Metabase analytics.
- **AI/ML Tier**:
    - **Agentic Logic**: LangGraph + Google ADK + Groq LLaMA 3.3 70B for intent routing and specialist agent delegation.
    - **Credit Scoring**: XGBoost + SHAP for explainable, daily-updated credit limits.
    - **Anomaly Detection**: PyTorch LSTM for real-time payment rhythm analysis.
    - **Recommendations**: PyTorch Two-Tower neural network with FAISS for sub-10ms retrieval.
    - **Market Intel**: Playwright/Scrapy scrapers + Groq LLaMA 3.3 entity extraction + ChromaDB vector search.

### 1. Start the Infrastructure (Docker)
Ensure Docker Desktop is running on your machine, then start the core databases, telemetry, and event streaming systems.
```powershell
cd d:\ds\Project\Credentia AI
docker-compose up -d
```
*Wait ~30 seconds for Kafka, Postgres, Mongo, and Metabase to initialize securely in the background.*

### 2. Start the Backend API & Agent Router
Open a **new terminal** and run the FastAPI application. This will also attach the Kafka consumer background thread. Ensure you set your Groq API key for the AI LangGraph agents to properly classify intent.
```powershell
cd d:\ds\Project\Credentia AI
.\venv\Scripts\activate

# Set your LLM API Key for the LangGraph router
$env:GROQ_API_KEY="your-api-key-here"

# Start the Python WebSockets and REST server
uvicorn backend.main:app --reload
```

### 3. Start the Frontend Application
Open a **third terminal** and boot the React UI to view the premium dashboard and chat with your agent.
```powershell
cd d:\ds\Project\Credentia AI\frontend
npm run dev
```

### 4. Access the Platform
- **React Dashboard**: Open `http://localhost:5173` in your browser (Main Interaction Point).
- **FastAPI Specs**: `http://localhost:8000/docs` (Swagger API endpoint documentation).
- **Metabase**: `http://localhost:3000` (Setup your dashboard configurations here).
- **Grafana**: `http://localhost:3001` (Monitor your local metrics).

### Training the Models (Next Steps)
The massive synthetic dataset (Transactions, Merchants, Catalogs) has been generated locally in `data_pipeline/raw_data`. To turn the ML "base structural components" into actual predictive mathematical engines, you will need to map these CSVs into Pandas DataFrames and call the `.fit()` and `.train()` methods within the isolated `xgboost_model.py` and `lstm_model.py` scripts.
