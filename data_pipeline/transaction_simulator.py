import pandas as pd
import json
import time
import os
import logging
from backend.core.kafka_client import get_kafka_producer, ensure_topic_exists

logging.basicConfig(level=logging.INFO)

DATA_PATH = os.path.join(os.path.dirname(__file__), "raw_data", "transactions.csv")
TOPIC = "merchant_transactions"

def stream_transactions():
    """Reads the synthetic CSV and streams it into Kafka to simulate live merchant activity."""
    if not os.path.exists(DATA_PATH):
        logging.error(f"Dataset not found at {DATA_PATH}. Please run synthetic_data_gen.py first.")
        return

    ensure_topic_exists(TOPIC)
    producer = get_kafka_producer()
    
    logging.info(f"Starting live stream from {DATA_PATH} to Kafka topic '{TOPIC}'...")
    
    # Load first 1000 txns to simulate a burst
    df = pd.read_csv(DATA_PATH).head(1000)
    
    for _, row in df.iterrows():
        payload = {
            "transaction_id": row['transaction_id'],
            "merchant_id": row['merchant_id'],
            "transaction_amount": float(row['amount']),
            "status": row['status'],
            "timestamp": row['timestamp']
        }
        
        producer.produce(TOPIC, value=json.dumps(payload).encode('utf-8'))
        logging.info(f"Streamed TXN: {row['transaction_id']} for Merchant: {row['merchant_id']}")
        
        # Slow down simulation to watch the dashboard react
        time.sleep(0.5) 
        producer.poll(0)

    producer.flush()
    logging.info("Simulation burst complete!")

if __name__ == "__main__":
    stream_transactions()
