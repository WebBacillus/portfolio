"use client"

import { useRef, useEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

interface ExperienceCardProps {
  title: string
  company: string
  period: string
  description: string
  skills: string[]
  index: number
}

export default function ExperienceCard({ title, company, period, description, skills, index }: ExperienceCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === "undefined" || !cardRef.current) return

    gsap.registerPlugin(ScrollTrigger)

    const card = cardRef.current

    // Set initial state
    gsap.set(card, {
      opacity: 0,
      y: 30,
      scale: 0.95,
    })

    // Create scroll trigger
    const trigger = ScrollTrigger.create({
      trigger: card,
      start: "top 85%",
      once: true,
      onEnter: () => {
        gsap.to(card, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          delay: index * 0.1,
          ease: "power3.out",
        })
      },
    })

    // Hover animations
    const handleMouseEnter = () => {
      gsap.to(card, {
        y: -5,
        boxShadow: "0 10px 25px rgba(107, 70, 193, 0.15)",
        duration: 0.3,
        ease: "power2.out",
      })
    }

    const handleMouseLeave = () => {
      gsap.to(card, {
        y: 0,
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
        duration: 0.3,
        ease: "power2.out",
      })
    }

    card.addEventListener("mouseenter", handleMouseEnter)
    card.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      trigger.kill()
      card.removeEventListener("mouseenter", handleMouseEnter)
      card.removeEventListener("mouseleave", handleMouseLeave)
      gsap.killTweensOf(card)
    }
  }, [index])

  return (
    <div
      ref={cardRef}
      className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-sm border border-purple/10 h-full transform-gpu"
    >
      <h3 className="font-bold text-lg text-purple mb-1">{title}</h3>
      <p className="text-sm text-black/70 mb-2 font-medium">
        {company} • {period}
      </p>
      <p className="text-black/80 text-sm mb-4 leading-relaxed">{description}</p>
      <div className="flex flex-wrap gap-1">
        {skills.map((skill, skillIndex) => (
          <span key={skillIndex} className="text-xs px-2 py-1 bg-purple/10 text-purple rounded-full font-medium">
            {skill}
          </span>
        ))}
      </div>
    </div>
  )
}
