"use client"

import { useRef, useEffect, useCallback } from "react"
import ScrollingText from "@/components/scrolling-text"
import AnimatedTitle from "@/components/animated-title"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Image from "next/image"
import Link from "next/link"
import useMobile from "@/hooks/use-mobile"
import TransitionLink from "@/components/transition-link"
import { ArrowUpRight } from "lucide-react"
import { projects } from "@/data/projects"

const featuredCopy = [
  {
    slug: "se-for-ml",
    status: "ML systems",
    summary: "An image classification system built around serving, human review, and drift-aware retraining.",
    imageBg: "bg-[#101116]",
  },
  {
    slug: "customer-support-agent",
    status: "Research & prototype",
    summary: "Exploring evidence-guided troubleshooting for Thai and English smart home support.",
    imageBg: "bg-purple/5",
  },
  {
    slug: "scb-tech-x-loan-origination",
    status: "Industry work",
    summary: "Go services and durable Temporal workflows for a multi-step loan process.",
    imageBg: "bg-[#4B258B]",
  },
] as const

const featuredProjects = featuredCopy.map((copy) => {
  const project = projects.find((item) => item.slug === copy.slug)
  if (!project) throw new Error(`Featured project not found: ${copy.slug}`)
  return { ...project, ...copy }
})

export default function Home() {
  const scrollTextRef = useRef<HTMLDivElement>(null)
  const summaryRef = useRef<HTMLParagraphElement>(null)
  const heroTimelineRef = useRef<gsap.core.Timeline | null>(null)
  const titleRevealedRef = useRef(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const introTextRef = useRef<HTMLParagraphElement>(null)
  const highlightsRef = useRef<HTMLUListElement>(null)
  const buttonsRef = useRef<HTMLDivElement>(null)
  const experienceRef = useRef<HTMLDivElement>(null)
  const aboutSectionRef = useRef<HTMLDivElement>(null)
  const contactSectionRef = useRef<HTMLDivElement>(null)
  const isMobile = useMobile()
  const onTitleReveal = useCallback(() => {
    titleRevealedRef.current = true
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) heroTimelineRef.current?.play()
  }, [])

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const timeline = gsap.timeline({ paused: true })
    heroTimelineRef.current = timeline
    const scrollTriggers: ScrollTrigger[] = []
    const animatedElements: Element[] = []

    if (summaryRef.current) {
      animatedElements.push(summaryRef.current)
      timeline.fromTo(
        summaryRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
      )
    }

    // Scrolling text animation
    if (scrollTextRef.current) {
      animatedElements.push(scrollTextRef.current)
      timeline.fromTo(scrollTextRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 })
    }

    // Profile picture animation
    if (profileRef.current) {
      animatedElements.push(profileRef.current)
      timeline.fromTo(
        profileRef.current,
        { opacity: 0, scale: 0.9, rotation: -5 },
        { opacity: 1, scale: 1, rotation: 0, duration: 0.8, delay: 0, ease: "elastic.out(1.5, 0.5)" },
      )
    }

    // Intro text animation
    if (introTextRef.current) {
      animatedElements.push(introTextRef.current)
      timeline.fromTo(
        introTextRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, delay: 0, ease: "power3.out" },
      )
    }

    if (highlightsRef.current) {
      animatedElements.push(highlightsRef.current)
      timeline.fromTo(
        highlightsRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" },
      )
    }

    // Buttons animation
    if (buttonsRef.current) {
      animatedElements.push(buttonsRef.current)
      timeline.fromTo(
        buttonsRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, delay: 0, ease: "power3.out" },
      )
    }

    // Experience section animation
    if (experienceRef.current) {
      const experienceTitle = experienceRef.current.querySelector("h2")
      const experienceCards = experienceRef.current.querySelectorAll(".experience-card")
      const experienceCTA = experienceRef.current.querySelector(".experience-cta")
      animatedElements.push(...Array.from([experienceTitle, ...experienceCards, experienceCTA]).filter((element): element is Element => element !== null))

      gsap.set([experienceTitle, experienceCards, experienceCTA], { opacity: 0, y: 30 })

      scrollTriggers.push(ScrollTrigger.create({
        trigger: experienceRef.current,
        start: "top 75%",
        once: true,
        onEnter: () => {
          const tl = gsap.timeline()

          tl.to(experienceTitle, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
          })
            .to(
              experienceCards,
              {
                opacity: 1,
                y: 0,
                duration: 0.6,
                stagger: 0.15,
                ease: "power3.out",
              },
              "-=0.3",
            )
            .to(
              experienceCTA,
              {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: "power3.out",
              },
              "-=0.2",
            )
        },
      }))
    }

    // About section animation
    if (aboutSectionRef.current) {
      const aboutElements = aboutSectionRef.current.querySelectorAll(".about-element")
      animatedElements.push(...Array.from(aboutElements))

      gsap.set(aboutElements, { opacity: 0, y: 40, scale: 0.95 })

      scrollTriggers.push(ScrollTrigger.create({
        trigger: aboutSectionRef.current,
        start: "top 70%",
        once: true,
        onEnter: () => {
          gsap.to(aboutElements, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.2,
            ease: "back.out(1.7)",
          })
        },
      }))
    }

    // Contact section animation
    if (contactSectionRef.current) {
      const contactElements = contactSectionRef.current.querySelectorAll(".contact-element")
      animatedElements.push(...Array.from(contactElements))

      gsap.set(contactElements, { opacity: 0, y: 30 })

      scrollTriggers.push(ScrollTrigger.create({
        trigger: contactSectionRef.current,
        start: "top 75%",
        once: true,
        onEnter: () => {
          gsap.to(contactElements, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.15,
            ease: "power3.out",
          })
        },
      }))
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(
        [summaryRef.current, scrollTextRef.current, profileRef.current, introTextRef.current, highlightsRef.current, buttonsRef.current],
        { opacity: 1, y: 0, scale: 1, rotation: 0 },
      )
    } else if (titleRevealedRef.current) {
      timeline.play()
    }

    return () => {
      heroTimelineRef.current = null
      timeline.kill()
      scrollTriggers.forEach((trigger) => trigger.kill())
      gsap.killTweensOf(animatedElements)
    }
  }, [])

  return (
    <main className={`min-h-screen ${isMobile ? "pb-nav" : ""}`}>
      <div className="container mx-auto px-4 pt-20 pb-16">
        <AnimatedTitle
          className="text-purple leading-none tracking-normal text-center whitespace-pre-line"
          accessibleLabel="Pasit Khumsena"
          onReveal={onTitleReveal}
          revealOverlapSeconds={0.5}
        >
          {"PASIT\nKHUMSENA"}
        </AnimatedTitle>
        <p ref={summaryRef} className="mx-auto mt-5 max-w-3xl text-center text-base leading-relaxed text-black/80 opacity-0 sm:text-lg motion-reduce:opacity-100">
          I&apos;m a Computer Engineering student at Chulalongkorn University, graduating in December 2026, focused on
          AI engineering and backend development.
        </p>
        <div ref={scrollTextRef} className="w-full overflow-hidden py-4 border-y border-purple/20 my-4">
          <ScrollingText />
        </div>
        <div className="mx-auto mt-8 grid max-w-[880px] grid-cols-1 items-center gap-6 lg:grid-cols-2 lg:gap-20">
          <div className="flex justify-center items-center">
            <div ref={profileRef} className="relative opacity-0">
              {/* Profile image container - make it responsive */}
              <div className="relative w-[220px] h-[220px] sm:w-[280px] sm:h-[280px] md:w-[320px] md:h-[320px] lg:w-[400px] lg:h-[400px] rounded-full overflow-hidden border-4 border-white shadow-lg">
                <Image src="/images/profile.png" alt="Profile pic" fill className="object-cover" priority />
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start lg:min-h-[400px] lg:justify-center">
            <p ref={introTextRef} className="text-lg text-black/80 max-w-xl opacity-0 mb-6">
              I build practical AI and automation tools alongside reliable backend systems.
            </p>

              <ul ref={highlightsRef} aria-label="Experience highlights" className="grid gap-5 border-t border-purple/20 pt-6 opacity-0 sm:grid-cols-2">
                <li className="border-l-2 border-purple/50 pl-3">
                  <div className="mb-3 flex h-14 items-center">
                    <Image src="/images/companies/true-corporation.jpg" alt="True Corporation logo" width={722} height={484} className="h-12 w-auto max-w-[130px] object-contain" />
                  </div>
                  <p className="font-semibold text-black">True Corporation</p>
                  <p className="text-sm text-black/70">AI Engineer Intern</p>
                  <p className="mt-1 text-sm text-black/70">Thai manual pipeline and RAG support prototype</p>
                </li>
                <li className="border-l-2 border-purple/50 pl-3">
                  <div className="mb-3 flex h-14 items-center">
                    <Image src="/images/companies/nitmx.png" alt="National ITMX logo" width={3360} height={1440} className="h-12 w-auto max-w-[130px] object-contain" />
                  </div>
                  <p className="font-semibold text-black">NITMX</p>
                  <p className="text-sm text-black/70">Software Engineer, Part-time</p>
                  <p className="mt-1 text-sm text-black/70">Go backend services and automated API tests</p>
                </li>
              </ul>
          </div>
        </div>
        <div ref={buttonsRef} className="mt-10 flex flex-wrap justify-center gap-4 opacity-0">
          <a
            href="/resume-general.pdf"
            download="resume-general.pdf"
            className="px-6 py-3 bg-purple text-white rounded-full hover:bg-dark-purple transition-colors transform hover:scale-105 duration-300"
          >
            Download Resume
          </a>
          <TransitionLink
            href="/contact"
            className="px-6 py-3 border border-purple text-purple rounded-full hover:bg-purple/10 transition-colors transform hover:scale-105 duration-300"
          >
            Get in Touch
          </TransitionLink>
        </div>

        {/* Featured Projects Showcase */}
        <section ref={experienceRef} aria-labelledby="featured-projects-heading" className="mt-12 mb-12">
          <h2 id="featured-projects-heading" className="mb-8 text-center text-3xl font-bold text-purple md:text-4xl">Featured Projects</h2>
          <div className="grid gap-5 md:grid-cols-2">
            <article className="experience-card group overflow-hidden rounded-2xl bg-[#241735] text-white md:col-span-2">
              <Link
                href={`/work/${featuredProjects[0].slug}`}
                aria-label={`View ${featuredProjects[0].title} case study`}
                className="grid h-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
              >
                <div className="order-2 flex flex-col justify-between gap-6 p-6 sm:p-9 lg:order-1 lg:p-12">
                  <div>
                    <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">{featuredProjects[0].status}</span>
                    <h3 className="mt-5 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{featuredProjects[0].title}</h3>
                    <p className="mt-4 max-w-[45ch] text-base leading-relaxed text-white/85 sm:text-lg">{featuredProjects[0].summary}</p>
                  </div>
                  <span className="inline-flex min-h-11 items-center gap-2 font-semibold transition-[gap] group-hover:gap-3">
                    View case study <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                  </span>
                </div>
                <div className={`relative order-1 min-h-48 overflow-hidden sm:min-h-72 lg:order-2 lg:min-h-[22rem] ${featuredProjects[0].imageBg}`}>
                  <Image
                    src={featuredProjects[0].image}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 100vw, 52vw"
                    className="object-contain transition-transform duration-500 group-hover:scale-[1.025] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                </div>
              </Link>
            </article>

            {featuredProjects.slice(1).map((project) => (
              <article key={project.slug} className="experience-card group overflow-hidden rounded-2xl border border-purple/15 bg-white">
                <Link
                  href={`/work/${project.slug}`}
                  aria-label={`View ${project.title} case study`}
                  className="flex h-full flex-col focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple"
                >
                  <div className={`relative aspect-[16/9] overflow-hidden ${project.imageBg}`}>
                    <Image
                      src={project.image}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      unoptimized={project.image.toLowerCase().endsWith(".gif")}
                      className="object-contain transition-transform duration-500 group-hover:scale-[1.025] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-6 sm:p-8">
                    <span className="w-fit rounded-full bg-purple/10 px-3 py-1 text-xs font-semibold text-dark-purple">{project.status}</span>
                    <h3 className="mt-4 text-2xl font-bold tracking-tight text-black">{project.title}</h3>
                    <p className="mt-3 max-w-[48ch] leading-relaxed text-black/75">{project.summary}</p>
                    <span className="mt-auto inline-flex min-h-11 items-center gap-2 pt-6 font-semibold text-dark-purple transition-[gap] group-hover:gap-3">
                      View case study <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>

          <div className="experience-cta mt-8 text-center">
            <TransitionLink
              href="/work"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-purple px-8 py-4 font-medium text-white transition-colors hover:bg-dark-purple focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple"
            >
              View All Projects <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
            </TransitionLink>
          </div>
        </section>

      </div>
    </main>
  )
}
