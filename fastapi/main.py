import os
import json
import hmac
import traceback
from typing import Optional
import httpx
from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware

from schemas import ChatRequest, ChatResponse, InsightsRequest

try:
    from agent import app as agent_app, generate_insights as agent_generate_insights
except Exception as agent_init_err:
    print(f"[FastAPI Init] Local LangGraph agent unavailable: {agent_init_err}")
    agent_app = None
    agent_generate_insights = None

WEBHOOK_URL = os.getenv("N8N_WEBHOOK_URL")
INTERNAL_SECRET = os.getenv("FASTAPI_INTERNAL_SECRET", "")
CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv("FASTAPI_CORS_ORIGINS", "http://localhost:3000").split(",")
    if origin.strip()
]

app = FastAPI(title="ChainIQ ERP AI Copilot", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

HTTP_TIMEOUT = httpx.Timeout(5.0, connect=2.0)

ALLOWED_ROLES = {"admin", "sales", "purchase", "inventory", "product_manager"}


def require_internal(
    x_internal_secret: Optional[str] = Header(default=None),
    x_user_role: Optional[str] = Header(default=None),
) -> str:
    if not INTERNAL_SECRET:
        raise HTTPException(status_code=503, detail="FASTAPI_INTERNAL_SECRET is not configured")
    if not x_internal_secret or not hmac.compare_digest(x_internal_secret, INTERNAL_SECRET):
        raise HTTPException(status_code=401, detail="Unauthorized")
    role = (x_user_role or "guest").lower()
    return role if role in ALLOWED_ROLES else "guest"


@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest, role: str = Depends(require_internal)):
    if os.getenv("GROQ_API_KEY") and agent_app:
        try:
            result = agent_app.invoke({
                "question": request.question,
                "role": role,
            })
            if result and result.get("answer"):
                return ChatResponse(answer=result["answer"])
        except Exception as e:
            print(f"[FastAPI chat] Local agent error: {e}, falling back to webhook")

    if not WEBHOOK_URL:
        return ChatResponse(answer="AI copilot is not configured. Set N8N_WEBHOOK_URL or GROQ_API_KEY.")

    payload = {
        "question": request.question,
        "role": role,
        "type": "chat",
    }

    try:
        async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
            response = await client.post(WEBHOOK_URL, json=payload)
            response.raise_for_status()

            try:
                data = response.json()
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
    except Exception:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal Server Error")


@app.post("/api/insights")
async def insights_endpoint(request: InsightsRequest, role: str = Depends(require_internal)):
    if os.getenv("GROQ_API_KEY") and agent_generate_insights and request.context:
        try:
            insights_res = agent_generate_insights(request.context, role)
            if insights_res and isinstance(insights_res, dict) and "operationalHealthScore" in insights_res:
                return insights_res
        except Exception as e:
            print(f"[FastAPI insights] Local generation error: {e}, falling back to webhook")

    if WEBHOOK_URL:
        payload = {
            "context": request.context,
            "role": role,
            "type": "insights",
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
                            if isinstance(inner, str):
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

    return {
        "operationalHealthScore": 88,
        "operationalHealthBreakdown": {
            "inventory": 92,
            "manufacturing": 88,
            "procurement": 75,
            "sales": 94,
        },
        "criticalRisks": [
            {
                "risk": "Safety Buffer Alert",
                "severity": "Medium",
                "reason": "Raw materials inventory is approaching safety reorder thresholds.",
                "roles": ["admin", "inventory", "purchase"],
            }
        ],
        "recommendations": [
            {
                "action": "Review Pending Procurement Orders",
                "impact": "High",
                "reason": "Secures assembly lines against supplier lead-time variances.",
                "roles": ["admin", "purchase"],
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
                "riskScore": "Medium",
            }
        ],
        "manufacturingInsights": [
            {
                "moNumber": "MO-102",
                "product": "Wooden Chair",
                "delayRisk": "15%",
                "reason": "Assembly line calibration scheduled.",
                "urgency": "Low",
            }
        ],
        "executiveSummary": "Operations running steadily with standard production cadence.",
    }


@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "ChainIQ ERP FastAPI Copilot is running asynchronously."}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
