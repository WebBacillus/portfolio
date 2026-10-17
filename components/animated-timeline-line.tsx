"use client"

import { useRef, useEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

export default function AnimatedTimelineLine() {
  const lineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!lineRef.current) return

    gsap.registerPlugin(ScrollTrigger)

    const line = lineRef.current

    // Set initial state
    gsap.set(line, {
      scaleY: 0,
      transformOrigin: "top center",
    })

    // Create scroll trigger for timeline line
    gsap.to(line, {
      scaleY: 1,
      duration: 2,
      ease: "power2.out",
      scrollTrigger: {
        trigger: line.parentElement,
        start: "top 80%",
        end: "bottom 20%",
        scrub: 1,
        onEnter: () => {
          // Add subtle glow effect
          gsap.to(line, {
            boxShadow: "0 0 10px rgba(107, 70, 193, 0.3)",
            duration: 1,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
          })
        },
        onLeave: () => {
          gsap.killTweensOf(line)
          gsap.set(line, { boxShadow: "none" })
        },
        onEnterBack: () => {
          gsap.to(line, {
            boxShadow: "0 0 10px rgba(107, 70, 193, 0.3)",
            duration: 1,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
          })
        },
        onLeaveBack: () => {
          gsap.killTweensOf(line)
          gsap.set(line, { boxShadow: "none" })
        },
      },
    })

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
      gsap.killTweensOf(line)
    }
  }, [])

  return (
    <div
      ref={lineRef}
      className="timeline-line absolute left-1/2 transform -translate-x-1/2 h-full w-px bg-purple/30 hidden md:block"
    />
  )
}
