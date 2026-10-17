"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"

export default function PageTransition() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    window.pageTransitionContainer = container

    return () => {
      gsap.killTweensOf(container.querySelectorAll("[id^='banner-']"))
      gsap.set(container, { display: "none", autoAlpha: 0 })
      if (window.pageTransitionContainer === container) {
        window.pageTransitionContainer = null
      }
    }
  }, [])

  return (
    <div
      id="page-transition-container"
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-50"
    >
      <div
        id="banner-1"
        className="min-h-screen bg-purple z-10 fixed top-0 left-0 w-1/4"
        style={{ transformOrigin: "bottom" }}
      ></div>
      <div
        id="banner-2"
        className="min-h-screen bg-purple z-10 fixed top-0 left-1/4 w-1/4"
        style={{ transformOrigin: "bottom" }}
      ></div>
      <div
        id="banner-3"
        className="min-h-screen bg-purple z-10 fixed top-0 left-2/4 w-1/4"
        style={{ transformOrigin: "bottom" }}
      ></div>
      <div
        id="banner-4"
        className="min-h-screen bg-purple z-10 fixed top-0 left-3/4 w-1/4"
        style={{ transformOrigin: "bottom" }}
      ></div>
    </div>
  )
}
