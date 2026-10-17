"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import type { ReactNode } from "react"
import { useState, useEffect } from "react"
import { animatePageOut } from "@/lib/transition-utils"
import useMobile from "@/hooks/use-mobile"

interface TransitionLinkProps {
  href: string
  children: ReactNode
  className?: string
  onClick?: () => void
}

export default function TransitionLink({ href, children, className = "", onClick }: TransitionLinkProps) {
  const router = useRouter()
  const isMobile = useMobile()
  const [isNavigating, setIsNavigating] = useState(false)

  // Reset navigation state when component unmounts
  useEffect(() => {
    return () => setIsNavigating(false)
  }, [])

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()

    // Prevent multiple clicks
    if (isNavigating) return
    setIsNavigating(true)

    // Execute any additional onClick handler
    if (onClick) onClick()

    // Skip animation for same page navigation
    if (window.location.pathname === href) {
      router.push(href)
      setIsNavigating(false)
      return
    }

    // Use simplified transitions for mobile to prevent issues
    if (isMobile) {
      // On mobile, use a shorter animation or direct navigation if there are issues
      try {
        animatePageOut(href, router)

        // Reset navigation state after timeout as safety
        setTimeout(() => {
          setIsNavigating(false)
        }, 2000)
      } catch (error) {
        // Fallback to direct navigation if animation fails
        console.error("Transition failed, using direct navigation", error)
        router.push(href)
        setIsNavigating(false)
      }
    } else {
      // Use full animation on desktop
      animatePageOut(href, router)

      // Reset navigation state after timeout as safety
      setTimeout(() => {
        setIsNavigating(false)
      }, 2000)
    }
  }

  return (
    <a href={href} onClick={handleClick} className={className} aria-disabled={isNavigating}>
      {children}
    </a>
  )
}
