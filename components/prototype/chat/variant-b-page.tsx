// PROTOTYPE VARIANT B: dedicated page.
// The chat gets a whole route. It reads like a document rather than a widget, and the
// suggested questions sit in a left column on wide screens so the visitor can see the
// whole scope before typing anything.
//
// Interaction contract being judged here:
//   - the narrow scope is stated in the page subtitle and again in the suggestion column
//   - a project question lands on a project page link, rendered inline in the transcript
//   - every answer carries a source label, and the label is part of the answer block
//   - reset, loading, error, and temporarily unavailable are all visible
//   - keyboard: Enter sends, Shift+Enter makes a new line, the transcript is a live region

"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowRight, RotateCcw } from "lucide-react"
import { usePrototypeChat } from "./use-prototype-chat"
import { CV_SUGGESTED_QUESTIONS, PROJECT_SUGGESTED_QUESTIONS } from "./mock-engine"
import { AssistantTurn, Composer, StatusBlock, UserTurn } from "./chat-parts"
import StateDemoControls from "./state-demo-controls"
import { shouldAutofocusComposer } from "./focus-policy"

export default function VariantB() {
  const [input, setInput] = useState("")
  const { messages, status, send, reset, retry } = usePrototypeChat()
  const logRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = logRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, status])

  useEffect(() => {
    // Same policy as the dock: no automatic focus on a touch device, because the
    // software keyboard covers the suggested questions.
    if (shouldAutofocusComposer()) {
      inputRef.current?.focus()
    }
  }, [])

  const submit = () => {
    if (!input.trim() || status === "loading") return
    send(input)
    setInput("")
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto max-w-5xl px-4 pt-16 pb-24">
        <header className="border-b border-purple/15 pb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-purple mb-3">Ask me anything</p>
          <h1 className="text-3xl md:text-4xl font-bold text-black tracking-normal">
            Questions about my CV
          </h1>
          <p className="mt-3 max-w-2xl text-black/70 leading-relaxed">
            I answer questions about my background, my experience, my education, and the skills I
            list. For anything about a specific project, I will point you to that project&apos;s
            page instead of paraphrasing it here.
          </p>
        </header>

        <div className="grid md:grid-cols-[260px_1fr] gap-8 pt-8">
          <aside className="md:sticky md:top-24 md:self-start space-y-6">
            <div>
              <h2 className="text-xs uppercase tracking-wider text-black/50 mb-3">Try asking</h2>
              <ul className="space-y-1.5">
                {CV_SUGGESTED_QUESTIONS.map((q) => (
                  <li key={q}>
                    <button
                      type="button"
                      onClick={() => send(q)}
                      className="text-left text-sm text-black/70 hover:text-purple transition-colors flex items-start gap-1.5 group"
                    >
                      <ArrowRight
                        className="w-3.5 h-3.5 mt-0.5 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity"
                        aria-hidden
                      />
                      <span>{q}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-purple/10 pt-5">
              <h2 className="text-xs uppercase tracking-wider text-black/50 mb-3">Project pages</h2>
              <p className="text-xs text-black/50 mb-3 leading-relaxed">
                These are answered with a link to the project page.
              </p>
              <ul className="space-y-1.5">
                {PROJECT_SUGGESTED_QUESTIONS.map((q) => (
                  <li key={q}>
                    <button
                      type="button"
                      onClick={() => send(q)}
                      className="text-left text-sm text-purple/80 hover:text-purple transition-colors flex items-start gap-1.5 group"
                    >
                      <ArrowRight
                        className="w-3.5 h-3.5 mt-0.5 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity"
                        aria-hidden
                      />
                      <span>{q}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <section className="min-w-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-black">Conversation</h2>
              <button
                type="button"
                onClick={reset}
                disabled={messages.length === 0}
                className="inline-flex items-center gap-1.5 text-xs text-black/50 hover:text-purple disabled:opacity-30 disabled:hover:text-black/50 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden />
                Reset
              </button>
            </div>

            <div
              ref={logRef}
              role="log"
              aria-live="polite"
              className="border border-purple/10 rounded-xl bg-white/60 min-h-[320px] max-h-[60vh] overflow-y-auto p-5 space-y-6"
            >
              {messages.length === 0 && (
                <p className="text-sm text-black/45">
                  No questions yet. Pick one from the left, or type below.
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

            <div className="mt-4 border border-purple/15 rounded-xl focus-within:border-purple/40 transition-colors">
              <Composer
                input={input}
                onInputChange={setInput}
                onSubmit={submit}
                disabled={!input.trim() || status === "loading"}
                inputId="chat-b-input"
                placeholder="Ask about my background, experience, skills, or education"
                showReset={false}
                canReset={messages.length > 0}
                onReset={reset}
                inputRef={inputRef}
              />
              <div className="px-3 pb-3 -mt-2">
                <div className="rounded-full bg-neutral-900 w-fit px-3 py-1.5">
                  <StateDemoControls compact />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
