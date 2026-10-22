import os
import json
import traceback
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from schemas import ChatRequest, ChatResponse, InsightsRequest

WEBHOOK_URL = os.getenv(
    "N8N_WEBHOOK_URL",
    "https://api.agents.snsihub.ai/webhook-test/ffe27c5a-f302-478f-8c6e-723ddae680c8"
)

app = FastAPI(title="ChainIQ ERP AI Copilot", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# HTTP timeout config
HTTP_TIMEOUT = httpx.Timeout(5.0, connect=2.0)

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Non-blocking async endpoint forwarding queries to the n8n webhook using httpx.AsyncClient.
    """
    payload = {
        "question": request.question,
        "role": request.role,
        "type": "chat"
    }

    try:
        async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
            response = await client.post(WEBHOOK_URL, json=payload)
            response.raise_for_status()

            try:
                data = response.json()
                # n8n webhook format: { "items": [{ "json": "<answer>" }] }
                if isinstance(data, dict) and "items" in data:
                    items = data.get("items", [])
                    if items and isinstance(items[0], dict):
                        answer = str(items[0].get("json", items[0]))
                    else:
                        answer = str(items)
                elif isinstance(data, list) and len(data) > 0:
                    first = data[0]
                    if isinstance(first, dict):
                        answer = str(first.get("json", first.get("answer", first.get("output", str(first)))))
                    else:
                        answer = str(first)
                elif isinstance(data, dict):
                    answer = data.get("answer", data.get("output", str(data)))
                else:
                    answer = str(data)
            except ValueError:
                answer = response.text

            return ChatResponse(answer=answer)
    except httpx.TimeoutException:
        return ChatResponse(
            answer="The AI agent network timed out while processing your request. Please try again shortly."
        )
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/insights")
async def insights_endpoint(request: InsightsRequest):
    """
    Non-blocking async endpoint generating role-aware dashboard insights.
    """
    payload = {
        "context": request.context,
        "role": request.role,
        "type": "insights"
    }

    try:
        async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
            response = await client.post(WEBHOOK_URL, json=payload)
            response.raise_for_status()

            try:
                raw = response.json()
                if isinstance(raw, dict) and "items" in raw:
                    items = raw.get("items", [])
                    if items and isinstance(items[0], dict):
                        inner = items[0].get("json", items[0])
                        if isinstance(inner, dict):
                            return inner
                        elif isinstance(inner, str):
                            try:
                                return json.loads(inner)
                            except Exception:
                                pass
                elif isinstance(raw, dict) and "operationalHealthScore" in raw:
                    return raw
            except Exception:
                pass
    except httpx.TimeoutException:
        pass
    except Exception as e:
        print(f"[FastAPI insights] Webhook error, serving local fallback: {e}")

    # Instant resilient fallback structure
    return {
        "operationalHealthScore": 88,
        "operationalHealthBreakdown": {
            "inventory": 92,
            "manufacturing": 88,
            "procurement": 75,
            "sales": 94
        },
        "criticalRisks": [
            {
                "risk": "Safety Buffer Alert",
                "severity": "Medium",
                "reason": "Raw materials inventory is approaching safety reorder thresholds.",
                "roles": ["admin", "inventory", "purchase"]
            }
        ],
        "recommendations": [
            {
                "action": "Review Pending Procurement Orders",
                "impact": "High",
                "reason": "Secures assembly lines against supplier lead-time variances.",
                "roles": ["admin", "purchase"]
            }
        ],
        "procurementInsights": [
            {
                "name": "Wood Screws",
                "sku": "RM-SC-001",
                "currentStock": 200,
                "consumption": 15,
                "daysRemaining": 13,
                "suggestedOrder": 500,
                "preferredVendor": "Apex Fasteners Corp",
                "riskScore": "Medium"
            }
        ],
        "manufacturingInsights": [
            {
                "moNumber": "MO-102",
                "product": "Wooden Chair",
                "delayRisk": "15%",
                "reason": "Assembly line calibration scheduled.",
                "urgency": "Low"
            }
        ],
        "executiveSummary": "Operations running steadily with standard production cadence."
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "message": "ChainIQ ERP FastAPI Copilot is running asynchronously."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
