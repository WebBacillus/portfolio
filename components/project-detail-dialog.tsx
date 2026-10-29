"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { X } from "lucide-react"

type Detail = {
  title: string
  summary: string
  role: string
  html: string
  image: string
  tags: string[]
  liveUrl?: string
  repoUrl?: string
}

export default function ProjectDetailDialog({ slug, title, children }: { slug: string; title: string; children: React.ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [detail, setDetail] = useState<Detail | null>(null)
  const [error, setError] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = previous }
  }, [isOpen])

  async function open() {
    setError(false)
    dialogRef.current?.showModal()
    setIsOpen(true)
    try {
      const response = await fetch(`/api/projects/${encodeURIComponent(slug)}`)
      if (!response.ok) throw new Error("Failed to load project")
      setDetail(await response.json() as Detail)
    } catch {
      setError(true)
    }
  }

  return <>
    <button type="button" onClick={open} className="block h-full w-full text-left cursor-pointer" aria-label={`View details for ${title}`}>
      {children}
    </button>
    <dialog ref={dialogRef} onClose={() => setIsOpen(false)} onClick={(event) => { if (event.target === dialogRef.current) dialogRef.current.close() }} className="project-detail-dialog m-auto w-[min(92vw,52rem)] max-h-[90dvh] rounded-2xl border-0 bg-white p-0 text-black shadow-2xl backdrop:bg-black/65">
      <div className="sticky top-0 z-10 flex justify-end bg-white p-3">
        <button type="button" onClick={() => dialogRef.current?.close()} aria-label="Close project details" className="rounded-full p-2 hover:bg-black/10"><X className="size-5" /></button>
      </div>
      {detail ? <article className="max-h-[calc(90dvh-3.5rem)] overflow-y-auto px-5 pb-8 sm:px-9">
        <h2 className="mb-3 text-3xl font-bold leading-tight break-normal sm:text-4xl">{detail.title}</h2>
        <p className="mb-3 leading-relaxed text-black/70">{detail.summary}</p>
        <p className="mb-6 text-sm text-black/60">{detail.role}</p>
        <div className="relative mb-6 aspect-video overflow-hidden rounded-lg"><Image src={detail.image} alt={detail.title} fill className="object-cover" sizes="(max-width: 768px) 92vw, 832px" /></div>
        <div className="mb-6 flex flex-wrap gap-2">{detail.tags.map(tag => <span key={tag} className="rounded-full bg-purple/10 px-3 py-1 text-sm text-purple">{tag}</span>)}</div>
        <div className="project-detail-content space-y-5 text-black/80 [&_a]:text-purple [&_a]:underline [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_li]:ml-6 [&_li]:list-disc [&_p]:leading-relaxed [&_ul]:space-y-2" dangerouslySetInnerHTML={{ __html: detail.html }} />
        <div className="mt-8 flex gap-5 text-purple">{detail.liveUrl && <a href={detail.liveUrl} target="_blank" rel="noopener noreferrer">Live demo</a>}{detail.repoUrl && <a href={detail.repoUrl} target="_blank" rel="noopener noreferrer">Repository</a>}</div>
      </article> : <p className="px-6 pb-8" role="status">{error ? "Could not load this project. Please try again." : "Loading project details…"}</p>}
    </dialog>
  </>
}
