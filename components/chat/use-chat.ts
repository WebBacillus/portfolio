"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export type SourceLabel = "Resume" | "About page" | "Project page" | "In progress"
export type ChatEntry =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "assistant"; text: string; source: SourceLabel | null; kind: "answer" | "decline" }
  | { id: string; role: "redirect"; title: string; href: string; summary: string }
export type ChatStatus = "idle" | "loading" | "error" | "unavailable"

type ApiResponse =
  | { kind: "answer" | "decline"; answer: string; source: SourceLabel | null }
  | { kind: "redirect"; redirect: { title: string; href: string; summary: string }; source: "Project page" }
  | { kind: "error" | "unavailable"; message: string }

function historyFrom(entries: ChatEntry[]) {
  const history: Array<{ role: "user" | "assistant"; content: string }> = []
  for (let i = 0; i < entries.length - 1; i++) {
    const user = entries[i]
    const answer = entries[i + 1]
    if (user.role === "user" && answer.role === "assistant") {
      history.push({ role: "user", content: user.text }, { role: "assistant", content: answer.text })
    }
  }
  return history.slice(-12)
}

export function useChat() {
  const [messages, setMessages] = useState<ChatEntry[]>([])
  const [status, setStatus] = useState<ChatStatus>("idle")
  const messagesRef = useRef<ChatEntry[]>([])
  const statusRef = useRef<ChatStatus>("idle")
  const failedQuestion = useRef<{ text: string; history: ReturnType<typeof historyFrom> } | null>(null)
  const activeRequest = useRef<AbortController | null>(null)
  const generation = useRef(0)
  const sequence = useRef(0)
  const nextId = useCallback(() => `chat-${++sequence.current}`, [])

  const setEntries = useCallback((entries: ChatEntry[]) => {
    messagesRef.current = entries
    setMessages(entries)
  }, [])

  const setChatStatus = useCallback((next: ChatStatus) => {
    statusRef.current = next
    setStatus(next)
  }, [])

  const run = useCallback(async (text: string, history: ReturnType<typeof historyFrom>) => {
    const controller = new AbortController()
    activeRequest.current = controller
    const requestGeneration = ++generation.current
    setChatStatus("loading")
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question: text, history }),
        signal: controller.signal,
      })
      const data = await response.json() as ApiResponse
      if (requestGeneration !== generation.current) return
      if (data.kind === "unavailable" || response.status === 429 || response.status === 503) {
        setChatStatus("unavailable")
        return
      }
      if (!response.ok || data.kind === "error") {
        failedQuestion.current = { text, history }
        setChatStatus("error")
        return
      }
      if (data.kind === "redirect") {
        const { title, href, summary } = data.redirect
        setEntries([...messagesRef.current, { id: nextId(), role: "redirect", title, href, summary }])
      } else if (data.kind === "answer" && data.source) {
        setEntries([...messagesRef.current, { id: nextId(), role: "assistant", text: data.answer, source: data.source, kind: data.kind }])
      } else if (data.kind === "decline") {
        setEntries([...messagesRef.current, { id: nextId(), role: "assistant", text: data.answer, source: null, kind: "decline" }])
      } else {
        failedQuestion.current = { text, history }
        setChatStatus("error")
        return
      }
      failedQuestion.current = null
      setChatStatus("idle")
    } catch {
      if (controller.signal.aborted || requestGeneration !== generation.current) return
      failedQuestion.current = { text, history }
      setChatStatus("error")
    } finally {
      if (activeRequest.current === controller) activeRequest.current = null
    }
  }, [nextId, setEntries, setChatStatus])

  const send = useCallback((value: string) => {
    const text = value.trim()
    if (!text || statusRef.current === "loading" || statusRef.current === "unavailable") return false
    const history = historyFrom(messagesRef.current)
    setEntries([...messagesRef.current, { id: nextId(), role: "user", text }])
    void run(text, history)
    return true
  }, [nextId, run, setEntries])

  const retry = useCallback(() => {
    if (statusRef.current !== "error" || !failedQuestion.current) return
    void run(failedQuestion.current.text, failedQuestion.current.history)
  }, [run])

  const reset = useCallback(() => {
    generation.current += 1
    activeRequest.current?.abort()
    activeRequest.current = null
    failedQuestion.current = null
    setEntries([])
    setChatStatus("idle")
  }, [setEntries, setChatStatus])

  useEffect(() => () => { activeRequest.current?.abort() }, [])

  return { messages, status, send, retry, reset }
}
