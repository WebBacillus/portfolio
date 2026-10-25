"use client"

import { useRef, useEffect } from "react"
import ScrollingText from "@/components/scrolling-text"
import AnimatedTitle from "@/components/animated-title"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Image from "next/image"
import useMobile from "@/hooks/use-mobile"
import TransitionLink from "@/components/transition-link"
import QuickStats from "@/components/quick-stats"
import ProjectCard from "@/components/project-card"
import { ExternalLink, Github } from "lucide-react"
import { projects } from "@/data/projects"

export default function Home() {
  const scrollTextRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const introTextRef = useRef<HTMLParagraphElement>(null)
  const buttonsRef = useRef<HTMLDivElement>(null)
  const experienceRef = useRef<HTMLDivElement>(null)
  const aboutSectionRef = useRef<HTMLDivElement>(null)
  const contactSectionRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const isMobile = useMobile()

  // Stats data
  const statsData = [
    {
      number: "6+",
      label: "Projects",
      description: "Full-stack & backend solutions",
    },
    {
      number: "5+",
      label: "Months",
      description: " Internships at leading tech companies",
    },
    {
      number: "10+",
      label: "Technologies",
      description: "Backend & AI expertise",
    },
  ]

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const timeline = gsap.timeline()
    const scrollTriggers: ScrollTrigger[] = []
    const animatedElements: Element[] = []

    // Scrolling text animation
    if (scrollTextRef.current) {
      animatedElements.push(scrollTextRef.current)
      timeline.fromTo(scrollTextRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5, delay: 1.25 })
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

    // Buttons animation
    if (buttonsRef.current) {
      animatedElements.push(buttonsRef.current)
      timeline.fromTo(
        buttonsRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, delay: 0, ease: "power3.out" },
      )
    }

    // Stats section animation
    if (statsRef.current) {
      animatedElements.push(statsRef.current)
      gsap.set(statsRef.current, { opacity: 0, y: 50 })

      scrollTriggers.push(ScrollTrigger.create({
        trigger: statsRef.current,
        start: "top 80%",
        once: true,
        onEnter: () => {
          gsap.to(statsRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
          })
        },
      }))
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

    return () => {
      timeline.kill()
      scrollTriggers.forEach((trigger) => trigger.kill())
      gsap.killTweensOf(animatedElements)
    }
  }, [])

  return (
    <main className={`min-h-screen ${isMobile ? "pb-nav" : ""}`}>
      <div className="container mx-auto px-4 pt-16 pb-16">
        <AnimatedTitle className="text-purple leading-none tracking-normal text-center">WEB</AnimatedTitle>
        <AnimatedTitle className="text-purple leading-none tracking-normal text-center">BACILLUS</AnimatedTitle>
        <div ref={scrollTextRef} className="w-full overflow-hidden py-4 border-y border-purple/20 my-4">
          <ScrollingText />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="flex justify-center items-center mt-8">
            <div ref={profileRef} className="relative opacity-0">
              {/* Profile image container - make it responsive */}
              <div className="relative w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px] rounded-full overflow-hidden border-4 border-white shadow-lg">
                <Image src="/images/profile.png" alt="Profile pic" fill className="object-cover" priority />
              </div>
            </div>
          </div>
          <div className="justify-items-end">
            <div className="flex flex-col items-start">
              <p ref={introTextRef} className="text-lg text-black/80 mt-6 max-w-xl opacity-0 mb-6">
                Computer Engineering student at Chulalongkorn University focused on AI engineering and backend development. I build practical products with AI, automation, and reliable software systems.
              </p>

              <div ref={buttonsRef} className="flex flex-wrap gap-4 mt-2 opacity-0">
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
            </div>
          </div>
        </div>

        {/* Quick Stats Section */}
        <div ref={statsRef} className="mt-16 mb-12">
          <QuickStats stats={statsData} />
        </div>

        {/* Featured Projects Showcase */}
        <div ref={experienceRef} className="mt-16 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-purple">Featured Projects</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {projects.filter((project) => (project.category === "ai" || project.tags.includes("AI")) && project.title !== "Takluz TTS").map((project) => (
              <div key={project.id} className={`experience-card ${project.featured ? "lg:col-span-2" : ""}`}>
                <ProjectCard
                  title={project.title}
                  description={project.description}
                  image={project.image}
                  tags={project.tags}
                  liveUrl={project.liveUrl}
                  repoUrl={project.repoUrl}
                  featured={project.featured}
                />
              </div>
            ))}
            {/* Takluz TTS is also an AI project; keep its existing featured layout here. */}
            <div className="experience-card lg:col-span-2">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-purple/10 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                  <div className="relative h-[250px] md:h-[300px] overflow-hidden">
                    <Image
                      src="/images/projects/takluz-tts.gif"
                      alt="Takluz TTS - AI-powered text-to-speech for Twitch streams"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <div className="p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold mb-3 text-black">Takluz TTS</h3>
                      <p className="text-black/70 mb-4 text-sm md:text-base leading-relaxed">
                        AI-powered text-to-speech system for Twitch streams using OpenAI&apos;s TTS model with channel points
                        integration. Offers diverse voices for enhanced viewer engagement.
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {["Go", "AI", "API", "Text-to-speech"].map((tag, index) => (
                          <span
                            key={index}
                            className="text-xs px-2 py-1 bg-purple/10 text-purple rounded-full font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <a
                        href="https://www.twitch.tv/takluz/clip/CorrectEvilButterPogChamp-PmfPRK0Lz6-wpMai"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-purple hover:text-dark-purple transition-colors text-sm"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Live Demo
                      </a>
                      <a
                        href="https://github.com/WebBacillus/Takluz_TTS"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-purple hover:text-dark-purple transition-colors text-sm"
                      >
                        <Github className="w-4 h-4 mr-1" />
                        Repository
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Project 2 - Employee Management */}
            <div className="experience-card">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-purple/10 overflow-hidden h-full">
                <div className="relative h-[200px] overflow-hidden">
                  <Image
                    src="/images/projects/employee-management.jpg"
                    alt="Employee Management System - Microservices architecture"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div className="p-6 flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="text-lg md:text-xl font-bold mb-2 text-black">Employee Management System</h3>
                    <p className="text-black/70 mb-3 text-sm leading-relaxed">
                      Comprehensive web application with microservices architecture for managing employees, attendance
                      tracking, and leave requests.
                    </p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {["Go", "Microservices", "PostgreSQL"].map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs px-2 py-1 bg-purple/10 text-purple rounded-full font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <a
                      href="https://github.com/night-sornram/employee-management"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-purple hover:text-dark-purple transition-colors text-sm"
                    >
                      <Github className="w-4 h-4 mr-1" />
                      Repository
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Project 3 - Takluz Leaderboards */}
            <div className="experience-card">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-purple/10 overflow-hidden h-full">
                <div className="relative h-[200px] overflow-hidden">
                  <Image
                    src="/images/projects/takluz-leaderboards.gif"
                    alt="Takluz Leaderboards - Real-time Twitch chat analytics"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div className="p-6 flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="text-lg md:text-xl font-bold mb-2 text-black">Takluz Leaderboards</h3>
                    <p className="text-black/70 mb-3 text-sm leading-relaxed">
                      Real-time analytics platform for Twitch chat data with Go IRC integration, deployed on AWS for
                      scalability.
                    </p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {["Next.js", "Go", "Supabase", "AWS-ECR", "AWS-ECS"].map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs px-2 py-1 bg-purple/10 text-purple rounded-full font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <a
                      href="https://v0-leaderboard-pi.vercel.app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-purple hover:text-dark-purple transition-colors text-sm"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Live Demo
                    </a>
                    <a
                      href="https://github.com/WebBacillus/Takluz_Leaderboard"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-purple hover:text-dark-purple transition-colors text-sm"
                    >
                      <Github className="w-4 h-4 mr-1" />
                      Repository
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
          </div>

          {/* Call to Action */}
          <div className="experience-cta text-center mt-8">
            <TransitionLink
              href="/work"
              className="inline-flex items-center px-8 py-4 bg-purple text-white rounded-full hover:bg-dark-purple transition-colors transform hover:scale-105 duration-300 font-medium"
            >
              View All Projects
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </TransitionLink>
          </div>
        </div>

      </div>
    </main>
  )
}
