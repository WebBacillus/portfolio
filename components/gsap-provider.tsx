"use client"

import { type ReactNode, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ScrollToPlugin } from "gsap/ScrollToPlugin"
import { animatePageIn, abortTransition } from "@/lib/transition-utils"

interface GSAPProviderProps {
  children: ReactNode
}

export default function GSAPProvider({ children }: GSAPProviderProps) {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (typeof window === "undefined") return

    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

    // Set default ease
    gsap.defaults({
      ease: "power2.out",
    })

    // Initialize flags for transition management
    window.isTransitioning = false

    // Animate page in on initial load
    animatePageIn()

    // Refresh ScrollTrigger on route change
    ScrollTrigger.refresh()

    // Clean up on unmount
    return () => {
      // Kill all ScrollTrigger instances
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())

      // Abort any ongoing transitions
      abortTransition()
    }
  }, [])

  // Handle page transitions when pathname changes
  useEffect(() => {
    if (typeof window === "undefined") return

    // Animate page in when pathname changes
    animatePageIn()

    // Scroll to top on page change
    window.scrollTo(0, 0)

    // Refresh ScrollTrigger
    ScrollTrigger.refresh()
  }, [pathname])

  // Add event listeners for mobile-specific issues
  useEffect(() => {
    if (typeof window === "undefined") return

    // Handle page visibility changes (like app switching on mobile)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // When returning to the page, ensure transitions are cleaned up
        abortTransition()
      }
    }

    // Handle page load complete to ensure transitions are cleaned up
    const handleLoad = () => {
      // Slight delay to ensure DOM is fully loaded
      setTimeout(() => {
        abortTransition()
      }, 300)
    }

    // Add event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("load", handleLoad)

    // Clean up event listeners
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("load", handleLoad)
    }
  }, [])

  return <>{children}</>
}
