"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

// Register GSAP plugins only on client side
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

// Animation presets
export const fadeIn = (element: HTMLElement | null, delay = 0, duration = 0.8) => {
  if (!element || typeof window === "undefined") return

  return gsap.fromTo(
    element,
    { opacity: 0, y: 20 },
    {
      opacity: 1,
      y: 0,
      duration,
      delay,
      ease: "power2.out",
    },
  )
}

export const staggerFadeIn = (elements: HTMLElement[] | NodeListOf<Element>, stagger = 0.1, delay = 0) => {
  if (!elements || elements.length === 0 || typeof window === "undefined") return

  return gsap.fromTo(
    elements,
    { opacity: 0, y: 20 },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger,
      delay,
      ease: "power2.out",
    },
  )
}

export const slideIn = (element: HTMLElement | null, direction: "left" | "right" | "top" | "bottom", delay = 0) => {
  if (!element || typeof window === "undefined") return

  const xValue = direction === "left" ? -100 : direction === "right" ? 100 : 0
  const yValue = direction === "top" ? -100 : direction === "bottom" ? 100 : 0

  return gsap.fromTo(
    element,
    { x: xValue, y: yValue, opacity: 0 },
    {
      x: 0,
      y: 0,
      opacity: 1,
      duration: 1,
      delay,
      ease: "power3.out",
    },
  )
}

export const createScrollTrigger = (
  element: HTMLElement | null,
  animation: gsap.core.Tween | undefined,
  trigger: HTMLElement | null = element,
  start = "top 80%",
) => {
  if (!element || !animation || !trigger || typeof window === "undefined") return

  return ScrollTrigger.create({
    trigger,
    start,
    onEnter: () => animation.play(),
    once: true,
  })
}

// Hook for scroll-triggered animations
export const useScrollAnimation = (
  ref: React.RefObject<HTMLElement>,
  animationType: "fadeIn" | "slideInLeft" | "slideInRight" | "slideInTop" | "slideInBottom",
  options = { delay: 0, start: "top 80%" },
) => {
  useEffect(() => {
    if (!ref.current || typeof window === "undefined") return

    let animation: gsap.core.Tween | undefined

    switch (animationType) {
      case "fadeIn":
        animation = fadeIn(ref.current, options.delay)
        break
      case "slideInLeft":
        animation = slideIn(ref.current, "left", options.delay)
        break
      case "slideInRight":
        animation = slideIn(ref.current, "right", options.delay)
        break
      case "slideInTop":
        animation = slideIn(ref.current, "top", options.delay)
        break
      case "slideInBottom":
        animation = slideIn(ref.current, "bottom", options.delay)
        break
    }

    if (animation) {
      animation.pause()
      const trigger = createScrollTrigger(ref.current, animation, ref.current, options.start)

      return () => {
        animation?.kill()
        trigger?.kill()
      }
    }
  }, [ref, animationType, options])
}

// Hook for staggered animations
export const useStaggerAnimation = (
  containerRef: React.RefObject<HTMLElement>,
  selector: string,
  options = { stagger: 0.1, delay: 0, start: "top 80%" },
) => {
  useEffect(() => {
    if (!containerRef.current || typeof window === "undefined") return

    const elements = containerRef.current.querySelectorAll(selector)
    if (elements.length === 0) return

    const animation = staggerFadeIn(elements, options.stagger, options.delay)
    if (animation) {
      animation.pause()
      const trigger = createScrollTrigger(containerRef.current, animation, containerRef.current, options.start)

      return () => {
        animation.kill()
        trigger?.kill()
      }
    }
  }, [containerRef, selector, options])
}

// Hook for page transition animations
export const usePageTransition = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current || typeof window === "undefined") return

    const tl = gsap.timeline()

    // Animate the page container
    tl.fromTo(pageRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.out" })

    // Animate direct children with stagger
    const children = pageRef.current.children
    if (children.length > 0) {
      tl.fromTo(
        children,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out",
        },
        "-=0.3", // Overlap with previous animation
      )
    }

    return () => {
      tl.kill()
    }
  }, [])

  return pageRef
}

// Create a scroll-triggered animation that plays when element enters viewport
export const createScrollAnimation = (
  element: HTMLElement | null,
  fromVars: gsap.TweenVars,
  toVars: gsap.TweenVars,
  options = { start: "top bottom-=100", once: true },
) => {
  if (!element || typeof window === "undefined") return

  // Set initial state
  gsap.set(element, fromVars)

  // Create animation
  const animation = gsap.to(element, {
    ...toVars,
    paused: true,
  })

  // Create scroll trigger
  const trigger = ScrollTrigger.create({
    trigger: element,
    start: options.start,
    onEnter: () => animation.play(),
    once: options.once,
  })

  return { animation, trigger }
}

// Create a parallax effect
export const createParallax = (
  element: HTMLElement | null,
  distance = 100,
  options = { start: "top bottom", end: "bottom top", scrub: true },
) => {
  if (!element || typeof window === "undefined") return

  return gsap.to(element, {
    y: distance,
    ease: "none",
    scrollTrigger: {
      trigger: element,
      start: options.start,
      end: options.end,
      scrub: options.scrub,
    },
  })
}

// Create a reveal animation for a grid of items
export const createGridReveal = (
  container: HTMLElement | null,
  itemSelector: string,
  fromVars: gsap.TweenVars,
  toVars: gsap.TweenVars,
  options = { stagger: 0.1, start: "top bottom-=100" },
) => {
  if (!container || typeof window === "undefined") return

  const items = container.querySelectorAll(itemSelector)
  if (items.length === 0) return

  // Set initial state
  gsap.set(items, fromVars)

  // Create scroll trigger
  const trigger = ScrollTrigger.create({
    trigger: container,
    start: options.start,
    onEnter: () => {
      gsap.to(items, {
        ...toVars,
        stagger: options.stagger,
        overwrite: true,
      })
    },
    once: true,
  })

  return trigger
}

// Create a scroll-based progress indicator
export const createScrollProgress = (
  element: HTMLElement | null,
  options = { scaleX: true, scaleY: false, start: "top top", end: "bottom bottom", scrub: true },
) => {
  if (!element || typeof window === "undefined") return

  // Set initial scale
  gsap.set(element, {
    scaleX: options.scaleX ? 0 : 1,
    scaleY: options.scaleY ? 0 : 1,
    transformOrigin: "left top",
  })

  // Create scroll trigger
  return ScrollTrigger.create({
    trigger: document.body,
    start: options.start,
    end: options.end,
    scrub: options.scrub,
    onUpdate: (self) => {
      if (options.scaleX) {
        gsap.to(element, {
          scaleX: self.progress,
          duration: 0.1,
          overwrite: true,
        })
      }
      if (options.scaleY) {
        gsap.to(element, {
          scaleY: self.progress,
          duration: 0.1,
          overwrite: true,
        })
      }
    },
  })
}

// Create a reveal animation for project cards
export const createProjectCardReveal = (
  container: HTMLElement | null,
  options = { stagger: 0.1, start: "top bottom-=100" },
) => {
  if (!container || typeof window === "undefined") return

  const cards = container.querySelectorAll(".project-card")
  if (cards.length === 0) return

  // Set initial state
  gsap.set(cards, {
    y: 50,
    opacity: 0,
  })

  // Create scroll trigger for each card
  const triggers = Array.from(cards).map((card, index) => {
    return ScrollTrigger.create({
      trigger: card,
      start: options.start,
      once: true,
      onEnter: () => {
        gsap.to(card, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: index * options.stagger,
          ease: "power3.out",
        })
      },
    })
  })

  return triggers
}

// Add hover animation to an element
export const addHoverAnimation = (
  element: HTMLElement | null,
  enterVars: gsap.TweenVars,
  leaveVars: gsap.TweenVars,
) => {
  if (!element || typeof window === "undefined") return

  const enterHandler = () => {
    gsap.to(element, { ...enterVars, duration: 0.3, ease: "power2.out" })
  }

  const leaveHandler = () => {
    gsap.to(element, { ...leaveVars, duration: 0.3, ease: "power2.out" })
  }

  element.addEventListener("mouseenter", enterHandler)
  element.addEventListener("mouseleave", leaveHandler)

  return () => {
    element.removeEventListener("mouseenter", enterHandler)
    element.removeEventListener("mouseleave", leaveHandler)
    gsap.killTweensOf(element)
  }
}
