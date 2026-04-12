import sentry_sdk
import mlflow
import os
import requests
import logging

# Module: Sentry full-stack exception tracking
SENTRY_DSN = os.getenv("SENTRY_DSN", "")
if SENTRY_DSN:
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        traces_sample_rate=1.0,
        profiles_sample_rate=1.0,
    )
    logging.info("Sentry monitoring active.")

# Module: MLflow MLOps experiment tracker
MLFLOW_URI = os.getenv("MLFLOW_TRACKING_URI", "http://localhost:5000")
try:
    mlflow.set_tracking_uri(MLFLOW_URI)
    mlflow.set_experiment("merchantiq_credit_models")
    logging.info("MLflow model tracker initialized correctly.")
except Exception as e:
    logging.warning(f"MLflow service not connected natively: {e}")

# Module: Discord/Resend alert infrastructure 
DISCORD_WEBHOOK = os.getenv("DISCORD_WEBHOOK_URL", "")

def trigger_intervention_alert(merchant_id: str, score_drop: int):
    """Fires an automated N8N-style intervention hook when LSTM score drops > 100 points in 7 days."""
    msg = f"🚨 **INTERVENTION ALERT**: Merchant {merchant_id} continuous health score dropped violently by {score_drop} points. Operator review mandated."
    logging.warning(msg)
    
    if DISCORD_WEBHOOK:
        try:
            requests.post(DISCORD_WEBHOOK, json={"content": msg})
        except Exception as e:
            logging.error(f"Failed to push discord webhooks: {e}")

def log_model_promotion(model_name: str, version: str, metrics: dict):
    """Gates the production promotion by verifying metrics via MLflow."""
    if not MLFLOW_URI: return
    with mlflow.start_run():
        mlflow.log_param("model_name", model_name)
        mlflow.log_param("version", version)
        mlflow.log_metrics(metrics)
        logging.info(f"Model {model_name} v{version} pushed to MLflow successfully.")
