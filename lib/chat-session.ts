import { createHmac, randomUUID, timingSafeEqual } from "node:crypto"
import { NextResponse } from "next/server"

const SESSION_SECONDS = 24 * 60 * 60
const COOKIE = "portfolio_chat_session"
const configuredCap = Number(process.env.CHAT_SESSION_CAP ?? "30")
export const SESSION_CAP = Number.isSafeInteger(configuredCap) && configuredCap > 0 ? configuredCap : 30
export type Session = { id: string; count: number; expires: number }

function signature(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("hex")
}

export function readSession(request: Request, secret: string): Session | undefined {
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

export function nextSession(request: Request, secret: string): Session {
  return readSession(request, secret) ?? { id: randomUUID(), count: 0, expires: Date.now() + SESSION_SECONDS * 1000 }
}

export function setSession(result: NextResponse, session: Session, secret: string) {
  const value = `${session.id}.${session.count}.${session.expires}`
  result.cookies.set(COOKIE, `${value}.${signature(value, secret)}`, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production",
    path: "/api", maxAge: SESSION_SECONDS,
  })
  return result
}
