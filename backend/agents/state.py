from typing import TypedDict, Annotated, Sequence
from langchain_core.messages import BaseMessage
import operator

class MerchantState(TypedDict):
    """State object for the LangGraph multi-agent flow."""
    messages: Annotated[Sequence[BaseMessage], operator.add]
    merchant_id: str
    intent: str
    context: dict
