"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Loader2, X } from "lucide-react"

const MAX_TEXT = 20_000

type Assessment = {
  kind: "assessment"
  requirement: string
  status: "has_evidence" | "partial_evidence" | "no_evidence_found"
  reason: string
  evidence: Array<{ sourceId: string; label: string; href: string }>
}

const labels = {
  has_evidence: "Has evidence",
  partial_evidence: "Partial evidence",
  no_evidence_found: "No evidence found",
}

export default function JobMatchPanel({ onBack }: { onBack: () => void }) {
  const [jobText, setJobText] = useState("")
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const [unavailable, setUnavailable] = useState(false)
  const [noticeHidden, setNoticeHidden] = useState(false)
  const resultRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (assessment) resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [assessment])

  async function assess(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!jobText.trim() || busy || unavailable) return
    setBusy(true)
    setError("")
    setAssessment(null)
    try {
      const response = await fetch("/api/job-match", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jobText }),
      })
      const raw: unknown = await response.json()
      if (!raw || typeof raw !== "object") throw new Error("Invalid response")
      const record = raw as Record<string, unknown>
      if (!response.ok || record.kind !== "assessment") {
        setUnavailable(record.kind === "unavailable" || response.status === 429 || response.status === 503)
        setError(typeof record.message === "string" ? record.message : "The assessment could not be produced. Please try again.")
        return
      }
      if (typeof record.requirement !== "string" || typeof record.reason !== "string" || !["has_evidence", "partial_evidence", "no_evidence_found"].includes(String(record.status)) || !Array.isArray(record.evidence)) {
        setError("The assessment could not be verified. Please try again.")
        return
      }
      setAssessment(record as unknown as Assessment)
    } catch {
      setError("The assessment could not be produced. Please try again.")
    } finally {
      setBusy(false)
    }
  }

  return <section aria-label="Match a job" className="space-y-4">
    <button type="button" onClick={onBack} className="text-xs font-medium text-purple underline underline-offset-2">Back to CV chat</button>
    {!noticeHidden && <div className="flex items-start gap-2 rounded-xl border border-black/10 bg-black/[0.025] px-3 py-2.5">
      <p className="min-w-0 flex-1 text-[11px] leading-relaxed text-black/65">Privacy: your job description is sent through this site to OpenAI to produce a result. This site does not save the description or log its text; hosting may retain request metadata. Avoid sensitive personal information.</p>
      <button type="button" onClick={() => setNoticeHidden(true)} aria-label="Hide privacy notice" className="shrink-0 rounded-md p-1 text-black/50 hover:bg-purple/10 hover:text-purple"><X className="size-3.5" aria-hidden /></button>
    </div>}
    {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"><p>{error}</p>{unavailable && <p className="mt-1">Please use the <Link href="/contact" className="underline">contact form</Link>.</p>}{!unavailable && !assessment && <button type="button" onClick={(event) => { const form = event.currentTarget.closest("section")?.querySelector("form"); form?.requestSubmit() }} disabled={busy || !jobText.trim()} className="mt-2 min-h-10 rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium hover:bg-red-100 disabled:opacity-40">Try again</button>}</div>}
    {assessment && <article ref={resultRef} className="space-y-2 rounded-xl border border-purple/20 bg-purple/[0.035] p-3" aria-label="Job requirement assessment">
      <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-xs font-semibold uppercase tracking-wide text-black/55">Requirement</h3><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${assessment.status === "has_evidence" ? "bg-emerald-100 text-emerald-900" : assessment.status === "partial_evidence" ? "bg-amber-100 text-amber-900" : "bg-black/5 text-black/70"}`}>{labels[assessment.status]}</span></div>
      <p className="text-sm font-medium leading-relaxed text-black">{assessment.requirement}</p>
      <p className="text-sm leading-relaxed text-black/75">{assessment.reason}</p>
      {assessment.status === "no_evidence_found" && <p className="text-xs text-black/55">This means the approved public sources do not document it, not that the candidate lacks the skill.</p>}
      {assessment.evidence.length > 0 && <ul className="flex flex-wrap gap-2 border-t border-purple/10 pt-2">{assessment.evidence.map((item) => <li key={item.sourceId}><Link href={item.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center rounded-lg border border-purple/20 px-3 py-1 text-xs font-medium text-purple underline underline-offset-2">{item.label}</Link></li>)}</ul>}
    </article>}
    <form onSubmit={assess} className="sticky bottom-0 -mx-4 space-y-2 border-t border-purple/10 bg-white px-4 pb-1 pt-3">
      <label htmlFor="job-match-text" className="block text-sm font-medium text-black/80">Paste one job description</label>
      <textarea id="job-match-text" value={jobText} onChange={(event) => setJobText(event.target.value)} maxLength={MAX_TEXT} rows={3} placeholder="Paste the role description here" className="w-full resize-y rounded-xl border border-purple/25 px-3 py-2 text-base leading-relaxed text-black outline-none focus:border-purple focus:ring-2 focus:ring-purple/20" />
      <div className="flex items-center justify-between gap-2 text-[11px] text-black/45"><span>{jobText.length.toLocaleString()} / 20,000 characters</span><span>Text only in this preview</span></div>
      <button type="submit" disabled={!jobText.trim() || jobText.length > MAX_TEXT || busy || unavailable} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-purple px-4 py-2 text-sm font-medium text-white hover:bg-dark-purple disabled:opacity-45">
        {busy ? <><Loader2 className="size-4 animate-spin" aria-hidden />Assessing</> : "Assess one requirement"}
      </button>
    </form>
  </section>
}
