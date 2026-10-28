// PROTOTYPE VARIANT C: inline section.
// No overlay and no separate route. The chat is a section of the page itself, placed under
// the hero. The visitor scrolls to it. On a project page the same section carries that
// project's context, so the suggested questions can point at the page they are already on.
//
// Interaction contract being judged here:
//   - the narrow scope is obvious from the section heading and its own suggested questions
//   - a project question lands on a project page link
//   - every answer carries a source label
//   - reset, loading, error, and temporarily unavailable are all visible
//   - keyboard: Enter sends, Shift+Enter makes a new line

"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowUp, Sparkles } from "lucide-react"
import { usePrototypeChat } from "./use-prototype-chat"
import { CV_SUGGESTED_QUESTIONS, PROJECT_SUGGESTED_QUESTIONS } from "./mock-engine"
import { AssistantTurn, Composer, StatusBlock, UserTurn } from "./chat-parts"
import StateDemoControls from "./state-demo-controls"

export default function VariantC({ contextTitle }: { contextTitle?: string }) {
  const [input, setInput] = useState("")
  const { messages, status, send, reset, retry } = usePrototypeChat()
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = logRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, status])

  // On a project page the section carries that project's context, so the visitor can
  // ask about the skills behind the page they are already reading.
  const suggestions = contextTitle
    ? [
        ...CV_SUGGESTED_QUESTIONS.slice(0, 2),
        `Which skills did you use for ${contextTitle}?`,
      ]
    : CV_SUGGESTED_QUESTIONS

  const submit = () => {
    if (!input.trim() || status === "loading") return
    send(input)
    setInput("")
  }

  return (
    <section id="ask" aria-labelledby="ask-heading" className="max-w-4xl mx-auto px-4 py-14 md:py-20">
      <div className="rounded-2xl border border-purple/12 bg-white/85 backdrop-blur-sm shadow-sm overflow-hidden">
        <header className="px-5 md:px-8 pt-6 md:pt-8 pb-5 border-b border-purple/10">
          <p className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-purple mb-2.5">
            <Sparkles className="w-3.5 h-3.5" aria-hidden />
            Ask me anything
          </p>
          <h2
            id="ask-heading"
            className="text-2xl md:text-3xl font-bold text-black tracking-normal"
          >
            Questions about my CV
          </h2>
          <p className="mt-2.5 text-sm md:text-[15px] text-black/65 leading-relaxed max-w-2xl">
            Background, experience, education, and the skills I list. For a specific project I
            will point you to its own page rather than answer it here.
          </p>

          <div className="mt-4 space-y-4">
            <div className="flex flex-wrap gap-2">
              {suggestions.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => send(q)}
                  className="text-xs md:text-[13px] px-3 py-1.5 rounded-full bg-purple/8 text-purple border border-purple/15 hover:bg-purple/15 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>

            <div className="border-t border-purple/10 pt-3.5 space-y-2.5">
              <p className="text-xs text-black/45 leading-snug">
                Ask about a project and I will link you to its page instead of answering here.
              </p>
              <div className="flex flex-wrap gap-2">
                {PROJECT_SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => send(q)}
                    className="text-xs md:text-[13px] px-3 py-1.5 rounded-full border border-black/15 text-black/60 hover:border-purple/30 hover:text-purple transition-colors inline-flex items-center gap-1.5"
                  >
                    {q}
                    <ArrowUp className="w-3 h-3 rotate-45 opacity-50" aria-hidden />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        <div
          ref={logRef}
          role="log"
          aria-live="polite"
          className="px-5 md:px-8 py-6 space-y-5 min-h-[180px] max-h-[420px] overflow-y-auto"
        >
          {messages.length === 0 && (
            <p className="text-sm text-black/40">
              Nothing asked yet. Pick a question above, or type one below.
            </p>
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

        <div className="border-t border-purple/10 px-5 md:px-8 py-4 bg-purple/[0.03]">
          <Composer
            input={input}
            onInputChange={setInput}
            onSubmit={submit}
            disabled={!input.trim() || status === "loading"}
            inputId="chat-c-input"
            placeholder="Ask about my CV"
            showReset
            canReset={messages.length > 0}
            onReset={reset}
          />
          <div className="mt-3 rounded-full bg-neutral-900 w-fit px-3 py-1.5">
            <StateDemoControls compact />
          </div>
        </div>
      </div>
    </section>
  )
}
