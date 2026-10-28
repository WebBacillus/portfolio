// PROTOTYPE ONLY. Shared chat state so the three UI variants differ in layout, not in
// behavior. In production this hook is where the real fetch to the API would live.

"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  armTriggerFromUrl,
  consumePendingTrigger,
  mockAnswer,
  type ChatMessage,
  type ChatStatus,
} from "./mock-engine"

export function usePrototypeChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [status, setStatus] = useState<ChatStatus>("idle")
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    armTriggerFromUrl()
  }, [])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  /** Run one question against the mock engine and settle on an answer or a failure. */
  const runAnswer = useCallback((text: string) => {
    setStatus("loading")

    const trigger = consumePendingTrigger()

    timerRef.current = setTimeout(() => {
      // A failure is a state, not a turn. No assistant message is added, because the
      // model produced no answer and the contract forbids substituting one. The banner
      // in the transcript carries the failure instead.
      if (trigger === "error") {
        setStatus("error")
        return
      }
      if (trigger === "unavailable") {
        setStatus("unavailable")
        return
      }
      setMessages((prev) => [...prev, mockAnswer(text)])
      setStatus("idle")
    }, 900)
  }, [])

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim()
      if (!trimmed) return

      const userMessage: ChatMessage = { id: `u-${Date.now()}`, role: "user", text: trimmed }
      setMessages((prev) => [...prev, userMessage])
      runAnswer(trimmed)
    },
    [runAnswer],
  )

  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setMessages([])
    setStatus("idle")
  }, [])

  /**
   * Resend the question that failed. The visitor's turn is already in the transcript,
   * so the retry re-runs the request without adding the question a second time.
   */
  const retry = useCallback(() => {
    if (status !== "error") return
    const last = messages[messages.length - 1]
    if (!last || last.role !== "user") return
    runAnswer(last.text)
  }, [runAnswer, status, messages])

  return { messages, status, send, reset, retry }
}
