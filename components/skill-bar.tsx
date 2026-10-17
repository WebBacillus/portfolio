"use client"

import { useRef, useEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

interface SkillBarProps {
  skill: string
  percentage: number
  delay?: number
}

export default function SkillBar({ skill, percentage, delay = 0 }: SkillBarProps) {
  const barRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === "undefined" || !barRef.current || !progressRef.current) return

    gsap.registerPlugin(ScrollTrigger)

    // Set initial state
    gsap.set(progressRef.current, {
      width: "0%",
    })

    // Create animation
    const animation = gsap.to(progressRef.current, {
      width: `${percentage}%`,
      duration: 1.5,
      delay,
      ease: "power3.out",
      paused: true,
    })

    // Create scroll trigger
    const trigger = ScrollTrigger.create({
      trigger: barRef.current,
      start: "top 80%",
      onEnter: () => animation.play(),
      once: true,
    })

    return () => {
      animation.kill()
      trigger.kill()
    }
  }, [percentage, delay])

  return (
    <div ref={barRef} className="mb-6">
      <div className="flex justify-between mb-1">
        <span className="text-black font-medium">{skill}</span>
        <span className="text-purple font-medium">{percentage}%</span>
      </div>
      <div className="h-3 bg-purple/10 rounded-full overflow-hidden">
        <div ref={progressRef} className="h-full bg-purple rounded-full" style={{ width: "0%" }}></div>
      </div>
    </div>
  )
}
