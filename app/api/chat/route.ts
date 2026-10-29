import { createHmac, randomUUID, timingSafeEqual } from "node:crypto"
import { NextResponse } from "next/server"
import { findProjectRedirect, listedOnlySkills } from "@/lib/chat-routing"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const MAX_BODY_BYTES = 32 * 1024
const MAX_QUESTION_CHARS = 1000
const MAX_HISTORY_MESSAGES = 12
const MAX_HISTORY_CHARS = 8000
const SESSION_SECONDS = 24 * 60 * 60
const configuredCap = Number(process.env.CHAT_SESSION_CAP ?? "30")
const SESSION_CAP = Number.isSafeInteger(configuredCap) && configuredCap > 0 ? configuredCap : 30
const COOKIE = "portfolio_chat_session"
const SOURCES = new Set(["Resume", "About page", "Project page", "In progress"])

type HistoryMessage = { role: "user" | "assistant"; content: string }
type Session = { id: string; count: number; expires: number }

function response(status: number, kind: "error" | "unavailable", message: string) {
  return NextResponse.json({ kind, message }, { status })
}

function signature(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("hex")
}

function readSession(request: Request, secret: string): Session | undefined {
  const cookie = request.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1)
  if (!cookie) return undefined
  const [id, countText, expiresText, given] = cookie.split(".")
  if (!id || !countText || !expiresText || !given || !/^[0-9a-f-]{36}$/.test(id) || !/^\d+$/.test(countText) || !/^\d+$/.test(expiresText) || !/^[0-9a-f]{64}$/.test(given)) return undefined
  const expected = signature(`${id}.${countText}.${expiresText}`, secret)
  if (!timingSafeEqual(Buffer.from(given), Buffer.from(expected))) return undefined
  const expires = Number(expiresText)
  const count = Number(countText)
  if (!Number.isSafeInteger(count) || !Number.isSafeInteger(expires) || expires <= Date.now()) return undefined
  return { id, count, expires }
}

function setSession(result: NextResponse, session: Session, secret: string) {
  const value = `${session.id}.${session.count}.${session.expires}`
  result.cookies.set(COOKIE, `${value}.${signature(value, secret)}`, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production",
    path: "/api/chat", maxAge: SESSION_SECONDS,
  })
  return result
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

  const previous = readSession(request, secret)
  const session: Session = previous ?? { id: randomUUID(), count: 0, expires: Date.now() + SESSION_SECONDS * 1000 }
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
