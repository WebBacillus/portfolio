"use client"

import { useEffect, useRef } from "react"

export default function SimpleBackground() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Create simple floating squares
    for (let i = 0; i < 20; i++) {
      const square = document.createElement("div")
      square.className = "absolute bg-purple/20 rounded-sm animate-pulse"
      square.style.width = `${Math.random() * 30 + 10}px`
      square.style.height = square.style.width
      square.style.left = `${Math.random() * 100}%`
      square.style.top = `${Math.random() * 100}%`
      square.style.animationDelay = `${Math.random() * 2}s`
      square.style.animationDuration = `${Math.random() * 3 + 2}s`

      container.appendChild(square)
    }

    return () => {
      container.innerHTML = ""
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  )
}
