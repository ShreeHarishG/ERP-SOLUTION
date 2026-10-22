from typing import TypedDict, Any, Optional
from pydantic import BaseModel

class ERPState(TypedDict, total=False):
    question: str
    role: str
    tool_output: str
    answer: str
    selected_tool: str
    validation_error: str

class ChatRequest(BaseModel):
    question: str
    role: Optional[str] = None

class ChatResponse(BaseModel):
    answer: str

class InsightsRequest(BaseModel):
    role: Optional[str] = None
    context: dict

