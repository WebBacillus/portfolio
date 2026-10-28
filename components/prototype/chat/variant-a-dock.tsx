// PROTOTYPE VARIANT A: floating dock.
// A collapsed launcher in the bottom right that expands into a floating card.
// The overlay does not change the page layout. On mobile the card becomes a full screen sheet.
//
// Interaction contract being judged here:
//   - the narrow scope is obvious before the first question is asked, from the launcher
//     label and the panel header, not from an answer the visitor has to ask for
//   - a project question lands on a project page link, not a chat answer
//   - every answer carries a source label
//   - reset, loading, error, and temporarily unavailable are all visible
//   - keyboard: Enter sends, Shift+Enter makes a new line, Escape closes, focus returns
//     to the launcher

"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowUp, MessageCircle, X } from "lucide-react"
import { usePrototypeChat } from "./use-prototype-chat"
import { CV_SUGGESTED_QUESTIONS, PROJECT_SUGGESTED_QUESTIONS } from "./mock-engine"
import {
  AssistantTurn,
  Composer,
  StatusBlock,
  UserTurn,
} from "./chat-parts"
import StateDemoControls from "./state-demo-controls"
import { shouldAutofocusComposer } from "./focus-policy"

const SCOPE_LINE =
  "I answer questions about my CV: background, experience, skills, and education. For a project I will point you to its page."

export default function VariantA() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const { messages, status, send, reset, retry } = usePrototypeChat()
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const launcherRef = useRef<HTMLButtonElement>(null)
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    // On a phone, focusing the field pops the keyboard straight away, which covers the
    // suggested questions the visitor has not seen yet. So the field is focused only on
    // a non touch device. The keyboard user reaches it with Tab, the phone user taps it.
    if (shouldAutofocusComposer()) {
      inputRef.current?.focus()
    }
  }, [open])

  useEffect(() => {
    const el = logRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, status])

  useEffect(() => {
    if (!open) return
    // The sheet covers the whole screen on a phone, so the page behind it must not
    // scroll under the visitor's thumb. On a desktop the dock is a card beside the
    // page, so the page keeps scrolling.
    const isSheet = !window.matchMedia("(min-width: 768px)").matches
    if (!isSheet) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
        launcherRef.current?.focus()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  const submit = () => {
    if (!input.trim() || status === "loading") return
    send(input)
    setInput("")
  }

  const close = () => {
    setOpen(false)
    launcherRef.current?.focus()
  }

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close chat"
          onClick={close}
          className="fixed inset-0 z-40 bg-black/30 md:bg-transparent md:pointer-events-none"
        />
      )}

      <div
        id="chat-a-panel"
        role="dialog"
        aria-label="Ask about my CV"
        className={[
          "fixed z-50 bg-white border border-purple/15 shadow-2xl flex flex-col",
          // The sheet uses the dynamic viewport height, so the composer stays reachable
          // when the on-screen keyboard opens on a phone.
          "inset-x-0 top-0 h-[100dvh] md:inset-auto md:right-6 md:bottom-24 md:w-[400px] md:h-[560px] md:max-h-[calc(100vh-8rem)] md:rounded-2xl",
          open ? "flex" : "hidden",
        ].join(" ")}
      >
        <header className="flex items-start gap-3 px-4 py-3 border-b border-purple/10 bg-purple/5 rounded-t-2xl">
          <MessageCircle className="w-5 h-5 text-purple mt-0.5 shrink-0" aria-hidden />
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-black">Ask about my CV</h2>
            <p className="text-xs text-black/60 leading-snug">{SCOPE_LINE}</p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close chat"
            className="p-1.5 rounded-md text-black/50 hover:text-purple hover:bg-purple/10 transition-colors"
          >
            <X className="w-4 h-4" aria-hidden />
          </button>
        </header>

        <div ref={logRef} role="log" aria-live="polite" className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="space-y-4">
              <div className="space-y-2.5">
                <p className="text-sm text-black/70">Try one of these.</p>
                <div className="flex flex-wrap gap-2">
                  {CV_SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => send(q)}
                      className="text-xs px-3 py-1.5 rounded-full border border-purple/25 text-purple hover:bg-purple/10 transition-colors text-left"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2.5 border-t border-purple/10 pt-3.5">
                <p className="text-xs text-black/45 leading-snug">
                  Ask about a project and I will link you to its page instead of answering here.
                </p>
                <div className="flex flex-wrap gap-2">
                  {PROJECT_SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => send(q)}
                      className="text-xs px-3 py-1.5 rounded-full border border-black/15 text-black/60 hover:border-purple/30 hover:text-purple transition-colors text-left inline-flex items-center gap-1.5"
                    >
                      {q}
                      <ArrowUp className="w-3 h-3 rotate-45 opacity-50" aria-hidden />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((message) =>
            message.role === "user" ? (
              <UserTurn key={message.id} message={message} />
            ) : (
              <AssistantTurn key={message.id} message={message} />
            ),
          )}

          {status !== "idle" && <StatusBlock status={status} onRetry={retry} />}
        </div>

        <div className="border-t border-purple/10 p-3">
          <Composer
            input={input}
            onInputChange={setInput}
            onSubmit={submit}
            disabled={!input.trim() || status === "loading"}
            inputId="chat-a-input"
            placeholder="Ask about my CV"
            showReset
            canReset={messages.length > 0}
            onReset={reset}
            inputRef={inputRef}
          />
        </div>
      </div>

      <button
        ref={launcherRef}
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-expanded={open}
        aria-controls="chat-a-panel"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-purple px-5 py-3 text-white shadow-lg hover:bg-dark-purple transition-colors"
      >
        {open ? <X className="w-5 h-5" aria-hidden /> : <MessageCircle className="w-5 h-5" aria-hidden />}
        <span className="text-sm font-medium">{open ? "Close" : "Ask about my CV"}</span>
      </button>

      <div className="fixed top-3 left-3 z-[100] rounded-full bg-neutral-900 px-3 py-1.5 md:top-auto md:bottom-6 md:left-6">
        <StateDemoControls compact />
      </div>
    </>
  )
}
