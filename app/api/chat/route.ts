import { NextResponse } from "next/server"
import { nextSession, setSession, SESSION_CAP } from "@/lib/chat-session"
import { findAiEngineerProjects, findProjectRedirect, listedOnlySkills } from "@/lib/chat-routing"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const MAX_BODY_BYTES = 32 * 1024
const MAX_QUESTION_CHARS = 1000
const MAX_HISTORY_MESSAGES = 12
const MAX_HISTORY_CHARS = 8000
const SOURCES = new Set(["Resume", "About page", "Project page", "In progress"])

type HistoryMessage = { role: "user" | "assistant"; content: string }

function response(status: number, kind: "error" | "unavailable", message: string) {
  return NextResponse.json({ kind, message }, { status })
}

function validatedHistory(value: unknown): HistoryMessage[] | undefined {
  if (value === undefined) return []
  if (!Array.isArray(value) || value.length > MAX_HISTORY_MESSAGES) return undefined
  const history: HistoryMessage[] = []
  for (const item of value) {
    if (!item || typeof item !== "object" || (item.role !== "user" && item.role !== "assistant") || typeof item.content !== "string" || !item.content || item.content.length > MAX_HISTORY_CHARS) return undefined
    history.push({ role: item.role, content: item.content })
  }
  return history
}

export async function POST(request: Request) {
  const raw = await request.text()
  if (Buffer.byteLength(raw) > MAX_BODY_BYTES) return response(413, "error", "That request is too large.")
  let body: Record<string, unknown>
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid body")
    body = parsed as Record<string, unknown>
  } catch {
    return response(422, "error", "That request is not valid.")
  }

  const question = typeof body.question === "string" ? body.question.trim() : ""
  const history = validatedHistory(body.history)
  if (!question || question.length > MAX_QUESTION_CHARS || !history) return response(422, "error", "That request is not valid.")

  const recommendation = findAiEngineerProjects(question)
  if (recommendation) return NextResponse.json({ kind: "project_recommendation", ...recommendation, source: "Project page" })

  const redirect = findProjectRedirect(question)
  if (redirect) return NextResponse.json({ kind: "redirect", redirect, source: "Project page" })

  const listedSkills = listedOnlySkills(question)
  if (listedSkills.length) {
    const names = listedSkills.join(", ")
    return NextResponse.json({
      kind: "answer",
      answer: `My resume lists ${names} as ${listedSkills.length === 1 ? "a skill" : "skills"}. It does not document ${listedSkills.length === 1 ? "it" : "them"} being used at a specific employer or project.`,
      source: "Resume",
    })
  }

  const backend = process.env.CHAT_API_URL
  const token = process.env.CHAT_INTERNAL_TOKEN
  const secret = process.env.CHAT_SESSION_SECRET
  if (!backend || !token || !secret) return response(503, "unavailable", "The assistant is temporarily unavailable.")

  const session = nextSession(request, secret)
  if (session.count >= SESSION_CAP) return response(429, "unavailable", "The assistant is temporarily unavailable. You have reached the session limit.")

  // Vercel overwrites this header to prevent client spoofing. Its WAF rule is the
  // durable per-IP limit; the Python service adds a per-instance second brake.
  const ip = process.env.VERCEL ? request.headers.get("x-vercel-forwarded-for") : request.headers.get("x-forwarded-for")
  if (process.env.VERCEL && !ip) return response(503, "unavailable", "The assistant is temporarily unavailable.")
  session.count += 1

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30_000)
  try {
    const upstream = await fetch(`${backend.replace(/\/$/, "")}/chat`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-chat-internal-token": token, "x-forwarded-for": ip?.split(",")[0].trim() || "unknown" },
      body: JSON.stringify({ question, history }), signal: controller.signal, cache: "no-store",
    })
    if (!upstream.ok) {
      const unavailable = upstream.status === 429 || upstream.status === 503
      return setSession(response(unavailable ? 503 : 502, unavailable ? "unavailable" : "error", unavailable ? "The assistant is temporarily unavailable." : "The assistant could not answer right now."), session, secret)
    }
    const result: unknown = await upstream.json()
    if (!result || typeof result !== "object" || !("kind" in result) || !("answer" in result) || !("source" in result)) throw new Error("Invalid upstream response")
    const item = result as { kind: unknown; answer: unknown; source: unknown }
    if ((item.kind !== "answer" && item.kind !== "decline") || typeof item.answer !== "string" || !item.answer.trim() || (item.kind === "answer" && !SOURCES.has(String(item.source))) || (item.source !== null && !SOURCES.has(String(item.source)))) throw new Error("Invalid upstream response")
    return setSession(NextResponse.json({ kind: item.kind, answer: item.answer, source: item.source }), session, secret)
  } catch {
    return setSession(response(502, "error", "The assistant could not answer right now."), session, secret)
  } finally {
    clearTimeout(timeout)
  }
}
