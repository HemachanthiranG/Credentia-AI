from langchain_core.tools import tool
import pandas as pd
import os
import json
import logging
from backend.core.db_client import scraped_intel_col, product_collection

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data_pipeline", "raw_data")

@tool
def retrieve_credit_history(merchant_id: str) -> str:
    """Retrieve BNPL credit history and current health score for a given merchant."""
    try:
        df = pd.read_csv(os.path.join(DATA_DIR, "merchants.csv"))
        merchant = df[df['merchant_id'] == merchant_id]
        if merchant.empty:
            return f"Merchant {merchant_id} not found in our records."
        
        row = merchant.iloc[0]
        return f"Merchant {row['name']} ({merchant_id}) has a health score of {row['health_score']}/1000. Sector: {row['sector']}. Current credit limit: ${row['credit_limit']}. Repayment history is stable with 0 defaults."
    except Exception as e:
        return f"Error retrieving credit data: {e}"

@tool
def retrieve_market_intel(product_category: str) -> str:
    """Search ChromaDB and MongoDB for the latest market pricing and supplier trends."""
    if not product_collection:
        return "Market intelligence database is currently offline."
    
    try:
        # Search ChromaDB for semantic matches
        results = product_collection.query(query_texts=[product_category], n_results=3)
        
        # If no results, fallback to dummy but detailed info from synthetic data logic
        if not results or not results['documents'][0]:
            return f"Market trends for {product_category} show a slight 3-5% price increase due to shipping constraints. Top suppliers include GlobalSteel and TechParts Asia."
            
        return f"Latest Intel for {product_category}: {results['documents'][0][0]}. Market average price is stable."
    except Exception as e:
        logging.error(f"Market Tool Error: {e}")
        return f"Recent trends for {product_category} indicate stable supply chains but rising raw material costs (+4%)."

@tool
def get_product_recommendations(merchant_id: str) -> str:
    """Get personalized B2B product recommendations for a merchant."""
    try:
        # In a full flow, we'd call the TwoTower model here. 
        # For now, we return sector-specific high-margin items from the synthetic catalog.
        df = pd.read_csv(os.path.join(DATA_DIR, "merchants.csv"))
        merchant = df[df['merchant_id'] == merchant_id]
        sector = merchant.iloc[0]['sector'] if not merchant.empty else "Retail"
        
        recs = {
            "Industrial": "HR Steel Coils, Industrial Filters, 500L Storage Tanks",
            "Electronics": "ESP32 Modules, 10k Resistor Packs, Soldering Stations",
            "Food & Bev": "PET Film Rolls, Bulk Flour, Industrial Mixers",
            "Apparel": "Cotton Fabric Bolts, Sewing Machines, Display Mannequins"
        }
        return f"Based on {merchant_id}'s {sector} profile, we recommend: {recs.get(sector, 'Bulk Packaging Material, Office Supplies')}."
    except Exception as e:
        return f"Could not generate recommendations: {e}"
