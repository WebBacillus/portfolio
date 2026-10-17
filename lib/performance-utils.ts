"use client"

// Performance monitoring utilities for animations
export class PerformanceMonitor {
  private frameCount = 0
  private lastTime = 0
  private fps = 60
  private fpsHistory: number[] = []
  private maxHistoryLength = 60 // Track last 60 frames

  constructor(private onPerformanceChange?: (fps: number, isLowPerformance: boolean) => void) {}

  update() {
    if (typeof window === "undefined") return

    const now = performance.now()

    if (this.lastTime > 0) {
      const delta = now - this.lastTime
      const currentFps = 1000 / delta

      this.fpsHistory.push(currentFps)
      if (this.fpsHistory.length > this.maxHistoryLength) {
        this.fpsHistory.shift()
      }

      // Calculate average FPS
      this.fps = this.fpsHistory.reduce((sum, fps) => sum + fps, 0) / this.fpsHistory.length

      // Detect low performance (below 30 FPS consistently)
      const isLowPerformance = this.fps < 30 && this.fpsHistory.length >= 30

      if (this.onPerformanceChange) {
        this.onPerformanceChange(this.fps, isLowPerformance)
      }
    }

    this.lastTime = now
    this.frameCount++
  }

  getFPS(): number {
    return Math.round(this.fps)
  }

  reset() {
    this.frameCount = 0
    this.lastTime = 0
    this.fpsHistory = []
  }
}

// Throttle function for better performance
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Debounce function for resize events
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}

// Check if device supports hardware acceleration
export function supportsHardwareAcceleration(): boolean {
  if (typeof window === "undefined") return false

  const canvas = document.createElement("canvas")
  const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
  return !!gl
}

// Detect if user prefers reduced motion
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

// Get device performance tier
export function getDevicePerformanceTier(): "low" | "medium" | "high" {
  if (typeof window === "undefined") return "medium"

  const hardwareConcurrency = navigator.hardwareConcurrency || 2
  const memory = (navigator as any).deviceMemory || 4

  if (hardwareConcurrency >= 8 && memory >= 8) {
    return "high"
  } else if (hardwareConcurrency >= 4 && memory >= 4) {
    return "medium"
  } else {
    return "low"
  }
}

// Adaptive quality settings based on device performance
export function getAdaptiveSettings() {
  if (typeof window === "undefined") {
    return {
      particleCount: 50,
      animationSpeed: 0.7,
      enableParallax: false,
      enablePulse: false,
    }
  }

  const performanceTier = getDevicePerformanceTier()
  const reducedMotion = prefersReducedMotion()

  if (reducedMotion) {
    return {
      particleCount: 5,
      animationSpeed: 0.1,
      enableParallax: false,
      enablePulse: false,
    }
  }

  switch (performanceTier) {
    case "high":
      return {
        particleCount: 100,
        animationSpeed: 1,
        enableParallax: true,
        enablePulse: true,
      }
    case "medium":
      return {
        particleCount: 100,
        animationSpeed: 0.8,
        enableParallax: true,
        enablePulse: false,
      }
    case "low":
      return {
        particleCount: 100,
        animationSpeed: 0.5,
        enableParallax: false,
        enablePulse: false,
      }
    default:
      return {
        particleCount: 100,
        animationSpeed: 0.7,
        enableParallax: true,
        enablePulse: false,
      }
  }
}
