"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ArrowUpRight } from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import AnimatedTitle from "@/components/animated-title"
import { projectTopics, projects, type ProjectTopicId } from "@/data/projects"

const selectedSlugs = ["se-for-ml", "customer-support-agent", "scb-tech-x-loan-origination"] as const
// Increase this value to start the featured cards sooner during the WORK title animation.
const CARD_REVEAL_OVERLAP_SECONDS = 0.5

const selectedCopy: Record<(typeof selectedSlugs)[number], { summary: string; role: string; status: string }> = {
  "se-for-ml": {
    summary: "An image classification system built around serving, human review, and drift-aware retraining.",
    role: "I designed the C4 diagrams and implemented model serving; the monitoring workflow was designed with my team.",
    status: "AI & ML",
  },
  "customer-support-agent": {
    summary: "Exploring evidence-guided troubleshooting for Thai and English smart home support.",
    role: "I defined the support scope and explored a RAG-based prototype. The application is still in research.",
    status: "AI & ML",
  },
  "scb-tech-x-loan-origination": {
    summary: "Go services and durable Temporal workflows for a multi-step loan process.",
    role: "I built the microservices and workflows. The work runs in internal systems, so there is no public demo.",
    status: "Backend & APIs",
  },
}

const selectedProjects = selectedSlugs.map((slug) => {
  const project = projects.find((item) => item.slug === slug)
  if (!project) throw new Error(`Selected project not found: ${slug}`)
  return { ...project, ...selectedCopy[slug] }
})

const moreProjects = projects.filter((project) => !selectedSlugs.some((slug) => slug === project.slug))
const availableTopics = projectTopics
  .map((topic) => ({ ...topic, count: moreProjects.filter((project) => project.topics.includes(topic.id)).length }))
  .filter((topic) => topic.count > 0)

export default function WorkPage() {
  const [activeFilter, setActiveFilter] = useState<ProjectTopicId | "all">("all")
  const visibleProjects = activeFilter === "all" ? moreProjects : moreProjects.filter((project) => project.topics.includes(activeFilter))
  const [lead, ...supporting] = selectedProjects
  const leadRef = useRef<HTMLElement>(null)
  const supportingRef = useRef<HTMLDivElement>(null)
  const moreSectionRef = useRef<HTMLElement>(null)
  const moreHeadingRef = useRef<HTMLDivElement>(null)
  const filtersRef = useRef<HTMLDivElement>(null)
  const moreListRef = useRef<HTMLDivElement>(null)
  const entranceRef = useRef<gsap.core.Timeline | null>(null)

  const revealSelectedWork = useCallback(() => entranceRef.current?.play(), [])

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    gsap.registerPlugin(ScrollTrigger)

    const leadCard = leadRef.current
    const supportingCards = supportingRef.current?.children
    const archiveElements = [moreHeadingRef.current, filtersRef.current, moreListRef.current]
    const archiveSection = moreSectionRef.current
    if (!leadCard || !supportingCards || !archiveSection || archiveElements.some((element) => !element)) return

    gsap.set(leadCard, { autoAlpha: 0, y: 16, filter: "brightness(0.85)" })
    gsap.set(supportingCards, { autoAlpha: 0, y: 20 })
    gsap.set(archiveElements, { autoAlpha: 0, y: 16 })

    let archiveTrigger: ScrollTrigger | undefined
    let archiveTween: gsap.core.Tween | undefined
    const entrance = gsap.timeline({ paused: true })
      .to(leadCard, { autoAlpha: 1, y: 0, filter: "brightness(1)", duration: 0.7, ease: "expo.out" })
      .to(supportingCards, { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.14, ease: "expo.out" }, "-=0.15")

    entrance.eventCallback("onComplete", () => {
      archiveTrigger = ScrollTrigger.create({
        trigger: archiveSection,
        start: "top 85%",
        once: true,
        onEnter: () => {
          archiveTween = gsap.to(archiveElements, {
            autoAlpha: 1,
            y: 0,
            duration: 0.45,
            stagger: 0.1,
            ease: "expo.out",
          })
        },
      })
    })
    entranceRef.current = entrance

    const handleEarlyScroll = () => {
      if (window.scrollY > 120 && entrance.progress() < 1) entrance.progress(1)
    }
    window.addEventListener("scroll", handleEarlyScroll, { passive: true })
    handleEarlyScroll()

    return () => {
      window.removeEventListener("scroll", handleEarlyScroll)
      entrance.kill()
      archiveTrigger?.kill()
      archiveTween?.kill()
      gsap.set([leadCard, ...Array.from(supportingCards), ...archiveElements], { clearProps: "opacity,visibility,transform,filter" })
      entranceRef.current = null
    }
  }, [])

  return (
    <main className="min-h-screen pb-24">
      <div className="container mx-auto px-4 pt-20 md:pt-16">
        <AnimatedTitle className="text-purple text-center leading-none tracking-normal mb-8" onReveal={revealSelectedWork} revealOverlapSeconds={CARD_REVEAL_OVERLAP_SECONDS}>WORK</AnimatedTitle>

        <section aria-label="Featured projects">
          <article ref={leadRef} className="group overflow-hidden rounded-2xl bg-[#241735] text-white motion-safe:invisible motion-safe:opacity-0">
            <div className="grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <div className="order-2 flex flex-col justify-between gap-6 p-6 sm:p-9 lg:order-1 lg:gap-9 lg:p-12">
                <div>
                  <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">{lead.status}</span>
                  <h3 className="mt-6 max-w-[12ch] text-4xl font-bold leading-tight tracking-tight sm:text-5xl">{lead.title}</h3>
                  <p className="mt-4 max-w-[45ch] text-lg leading-relaxed text-white/85">{lead.summary}</p>
                  <p className="mt-5 max-w-[52ch] text-sm leading-relaxed text-white/70">{lead.role}</p>
                </div>
                <Link href={`/work/${lead.slug}`} className="inline-flex min-h-11 w-fit items-center gap-2 border-b border-white pb-1 font-semibold transition-[gap] hover:gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
                  View case study <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </div>
              <Link href={`/work/${lead.slug}`} aria-label={`View ${lead.title} case study`} className="relative order-1 block min-h-48 overflow-hidden bg-[#101116] sm:min-h-80 lg:order-2 lg:min-h-[29rem]">
                <Image src={lead.image} alt="SE for ML review queue and drift monitoring interface" fill priority sizes="(max-width: 1024px) 100vw, 52vw" className="object-contain transition-transform duration-500 group-hover:scale-[1.025] motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
              </Link>
            </div>
          </article>

          <div ref={supportingRef} className="mt-5 grid gap-5 md:grid-cols-2">
            {supporting.map((project) => (
              <article key={project.slug} className="group flex flex-col overflow-hidden rounded-2xl border border-purple/15 bg-white motion-safe:invisible motion-safe:opacity-0">
                <Link href={`/work/${project.slug}`} aria-label={`View ${project.title} case study`} className={`relative block aspect-[16/9] overflow-hidden ${project.slug === "scb-tech-x-loan-origination" ? "bg-[#4B258B]" : "bg-purple/5"}`}>
                  <Image src={project.image} alt={project.title} fill sizes="(max-width: 768px) 100vw, 50vw" unoptimized={project.image.toLowerCase().endsWith(".gif")} className="object-contain transition-transform duration-500 group-hover:scale-[1.025] motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
                </Link>
                <div className="flex flex-1 flex-col p-6 sm:p-8">
                  <span className="w-fit rounded-full bg-purple/10 px-3 py-1 text-xs font-semibold text-dark-purple">{project.status}</span>
                  <h3 className="mt-4 text-2xl font-bold tracking-tight text-black">{project.title}</h3>
                  <p className="mt-3 leading-relaxed text-black/75">{project.summary}</p>
                  <p className="mt-4 text-sm leading-relaxed text-black/65">{project.role}</p>
                  <Link href={`/work/${project.slug}`} className="mt-auto inline-flex min-h-11 w-fit items-center gap-2 pt-6 font-semibold text-dark-purple transition-[gap] hover:gap-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple">
                    View case study <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section ref={moreSectionRef} aria-labelledby="more-work-heading" className="mt-20 md:mt-28">
          <div ref={moreHeadingRef} className="mb-7 flex flex-wrap items-end justify-between gap-3 motion-safe:invisible motion-safe:opacity-0">
            <h2 id="more-work-heading" className="text-2xl font-bold tracking-tight text-black md:text-3xl">More projects</h2>
            <p className="text-sm text-black/60">{visibleProjects.length} {visibleProjects.length === 1 ? "project" : "projects"}</p>
          </div>
          <div ref={filtersRef} role="group" aria-label="Filter more projects by topic" className="mb-8 flex flex-wrap gap-2 motion-safe:invisible motion-safe:opacity-0">
            <button type="button" aria-pressed={activeFilter === "all"} onClick={() => setActiveFilter("all")} className={`min-h-11 shrink-0 rounded-full px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple ${activeFilter === "all" ? "bg-purple text-white" : "bg-purple/10 text-dark-purple hover:bg-purple/20"}`}>
              All projects ({moreProjects.length})
            </button>
            {availableTopics.map((topic) => (
              <button key={topic.id} type="button" aria-pressed={activeFilter === topic.id} onClick={() => setActiveFilter(topic.id)} className={`min-h-11 shrink-0 rounded-full px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple ${activeFilter === topic.id ? "bg-purple text-white" : "bg-purple/10 text-dark-purple hover:bg-purple/20"}`}>
                {topic.label} ({topic.count})
              </button>
            ))}
          </div>
          <div ref={moreListRef} className="motion-safe:invisible motion-safe:opacity-0">
            {visibleProjects.length > 0 ? (
              <div className="grid gap-x-8 md:grid-cols-2">
                {visibleProjects.map((project) => (
                  <article key={project.slug} className="border-t border-purple/20 py-6">
                    <Link href={`/work/${project.slug}`} className="group grid min-h-36 grid-cols-[6rem_minmax(0,1fr)] gap-4 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-5">
                      <div className="relative aspect-square overflow-hidden rounded-lg bg-purple/5" style={project.imageBg ? { background: project.imageBg } : undefined}>
                        <Image src={project.image} alt="" fill sizes="(max-width: 640px) 96px, 128px" unoptimized={project.image.toLowerCase().endsWith(".gif")} className={project.imageFit === "contain" ? "object-contain" : "object-cover"} />
                      </div>
                      <div className="flex min-w-0 flex-col justify-center">
                        <span className="mb-1 text-xs font-semibold uppercase tracking-wide text-dark-purple">{project.topics.map((topicId) => projectTopics.find((topic) => topic.id === topicId)?.label).join(" · ")}</span>
                        <h3 className="flex items-start justify-between gap-2 text-lg font-bold leading-snug text-black sm:text-xl">
                          {project.title}<ArrowRight aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-purple transition-transform group-hover:translate-x-1" />
                        </h3>
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-black/70">{project.description}</p>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            ) : (
              <div className="border-t border-purple/20 py-12 text-center">
                <p className="text-black/70">No projects match this topic.</p>
                <button type="button" onClick={() => setActiveFilter("all")} className="mt-4 min-h-11 rounded-full bg-purple px-5 font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple">Show all projects</button>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
