"""
Gnani AI Voice Intelligence Service Layer for ChainIQ ERP
Integrates Gnani's Prisma STT and Timbre TTS REST endpoints.
Includes SHAP disruption-risk explainability for plain spoken briefings.
"""

import os
import re
import json
import httpx
from typing import Optional, Dict, Any

GNANI_API_KEY = os.getenv(
    "GNANI_API_KEY",
    "vach_1ytE2CY5X2DkusTGSgqNcwVdcDo4HYfRasJNyMeJGeL1FVqZZaSeqxlzmepg04HgqGmlhcSMbvJVDNkrTvX70Z72tZ84sQvl_1cce87c2ad93f793971acd289a061708"
)

GNANI_STT_ENDPOINT = os.getenv("GNANI_STT_ENDPOINT", "https://api.vachana.ai/stt/v3")
GNANI_TTS_ENDPOINT = os.getenv("GNANI_TTS_ENDPOINT", "https://api.vachana.ai/api/v1/tts/inference")

# Default HTTP Timeout for Speech APIs
TIMEOUT = httpx.Timeout(20.0, connect=5.0)


def clean_for_speech(text: str, question: str = "") -> str:
    """
    Strips robotic preambles, repeated user queries, and markdown symbols
    so the voice synthesis delivers a natural, direct spoken answer.
    """
    if not text:
        return ""

    # Strip robotic prefixes like "ChainIQ reply for your question '...': "
    cleaned = text.strip()
    
    # 1. Comprehensive patterns for robotic preambles
    patterns = [
        r"^(Here\s+is\s+the\s+)?(ChainIQ\s+(ERP\s+)?)?(Voice\s+Assistant|Copilot)?\s*(reply|answer|response)\s*(for|to)\s+(your\s+)?(query|question)?\s*[:\-\—]?\s*",
        r"^(ChainIQ\s+(ERP\s+)?(Voice\s+Assistant|Copilot)\s*:\s*)",
        r"^(ChainIQ\s+(reply|answer|response)\s*.*?[:\-\—]\s*)",
        r"^(In\s+response\s+to|Regarding)\s+(your\s+(query|question)\s+)?['\"].*?['\"]\s*,?\s*[:\-\—]?\s*",
        r"^(In\s+response\s+to|Regarding)\s+['\"].*?['\"]\s*,?\s*[:\-\—]?\s*",
        r"^(In\s+response\s+to\s+your\s+(query|question),?\s*)",
        r"^(For\s+your\s+(query|question),?\s*)",
        r"^(Here\s+is\s+(the\s+answer|what\s+I\s+found),?\s*)",
        r"^As\s+an\s+AI\s+(assistant|copilot),?\s*",
    ]
    for pat in patterns:
        cleaned = re.sub(pat, "", cleaned, flags=re.IGNORECASE).strip()

    # 2. If the text begins by repeating the question enclosed in quotes or colons, remove it
    if question:
        q_clean = question.strip().strip("'\"?.")
        if q_clean and len(q_clean) > 3:
            cleaned = re.sub(rf"^['\"]?{re.escape(q_clean)}['\"]?\s*[:,\-\—]?\s*", "", cleaned, flags=re.IGNORECASE).strip()

    # 3. Strip leading colon, comma, dash or quotes left behind
    cleaned = re.sub(r"^[:,\-\—\s'\"]+", "", cleaned).strip()

    # 4. Remove markdown symbols
    cleaned = cleaned.replace("**", "").replace("#", "").replace("`", "").replace("*", "").strip()

    # 5. Capitalize first letter if needed
    if cleaned and len(cleaned) > 1 and cleaned[0].islower():
        cleaned = cleaned[0].upper() + cleaned[1:]

    return cleaned


class GnaniSTTClient:
    """
    Client for Gnani Prisma STT REST endpoint.
    Named gnaniStt to avoid any naming conflict with Prisma ORM.
    """
    def __init__(self, api_key: str = GNANI_API_KEY, endpoint: str = GNANI_STT_ENDPOINT):
        self.api_key = api_key
        self.endpoint = endpoint

    async def transcribe(
        self,
        audio_bytes: bytes,
        filename: str = "query.wav",
        content_type: str = "audio/wav",
        language_code: str = "indic-auto",
        model: str = "prisma-v3.0"
    ) -> Dict[str, Any]:
        """
        Transcribes speech audio into text using Gnani Prisma v3.0 REST API.
        """
        if not self.api_key:
            return {
                "success": False,
                "transcript": "",
                "error": "GNANI_API_KEY not configured"
            }

        headers = {
            "X-API-Key-ID": self.api_key
        }

        # Normalize content type and filename
        clean_ext = filename.split(".")[-1].lower() if "." in filename else "wav"
        if clean_ext not in ["wav", "mp3", "ogg", "flac", "aac", "m4a"]:
            clean_filename = "query.wav"
            clean_content_type = "audio/wav"
        else:
            clean_filename = filename
            clean_content_type = content_type

        files = {
            "audio_file": (clean_filename, audio_bytes, clean_content_type)
        }
        data = {
            "model": model,
            "language_code": language_code
        }

        try:
            async with httpx.AsyncClient(timeout=TIMEOUT) as client:
                response = await client.post(
                    self.endpoint,
                    headers=headers,
                    files=files,
                    data=data
                )

                if response.status_code == 200:
                    payload = response.json()
                    transcript = payload.get("transcript", "").strip()
                    return {
                        "success": True,
                        "transcript": transcript,
                        "detected_language": payload.get("detected_language_code", "en-IN"),
                        "processing_time": payload.get("processing_time", 0.0),
                        "model": payload.get("model", model),
                        "raw": payload
                    }
                else:
                    err_msg = f"Gnani STT error {response.status_code}: {response.text}"
                    print(f"[Gnani STT] {err_msg}")
                    return {
                        "success": False,
                        "transcript": "",
                        "error": err_msg
                    }
        except Exception as e:
            err_msg = f"Gnani STT request failed: {str(e)}"
            print(f"[Gnani STT Exception] {err_msg}")
            return {
                "success": False,
                "transcript": "",
                "error": err_msg
            }


class GnaniTTSClient:
    """
    Client for Gnani Timbre TTS REST endpoint.
    Named gnaniTts.
    """
    def __init__(self, api_key: str = GNANI_API_KEY, endpoint: str = GNANI_TTS_ENDPOINT):
        self.api_key = api_key
        self.endpoint = endpoint

    async def synthesize(
        self,
        text: str,
        voice: str = "Shivani",
        model: str = "timbre-v3.0",
        language: str = "en-IN",
        speed: float = 1.0,
        sample_rate: int = 24000
    ) -> bytes:
        """
        Synthesizes text to speech using Gnani Timbre v3.0 REST API.
        Returns WAV audio bytes directly playable in browser <audio> tags.
        """
        if not self.api_key:
            print("[Gnani TTS] GNANI_API_KEY is missing")
            return b""

        # Clean up text from robotic preambles, repeated queries, and markdown symbols
        clean_text = clean_for_speech(text)
        if not clean_text:
            clean_text = "No response available to speak."

        headers = {
            "X-API-Key-ID": self.api_key,
            "Content-Type": "application/json"
        }

        payload = {
            "text": clean_text,
            "voice": voice,
            "model": model,
            "language": language,
            "speed": speed,
            "audio_config": {
                "sample_rate": sample_rate,
                "container": "wav"
            }
        }

        try:
            async with httpx.AsyncClient(timeout=TIMEOUT) as client:
                response = await client.post(
                    self.endpoint,
                    headers=headers,
                    json=payload
                )

                if response.status_code == 200:
                    return response.content
                else:
                    print(f"[Gnani TTS Error] Status {response.status_code}: {response.text}")
                    return b""
        except Exception as e:
            print(f"[Gnani TTS Exception] {str(e)}")
            return b""


# Instances to be used across the application
# Explicitly named gnaniStt to avoid any naming conflict with Prisma ORM
gnaniStt = GnaniSTTClient()
gnaniTts = GnaniTTSClient()


# =============================================================================
# Onchain Insights Disruption-Risk & SHAP Feature-Importance Subsystem
# =============================================================================

KNOWN_ENTITIES = {
    "sup-001": {
        "id": "sup-001",
        "name": "Global Timber Exports",
        "aliases": ["global timber", "timber", "teak", "sup-001", "myanmar timber"],
        "category": "Raw Timber & Hardwood",
        "location": "Yangon, Myanmar",
        "risk_tier": "critical",
        "risk_score": 78,
        "shap_importance": {
            "disruption_exposure": 0.38,
            "geographic_corridor": 0.28,
            "delivery_reliability": 0.18,
            "financial_stability": 0.10,
            "compliance_health": 0.06
        },
        "raw_metrics": {
            "disruption_exposure": 92,
            "geographic_corridor": 88,
            "delivery_reliability": 74,
            "financial_stability": 45,
            "compliance_health": 38
        },
        "primary_driver": "Active Disruption Exposure & Bay of Bengal Maritime Corridor",
        "active_disruptions": [
            "Cyclone Warning in Bay of Bengal shipping lanes affecting shipment SHP-2026-0847 (10-day delay)"
        ],
        "mitigation": "Activate pre-qualified secondary vendor Southern Plywood immediately. Expedite safety stock transfers."
    },
    "sup-002": {
        "id": "sup-002",
        "name": "Apex Fasteners Corp",
        "aliases": ["apex", "fasteners", "screws", "hardware", "sup-002"],
        "category": "Industrial Screws & Hardware",
        "location": "Coimbatore, Tamil Nadu",
        "risk_tier": "low",
        "risk_score": 18,
        "shap_importance": {
            "disruption_exposure": 0.05,
            "geographic_corridor": 0.10,
            "delivery_reliability": 0.08,
            "financial_stability": 0.12,
            "compliance_health": 0.05
        },
        "raw_metrics": {
            "disruption_exposure": 10,
            "geographic_corridor": 15,
            "delivery_reliability": 12,
            "financial_stability": 18,
            "compliance_health": 10
        },
        "primary_driver": "Stable Regional Road Freight & High OTIF Reliability",
        "active_disruptions": [],
        "mitigation": "Maintain standard automated replenishment pacing. No intervention required."
    },
    "sup-003": {
        "id": "sup-003",
        "name": "Southern Plywood Industries",
        "aliases": ["southern plywood", "plywood", "sup-003"],
        "category": "Engineered Plywood Sheets",
        "location": "Kochi, Kerala",
        "risk_tier": "high",
        "risk_score": 62,
        "shap_importance": {
            "disruption_exposure": 0.30,
            "geographic_corridor": 0.20,
            "delivery_reliability": 0.25,
            "financial_stability": 0.15,
            "compliance_health": 0.10
        },
        "raw_metrics": {
            "disruption_exposure": 70,
            "geographic_corridor": 50,
            "delivery_reliability": 65,
            "financial_stability": 55,
            "compliance_health": 40
        },
        "primary_driver": "Monsoon Road Freight Delays & Capacity Constraints",
        "active_disruptions": ["Heavy rainfall coastal highway speed restrictions"],
        "mitigation": "Split procurement quota 60/40 with secondary supplier and track daily dispatch notes."
    },
    "shp-001": {
        "id": "shp-001",
        "name": "Shipment SHP-2026-0847 (Teak Wood Planks)",
        "aliases": ["shp-001", "847", "teak shipment", "maersk line"],
        "category": "Maritime Freight",
        "location": "Bay of Bengal Deep Water Basin",
        "risk_tier": "critical",
        "risk_score": 85,
        "shap_importance": {
            "disruption_exposure": 0.45,
            "geographic_corridor": 0.30,
            "delivery_reliability": 0.15,
            "financial_stability": 0.05,
            "compliance_health": 0.05
        },
        "raw_metrics": {
            "disruption_exposure": 95,
            "geographic_corridor": 90,
            "delivery_reliability": 80,
            "financial_stability": 20,
            "compliance_health": 20
        },
        "primary_driver": "Severe Cyclone Routing in Bay of Bengal with 10-day ETA Slippage",
        "active_disruptions": ["Cyclone Warning — Bay of Bengal Shipping Routes"],
        "mitigation": "Reroute cargo to Chennai outer anchorage and release domestic buffer stock for Line 1."
    }
}


def extract_entity_shap(query_text: str, default_entity: str = "sup-001") -> Dict[str, Any]:
    """
    Matches query text to an entity and returns its current SHAP feature-importance profile.
    """
    q = query_text.lower()
    matched_key = None

    for entity_id, data in KNOWN_ENTITIES.items():
        if entity_id.lower() in q:
            matched_key = entity_id
            break
        for alias in data["aliases"]:
            if alias in q:
                matched_key = entity_id
                break
        if matched_key:
            break

    if not matched_key:
        matched_key = default_entity if default_entity in KNOWN_ENTITIES else "sup-001"

    entity = KNOWN_ENTITIES[matched_key]
    return {
        "entityId": entity["id"],
        "entityName": entity["name"],
        "category": entity["category"],
        "location": entity["location"],
        "riskScore": entity["risk_score"],
        "riskTier": entity["risk_tier"],
        "primaryDriver": entity["primary_driver"],
        "shapImportance": entity["shap_importance"],
        "rawMetrics": entity["raw_metrics"],
        "activeDisruptions": entity["active_disruptions"],
        "recommendedMitigation": entity["mitigation"]
    }


def explain_shap_in_plain_language(shap_data: Dict[str, Any], question: str) -> str:
    """
    Transforms SHAP feature-importance metrics into a natural, executive spoken risk briefing.
    Instruction: Explain risk factors in plain spoken language, NOT technical SHAP terminology.
    """
    # Try calling Groq LLM if configured
    groq_api_key = os.getenv("GROQ_API_KEY")
    if groq_api_key:
        try:
            from langchain_groq import ChatGroq
            from langchain_core.messages import SystemMessage, HumanMessage

            llm = ChatGroq(
                model="llama-3.3-70b-versatile",
                temperature=0.2,
                api_key=groq_api_key
            )

            system_prompt = (
                "You are ChainIQ ERP's executive voice briefing advisor. "
                "The user is asking a spoken question about supplier or shipment risk. "
                "Explain the risk drivers in natural, spoken conversational English. "
                "CRITICAL: Do NOT use technical machine learning or SHAP terminology (e.g., do not say 'SHAP values', 'features', or 'weights'). "
                "Instead, explain what is physically happening in the supply chain (e.g., weather delays, delivery reliability, customs hold-ups, or vendor financial standing). "
                "Keep your explanation concise (2 to 3 sentences max) so it can be comfortably spoken out loud."
            )

            prompt = (
                f"User Question: {question}\n\n"
                f"Disruption Risk Analysis Data:\n{json.dumps(shap_data, indent=2)}\n\n"
                "Provide the spoken executive briefing:"
            )

            resp = llm.invoke([SystemMessage(content=system_prompt), HumanMessage(content=prompt)])
            if resp and resp.content:
                return resp.content.strip()
        except Exception as e:
            print(f"[SHAP LLM Explain] Falling back to rule-based spoken template: {e}")

    # Robust spoken-language fallback generator
    name = shap_data.get("entityName", "the supplier")
    score = shap_data.get("riskScore", 50)
    tier = shap_data.get("riskTier", "medium").upper()
    primary = shap_data.get("primaryDriver", "delivery lead times")
    mitigation = shap_data.get("recommendedMitigation", "review safety stock levels")
    disruptions = shap_data.get("activeDisruptions", [])

    if tier == "CRITICAL":
        clause = f"Due to active disruptions including {disruptions[0]}, " if disruptions else "Due to acute logistical bottlenecks, "
        return (
            f"Here is your risk briefing for {name}. It is currently rated Critical Risk at {score} out of 100. "
            f"{clause}the main risk driver is {primary}. "
            f"Our recommended action is to {mitigation}"
        )
    elif tier == "HIGH":
        return (
            f"Risk briefing for {name}: This supplier is currently flagged as High Risk with an index of {score} out of 100. "
            f"The primary concern stems from {primary}. "
            f"We advise that you {mitigation}"
        )
    else:
        return (
            f"Good news regarding {name}: It is currently evaluated at Low Risk with an operational score of {score} out of 100. "
            f"Operations remain stable with {primary}. {mitigation}"
        )

