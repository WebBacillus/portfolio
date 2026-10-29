"use client"

import { type ReactNode, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ScrollToPlugin } from "gsap/ScrollToPlugin"
import { animatePageIn, abortTransition } from "@/lib/transition-utils"

interface GSAPProviderProps {
  children: ReactNode
}

export default function GSAPProvider({ children }: GSAPProviderProps) {
  const pathname = usePathname()
  const previousPathname = useRef<string | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

    // Set default ease
    gsap.defaults({
      ease: "power2.out",
    })

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

    // Project detail routes use direct navigation in both directions.
    const projectNavigation = pathname.startsWith("/work/") || previousPathname.current?.startsWith("/work/")
    const transition = projectNavigation ? undefined : animatePageIn()
    if (projectNavigation) abortTransition()
    previousPathname.current = pathname

    // Scroll to top on page change
    window.scrollTo(0, 0)

    // Refresh ScrollTrigger
    ScrollTrigger.refresh()

    return () => {
      transition?.kill()
      abortTransition()
    }
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

    // Add event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange)

    // Clean up event listeners
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  return <>{children}</>
}
