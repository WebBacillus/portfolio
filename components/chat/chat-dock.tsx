"use client"

import { useEffect, useRef, useState, type KeyboardEvent } from "react"
import Link from "next/link"
import { ArrowUpRight, Loader2, MessageCircle, RotateCcw, Send, X } from "lucide-react"
import { useChat, type ChatEntry, type SourceLabel } from "./use-chat"

const scope = "I answer questions about my CV: background, experience, skills, and education. For a project I will point you to its page."
const cvQuestions = [
  "What is your current role?",
  "What did you do at NITMX?",
  "Which skills do you list?",
  "Where did you study?",
]
const projectQuestions = [
  "Tell me about SE for ML",
  "What did you build for NECTEC?",
  "What is SCB Tech X Loan Origination?",
]

function SourceTag({ source, href }: { source: SourceLabel; href?: string }) {
  const target = href ?? (source === "Resume" || source === "About page" ? "/about" : undefined)
  const label = <span className="text-[11px] uppercase tracking-widest text-black/45">Source: {source}</span>
  return target ? <Link href={target} className="hover:underline">{label}</Link> : label
}

function Entry({ entry }: { entry: ChatEntry }) {
  if (entry.role === "user") {
    return <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-purple px-3.5 py-2.5 text-sm leading-relaxed text-white">{entry.text}</p>
  }
  if (entry.role === "redirect") {
    return <div className="space-y-2">
      <p className="text-sm text-black/75">That one has its own page:</p>
      <Link href={entry.href} className="group flex items-center justify-between gap-4 rounded-xl border border-purple/20 bg-purple/5 px-4 py-3 hover:border-purple/40 hover:bg-purple/10">
        <span className="min-w-0"><strong className="block text-sm text-purple">{entry.title}</strong><span className="mt-1 block text-xs leading-relaxed text-black/65">{entry.summary}</span></span>
        <ArrowUpRight className="size-4 shrink-0 text-purple group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
      </Link>
      <SourceTag source="Project page" href={entry.href} />
    </div>
  }
  return <div className="space-y-1.5"><p className="text-sm leading-relaxed text-black/85">{entry.text}</p>{entry.source && <SourceTag source={entry.source} />}</div>
}

export default function ChatDock() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const { messages, status, send, retry, reset } = useChat()
  const launcherRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const composerRef = useRef<HTMLTextAreaElement>(null)
  const logRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const touch = navigator.maxTouchPoints > 0 || window.matchMedia("(pointer: coarse)").matches
    if (touch) closeRef.current?.focus()
    else composerRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (open && logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [open, messages, status])

  useEffect(() => {
    if (!open) return
    const media = window.matchMedia("(max-width: 767px)")
    const previous = document.body.style.overflow
    const update = () => { document.body.style.overflow = media.matches ? "hidden" : previous }
    update()
    media.addEventListener("change", update)
    return () => { document.body.style.overflow = previous; media.removeEventListener("change", update) }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        setOpen(false)
        requestAnimationFrame(() => launcherRef.current?.focus())
      }
    }
    window.addEventListener("keydown", onEscape)
    return () => window.removeEventListener("keydown", onEscape)
  }, [open])

  function close() {
    setOpen(false)
    requestAnimationFrame(() => launcherRef.current?.focus())
  }

  function submit(value = input) {
    if (send(value)) setInput("")
  }

  function onPanelKeyDown(event: KeyboardEvent) {
    if (event.key !== "Tab" || !window.matchMedia("(max-width: 767px)").matches) return
    const focusable = [...(panelRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], textarea:not(:disabled)') ?? [])]
    if (!focusable.length) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
  }

  return <>
    {open && <button type="button" aria-label="Close chat" onClick={close} className="fixed inset-0 z-[60] bg-black/25 md:bg-transparent md:pointer-events-none" />}
    <div
      ref={panelRef}
      id="portfolio-chat-panel"
      role="dialog"
      aria-label="Ask me anything: CV questions"
      aria-hidden={!open}
      onKeyDown={onPanelKeyDown}
      className={`${open ? "chat-dock-enter flex" : "hidden"} fixed inset-0 z-[70] h-[100dvh] flex-col overflow-hidden border border-purple/15 bg-white shadow-2xl md:inset-auto md:bottom-24 md:right-6 md:h-[min(560px,calc(100dvh-8rem))] md:w-[400px] md:rounded-2xl`}
    >
      <header className="flex shrink-0 items-start gap-3 border-b border-purple/10 bg-purple/5 px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] md:rounded-t-2xl md:pt-3">
        <MessageCircle className="mt-0.5 size-5 shrink-0 text-purple" aria-hidden />
        <div className="min-w-0 flex-1"><h2 className="text-sm font-semibold text-black">Ask me anything</h2><p className="mt-0.5 text-xs leading-snug text-black/65">{scope}</p></div>
        <button ref={closeRef} type="button" onClick={close} aria-label="Close chat" className="rounded-md p-1.5 text-black/60 hover:bg-purple/10 hover:text-purple"><X className="size-4" aria-hidden /></button>
      </header>

      <div ref={logRef} role="log" aria-live="polite" aria-relevant="additions text" className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {messages.length === 0 && <div className="space-y-4">
          <div className="space-y-2.5"><p className="text-sm text-black/70">Try one of these.</p><div className="flex flex-wrap gap-2">{cvQuestions.map((question) => <button key={question} type="button" onClick={() => submit(question)} disabled={status === "loading" || status === "unavailable"} className="rounded-full border border-purple/25 px-3 py-1.5 text-left text-xs text-purple hover:bg-purple/10 disabled:opacity-40">{question}</button>)}</div></div>
          <div className="space-y-2.5 border-t border-purple/10 pt-3.5"><p className="text-xs leading-snug text-black/55">Ask about a project and I will link you to its page instead of answering here.</p><div className="flex flex-wrap gap-2">{projectQuestions.map((question) => <button key={question} type="button" onClick={() => submit(question)} disabled={status === "loading" || status === "unavailable"} className="inline-flex items-center gap-1 rounded-full border border-black/15 px-3 py-1.5 text-left text-xs text-black/65 hover:border-purple/30 hover:text-purple disabled:opacity-40">{question}<ArrowUpRight className="size-3" aria-hidden /></button>)}</div></div>
        </div>}
        {messages.map((entry) => <Entry key={entry.id} entry={entry} />)}
        {status === "loading" && <div role="status" className="flex items-center gap-2 text-sm text-black/60"><Loader2 className="size-4 animate-spin text-purple" aria-hidden />Thinking</div>}
        {status === "error" && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"><p className="font-semibold">The answer could not be produced.</p><p className="mt-1">No answer was substituted. Please try again.</p><button type="button" onClick={retry} className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-1.5 text-xs hover:bg-red-100"><RotateCcw className="size-3.5" aria-hidden />Try that again</button></div>}
        {status === "unavailable" && <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"><p className="font-semibold">Temporarily unavailable</p><p className="mt-1">No answer was produced. Please use the <Link href="/contact" className="underline">contact form</Link> or try again later.</p></div>}
      </div>

      <div className="shrink-0 border-t border-purple/10 bg-white px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 md:pb-3">
        <label htmlFor="portfolio-chat-input" className="sr-only">Your question</label>
        <textarea id="portfolio-chat-input" ref={composerRef} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); submit() } }} maxLength={1000} rows={2} placeholder="Ask about my CV" className="w-full resize-none rounded-xl border border-purple/25 px-3 py-2 text-base text-black outline-none focus:border-purple focus:ring-2 focus:ring-purple/20" />
        <div className="mt-1.5 flex items-center justify-between gap-2"><p className="text-[11px] text-black/45">Enter sends, Shift+Enter adds a line.</p><div className="flex items-center gap-1"><button type="button" onClick={() => { reset(); setInput("") }} disabled={messages.length === 0} className="rounded-lg px-2 py-1.5 text-xs text-black/60 hover:text-purple disabled:opacity-35">Reset</button><button type="button" onClick={() => submit()} disabled={!input.trim() || status === "loading" || status === "unavailable"} className="inline-flex items-center gap-1.5 rounded-lg bg-purple px-3 py-1.5 text-xs font-medium text-white hover:bg-dark-purple disabled:opacity-40">Send<Send className="size-3.5" aria-hidden /></button></div></div>
      </div>
    </div>

    <button ref={launcherRef} type="button" onClick={() => open ? close() : setOpen(true)} aria-expanded={open} aria-controls="portfolio-chat-panel" className={`${open ? "hidden md:flex" : "flex"} fixed right-6 z-[70] items-center gap-2 rounded-full bg-purple px-5 py-3 text-white shadow-lg hover:bg-dark-purple`} style={{ bottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}><MessageCircle className="size-5" aria-hidden /><span className="text-sm font-medium">{open ? "Close" : "Ask me anything"}</span></button>
  </>
}
