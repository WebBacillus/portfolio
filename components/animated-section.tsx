"use client"

import { useRef, type ReactNode } from "react"
import { useScrollAnimation } from "@/lib/gsap-utils"

interface AnimatedSectionProps {
  children: ReactNode
  className?: string
  animation?: "fadeIn" | "slideInLeft" | "slideInRight" | "slideInTop" | "slideInBottom"
  delay?: number
  threshold?: string
  /** Frames the section with the bracket cursor's target box. */
  cursorTarget?: boolean
}

export default function AnimatedSection({
  children,
  className = "",
  animation = "fadeIn",
  delay = 0,
  threshold = "top 80%",
  cursorTarget = false,
}: AnimatedSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)

  useScrollAnimation(sectionRef, animation, { delay, start: threshold })

  return (
    <div
      ref={sectionRef}
      data-cursor-target={cursorTarget ? "" : undefined}
      className={className}
      style={{ opacity: 0 }}
    >
      {children}
    </div>
  )
}
