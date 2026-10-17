"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { PerformanceMonitor, getAdaptiveSettings } from "@/lib/performance-utils"

interface Square {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
  element: HTMLDivElement
  depth: number
  initialX: number
  initialY: number
  rotationSpeed: number
  pulsePhase: number
}

interface AdaptiveSettings {
  particleCount: number
  animationSpeed: number
  enableParallax: boolean
  enablePulse: boolean
}

export default function AnimatedBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const squares = useRef<Square[]>([])
  const animationRef = useRef<number | null>(null)
  const scrollY = useRef(0)
  const mouseX = useRef(0)
  const mouseY = useRef(0)
  const isVisible = useRef(true)
  const animateRef = useRef<() => void>(() => {})
  const performanceMonitor = useRef<PerformanceMonitor | null>(null)
  const [settings, setSettings] = useState<AdaptiveSettings>(getAdaptiveSettings())

  // Throttled scroll handler for better performance
  const handleScroll = useCallback(() => {
    scrollY.current = window.scrollY
  }, [])

  // Throttled mouse move handler
  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseX.current = (e.clientX / window.innerWidth - 0.5) * 2
    mouseY.current = (e.clientY / window.innerHeight - 0.5) * 2
  }, [])

  // Visibility change handler to pause animations when tab is not visible
  const handleVisibilityChange = useCallback(() => {
    isVisible.current = !document.hidden
    if (!isVisible.current && animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    } else if (isVisible.current) {
      animateRef.current()
    }
  }, [])

  const animate = useCallback(() => {
    if (!isVisible.current || !containerRef.current) return

    // Monitor performance
    performanceMonitor.current?.update()

    const currentTime = Date.now() * 0.001
    const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)
    const scrollProgress = Math.min(scrollY.current / maxScroll, 1)

    squares.current.forEach((square) => {
      // Update position with bounds checking
      square.x += square.speedX * settings.animationSpeed
      square.y += square.speedY * settings.animationSpeed

      // Bounce off edges
      if (square.x <= 0 || square.x + square.size >= window.innerWidth) {
        square.speedX *= -1
        square.x = Math.max(0, Math.min(window.innerWidth - square.size, square.x))
      }

      if (square.y <= 0 || square.y + square.size >= window.innerHeight) {
        square.speedY *= -1
        square.y = Math.max(0, Math.min(window.innerHeight - square.size, square.y))
      }

      // Parallax and effects
      const parallaxX = settings.enableParallax ? mouseX.current * square.depth * 10 : 0
      const parallaxY = settings.enableParallax ? mouseY.current * square.depth * 10 : 0
      const scrollOffset = scrollProgress * square.depth * 50

      // Pulse effect
      const pulseScale = settings.enablePulse ? 1 + Math.sin(currentTime * 2 + square.pulsePhase) * 0.2 : 1

      // Color intensity
      const baseOpacity = square.opacity * (0.3 + scrollProgress * 0.4)
      const finalOpacity = Math.min(Math.max(baseOpacity, 0.1), 0.6)

      // Apply all transformations at once
      gsap.set(square.element, {
        x: square.x + parallaxX,
        y: square.y + parallaxY - scrollOffset,
        scale: pulseScale,
        opacity: finalOpacity,
        backgroundColor: `rgba(107, 70, 193, ${finalOpacity})`,
        force3D: true,
      })
    })

    animationRef.current = requestAnimationFrame(() => animateRef.current())
  }, [settings])

  useEffect(() => {
    animateRef.current = animate
  }, [animate])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger)

    // Set container to full screen
    const handleResize = () => {
      if (container) {
        container.style.width = `${window.innerWidth}px`
        container.style.height = `${document.documentElement.scrollHeight}px`
        initSquares()
      }
    }

    // Initialize squares with enhanced properties
    function initSquares() {
      // Clear existing squares
      squares.current.forEach((square) => {
        if (square.element?.parentNode) {
          square.element.parentNode.removeChild(square.element)
        }
      })
      squares.current = []

      if (!container) return

      const numberOfSquares = Math.min(settings.particleCount, 30)

      for (let i = 0; i < numberOfSquares; i++) {
        const element = document.createElement("div")
        element.className = "absolute bg-purple rounded-sm"
        element.style.willChange = "transform, opacity"
        element.style.pointerEvents = "none"
        container.appendChild(element)

        const size = Math.random() * 20 + 15
        const square = {
          x: Math.random() * (window.innerWidth - size),
          y: Math.random() * (window.innerHeight - size),
          size,
          speedX: (Math.random() - 0.5) * 1,
          speedY: (Math.random() - 0.5) * 1,
          opacity: Math.random() * 0.3 + 0.2,
          depth: Math.random() * 3 + 1,
          initialX: 0,
          initialY: 0,
          rotationSpeed: (Math.random() - 0.5) * 0.5,
          pulsePhase: Math.random() * Math.PI * 2,
          element,
        }

        // Set initial styles
        gsap.set(element, {
          width: size,
          height: size,
          x: square.x,
          y: square.y,
          opacity: 0,
          backgroundColor: `rgba(107, 70, 193, ${square.opacity})`,
          force3D: true,
        })

        // Animate in
        gsap.to(element, {
          opacity: square.opacity,
          duration: 1,
          delay: Math.random() * 2,
          ease: "power2.out",
        })

        squares.current.push(square)
      }
    }

    // Create scroll-triggered background effects
    const scrollTrigger = ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress

        // Change container background based on scroll progress
        if (container) {
          const bgOpacity = Math.min(progress * 0.1, 0.05)
          gsap.to(container, {
            backgroundColor: `rgba(107, 70, 193, ${bgOpacity})`,
            duration: 0.3,
          })
        }

        // Add wave effect to squares based on scroll
        squares.current.forEach((square, index) => {
          const wave = Math.sin(progress * Math.PI * 4 + index * 0.1) * 20
          gsap.set(square.element, {
            y: square.y + wave,
            duration: 0.1,
          })
        })
      },
    })

    // Throttled event listeners
    let scrollTimeout: NodeJS.Timeout
    const throttledScroll = () => {
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(handleScroll, 16) // ~60fps
    }

    let mouseTimeout: NodeJS.Timeout
    const throttledMouseMove = (e: MouseEvent) => {
      clearTimeout(mouseTimeout)
      mouseTimeout = setTimeout(() => handleMouseMove(e), 16) // ~60fps
    }

    // Initialize performance monitor
    performanceMonitor.current = new PerformanceMonitor((fps, isLowPerformance) => {
      if (isLowPerformance) {
        // Reduce quality if performance is poor
        setSettings((prev) => ({
          ...prev,
          particleCount: Math.max(prev.particleCount * 0.7, 10),
          enableParallax: false,
          enablePulse: false,
        }))
      }
    })

    // Add event listeners
    window.addEventListener("resize", handleResize)
    window.addEventListener("scroll", throttledScroll, { passive: true })
    window.addEventListener("mousemove", throttledMouseMove, { passive: true })
    document.addEventListener("visibilitychange", handleVisibilityChange)

    // Initialize
    handleResize()
    animateRef.current()

    return () => {
      // Cleanup
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("scroll", throttledScroll)
      window.removeEventListener("mousemove", throttledMouseMove)
      document.removeEventListener("visibilitychange", handleVisibilityChange)

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }

      // Clean up squares
      squares.current.forEach((square) => {
        if (square.element && square.element.parentNode) {
          square.element.parentNode.removeChild(square.element)
        }
      })

      // Kill ScrollTrigger instances
      scrollTrigger.kill()

      clearTimeout(scrollTimeout)
      clearTimeout(mouseTimeout)
    }
  }, [handleScroll, handleMouseMove, handleVisibilityChange, settings])

  return (
    <div
      ref={containerRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden"
      style={{
        zIndex: 0,
        willChange: "transform",
        backfaceVisibility: "hidden",
      }}
      aria-hidden="true"
    />
  )
}
