"use client"

import type React from "react"
import { useRef, useEffect } from "react"
import gsap from "gsap"

interface AnimatedTitleProps {
  children: React.ReactNode
  className?: string
  accessibleLabel?: string
  onReveal?: () => void
  revealOverlapSeconds?: number
}

export default function AnimatedTitle({ children, className = "", accessibleLabel, onReveal, revealOverlapSeconds = 0 }: AnimatedTitleProps) {
  const titleRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (typeof window === "undefined" || !titleRef.current) return

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onReveal?.()
      return
    }

    // Simple character animation without SplitText for better compatibility
    const title = titleRef.current
    const text = typeof children === "string" ? children : title.textContent || ""

    // Clear the title and create spans for each character
    title.innerHTML = ""

    const chars: HTMLSpanElement[] = []
    const lines = text.split("\n")
    for (const line of lines) {
      const lineElement = lines.length > 1 ? document.createElement("span") : title
      if (lineElement !== title) {
        lineElement.style.display = "block"
        lineElement.style.whiteSpace = "nowrap"
        title.appendChild(lineElement)
      }
      for (const char of line) {
        const span = document.createElement("span")
        span.textContent = char === " " ? "\u00A0" : char // Use non-breaking space
        span.style.display = "inline-block"
        chars.push(span)
        lineElement.appendChild(span)
      }
    }

    // Create animation timeline
    const tl = gsap.timeline()

    // Reset initial state
    gsap.set(chars, { opacity: 0, y: 25 })

    // Animate each character
    tl.to(chars, {
      opacity: 1,
      y: 0,
      delay: 1,
      duration: 1.5,
      stagger: 0.03,
      ease: "power4.out",
    })

    if (onReveal) tl.call(onReveal, undefined, `-=${Math.max(0, revealOverlapSeconds)}`)

    // Handle resize for responsive text
    const handleResize = () => {
      // Simple resize handling without SplitText
      if (window.innerWidth < 768) {
        // Adjust animation for mobile if needed
        gsap.set(chars, { clearProps: "all" })
      }
    }

    window.addEventListener("resize", handleResize)

    // Clean up
    return () => {
      window.removeEventListener("resize", handleResize)
      tl.kill()
      // Restore original text content
      title.textContent = text
    }
  }, [children, onReveal, revealOverlapSeconds])

  return (
    <h1
      ref={titleRef}
      aria-label={accessibleLabel}
      className={`${className} font-black lg:text-[15vw] md:text-[12vw] text-[15vw] w-full`}
      style={{ fontFamily: "'Gabarito', sans-serif" }}
    >
      {typeof children === "string" && children.includes("\n")
        ? children.split("\n").map((line, index) => <span key={index} className="block whitespace-nowrap">{line}</span>)
        : children}
    </h1>
  )
}
