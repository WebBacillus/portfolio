"use client"

import Image from "next/image"
import AnimatedTitle from "@/components/animated-title"
import TimelineItem from "@/components/timeline-item"
import AnimatedSection from "@/components/animated-section"
import { useRef, useEffect } from "react"
import gsap from "gsap"
import TransitionLink from "@/components/transition-link"
import AnimatedTimelineLine from "@/components/animated-timeline-line"

// Timeline data
const timelineData = [
  //{
  //   year: "May 2025 - Present",
  //   title: "Software Engineer (Backend), ITMX (Part-time Contract)",
  //   description:
  //     "Developing backend systems and contributing to ongoing projects. Applying skills learned from internship experiences.",
  // },
  {
    year: "April 2025 - Present",
    title: "Software Engineer Intern (Backend), ITMX",
    description: "Gained experience in developing backend systems, focusing on scalability and performance.",
  },
  {
    year: "Oct 2024 - May 2025",
    title: "Accountant, CEDT Innovation Summit 2025",
    description:
      "Managed the financial aspects of the CEDT Innovation Summit, including budget oversight, expense management, and coordination with various departments. Verified the accuracy of receipts.",
    skills: ["Accounting", "Budget Management", "Financial Coordination", "Expense Tracking"],
  },
  {
    year: "May 2024 - July 2024",
    title: "Backend Developer Intern, NITMX",
    description:
      "Developed backend systems capable of handling high user traffic, similar to banking systems. Gained experience with various backend technologies.",
    skills: [
      "Backend Development",
      "Go",
      "Hexagonal Architecture",
      "Microservices",
      "Kafka",
      "gRPC",
      "Load Balancing",
      "k6",
      "Test-driven development",
    ],
  },
  {
    year: "July 2023",
    title: "Bachelors of Engineering in Computer Engineering, Chulalongkorn University",
    description: "Currently pursuing a Bachelors of Engineering in Computer Engineering at Chulalongkorn University.",
  },
  {
    year: "March 2023 - June 2023",
    title: "AI Builders Program Participant",
    description:
      "Selected to participate in the AI Builders program, developing a project for swear word detection in Thai videos using AI and NLP. Presented the project at the Bangkok Art and Culture Centre.",
    skills: ["AI", "NLP", "Data Science", "Automatic Speech Recognition", "Project Presentation"],
  },
]

// Skills data, grouped as listed in the resume and prioritized for the target role
const skillsData = [
  {
    category: "Generative AI",
    skills: ["OpenAI API", "LLM Tool Calling", "RAG", "Text-to-Speech (TTS)", "n8n", "LangChain", "Langraph", "Qdrant"],
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
    <main className="min-h-screen">
      <div className="container mx-auto px-4 pt-16">
        <AnimatedTitle className="text-purple text-center leading-none tracking-normal mb-8">ABOUT</AnimatedTitle>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-8">
        <AnimatedSection animation="slideInLeft" delay={1.5} className="order-2 md:order-1">
            <h2 className="text-3xl font-bold mb-6">Hello, I&apos;m Pasit Khumsena</h2>

            <p className="text-black/80 text-lg leading-relaxed mb-4">
              Computer Engineering student at Chulalongkorn University, focused on AI engineering and backend development. I build practical AI products and reliable software systems, and I am interested in how automation can make useful tools easier to use.
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
              <a
                target="_blank"
                rel="noopener noreferrer"
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
        <div className="mt-20 mb-20">
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
                index={index}
                skills={item.skills}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
