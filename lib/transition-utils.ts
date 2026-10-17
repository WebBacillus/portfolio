import gsap from "gsap"
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"

// Declare the global window interface to include our custom property
declare global {
  interface Window {
    pageTransitionContainer: HTMLDivElement | null
    isTransitioning: boolean
  }
}

let activeTransition: gsap.core.Timeline | undefined

export const animatePageIn = (): gsap.core.Timeline | undefined => {
  if (typeof window === "undefined") return

  // Get the transition container
  const container = window.pageTransitionContainer || document.getElementById("page-transition-container")
  const bannerOne = document.getElementById("banner-1")
  const bannerTwo = document.getElementById("banner-2")
  const bannerThree = document.getElementById("banner-3")
  const bannerFour = document.getElementById("banner-4")

  // Reset the is-transitioning flag
  window.isTransitioning = false

  if (container && bannerOne && bannerTwo && bannerThree && bannerFour) {
    activeTransition?.kill()
    // Make container visible first
    gsap.set(container, { display: "block", autoAlpha: 1 })

    const tl = gsap.timeline({
      onComplete: () => {
        // Ensure banners are hidden and not interfering with UI after animation
        gsap.set(container, { display: "none", autoAlpha: 0 })
        window.isTransitioning = false
        activeTransition = undefined
      },
    })
    activeTransition = tl

    // Set initial positions
    tl.set([bannerOne, bannerTwo, bannerThree, bannerFour], {
      yPercent: 0,
      autoAlpha: 1,
    })

    // Animate banners up with stagger
    tl.to([bannerOne, bannerTwo, bannerThree, bannerFour], {
      yPercent: 100,
      stagger: 0.2,
      duration: 0.8,
      ease: "power4.inOut",
    })

    return tl
  }
}

export const animatePageOut = (href: string, router: AppRouterInstance) => {
  if (typeof window === "undefined") {
    router.push(href)
    return
  }

  // Prevent multiple simultaneous transitions
  if (window.isTransitioning) return
  window.isTransitioning = true

  // Get the transition container
  const container = window.pageTransitionContainer || document.getElementById("page-transition-container")
  const bannerOne = document.getElementById("banner-1")
  const bannerTwo = document.getElementById("banner-2")
  const bannerThree = document.getElementById("banner-3")
  const bannerFour = document.getElementById("banner-4")

  if (container && bannerOne && bannerTwo && bannerThree && bannerFour) {
    activeTransition?.kill()
    // Make the transition container visible first
    gsap.set(container, { display: "block", autoAlpha: 1 })

    const tl = gsap.timeline({
      onComplete: () => {
        activeTransition = undefined
        router.push(href)
      },
    })
    activeTransition = tl

    // Set initial positions (banners above viewport)
    tl.set([bannerOne, bannerTwo, bannerThree, bannerFour], {
      yPercent: -100,
      autoAlpha: 1,
    })

    // Animate banners down with stagger
    tl.to([bannerOne, bannerTwo, bannerThree, bannerFour], {
      yPercent: 0,
      stagger: 0.2,
      duration: 0.8,
      ease: "power4.inOut",
    })
  } else {
    // Fallback if animation elements aren't available
    router.push(href)
    window.isTransitioning = false
  }
}

// Helper function to abort any ongoing transitions
export const abortTransition = () => {
  if (typeof window === "undefined") return

  activeTransition?.kill()
  activeTransition = undefined
  const container = window.pageTransitionContainer || document.getElementById("page-transition-container")

  if (container) {
    // Kill any active animations
    gsap.killTweensOf("#banner-1, #banner-2, #banner-3, #banner-4")

    // Hide the transition container
    gsap.set(container, { display: "none", autoAlpha: 0 })
  }

  window.isTransitioning = false
}
