from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
import json
import logging
import os
import pandas as pd
from langchain_core.messages import HumanMessage
from backend.services.scoring_service import start_scoring_thread

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data_pipeline", "raw_data")

# Gracefully load graph
try:
    from backend.agents.router_agent import merchant_agent_graph
    graph_loaded = True
except ImportError as e:
    logging.warning(f"Could not load LangGraph agent module: {e}")
    merchant_agent_graph = None
    graph_loaded = False

app = FastAPI(title="MerchantIQ API", version="1.0.0")

# Attempt router registration
try:
    from backend.api.market_intel import router as market_router
    app.include_router(market_router)
    logging.info("Market Intel router successfully bound to /market")
except ImportError as e:
    logging.warning(f"Could not load Market Intel API: {e}")

@app.on_event("startup")
async def startup_event():
    start_scoring_thread()
    logging.info("Scoring engine Kafka consumer initialized.")

@app.get("/metrics")
async def prometheus_metrics():
    """Prometheus local scraping stub to clear 404s."""
    return PlainTextResponse("merchantiq_api_health_status 1\n", media_type="text/plain")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "MerchantIQ Backend API", "agent_graph_loaded": graph_loaded}

# --- Module 1 & 2: Merchant Catalog & Health ---
@app.get("/merchants")
async def get_merchants(search: str = "", sector: str = "all", limit: int = 50, offset: int = 0):
    try:
        df = pd.read_csv(os.path.join(DATA_DIR, "merchants.csv"))
        if sector != "all":
            df = df[df['sector'] == sector]
        if search:
            df = df[df['name'].str.contains(search, case=False) | df['merchant_id'].str.contains(search, case=False)]
        
        total = len(df)
        paged = df.iloc[offset : offset + limit]
        return {"total": total, "merchants": paged.to_dict(orient="records")}
    except Exception as e:
        return {"error": str(e), "merchants": []}

@app.get("/merchants/{merchant_id}/health")
async def get_merchant_detail(merchant_id: str):
    try:
        df = pd.read_csv(os.path.join(DATA_DIR, "merchants.csv"))
        merchant = df[df['merchant_id'] == merchant_id]
        if merchant.empty:
            return {"error": "Not found"}
        
        row = merchant.to_dict(orient="records")[0]
        # Simulate 8-dimension breakdown
        row["dimensions"] = {
            "order_velocity": 0.5 + (row["health_score"]/2000),
            "payment_punctuality": 0.6 + (row["health_score"]/3000),
            "gmv_growth": 0.4 + (row["health_score"]/2500),
            "category_diversity": 0.7,
            "bnpl_utilization": 0.3 + (row["credit_limit"]/200000),
            "session_depth": 0.8,
            "peer_rank": 0.6,
            "market_signals": 0.75
        }
        return row
    except Exception as e:
        return {"error": str(e)}

# --- Module 2: Credit Predictor (What-If) ---
@app.post("/credit/predict")
async def predict_credit(data: dict):
    # This is a simulation endpoint that 'predicts' a new limit based on user inputs
    # In prod, this would call the XGBoost model.predict()
    base_limit = data.get("current_limit", 20000)
    growth = data.get("monthly_growth", 0)
    late_pmts = data.get("late_payments", 0)
    
    new_limit = base_limit * (1 + (growth/100)) * (0.8 ** late_pmts)
    return {
        "recommended_limit": round(new_limit, 2),
        "change_pct": round(((new_limit - base_limit) / base_limit) * 100, 2),
        "explanation": f"Growth of {growth}% increased limit, while {late_pmts} late payments reduced it."
    }

# --- Module 3: Recommendations ---
@app.get("/recommendations/{merchant_id}")
async def get_recommendations(merchant_id: str):
    try:
        # Load products and merchants to find sector context
        m_df = pd.read_csv(os.path.join(DATA_DIR, "merchants.csv"))
        p_df = pd.read_csv(os.path.join(DATA_DIR, "products.csv"))
        
        merchant = m_df[m_df['merchant_id'] == merchant_id]
        sector = merchant.iloc[0]['sector'] if not merchant.empty else "Retail"
        
        # Filter products by sector and take top 6 as 'recommended'
        recs = p_df[p_df['category'] == sector].head(6)
        # Add some mock recommendation scores and peak days for UI depth
        result = recs.to_dict(orient="records")
        for i, r in enumerate(result):
            r["name"] = f"{sector} {r['product_id']}"
            r["price"] = r["base_price"]
            r["market_avg"] = round(r["base_price"] * 1.15, 2)
            r["demand_peak_days"] = 5 + i
            r["score"] = 0.85 + (0.02 * i)
            
    except Exception as e:
        return {"error": str(e), "recommendations": []}

@app.websocket("/ws/agent")
async def agent_websocket(websocket: WebSocket):
    await websocket.accept()
    await websocket.send_json({"message": "Connected to AI Merchant Advisor Stream (LangGraph Protocol)"})
    
    try:
        while True:
            data = await websocket.receive_text()
            
            if not graph_loaded:
                await websocket.send_json({"error": "LangGraph is disabled or missing GROQ_API_KEY. Echoing...", "response": f"Echo: {data}"})
                continue
                
            # Parse incoming payload
            try:
                payload = json.loads(data)
                query = payload.get("query", data)
                merchant_id = payload.get("merchant_id", "M-1001")
            except Exception:
                query = data
                merchant_id = "M-1001"

            # 1. Provide rapid acknowledgment to frontend
            await websocket.send_json({"status": "thinking", "response": "Classifying intent..."})
            
            # 2. Invoke LangGraph multi-agent flow
            try:
                state_input = {
                    "messages": [HumanMessage(content=query)],
                    "merchant_id": merchant_id,
                    "intent": ""
                }
                
                result = merchant_agent_graph.invoke(state_input)
                final_answer = result["messages"][-1].content
                intent_detected = result.get("intent", "unknown")
                
                # 3. Stream back final result
                await websocket.send_json({
                    "status": "complete",
                    "intent": intent_detected, 
                    "response": final_answer
                })
            except Exception as e:
                logging.error(f"Agent Execution Error: {e}")
                await websocket.send_json({"error": str(e), "response": "Failed to invoke intelligence model."})

    except WebSocketDisconnect:
        print("WebSocket client gracefully disconnected.")
    except Exception as e:
        print(f"WebSocket isolated error: {e}")
