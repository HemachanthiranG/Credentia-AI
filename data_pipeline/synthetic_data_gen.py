import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os

DATA_DIR = os.path.join(os.path.dirname(__file__), "raw_data")
os.makedirs(DATA_DIR, exist_ok=True)

def generate_synthetic_data(num_merchants=5000, num_transactions=200000):
    print(f"Generating synthetic structured data for {num_merchants} B2B merchants...")
    
    # 1. Merchants Table
    np.random.seed(42)
    merchant_ids = [f"M-{1000 + i}" for i in range(num_merchants)]
    sectors = np.random.choice(['Retail', 'Electronics', 'Food & Bev', 'Industrial', 'Apparel'], num_merchants)
    signup_dates = [datetime(2023, 1, 1) + timedelta(days=np.random.randint(0, 700)) for _ in range(num_merchants)]
    
    # Base credit limit assigned at onboarding (static legacy limit to be replaced by our XGBoost model)
    base_limits = np.random.choice([5000, 10000, 25000, 50000, 100000], num_merchants, p=[0.4, 0.3, 0.15, 0.1, 0.05])
    
    merchants_df = pd.DataFrame({
        'merchant_id': merchant_ids,
        'sector': sectors,
        'signup_date': signup_dates,
        'onboarding_limit': base_limits,
        'health_score': np.random.normal(700, 100, num_merchants).clip(0, 1000).astype(int)
    })
    
    # 2. Transactions Table
    print(f"Generating {num_transactions} BNPL transactions...")
    txn_merchants = np.random.choice(merchant_ids, num_transactions)
    txn_amounts = np.random.exponential(scale=1500, size=num_transactions).round(2)
    txn_dates = [datetime(2025, 1, 1) + timedelta(hours=int(np.random.randint(0, 8000))) for _ in range(num_transactions)]
    
    # Introduce anomalies for LSTM to catch
    status_choices = ['PAID_ON_TIME', 'PAID_LATE', 'DEFAULTED']
    txn_status = np.random.choice(status_choices, num_transactions, p=[0.85, 0.12, 0.03])
    
    txns_df = pd.DataFrame({
        'transaction_id': [f"TXN-{100000 + i}" for i in range(num_transactions)],
        'merchant_id': txn_merchants,
        'amount': txn_amounts,
        'timestamp': txn_dates,
        'status': txn_status
    })
    
    # 3. Product Catalog
    num_products = 50000
    print(f"Generating {num_products} catalog elements...")
    products_df = pd.DataFrame({
        'product_id': [f"P-{i}" for i in range(num_products)],
        'category': np.random.choice(sectors, num_products),
        'base_price': np.random.uniform(10, 5000, num_products).round(2),
        'supplier_id': np.random.choice([f"SUP-{i}" for i in range(50)], num_products)
    })
    
    print("Saving vast datasets to local CSV chunks...")
    merchants_df.to_csv(os.path.join(DATA_DIR, "merchants.csv"), index=False)
    txns_df.to_csv(os.path.join(DATA_DIR, "transactions.csv"), index=False)
    products_df.to_csv(os.path.join(DATA_DIR, "products.csv"), index=False)
    print("Synthetic data generation completely assembled! Ready for XGBoost/LSTM training and PostgreSQL ingestion.")

if __name__ == "__main__":
    generate_synthetic_data()
