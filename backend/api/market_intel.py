from fastapi import APIRouter, HTTPException
from typing import Optional
import logging
from backend.core.db_client import product_collection, scraped_intel_col

router = APIRouter(prefix="/market", tags=["Market Intelligence"])

@router.get("/search")
async def search_market_intel(query: str, limit: int = 5):
    """
    Semantic search against ChromaDB vectors for scraped market intelligence.
    Routes queries mapped from LangGraph or user frontends directly to BGE embeddings.
    """
    if not product_collection:
        raise HTTPException(status_code=500, detail="ChromaDB not initialized locally.")
        
    try:
        results = product_collection.query(
            query_texts=[query],
            n_results=limit
        )
        return {"query": query, "results": results}
    except Exception as e:
        logging.error(f"ChromaDB retrieval failed: {e}")
        raise HTTPException(status_code=500, detail="Semantic search failed.")

@router.get("/raw")
async def get_raw_intel(limit: int = 10):
    """Retrieve raw scraped JSON from MongoDB for manual audits or Airflow reconciliation."""
    if scraped_intel_col is None:
        raise HTTPException(status_code=500, detail="MongoDB not initialized.")
        
    data = list(scraped_intel_col.find({}, {"_id": 0}).limit(limit))
    return {"count": len(data), "data": data}
