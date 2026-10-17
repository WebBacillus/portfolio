"use client"

import { useRef, useEffect } from "react"
import gsap from "gsap"

export default function ScrollingText() {
  const items = ["Developer", "Automation", "Fintech", "Student"]
  const repeatedItems = [...items, ...items, ...items, ...items]
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!scrollRef.current) return

    // Create a smoother scrolling animation with GSAP
    // Reset the default CSS animation
    gsap.set(scrollRef.current, {
      animation: "none",
      x: 0,
    })

    // Create GSAP animation
    const tl = gsap.timeline({
      repeat: -1,
      ease: "none",
    })

    // Calculate the width of one set of items
    const itemWidth = scrollRef.current.scrollWidth / 4

    tl.to(scrollRef.current, {
      x: -itemWidth,
      duration: 20,
      ease: "none",
    })

    // Add hover effect to pause animation
    const container = scrollRef.current.parentElement
    const handleMouseEnter = () => gsap.to(tl, { timeScale: 0.2, duration: 0.5 })
    const handleMouseLeave = () => gsap.to(tl, { timeScale: 1, duration: 0.5 })
    if (container) {
      container.addEventListener("mouseenter", handleMouseEnter)
      container.addEventListener("mouseleave", handleMouseLeave)
    }

    return () => {
      tl.kill()
      gsap.killTweensOf(tl)
      if (container) {
        container.removeEventListener("mouseenter", handleMouseEnter)
        container.removeEventListener("mouseleave", handleMouseLeave)
      }
    }
  }, [])

  return (
    <div className="overflow-hidden">
      <div ref={scrollRef} className="flex">
        {repeatedItems.map((item, index) => (
          <div key={index} className="flex items-center">
            <span className="text-purple/80 text-base sm:text-lg md:text-xl px-4 sm:px-6 md:px-8">{item}</span>
            <span className="text-purple/60 text-lg sm:text-xl md:text-2xl">✦</span>
          </div>
        ))}
      </div>
    </div>
  )
}
