import os
from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from backend.agents.state import MerchantState
from backend.agents.tools import retrieve_credit_history, retrieve_market_intel, get_product_recommendations
from dotenv import load_dotenv

load_dotenv()

# We use Groq LLaMA 3.3 70B
# Ensure GROQ_API_KEY is in your environment (.env)
llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0)

def classify_intent(state: MerchantState):
    """Router node that classifies the user intent."""
    messages = state['messages']
    last_message = messages[-1].content
    
    prompt = f"""Classify the user intent into exactly one of three categories:
    [credit, market, recommendations]. 
    Query: {last_message}
    Output ONLY the exact category name. Do not explain."""
    
    try:
        response = llm.invoke([HumanMessage(content=prompt)])
        intent = response.content.strip().lower()
    except Exception as e:
        print(f"Router Groq error: {e}")
        intent = 'market' # Fallback
        
    if intent not in ['credit', 'market', 'recommendations']:
        intent = 'market'
        
    return {"intent": intent}

def credit_agent(state: MerchantState):
    """Specialist agent for credit questions."""
    history = retrieve_credit_history.invoke({"merchant_id": state.get('merchant_id', 'unknown')})
    prompt = f"You are the MerchantIQ Credit Advisor. Context: {history}\n\nUser Question: {state['messages'][-1].content}"
    response = llm.invoke([SystemMessage(content=prompt)])
    return {"messages": [response]}

def market_agent(state: MerchantState):
    """Specialist agent for market intelligence."""
    intel = retrieve_market_intel.invoke({"product_category": "electronics"}) # Dummy parameter for now
    prompt = f"You are the MerchantIQ Market Advisor. Context: {intel}\n\nUser Question: {state['messages'][-1].content}"
    response = llm.invoke([SystemMessage(content=prompt)])
    return {"messages": [response]}

def rec_agent(state: MerchantState):
    """Specialist agent for product recommendations."""
    recs = get_product_recommendations.invoke({"merchant_id": state.get('merchant_id', 'unknown')})
    prompt = f"You are the MerchantIQ Recommendations Advisor. Context: {recs}\n\nUser Question: {state['messages'][-1].content}"
    response = llm.invoke([SystemMessage(content=prompt)])
    return {"messages": [response]}

def route_intent(state: MerchantState):
    return state['intent']

# Build the Graph
workflow = StateGraph(MerchantState)

workflow.add_node("classifier", classify_intent)
workflow.add_node("credit", credit_agent)
workflow.add_node("market", market_agent)
workflow.add_node("recommendations", rec_agent)

workflow.set_entry_point("classifier")

workflow.add_conditional_edges(
    "classifier",
    route_intent,
    {
        "credit": "credit",
        "market": "market",
        "recommendations": "recommendations"
    }
)

workflow.add_edge("credit", END)
workflow.add_edge("market", END)
workflow.add_edge("recommendations", END)

try:
    merchant_agent_graph = workflow.compile()
except Exception as e:
    print(f"Failed to compile graph: {e}")
    merchant_agent_graph = None
