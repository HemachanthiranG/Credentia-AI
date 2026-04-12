from pymongo import MongoClient
import chromadb
import os
import logging

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
CHROMA_PATH = os.getenv("CHROMA_PATH", "./chroma_db")

# MongoDB (Document Store for unstructured intelligence)
try:
    mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000)
    mongo_db = mongo_client["merchant_iq"]
    scraped_intel_col = mongo_db["market_intelligence"]
except Exception as e:
    logging.warning(f"MongoDB connection failed: {e}")
    scraped_intel_col = None

# ChromaDB (Vector Store for Semantic Market Search)
try:
    chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)
    product_collection = chroma_client.get_or_create_collection(
        name="product_intelligence",
        metadata={"hnsw:space": "cosine"}
    )
except Exception as e:
    logging.warning(f"ChromaDB local connection failed: {e}")
    product_collection = None
