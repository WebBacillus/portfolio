"""PROTOTYPE PROOF. A minimal, non-agentic chat service shaped the way Vercel expects a
Python function, so the hosting boundary can be tested before the implementation spec is
written. This is not production code.

What it proves:
  - a Python function can serve the chat contract
  - the request bounds are enforced before any spend
  - the key stays on the server and never appears in a response
  - a model failure is a clean error, never a substituted answer
  - the request body and history never get logged

The knowledge contract at docs/chatbot/knowledge-contract.md is the source of the rules
this file enforces. The prompt text here is a stand-in, not the approved prompt.
"""

from __future__ import annotations

import hmac
import json
import os
import time
import uuid
from typing import Any, Literal

import httpx
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, ValidationError, field_validator

MODEL = os.environ.get("OPENAI_MODEL", "gpt-6-luna")
BASE_URL = os.environ.get("OPENAI_BASE_URL", "https://api.openai.com/v1")

# A separate deployment means a second public origin. Its URL is visible in the Vercel
# dashboard, in logs, and in any Referer header, so "keep it private" cannot rely on
# obscurity. The service therefore refuses any request that does not carry the shared
# secret the Next.js proxy holds. Without this, one person with the URL can spend the
# owner's whole monthly budget.
#
# The comparison is constant time so the secret cannot be recovered by timing.
INTERNAL_TOKEN = os.environ.get("CHAT_INTERNAL_TOKEN", "")


def _token_is_valid(candidate: str | None) -> bool:
    if not INTERNAL_TOKEN:
        # No token configured means the service is unprotected. This is reported by
        # /health so the misconfiguration is visible rather than silent.
        return False
    if not candidate:
        return False
    return hmac.compare_digest(candidate, INTERNAL_TOKEN)

# Request bounds. The browser also bounds these, but the server is the only place that
# can be trusted to enforce them, because a request can arrive from anywhere.
MAX_QUESTION_CHARS = 1000
MAX_HISTORY_MESSAGES = 12
MAX_HISTORY_CHARS = 8000
MAX_BODY_BYTES = 32 * 1024
REQUEST_TIMEOUT_SECONDS = 25.0

# In-memory abuse brake. A single instance sees only its own traffic, so this is a floor
# and not a guarantee. The real limit has to be a shared store or an edge rule.
RATE_LIMIT_REQUESTS = 20
RATE_LIMIT_WINDOW_SECONDS = 60

app = FastAPI(title="chat-prototype", docs_url=None, redoc_url=None, openapi_url=None)

_hits: dict[str, list[float]] = {}


def _client_key(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _rate_limited(key: str) -> bool:
    now = time.monotonic()
    window = [t for t in _hits.get(key, []) if now - t < RATE_LIMIT_WINDOW_SECONDS]
    if len(window) >= RATE_LIMIT_REQUESTS:
        _hits[key] = window
        return True
    window.append(now)
    _hits[key] = window
    return False


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=MAX_HISTORY_CHARS)


class ChatRequest(BaseModel):
    # The question is stripped before it is validated. Without the strip, a body of
    # "   " satisfies min_length=1 and spends a model call on an empty question.
    # The boundary proof found this: a whitespace-only question returned 200.
    question: str = Field(min_length=1, max_length=MAX_QUESTION_CHARS)
    history: list[ChatMessage] = Field(default_factory=list, max_length=MAX_HISTORY_MESSAGES)

    @field_validator("question", mode="before")
    @classmethod
    def _strip_question(cls, value: Any) -> Any:
        if isinstance(value, str):
            return value.strip()
        return value


SYSTEM_PROMPT = (
    "You answer questions about Pasit Khumsena's CV: background, education, experience, "
    "and the skills he lists. Answer briefly and in plain sentences. If a fact is not in "
    "your instructions, say you would rather not guess."
)


def _knowledge_brief() -> str:
    """The reviewed knowledge, inlined for the proof.

    In production this is read from the approved knowledge files at build time or from a
    bundled artifact. It is never fetched from a database at request time, and the visitor
    can never supply it.
    """
    return (
        "Approved facts for this proof: Pasit Khumsena is a Computer Engineering student "
        "at Chulalongkorn University, graduating December 2026 with a GPAX of 3.71. He is "
        "an AI Engineer intern at True Corporation since August 2026, and was a part time "
        "software engineer at NITMX from April 2025 to July 2026. His resume lists Go, "
        "Python, TypeScript, Java, PostgreSQL, MongoDB, PyTorch, Scikit learn, Airflow, "
        "MLflow, the OpenAI API, RAG, and Qdrant."
    )


def _build_input(request: ChatRequest) -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = [
        {"role": "system", "content": f"{SYSTEM_PROMPT}\n\n{_knowledge_brief()}"}
    ]
    for message in request.history:
        items.append({"role": message.role, "content": message.content})
    items.append({"role": "user", "content": request.question})
    return items


@app.get("/health")
async def health() -> dict[str, Any]:
    """A health check that proves the key is present without revealing it."""
    key = os.environ.get("OPENAI_API_KEY")
    return {
        "ok": True,
        "model": MODEL,
        "key_present": bool(key),
        "runtime": "python",
        # False means the service would reject every caller, which is a misconfiguration
        # rather than a healthy state. It is reported so it cannot pass unnoticed.
        "internal_auth_configured": bool(INTERNAL_TOKEN),
    }


@app.post("/chat")
async def chat(request: Request) -> JSONResponse:
    request_id = uuid.uuid4().hex[:12]

    # The shared secret is checked before anything else, so an unauthenticated caller
    # never reaches the body parse, the rate limiter, or the model.
    if not _token_is_valid(request.headers.get("x-chat-internal-token")):
        return JSONResponse(
            status_code=401,
            content={
                "error": "unauthorized",
                "message": "Not available.",
                "request_id": request_id,
            },
        )

    # Body size is checked from the raw stream, before parsing, so an oversized body
    # never gets parsed into memory.
    raw = await request.body()
    if len(raw) > MAX_BODY_BYTES:
        return JSONResponse(
            status_code=413,
            content={
                "error": "payload_too_large",
                "message": "That request is too large.",
                "request_id": request_id,
            },
        )

    try:
        payload = ChatRequest.model_validate(json.loads(raw or b"{}"))
    except ValidationError as exc:
        return JSONResponse(
            status_code=422,
            content={
                "error": "invalid_request",
                "message": "That request is not valid.",
                "request_id": request_id,
            },
        )
    except json.JSONDecodeError:
        return JSONResponse(
            status_code=422,
            content={
                "error": "invalid_json",
                "message": "That request is not valid.",
                "request_id": request_id,
            },
        )

    if _rate_limited(_client_key(request)):
        return JSONResponse(
            status_code=429,
            content={
                "error": "rate_limited",
                "message": "Too many requests. Please try again shortly.",
                "request_id": request_id,
            },
        )

    key = os.environ.get("OPENAI_API_KEY")
    if not key:
        return JSONResponse(
            status_code=503,
            content={
                "error": "not_configured",
                "message": "The assistant is not available right now.",
                "request_id": request_id,
            },
        )

    # PROTOTYPE PROOF. STUB=1 answers without touching the model, so the cost of the
    # proxy hop can be measured on its own. The model call is the slow part and its
    # latency varies by seconds, which would otherwise swamp the hop being measured.
    if os.environ.get("STUB") == "1":
        return JSONResponse(
            status_code=200,
            content={
                "answer": "stub answer",
                "model": "stub",
                "request_id": request_id,
            },
        )

    try:
        async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT_SECONDS) as client:
            response = await client.post(
                f"{BASE_URL}/responses",
                headers={
                    "Authorization": f"Bearer {key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": MODEL,
                    "input": _build_input(payload),
                    "max_output_tokens": 400,
                    "store": False,
                },
            )
    except httpx.TimeoutException:
        return JSONResponse(
            status_code=504,
            content={
                "error": "model_timeout",
                "message": "The assistant took too long. Please try again.",
                "request_id": request_id,
            },
        )
    except httpx.HTTPError:
        return JSONResponse(
            status_code=502,
            content={
                "error": "upstream_unreachable",
                "message": "The assistant is not reachable right now. Please try again.",
                "request_id": request_id,
            },
        )

    if response.status_code != 200:
        # The upstream body can contain provider detail. It is not passed through, so a
        # visitor never sees it and no key material can leak through an error.
        return JSONResponse(
            status_code=502,
            content={
                "error": "model_error",
                "message": "The assistant could not answer right now. Please try again.",
                "request_id": request_id,
            },
        )

    data = response.json()
    text = ""
    for item in data.get("output", []):
        for part in item.get("content", []):
            if part.get("type") in ("output_text", "text"):
                text += part.get("text", "")

    return JSONResponse(
        status_code=200,
        content={
            "answer": text.strip(),
            "model": data.get("model", MODEL),
            "request_id": request_id,
        },
    )
