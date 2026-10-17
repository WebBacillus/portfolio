"use client"

import { useRef, useEffect } from "react"
import gsap from "gsap"

interface FilterButtonProps {
  label: string
  active: boolean
  onClick: () => void
}

export default function FilterButton({ label, active, onClick }: FilterButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const button = buttonRef.current
    if (!button) return

    // Animate when active state changes
    if (active) {
      gsap.fromTo(button, { scale: 0.95 }, { scale: 1, duration: 0.4, ease: "elastic.out(1, 0.5)" })
    }

    // Add hover animations
    const hoverIn = () => {
      if (!active) {
        gsap.to(button, {
          scale: 1.05,
          duration: 0.2,
          ease: "power1.out",
        })
      }
    }

    const hoverOut = () => {
      if (!active) {
        gsap.to(button, {
          scale: 1,
          duration: 0.2,
          ease: "power1.out",
        })
      }
    }

    // Add click animation
    const handleClick = () => {
      gsap.fromTo(button, { scale: 0.9 }, { scale: 1, duration: 0.3, ease: "elastic.out(1, 0.5)" })
    }

    button.addEventListener("mouseenter", hoverIn)
    button.addEventListener("mouseleave", hoverOut)
    button.addEventListener("click", handleClick)

    return () => {
      button.removeEventListener("mouseenter", hoverIn)
      button.removeEventListener("mouseleave", hoverOut)
      button.removeEventListener("click", handleClick)
      gsap.killTweensOf(button)
    }
  }, [active])

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transform-gpu ${
        active ? "bg-purple text-white" : "bg-purple/10 text-dark-purple"
      }`}
    >
      {label}
    </button>
  )
}
