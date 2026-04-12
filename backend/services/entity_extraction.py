from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage
import json
import logging

# Ultra-fast open-weight inference: LLaMA 3.3 70B
llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0)

def extract_market_intelligence(raw_text: str):
    """Pass unstructured scraped text to LLaMA 3.1 for strict JSON entity extraction."""
    if not raw_text:
        return None
        
    prompt = f"""
    You are an enterprise data extraction system. Extract the supplier name, product name, price, and availability. 
    Ensure formatting conforms to valid JSON. Output NOTHING else.
    
    Format requested:
    {{
        "supplier": "Name",
        "product": "Product Description",
        "price": 0.00,
        "availability": "In Stock / Out of Stock"
    }}
    
    Raw Data:
    {raw_text[:2500]}
    """
    
    try:
        response = llm.invoke([HumanMessage(content=prompt)])
        parsed = json.loads(response.content)
        return parsed
    except json.JSONDecodeError:
        logging.error("Model hallucinated non-JSON formatting. Retry in DAG.")
        return None
    except Exception as e:
        logging.error(f"Groq Extraction failed: {e}")
        return None
