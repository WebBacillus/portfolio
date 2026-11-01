import { NextResponse } from "next/server"
import { nextSession, SESSION_CAP, setSession } from "@/lib/chat-session"
import { APPROVED_EVIDENCE, MAX_JOB_RESULT_BYTES, MAX_JOB_TEXT_CHARS, type EvidenceSourceId, type EvidenceStatus, type PublicEvidence, type PublicJobAssessment } from "@/lib/job-match-contract"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
const MAX_BODY_BYTES = 80 * 1024
const RESULT_TIMEOUT_MS = 45_000

function error(status: number, kind: "error" | "unavailable", message: string) {
  return NextResponse.json({ kind, message }, { status })
}

function enabledForPreview() {
  return process.env.VERCEL_ENV === "preview" && process.env.JOB_MATCH_PREVIEW_ENABLED === "true"
}

function validIp(request: Request) {
  const ip = process.env.VERCEL ? request.headers.get("x-vercel-forwarded-for") : request.headers.get("x-forwarded-for")
  return ip?.split(",")[0].trim() || (!process.env.VERCEL ? "local" : "")
}

function parseAssessment(value: unknown, jobText: string): PublicJobAssessment | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined
  const result = value as Record<string, unknown>
  if (typeof result.requirement !== "string" || !result.requirement.trim() || result.requirement.length > 500 || !result.requirement.toLowerCase().split(/[^a-z0-9+#.]+/).filter(Boolean).every((word) => jobText.toLowerCase().includes(word))) return undefined
  if (result.status !== "has_evidence" && result.status !== "partial_evidence" && result.status !== "no_evidence_found") return undefined
  const status = result.status as EvidenceStatus
  if (typeof result.reason !== "string" || !result.reason.trim() || result.reason.length > 500 || !Array.isArray(result.evidence) || result.evidence.length > 4) return undefined
  const evidence: PublicEvidence[] = []
  const seen = new Set<string>()
  for (const item of result.evidence) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return undefined
    const sourceId = (item as Record<string, unknown>).sourceId
    if (typeof sourceId !== "string" || !(sourceId in APPROVED_EVIDENCE) || seen.has(sourceId)) return undefined
    seen.add(sourceId)
    const source = APPROVED_EVIDENCE[sourceId as EvidenceSourceId]
    evidence.push({ sourceId: sourceId as EvidenceSourceId, label: source.label, href: source.href })
  }
  if ((status === "no_evidence_found" && evidence.length !== 0) || (status !== "no_evidence_found" && evidence.length === 0)) return undefined
  return { kind: "assessment", requirement: result.requirement.trim(), status, reason: result.reason.trim(), evidence }
}

async function readLimitedBody(request: Request, limit: number): Promise<Uint8Array | undefined> {
  const reader = request.body?.getReader()
  if (!reader) return new Uint8Array()
  const chunks: Uint8Array[] = []
  let size = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > limit) {
      await reader.cancel()
      return undefined
    }
    chunks.push(value)
  }
  const body = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength }
  return body
}

export async function POST(request: Request) {
  if (!enabledForPreview()) return error(404, "unavailable", "Job matching is not available.")
  const backend = process.env.CHAT_API_URL
  const token = process.env.CHAT_INTERNAL_TOKEN
  const secret = process.env.CHAT_SESSION_SECRET
  if (!backend || !token || !secret) return error(503, "unavailable", "Job matching is temporarily unavailable.")
  const ip = validIp(request)
  if (!ip) return error(503, "unavailable", "Job matching is temporarily unavailable.")
  const raw = await readLimitedBody(request, MAX_BODY_BYTES)
  if (!raw) return error(413, "error", "That request is too large. Paste a shorter job description.")
  let payload: unknown
  try { payload = JSON.parse(new TextDecoder().decode(raw)) } catch { return error(422, "error", "Paste one valid job description.") }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return error(422, "error", "Paste one valid job description.")
  const jobText = (payload as Record<string, unknown>).jobText
  if (typeof jobText !== "string" || !jobText.trim() || jobText.trim().length > MAX_JOB_TEXT_CHARS) return error(422, "error", "Paste one job description of up to 20,000 characters.")

  const session = nextSession(request, secret)
  if (session.count >= SESSION_CAP) return setSession(error(429, "unavailable", "The assistant is temporarily unavailable. You have reached the session limit."), session, secret)
  session.count += 1

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), RESULT_TIMEOUT_MS)
  try {
    const upstream = await fetch(`${backend.replace(/\/$/, "")}/job-match`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-chat-internal-token": token, "x-forwarded-for": ip },
      body: JSON.stringify({ jobText: jobText.trim() }), signal: controller.signal, cache: "no-store",
    })
    if (!upstream.ok) {
      const unavailable = upstream.status === 429 || upstream.status === 503
      return setSession(error(unavailable ? 503 : 502, unavailable ? "unavailable" : "error", unavailable ? "Job matching is temporarily unavailable." : "The assessment could not be produced. Please try again."), session, secret)
    }
    const responseBytes = new Uint8Array(await upstream.arrayBuffer())
    if (responseBytes.byteLength > MAX_JOB_RESULT_BYTES) throw new Error("Oversized assessment")
    const parsed = parseAssessment(JSON.parse(new TextDecoder().decode(responseBytes)), jobText.trim())
    if (!parsed) throw new Error("Invalid assessment")
    return setSession(NextResponse.json(parsed), session, secret)
  } catch {
    return setSession(error(502, "error", "The assessment could not be produced. Please try again."), session, secret)
  } finally {
    clearTimeout(timeout)
  }
}
