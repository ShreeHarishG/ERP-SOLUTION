import os
from typing import Dict, Any
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import StateGraph, START, END
from dotenv import load_dotenv

from schemas import ERPState
from tools import tools_list, tools_map

load_dotenv()

# Initialize LLM
llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0,
    api_key=os.getenv("GROQ_API_KEY")
)

def get_authorized_tools(role: str) -> list:
    """Returns a list of tool names the role is authorized to use."""
    role = role.lower()
    authorized = [
        "get_low_stock_products", 
        "get_today_revenue", 
        "get_delayed_orders", 
        "get_pending_manufacturing", 
        "get_pending_purchase_orders",
        "business_health_score",
        "recommend_actions"
    ]
    
    if role == "admin":
        authorized.append("get_audit_logs")
        
    return authorized

def role_validator(state: ERPState):
    """
    Clears any previous validation errors.
    """
    return {"validation_error": ""}

def tool_selector(state: ERPState):
    """
    Selects the best tool using the LLM, exposing ONLY tools authorized for the user's role.
    """
    if state.get("validation_error"):
        return state # Skip tool selection if validation failed

    role = state.get("role", "guest").lower()
    authorized_tool_names = get_authorized_tools(role)
    
    prompt = f"""You are ChainIQ ERP AI.
Available Tools for the user's role '{role}':
{", ".join(authorized_tool_names)}

Choose the best tool to answer the user's question.
If the user asks "What should I do today?", choose recommend_actions.
If the user asks for information outside the scope of their Available Tools (like audit logs for a non-admin), do NOT select a tool. Instead, return "UNAUTHORIZED".
Return ONLY the tool name, or "UNAUTHORIZED", nothing else.

User: {state['question']}
Output:"""
    
    response = llm.invoke([HumanMessage(content=prompt)])
    selected_tool = response.content.strip()
    
    if selected_tool == "UNAUTHORIZED":
        return {"validation_error": f"You do not have permission to perform this action or query this data with the '{role}' role."}
        
    return {"selected_tool": selected_tool}

def tool_executor(state: ERPState):
    """
    Executes the selected tool and stores the output.
    """
    if state.get("validation_error"):
        return state # Skip tool execution if validation failed
        
    tool_name = state.get("selected_tool", "")
    
    # Check if the tool exists and run it
    if tool_name in tools_map:
        tool_func = tools_map[tool_name]
        try:
            # We assume tools don't need complicated arguments for this scope
            tool_output = tool_func.invoke({})
            return {"tool_output": str(tool_output)}
        except Exception as e:
            return {"tool_output": f"Error executing tool {tool_name}: {str(e)}"}
    else:
        return {"tool_output": f"Tool '{tool_name}' not found or not recognized."}

def response_generator(state: ERPState):
    """
    Generates a concise response based on the tool output.
    """
    if state.get("validation_error"):
        return {"answer": state["validation_error"]}
        
    prompt = f"""You are ChainIQ ERP Copilot.

Question:
{state['question']}

Tool Result:
{state.get('tool_output', 'No result')}

Generate an ERP answer.
Be concise.
Give recommendations.
If the Tool Result contains structured priorities (like 'Today's Priorities'), present it clearly in markdown format.
"""
    
    response = llm.invoke([HumanMessage(content=prompt)])
    return {"answer": response.content}

# Build LangGraph
workflow = StateGraph(ERPState)

# Add Nodes
workflow.add_node("role_validator", role_validator)
workflow.add_node("tool_selector", tool_selector)
workflow.add_node("tool_executor", tool_executor)
workflow.add_node("response_generator", response_generator)

# Add Edges
workflow.add_edge(START, "role_validator")
workflow.add_edge("role_validator", "tool_selector")
workflow.add_edge("tool_selector", "tool_executor")
workflow.add_edge("tool_executor", "response_generator")
workflow.add_edge("response_generator", END)

# Compile Graph
app = workflow.compile()


import json

def generate_insights(context: dict, role: str) -> dict:
    """
    Generate role-aware dashboard insights using Grok based on live database context.
    """
    system_prompt = f"""You are an ERP Operations Intelligence Engine helping a furniture manufacturing company make operational decisions.
Analyze the provided live inventory, sales, manufacturing, procurement, and timeline audit logs.

The current user's role is: '{role}'. You MUST customize the insights, risks, and recommendations to focus on this role's interests, but you must return the complete response format.
Specifically:
- If the role is 'sales': Focus heavily on delivery risks, customer order risks, fulfillment delays, and revenue-impacting recommendations.
- If the role is 'product_manager': Focus heavily on manufacturing bottlenecks, material shortages, and capacity issues.
- If the role is 'purchase': Focus heavily on vendor recommendations, purchase order issues, RFQ analysis, and reorder suggestions.
- If the role is 'inventory': Focus heavily on stockout predictions, overstock detection, safety stock levels, and inventory anomalies.
- If the role is 'admin': Focus on enterprise-level KPIs, overall Operational Health Score, enterprise risks, executive summary, and high-level recommendations.

Business Rules & Database Context:
1. All insights must be generated dynamically based on the actual database context provided in the user prompt. DO NOT return placeholder/hardcoded values or generic advice.
2. Every recommendation or risk must have a specific reason tied directly to the inventory, sales, or manufacturing data in the context.
3. Every recommendation must indicate which role(s) are targeted to take action. Ensure the requesting role '{role}' is included where relevant.
4. Calculate the Operational Health Score (0-100) dynamically:
   - Start at 100.
   - Reduce based on: low stock items (especially raw materials needed for manufacturing), delayed sales orders, delayed purchase orders, and delayed manufacturing orders.
   - Compute department breakdowns (inventory, manufacturing, procurement, sales) dynamically based on these counts.
5. Identify:
   - Which material will run out first? Estimate based on current stock, consumption rates, and days remaining.
   - Which vendor is best? (Analyze vendor performance data).
   - What quantity should be purchased?
   - What is the procurement risk score?
   - Which work orders are delayed?
   - Which materials block production?
   - What should be prioritized?
   - Timeline intelligence: Identify reasons for delays, bottlenecks, risk propagation, and department accountability using the audit logs and timeline events.

Format requirements:
You MUST return a valid JSON object matching the following schema. Do NOT wrap it in markdown code blocks. Return ONLY the JSON object.

JSON Schema:
{{
  "operationalHealthScore": number,
  "operationalHealthBreakdown": {{
    "inventory": number,
    "manufacturing": number,
    "procurement": number,
    "sales": number
  }},
  "criticalRisks": [
    {{ "risk": "string", "severity": "High" | "Medium" | "Low", "reason": "string", "roles": ["admin" | "sales" | "purchase" | "inventory" | "product_manager"] }}
  ],
  "recommendations": [
    {{ "action": "string", "impact": "Critical" | "High" | "Medium" | "Low", "reason": "string", "roles": ["admin" | "sales" | "purchase" | "inventory" | "product_manager"] }}
  ],
  "procurementInsights": [
    {{
      "name": "string",
      "sku": "string",
      "currentStock": number,
      "consumption": number,
      "daysRemaining": number,
      "suggestedOrder": number,
      "preferredVendor": "string",
      "riskScore": "High" | "Medium" | "Low",
      "urgency": "High" | "Medium" | "Low",
      "reason": "string"
    }}
  ],
  "manufacturingInsights": [
    {{
      "moNumber": "string",
      "product": "string",
      "delayRisk": "string",
      "reason": "string",
      "urgency": "High" | "Medium" | "Low"
    }}
  ],
  "executiveSummary": "string"
}}
"""

    prompt = f"Here is the current live ERP context from our Postgres database:\n{json.dumps(context, indent=2)}\n\nProvide the structured operational decision recommendations."
    
    # We bind response_format to ensure JSON output
    json_llm = llm.bind(response_format={"type": "json_object"})
    response = json_llm.invoke([
        SystemMessage(content=system_prompt),
        HumanMessage(content=prompt)
    ])
    
    content = response.content.strip()
    return json.loads(content)

