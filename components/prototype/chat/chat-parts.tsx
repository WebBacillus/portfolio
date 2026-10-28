// PROTOTYPE ONLY. The shared interaction primitives. All three variants render these,
// so the three differ in layout only and the interaction contract stays identical.
//
// The contract this file encodes:
//   - a project answer is a link to the project page, never prose in the transcript
//   - every answer carries exactly one source label, and the label links where the
//     visitor can check it
//   - loading, error, and temporarily unavailable are three distinct, visible states
//   - the transcript is a live region, so a screen reader announces new answers

"use client"

import Link from "next/link"
import { AlertCircle, ArrowUp, Loader2, RotateCcw } from "lucide-react"
import type { ChatMessage, SourceLabel } from "./mock-engine"

/**
 * Where a source label sends the visitor. A label the visitor cannot open is decoration,
 * so every label that has a page behind it is a link, and only "In progress" is not.
 */
const SOURCE_HREF: Record<SourceLabel, string | undefined> = {
  Resume: "/about",
  "About page": "/about",
  "Project page": undefined, // set per message, the redirect carries the path
  "In progress": undefined,
}

export function SourceTag({ message }: { message: ChatMessage }) {
  if (!message.source) return null

  const href = message.source === "Project page" ? message.redirect?.path : SOURCE_HREF[message.source]

  const className =
    "text-[11px] uppercase tracking-widest text-black/40 hover:text-purple transition-colors"

  if (!href) {
    return <p className={className}>Source: {message.source}</p>
  }

  return (
    <Link href={href} className={className}>
      Source: {message.source}
    </Link>
  )
}

/**
 * The project redirect. It is the whole answer to a project question: a card that goes to
 * the project page, carrying that page's own summary so the two agree.
 */
export function ProjectLink({
  redirect,
}: {
  redirect: NonNullable<ChatMessage["redirect"]>
}) {
  return (
    <Link
      href={redirect.path}
      className="group flex max-w-[60ch] items-center justify-between gap-4 rounded-xl border border-purple/20 bg-purple/5 px-4 py-3 hover:border-purple/40 hover:bg-purple/10 transition-colors"
    >
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-purple">{redirect.title}</span>
        <span className="mt-0.5 block text-xs text-black/60 leading-snug">{redirect.summary}</span>
      </span>
      <ArrowUp
        className="w-4 h-4 text-purple rotate-45 shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
        aria-hidden
      />
    </Link>
  )
}

/** One assistant turn. Prose, then the redirect if there is one, then the source label. */
export function AssistantTurn({ message }: { message: ChatMessage }) {
  return (
    <div className="space-y-2.5">
      <p className="text-[15px] text-black/85 leading-relaxed max-w-[62ch]">{message.text}</p>
      {message.redirect && <ProjectLink redirect={message.redirect} />}
      <SourceTag message={message} />
    </div>
  )
}

/** One visitor turn. */
export function UserTurn({ message }: { message: ChatMessage }) {
  return (
    <p className="ml-auto max-w-[80%] w-fit rounded-xl bg-purple px-3.5 py-2 text-sm text-white">
      {message.text}
    </p>
  )
}

/** The three failure and waiting states, kept distinct because they mean different things. */
export function StatusBlock({
  status,
  onRetry,
}: {
  status: "loading" | "error" | "unavailable"
  onRetry?: () => void
}) {
  if (status === "loading") {
    return (
      <div className="flex items-center gap-2 text-sm text-black/55">
        <Loader2 className="w-4 h-4 animate-spin text-purple" aria-hidden />
        Thinking
      </div>
    )
  }

  if (status === "error") {
    return (
      <div
        role="alert"
        className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
      >
        <p className="font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4" aria-hidden />
          The answer could not be produced
        </p>
        <p className="mt-1 text-red-700">
          The model did not respond, so no answer was substituted. Please try again.
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-800 hover:bg-red-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden />
            Try that again
          </button>
        )}
      </div>
    )
  }

  return (
    <div
      role="alert"
      className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
    >
      <p className="font-medium flex items-center gap-2">
        <AlertCircle className="w-4 h-4" aria-hidden />
        Temporarily unavailable
      </p>
      <p className="mt-1">
        The usage limit was reached, so the assistant is paused and no answer was produced.
        Please try again later, or use the contact form.
      </p>
    </div>
  )
}

/**
 * The composer. Enter sends, Shift+Enter makes a new line, and the hint under the field
 * says so, because a keyboard user should not have to guess.
 */
export function Composer({
  input,
  onInputChange,
  onSubmit,
  disabled,
  inputId,
  placeholder,
  showReset,
  canReset,
  onReset,
  inputRef,
}: {
  input: string
  onInputChange: (value: string) => void
  onSubmit: () => void
  disabled: boolean
  inputId: string
  placeholder: string
  showReset: boolean
  canReset: boolean
  onReset: () => void
  inputRef?: React.RefObject<HTMLTextAreaElement | null>
}) {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end gap-3">
        <label htmlFor={inputId} className="sr-only">
          Your question
        </label>
        <textarea
          id={inputId}
          ref={inputRef}
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              onSubmit()
            }
          }}
          rows={1}
          placeholder={placeholder}
          className="flex-1 resize-none rounded-xl border border-purple/20 bg-white px-4 py-2.5 text-sm focus:outline-2 focus:outline-purple"
        />
        <div className="flex items-center gap-2">
          {showReset && (
            <button
              type="button"
              onClick={onReset}
              disabled={!canReset}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm text-black/55 hover:text-purple disabled:opacity-30 disabled:hover:text-black/55 transition-colors"
            >
              <RotateCcw className="w-4 h-4" aria-hidden />
              Reset
            </button>
          )}
          <button
            type="button"
            onClick={onSubmit}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 rounded-xl bg-purple px-4 py-2.5 text-sm text-white hover:bg-dark-purple disabled:opacity-40 transition-colors"
          >
            Send
            <ArrowUp className="w-4 h-4" aria-hidden />
          </button>
        </div>
      </div>
      <p className="mt-2 text-[11px] text-black/40">Enter sends, Shift+Enter adds a line.</p>
    </div>
  )
}
