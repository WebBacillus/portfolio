// PROTOTYPE PROOF. The same-origin proxy boundary.
//
// The browser only ever talks to this route, which lives on the same origin as the
// portfolio. The Python service URL is a server-side env var and never reaches the
// client, so there is no cross-origin request, no CORS negotiation, and no way for a
// visitor to learn the backend's address.
//
// This route is also where the abuse limits that must survive a cold start live: body
// size, question length, history length, and a per-IP rate limit that the Python
// service cannot enforce on its own because each of its instances keeps its own counter.
//
// PROTOTYPE: not production code. The implementation spec decides whether this boundary
// stays, and the deployment proof decides whether the Python service is reachable from
// this route at all.

import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const MAX_BODY_BYTES = 32 * 1024
const MAX_QUESTION_CHARS = 1000
const MAX_HISTORY_MESSAGES = 12

const RATE_LIMIT_REQUESTS = 20
const RATE_LIMIT_WINDOW_MS = 60_000

type ChatMessage = { role: "user" | "assistant"; content: string }
type ChatRequestBody = { question?: unknown; history?: unknown }

const hits = new Map<string, number[]>()

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  return "unknown"
}

function rateLimited(key: string): boolean {
  const now = Date.now()
  const window = (hits.get(key) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
  if (window.length >= RATE_LIMIT_REQUESTS) {
    hits.set(key, window)
    return true
  }
  window.push(now)
  hits.set(key, window)
  return false
}

function errorResponse(status: number, code: string, message: string) {
  return NextResponse.json({ error: code, message }, { status })
}

export async function POST(request: Request) {
  const backend = process.env.CHAT_API_URL
  if (!backend) {
    return errorResponse(
      503,
      "not_configured",
      "The assistant is not available right now.",
    )
  }

  const raw = await request.text()
  if (raw.length > MAX_BODY_BYTES) {
    return errorResponse(413, "payload_too_large", "That request is too large.")
  }

  let body: ChatRequestBody
  try {
    body = JSON.parse(raw) as ChatRequestBody
  } catch {
    return errorResponse(422, "invalid_json", "That request is not valid.")
  }

  const question = typeof body.question === "string" ? body.question.trim() : ""
  if (!question) {
    return errorResponse(422, "invalid_request", "A question is required.")
  }
  if (question.length > MAX_QUESTION_CHARS) {
    return errorResponse(422, "invalid_request", "That question is too long.")
  }

  const rawHistory = Array.isArray(body.history) ? body.history : []
  if (rawHistory.length > MAX_HISTORY_MESSAGES) {
    return errorResponse(422, "invalid_request", "That conversation is too long.")
  }

  const history: ChatMessage[] = []
  for (const entry of rawHistory) {
    if (!entry || typeof entry !== "object") continue
    const role = (entry as { role?: unknown }).role
    const content = (entry as { content?: unknown }).content
    if ((role === "user" || role === "assistant") && typeof content === "string") {
      history.push({ role, content: content.slice(0, 8000) })
    }
  }

  if (rateLimited(clientKey(request))) {
    return errorResponse(
      429,
      "rate_limited",
      "Too many requests. Please try again shortly.",
    )
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30_000)

  // The Python service is a second public origin, so it only accepts requests carrying
  // this shared secret. Without it, anyone who learns the backend URL can spend the
  // owner's whole monthly model budget.
  const internalToken = process.env.CHAT_INTERNAL_TOKEN
  if (!internalToken) {
    return errorResponse(
      503,
      "not_configured",
      "The assistant is not available right now.",
    )
  }

  try {
    const upstream = await fetch(`${backend.replace(/\/$/, "")}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-chat-internal-token": internalToken,
        // The visitor's real IP is forwarded so the backend's per-IP limiter counts
        // visitors, not the proxy. Without this the backend sees only the proxy's
        // address and one visitor's burst trips the limit for everyone.
        "x-forwarded-for": clientKey(request),
      },
      body: JSON.stringify({ question, history }),
      signal: controller.signal,
      cache: "no-store",
    })

    const text = await upstream.text()

    if (!upstream.ok) {
      // The upstream error code is passed through so the UI can distinguish an error
      // from a temporary unavailability, but the upstream body is not relayed verbatim.
      let code = "upstream_error"
      try {
        const parsed = JSON.parse(text) as { error?: string }
        if (typeof parsed.error === "string") code = parsed.error
      } catch {
        code = "upstream_error"
      }
      const status = upstream.status === 429 ? 429 : upstream.status === 503 ? 503 : 502
      return errorResponse(
        status,
        code,
        status === 429
          ? "Too many requests. Please try again shortly."
          : "The assistant could not answer right now. Please try again.",
      )
    }

    let parsed: { answer?: unknown; model?: unknown }
    try {
      parsed = JSON.parse(text) as { answer?: unknown; model?: unknown }
    } catch {
      return errorResponse(
        502,
        "upstream_error",
        "The assistant could not answer right now. Please try again.",
      )
    }

    if (typeof parsed.answer !== "string") {
      return errorResponse(
        502,
        "upstream_error",
        "The assistant could not answer right now. Please try again.",
      )
    }

    return NextResponse.json({
      answer: parsed.answer,
      model: typeof parsed.model === "string" ? parsed.model : undefined,
    })
  } catch (error) {
    const aborted = error instanceof Error && error.name === "AbortError"
    return errorResponse(
      aborted ? 504 : 502,
      aborted ? "model_timeout" : "upstream_unreachable",
      aborted
        ? "The assistant took too long. Please try again."
        : "The assistant is not reachable right now. Please try again.",
    )
  } finally {
    clearTimeout(timeout)
  }
}
