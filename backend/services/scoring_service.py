import json
import threading
import logging
import pandas as pd
from backend.core.kafka_client import get_kafka_consumer, ensure_topic_exists
from ml_tier.credit_scoring.xgboost_model import DynamicCreditModel

# Initialize an instance of the ML model
credit_model = DynamicCreditModel()

def process_merchant_event(event_data: dict):
    """
    Simulates feeding live transaction events into the ML models.
    """
    merchant_id = event_data.get("merchant_id", "unknown")
    amount = event_data.get("transaction_amount", 0.0)
    
    # Stub: Fetching historical features from Redis
    df_instance = pd.DataFrame([{
        "amount": amount,
        "historical_volume": 50000,
        "bounced_payments": 0,
        "session_depth": 5
    }])
    
    try:
        decision = credit_model.predict_with_explanation(df_instance)
        logging.info(f"[Scoring] Merchant {merchant_id} | New Limit: {decision['prediction']} | SHAP: {decision['shap_values']}")
        return decision
    except Exception as e:
        # Fails gracefully if XGBoost is uninitialized/untrained
        logging.info(f"[Scoring fallback via Rules Engine for {merchant_id}]. Model stub status: {e}")
        return {"prediction": 10000.0, "status": "fallback_default"}

def run_scoring_consumer():
    """Background loop consuming Kafka events."""
    ensure_topic_exists('merchant_transactions')
    consumer = get_kafka_consumer(group_id="ml_scoring_group")
    consumer.subscribe(['merchant_transactions'])
    
    logging.info("Kafka Consumer attached to 'merchant_transactions'. Awaiting events...")
    
    try:
        while True:
            msg = consumer.poll(timeout=1.0)
            if msg is None:
                continue
            if msg.error():
                logging.error(f"Kafka error: {msg.error()}")
                continue
                
            event_data = json.loads(msg.value().decode('utf-8'))
            logging.info(f"Received transaction event: {event_data}")
            process_merchant_event(event_data)
            
    except Exception as e:
        logging.error(f"Kafka consumer crashed: {e}")
    finally:
        consumer.close()

def start_scoring_thread():
    thread = threading.Thread(target=run_scoring_consumer, daemon=True)
    thread.start()
    return thread
