"use client"

import { useEffect, useRef, type ReactNode } from "react"

interface InteractiveParticleTitleProps {
  children: ReactNode
  className?: string
  accessibleLabel?: string
  onReveal?: () => void
}

interface Particle {
  x: number
  y: number
  originX: number
  originY: number
  alpha: number
}

export default function InteractiveParticleTitle({
  children,
  className = "",
  accessibleLabel,
  onReveal,
}: InteractiveParticleTitleProps) {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const title = titleRef.current
    const textLayer = textRef.current
    const canvas = canvasRef.current
    const context = canvas?.getContext("2d")
    if (!title || !textLayer || !canvas || !context) {
      onReveal?.()
      return
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onReveal?.()
      return
    }

    const text = typeof children === "string" ? children : textLayer.textContent || ""
    let particles: Particle[] = []
    let width = 0
    let height = 0
    let pixelRatio = 1
    let particleRadius = 1
    let particleColor = ""
    let animationFrame = 0
    let resizeFrame = 0
    let revealTimer: number | undefined
    let revealed = false
    let revealAfterSettle = false
    let revealCallbackCalled = false
    let disposed = false

    const callReveal = () => {
      if (revealCallbackCalled) return
      revealCallbackCalled = true
      onReveal?.()
    }

    const draw = () => {
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      context.clearRect(0, 0, width, height)
      context.fillStyle = particleColor

      for (const particle of particles) {
        context.globalAlpha = particle.alpha
        context.beginPath()
        context.arc(particle.x, particle.y, particleRadius, 0, Math.PI * 2)
        context.fill()
      }

      context.globalAlpha = 1
    }

    const animateBackToText = () => {
      animationFrame = 0
      let particlesMoving = false

      for (const particle of particles) {
        const deltaX = (particle.originX - particle.x) * 0.1
        const deltaY = (particle.originY - particle.y) * 0.1
        particle.x += deltaX
        particle.y += deltaY

        if (Math.abs(deltaX) > 0.2 || Math.abs(deltaY) > 0.2) particlesMoving = true
      }

      if (particlesMoving) {
        draw()
        animationFrame = requestAnimationFrame(animateBackToText)
      } else {
        particles.forEach((particle) => {
          particle.x = particle.originX
          particle.y = particle.originY
        })
        draw()
        if (revealAfterSettle && !revealed) {
          revealed = true
          revealAfterSettle = false
          callReveal()
        }
      }
    }

    const startReturnAnimation = () => {
      if (!animationFrame) animationFrame = requestAnimationFrame(animateBackToText)
    }

    const buildParticles = () => {
      const bounds = title.getBoundingClientRect()
      width = bounds.width
      height = bounds.height
      if (!width || !height) return false

      pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.max(1, Math.round(width * pixelRatio))
      canvas.height = Math.max(1, Math.round(height * pixelRatio))
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      const source = document.createElement("canvas")
      source.width = canvas.width
      source.height = canvas.height
      const sourceContext = source.getContext("2d", { willReadFrequently: true })
      if (!sourceContext) return false

      sourceContext.scale(pixelRatio, pixelRatio)
      sourceContext.font = window.getComputedStyle(title).font
      sourceContext.fillStyle = window.getComputedStyle(title).color
      sourceContext.textAlign = "center"
      sourceContext.textBaseline = "middle"

      const lines = text.split("\n")
      const lineElements = Array.from(textLayer.children)
      lines.forEach((line, index) => {
        const lineElement = lineElements[index] as HTMLElement | undefined
        const lineBounds = lineElement?.getBoundingClientRect()
        const x = lineBounds ? lineBounds.left - bounds.left + lineBounds.width / 2 : width / 2
        const y = lineBounds ? lineBounds.top - bounds.top + lineBounds.height / 2 : height / 2
        sourceContext.fillText(line, x, y)
      })

      const imageData = sourceContext.getImageData(0, 0, source.width, source.height)
      const sampleStep = Math.max(3, Math.ceil(Math.sqrt((source.width * source.height) / 12000)))
      const nextParticles: Particle[] = []

      for (let y = 0; y < source.height; y += sampleStep) {
        for (let x = 0; x < source.width; x += sampleStep) {
          const sampleX = Math.min(x + Math.floor(sampleStep / 2), source.width - 1)
          const sampleY = Math.min(y + Math.floor(sampleStep / 2), source.height - 1)
          const alpha = imageData.data[(sampleY * source.width + sampleX) * 4 + 3]
          if (alpha < 64) continue

          const originX = sampleX / pixelRatio
          const originY = sampleY / pixelRatio
          const initialSpread = revealed ? 0 : 36
          nextParticles.push({
            x: originX + (Math.random() - 0.5) * initialSpread,
            y: originY + (Math.random() - 0.5) * initialSpread,
            originX,
            originY,
            alpha: alpha / 255,
          })
        }
      }

      if (!nextParticles.length) return false

      particles = nextParticles
      particleRadius = Math.max(0.8, (sampleStep / pixelRatio) * 0.4)
      particleColor = window.getComputedStyle(title).color
      textLayer.style.color = "transparent"
      draw()

      if (!revealed) {
        revealTimer = window.setTimeout(() => {
          revealAfterSettle = true
          startReturnAnimation()
        }, 900)
      }

      return true
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !particles.length) return

      const bounds = title.getBoundingClientRect()
      const pointerX = event.clientX - bounds.left
      const pointerY = event.clientY - bounds.top
      const radius = Math.min(100, Math.max(48, width * 0.07))
      const maxOffset = Math.min(56, width * 0.08)

      for (const particle of particles) {
        const deltaX = particle.x - pointerX
        const deltaY = particle.y - pointerY
        const distance = Math.hypot(deltaX, deltaY)
        if (distance >= radius) continue

        const force = (1 - distance / radius) * 16
        const directionX = distance ? deltaX / distance : Math.random() - 0.5
        const directionY = distance ? deltaY / distance : Math.random() - 0.5
        particle.x = Math.max(particle.originX - maxOffset, Math.min(particle.originX + maxOffset, particle.x + directionX * force))
        particle.y = Math.max(particle.originY - maxOffset, Math.min(particle.originY + maxOffset, particle.y + directionY * force))
      }

      startReturnAnimation()
    }

    const initialize = () => {
      if (disposed) return
      if (!buildParticles()) {
        textLayer.style.color = ""
        callReveal()
      }
    }

    const handleResize = () => {
      if (resizeFrame) cancelAnimationFrame(resizeFrame)
      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = 0
        if (revealTimer) window.clearTimeout(revealTimer)
        if (animationFrame) cancelAnimationFrame(animationFrame)
        animationFrame = 0
        initialize()
      })
    }

    const handleFontsReady = () => {
      if (!disposed) initialize()
    }

    void document.fonts.ready.then(handleFontsReady)
    window.addEventListener("resize", handleResize)
    title.addEventListener("pointermove", handlePointerMove)

    return () => {
      disposed = true
      window.removeEventListener("resize", handleResize)
      title.removeEventListener("pointermove", handlePointerMove)
      if (resizeFrame) cancelAnimationFrame(resizeFrame)
      if (animationFrame) cancelAnimationFrame(animationFrame)
      if (revealTimer) window.clearTimeout(revealTimer)
      textLayer.style.color = ""
    }
  }, [children, onReveal])

  const titleContent = typeof children === "string" && children.includes("\n")
    ? children.split("\n").map((line, index) => <span key={index} className="block whitespace-nowrap">{line}</span>)
    : children

  return (
    <h1
      ref={titleRef}
      aria-label={accessibleLabel}
      className={`relative ${className} font-black lg:text-[15vw] md:text-[12vw] text-[15vw] w-full`}
      style={{ fontFamily: "'Gabarito', sans-serif" }}
    >
      <span ref={textRef} className="relative z-0 block">{titleContent}</span>
      <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 h-full w-full" />
    </h1>
  )
}
