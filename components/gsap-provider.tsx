"use client"

import { type ReactNode, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ScrollToPlugin } from "gsap/ScrollToPlugin"
import { ScrollSmoother } from "gsap/ScrollSmoother"
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
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, ScrollSmoother)

    // Set default ease
    gsap.defaults({
      ease: "power2.out",
    })

    // Keep native scrolling for touch and reduced-motion visitors.
    const desktop = window.matchMedia("(min-width: 769px) and (hover: hover) and (pointer: fine)")
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    const syncSmoother = () => {
      const smoother = ScrollSmoother.get()
      if (!desktop.matches || reducedMotion.matches) {
        smoother?.kill()
      } else if (!smoother) {
        ScrollSmoother.create({
          wrapper: "#smooth-wrapper",
          content: "#smooth-content",
          smooth: 0.8,
          smoothTouch: false,
          effects: false,
        })
      }
      ScrollTrigger.refresh()
    }

    syncSmoother()
    desktop.addEventListener("change", syncSmoother)
    reducedMotion.addEventListener("change", syncSmoother)

    // Clean up on unmount
    return () => {
      desktop.removeEventListener("change", syncSmoother)
      reducedMotion.removeEventListener("change", syncSmoother)
      ScrollSmoother.get()?.kill()
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
    const frame = requestAnimationFrame(() => {
      const smoother = ScrollSmoother.get()
      if (smoother) smoother.scrollTop(0)
      else window.scrollTo(0, 0)
      ScrollTrigger.refresh()
    })

    return () => {
      cancelAnimationFrame(frame)
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
