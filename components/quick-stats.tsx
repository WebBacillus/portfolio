"use client"

import { useRef, useEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

interface Stat {
  number: string
  label: string
  description: string
}

interface QuickStatsProps {
  stats: Stat[]
  className?: string
}

export default function QuickStats({ stats, className = "" }: QuickStatsProps) {
  const statsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === "undefined" || !statsRef.current) return

    gsap.registerPlugin(ScrollTrigger)

    const container = statsRef.current
    const statItems = container.querySelectorAll(".stat-item")

    // Set initial state
    gsap.set(statItems, {
      opacity: 0,
      y: 30,
      scale: 0.9,
    })

    // Create scroll trigger
    const trigger = ScrollTrigger.create({
      trigger: container,
      start: "top 85%",
      once: true,
      onEnter: () => {
        gsap.to(statItems, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.15,
          ease: "back.out(1.7)",
        })
      },
    })

    return () => {
      trigger.kill()
      gsap.killTweensOf(statItems)
    }
  }, [])

  return (
    <div ref={statsRef} className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${className}`}>
      {stats.map((stat, index) => (
        <div
          key={index}
          className="stat-item text-center p-6 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-purple/10"
        >
          <div className="text-3xl md:text-4xl font-bold text-purple mb-2">{stat.number}</div>
          <div className="text-lg font-semibold text-black mb-1">{stat.label}</div>
          <div className="text-sm text-black/70">{stat.description}</div>
        </div>
      ))}
    </div>
  )
}
