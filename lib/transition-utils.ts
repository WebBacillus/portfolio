import gsap from "gsap"
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"

let activeTransition: gsap.core.Timeline | undefined
let transitionContainer: HTMLDivElement | null = null
let isTransitioning = false

export const registerTransitionContainer = (container: HTMLDivElement) => {
  transitionContainer = container
}

export const unregisterTransitionContainer = (container: HTMLDivElement) => {
  if (transitionContainer !== container) return

  abortTransition()
  transitionContainer = null
}

const getTransitionElements = () => {
  if (!transitionContainer) return

  const banners = ["banner-1", "banner-2", "banner-3", "banner-4"].map((id) =>
    transitionContainer?.querySelector<HTMLDivElement>(`#${id}`),
  )

  if (banners.some((banner) => !banner)) return

  return { container: transitionContainer, banners: banners as HTMLDivElement[] }
}

export const animatePageIn = (): gsap.core.Timeline | undefined => {
  if (typeof window === "undefined") return

  const elements = getTransitionElements()

  isTransitioning = false

  if (elements) {
    const { container, banners } = elements
    activeTransition?.kill()
    // Make container visible first
    gsap.set(container, { display: "block", autoAlpha: 1 })

    const tl = gsap.timeline({
      onComplete: () => {
        // Ensure banners are hidden and not interfering with UI after animation
        gsap.set(container, { display: "none", autoAlpha: 0 })
        isTransitioning = false
        activeTransition = undefined
      },
    })
    activeTransition = tl

    // Set initial positions
    tl.set(banners, {
      yPercent: 0,
      autoAlpha: 1,
    })

    // Animate banners up with stagger
    tl.to(banners, {
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
  if (isTransitioning) return
  isTransitioning = true

  const elements = getTransitionElements()

  if (elements) {
    const { container, banners } = elements
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
    tl.set(banners, {
      yPercent: -100,
      autoAlpha: 1,
    })

    // Animate banners down with stagger
    tl.to(banners, {
      yPercent: 0,
      stagger: 0.2,
      duration: 0.8,
      ease: "power4.inOut",
    })
  } else {
    // Fallback if animation elements aren't available
    router.push(href)
    isTransitioning = false
  }
}

// Helper function to abort any ongoing transitions
export const abortTransition = () => {
  if (typeof window === "undefined") return

  activeTransition?.kill()
  activeTransition = undefined
  const container = transitionContainer

  if (container) {
    // Kill any active animations
    gsap.killTweensOf(container.querySelectorAll("[id^='banner-']"))

    // Hide the transition container
    gsap.set(container, { display: "none", autoAlpha: 0 })
  }

  isTransitioning = false
}
