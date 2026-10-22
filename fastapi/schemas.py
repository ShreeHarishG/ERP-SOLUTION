from typing import TypedDict, Any
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
    role: str

class ChatResponse(BaseModel):
    answer: str

class InsightsRequest(BaseModel):
    role: str
    context: dict

