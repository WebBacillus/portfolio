"use client"

import Image from "next/image"
import AnimatedTitle from "@/components/animated-title"
import TimelineItem, { type TimelineRole } from "@/components/timeline-item"
import AnimatedSection from "@/components/animated-section"
import { useRef, useEffect } from "react"
import gsap from "gsap"
import MagneticLink from "@/components/magnetic-link"
import AnimatedTimelineLine from "@/components/animated-timeline-line"
import { companyLogos, type CompanyLogo } from "@/data/company-logos"

type TimelineEntry = {
  year: string
  title: string
  description?: string
  organization?: string
  roles?: TimelineRole[]
  logo?: CompanyLogo
}

// Timeline data
const timelineData: TimelineEntry[] = [
  {
    year: "Aug 2026 – Present",
    title: "AI Engineer (Intern)",
    organization: "True Corporation",
    description:
      "Own product scope, timelines, and customer workflows for an AI support agent. Built a document pipeline for Thai device manuals with Docling and font-aware Unicode recovery, and developed a RAG prototype for TrueX smart home support with evidence validation and human escalation.",
    logo: companyLogos.true,
  },
  {
    year: "Apr 2025–Jul 2026",
    title: "Software Engineer (Part-time)",
    organization: "National ITMX",
    description:
      "Upgraded legacy systems from Java 11 to Java 25 and addressed security issues; automated API tests for a national anti-mule account project with Postman and Bruno. Built a secure interbank financial-adjustment web app in Go with Clean and Hexagonal Architecture, and contributed to Hyperledger Besu with Ansible disaster-recovery automation.",
    roles: [
      {
        year: "May–Jul 2024",
        title: "Backend Developer Intern",
        description:
          "Built backend systems for high-traffic, banking-style workloads using Go, Hexagonal Architecture, microservices, Kafka, and gRPC. Applied load balancing and k6 testing, and used test-driven development.",
      },
    ],
    logo: companyLogos.nitmx,
  },
  {
    year: "Oct 2024 – May 2025",
    title: "Accountant",
    organization: "CEDT Innovation Summit 2025",
    description:
      "Managed event budgets and expenses, coordinated with departments, and verified receipts.",
    logo: companyLogos.cedtInnovationSummit,
  },
  {
    year: "Jul 2023 – Dec 2026",
    title: "Bachelor of Engineering in Computer Engineering",
    organization: "Chulalongkorn University",
    description:
      "Expected Dec 2026 · GPAX 3.71/4.0. Coursework: Software Engineering for ML Systems; Digital and AI Transformation; Introduction to Data Science and Data Engineering; System Design for Software Development; Software Engineering.",
    logo: companyLogos.chulalongkorn,
  },
  {
    year: "Mar 2023 – Jun 2023",
    title: "AI Builders Program Participant",
    organization: "AI Builders",
    description:
      "Selected for the AI Builders program. Developed an AI and NLP project to detect swear words in Thai videos and presented it at the Bangkok Art and Culture Centre.",
    logo: companyLogos.aiBuilders,
  },
]

// Skills data, grouped as listed in the resume and prioritized for the target role
const skillsData = [
  {
    category: "Generative AI",
    skills: ["OpenAI API", "LLM Tool Calling", "RAG", "Text-to-Speech (TTS)", "n8n", "LangChain", "LangGraph", "Qdrant"],
  },
  {
    category: "AI & ML",
    skills: ["PyTorch", "Torchvision", "Scikit-learn", "Pandas", "NumPy", "Apache Airflow", "MLflow", "Streamlit", "Plotly"],
  },
  {
    category: "Backend & Architecture",
    skills: ["REST API", "gRPC", "Microservices", "Clean Architecture", "Hexagonal Architecture", "Kafka", "RabbitMQ"],
  },
  { category: "Languages", skills: ["Go", "Python", "C++", "TypeScript", "JavaScript", "Java"] },
  { category: "Databases", skills: ["PostgreSQL", "MongoDB", "MySQL"] },
  {
    category: "Testing & Quality",
    skills: ["Unit Testing", "Integration Testing", "Load Testing", "promptfoo (Red Teaming/Agent Evaluation)"],
  },
]

export default function AboutPage() {
  const headshotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const headshot = headshotRef.current
    if (!headshot) return

    // Simple headshot animation without scroll trigger
    const animation = gsap.fromTo(
      headshot,
      { opacity: 0, scale: 0.8, rotation: -5 },
      {
        opacity: 1,
        scale: 1,
        rotation: 0,
        duration: 1,
        delay: 1.75,
        ease: "elastic.out(1, 0.5)",
      },
    )

    return () => {
      animation.kill()
      gsap.killTweensOf(headshot)
    }
  }, [])

  return (
    <main className="min-h-screen pb-20">
      <div className="container mx-auto px-4 pt-16">
        <AnimatedTitle className="text-purple text-center leading-none tracking-normal mb-8" interactiveParticles>ABOUT</AnimatedTitle>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-8">
        <AnimatedSection animation="slideInLeft" delay={1.5} className="order-2 md:order-1" cursorTarget>
            <h2 className="text-3xl font-bold mb-6">Hello, I&apos;m Pasit Khumsena</h2>

            <p className="text-black/80 text-lg leading-relaxed mb-4">
              Computer Engineering student at Chulalongkorn University, graduating in December 2026, with
              hands-on experience developing LLM-powered applications and RAG-based customer support systems. I
              build practical AI products and reliable software systems, and I am interested in how automation can
              make useful tools easier to use.
            </p>

            <p className="text-black/80 text-lg leading-relaxed mb-4">
              Beyond my studies, I&apos;m dedicated to creating novel software solutions that harness the potential of
              cutting-edge AI technologies. I&apos;m also deeply interested in developing automation tools to simplify and
              enhance daily routines, always seeking opportunities to streamline processes and boost efficiency.
            </p>

            <p className="text-black/80 text-lg leading-relaxed mb-6">
              When I&apos;m not actively coding, my curiosity leads me to explore the ever-evolving world of AI. I enjoy
              discovering new tools, techniques, and applications, always seeking inspiration and opportunities to
              leverage these technologies in my own projects and beyond.
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
              <MagneticLink
                href="/resume-general.pdf"
                download="resume-general.pdf"
                target="_blank"
                rel="noopener noreferrer"
                wiggle
                cursorTarget
                className="inline-flex items-center justify-center rounded-full bg-purple px-6 py-3 text-white transition-colors duration-300 hover:bg-dark-purple"
              >
                Download Resume
              </MagneticLink>
              <MagneticLink
                href="/contact"
                transition
                cursorTarget
                className="inline-flex items-center justify-center rounded-full border border-purple px-6 py-3 text-purple transition-colors duration-300 hover:bg-purple/10"
              >
                Get in Touch
              </MagneticLink>
            </div>
          </AnimatedSection>

          <div
            ref={headshotRef}
            className="relative order-1 md:order-2 flex justify-center items-center opacity-0 my-8 md:my-0"
          >
            <div className="absolute w-full h-full bg-purple/10 rounded-lg md:rounded-xl transform rotate-2"></div>
            <div className="relative w-[280px] h-[350px] sm:w-[320px] sm:h-[400px] md:w-[360px] md:h-[450px] rounded-lg md:rounded-xl overflow-hidden border-4 border-white shadow-lg">
              <Image
                src="/images/profile-photo.png"
                alt="Pasit Khumsena presenting at a tech event, gesturing while explaining concepts next to a display screen"
                fill
                className="object-cover object-center"
                data-cursor-target
                sizes="(max-width: 768px) 280px, (max-width: 1024px) 320px, 360px"
                priority
              />
            </div>
          </div>
        </div>

        <AnimatedSection animation="fadeIn" delay={0} className="mt-20">
          <h2 className="text-3xl font-bold mb-8 text-center">My Skills</h2>

          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-x-14 gap-y-8 px-4 md:grid-cols-2">
            {skillsData.map((group) => {
              const categoryId = `skills-${group.category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`

              return (
                <section key={group.category} aria-labelledby={categoryId} className="min-w-0 border-b border-purple/15 pb-6">
                  <h3 id={categoryId} className="mb-4 flex items-center gap-3 text-base font-semibold text-black/80">
                    <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-purple" />
                    {group.category}
                  </h3>
                  <ul className="flex flex-wrap justify-start gap-2">
                    {group.skills.map((skill) => (
                      <li key={skill} className="rounded-full border border-purple/10 bg-white/75 px-3 py-1.5 text-xs font-medium text-purple md:text-sm">
                        {skill}
                      </li>
                    ))}
                  </ul>
                </section>
              )
            })}
          </div>
        </AnimatedSection>

        {/* Timeline section with scroll-triggered animations */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold mb-12 text-center">My Journey</h2>
          <div className="relative">
            {/* Animated vertical line */}
            <AnimatedTimelineLine />
            {/* Timeline items */}
            {timelineData.map((item, index) => (
              <TimelineItem
                key={index}
                year={item.year}
                title={item.title}
                description={item.description}
                organization={item.organization}
                roles={item.roles}
                index={index}
                logo={item.logo}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
