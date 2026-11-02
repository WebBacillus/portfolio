"use client"

import { useEffect, useRef, useState } from "react"
import gsap from "gsap"

/**
 * Bracket cursor adapted from maimaiproleague.net: a center dot plus four
 * L-shaped corner brackets that slowly spin while idle and snap to the
 * bounding box of any element carrying `data-cursor-target`.
 *
 * Mark interactive surfaces with `data-cursor-target` and they get the frame.
 *
 * Geometry is ported from the reference site (verified against its live DOM):
 * each bracket is a 12px box whose visible L sits BRACKET_OUTSET px outside
 * the target corner, positioned relative to the cursor origin via GSAP x/y.
 *
 * Improvements over the reference: disabled for coarse pointers and
 * reduced-motion users, native caret kept over editable fields, and bracket
 * positions are re-anchored every frame so they stay locked to the target
 * while the cursor follower settles.
 */

const TARGET_SELECTOR = "[data-cursor-target]"
const EDITABLE_SELECTOR = "input, textarea, select, [contenteditable='true']"

/** Bracket box size in px. */
const BRACKET_SIZE = 12
/** Gap between each bracket and the target edge in px. */
const BRACKET_OUTSET = 3
/** Pointer-driven bracket drift; the reference uses 5e-5 (effectively static). */
const PARALLAX_STRENGTH = 5e-5
/** Seconds per idle revolution. */
const SPIN_DURATION = 2
/** Cursor follow duration in seconds. */
const FOLLOW_DURATION = 0.1
/** Bracket snap duration when entering a target. */
const SNAP_DURATION = 0.2
/** Bracket release duration when leaving a target. */
const RELEASE_DURATION = 0.3

/** Bracket box offsets from the cursor origin while idle. */
const IDLE_OFFSETS = [
  { x: -BRACKET_SIZE * 1.5, y: -BRACKET_SIZE * 1.5 },
  { x: BRACKET_SIZE * 0.5, y: -BRACKET_SIZE * 1.5 },
  { x: BRACKET_SIZE * 0.5, y: BRACKET_SIZE * 0.5 },
  { x: -BRACKET_SIZE * 1.5, y: BRACKET_SIZE * 0.5 },
]

const BRACKET_CLASSES = [
  "border-l-[1.5px] border-t-[1.5px]",
  "border-r-[1.5px] border-t-[1.5px]",
  "border-b-[1.5px] border-r-[1.5px]",
  "border-b-[1.5px] border-l-[1.5px]",
]

interface TargetRect {
  left: number
  top: number
  right: number
  bottom: number
  centerX: number
  centerY: number
}

/** Bracket box top-left positions in viewport coordinates for a target rect. */
function bracketBoxes(rect: TargetRect) {
  const outset = BRACKET_OUTSET
  const size = BRACKET_SIZE
  return [
    { x: rect.left - outset, y: rect.top - outset },
    { x: rect.right + outset - size, y: rect.top - outset },
    { x: rect.right + outset - size, y: rect.bottom + outset - size },
    { x: rect.left - outset, y: rect.bottom + outset - size },
  ]
}

export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLSpanElement>(null)
  const bracketsRef = useRef<HTMLDivElement>(null)

  // The cursor only makes sense for a fine pointer, and it is pure motion,
  // so reduced-motion visitors keep the native cursor instead.
  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)")
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setEnabled(finePointer.matches && !reducedMotion.matches)
    sync()
    finePointer.addEventListener("change", sync)
    reducedMotion.addEventListener("change", sync)
    return () => {
      finePointer.removeEventListener("change", sync)
      reducedMotion.removeEventListener("change", sync)
    }
  }, [])

  useEffect(() => {
    const container = containerRef.current
    const dot = dotRef.current
    const brackets = bracketsRef.current
    if (!enabled || !container || !dot || !brackets) return

    const corners = Array.from(brackets.children) as HTMLElement[]
    if (corners.length !== IDLE_OFFSETS.length) return

    document.documentElement.classList.add("custom-cursor")

    const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const blend = { value: 0 }
    let target: HTMLElement | null = null
    let targetRect: TargetRect | null = null
    let spin: gsap.core.Timeline | null = null
    let hiddenOverEditable = false
    let moveFrame = 0
    let scrollFrame = 0

    const readRect = (element: HTMLElement): TargetRect => {
      const rect = element.getBoundingClientRect()
      return {
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        centerX: rect.left + rect.width / 2,
        centerY: rect.top + rect.height / 2,
      }
    }

    const followX = gsap.quickTo(container, "x", { duration: FOLLOW_DURATION, ease: "power3.out" })
    const followY = gsap.quickTo(container, "y", { duration: FOLLOW_DURATION, ease: "power3.out" })

    const startSpin = () => {
      spin?.kill()
      spin = gsap.timeline({ repeat: -1 }).to(container, { rotation: "+=360", duration: SPIN_DURATION, ease: "none" })
    }

    const stopSpin = () => {
      spin?.kill()
      spin = null
      gsap.set(container, { rotation: 0 })
    }

    const setTarget = (element: HTMLElement | null) => {
      if (element === target) return
      target = element
      if (element) {
        targetRect = readRect(element)
        stopSpin()
        gsap.to(blend, { value: 1, duration: SNAP_DURATION, ease: "power2.out", overwrite: true })
      } else {
        targetRect = null
        startSpin()
        gsap.to(blend, { value: 0, duration: RELEASE_DURATION, ease: "power3.out", overwrite: true })
      }
    }

    // Re-anchored every frame so the brackets stay on the target box even
    // while the cursor follower is still catching up to the pointer.
    const renderBrackets = () => {
      if (target && !target.isConnected) setTarget(null)

      // Re-read every frame: the target can move on its own (magnetic buttons
      // translate toward the pointer) and the frame has to stay locked on it.
      if (target) targetRect = readRect(target)

      const originX = gsap.getProperty(container, "x") as number
      const originY = gsap.getProperty(container, "y") as number
      const boxes = targetRect ? bracketBoxes(targetRect) : null
      const progress = blend.value
      const driftX = targetRect ? (pointer.x - targetRect.centerX) * PARALLAX_STRENGTH * progress : 0
      const driftY = targetRect ? (pointer.y - targetRect.centerY) * PARALLAX_STRENGTH * progress : 0

      corners.forEach((corner, index) => {
        const idle = IDLE_OFFSETS[index]
        let x = idle.x
        let y = idle.y
        if (boxes) {
          const box = boxes[index]
          x = idle.x + (box.x - originX - idle.x) * progress
          y = idle.y + (box.y - originY - idle.y) * progress
        }
        gsap.set(corner, { x: x + driftX, y: y + driftY })
      })
    }

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return
      pointer.x = event.clientX
      pointer.y = event.clientY
      followX(pointer.x)
      followY(pointer.y)
      if (moveFrame) return
      moveFrame = requestAnimationFrame(() => {
        moveFrame = 0
        const element = event.target instanceof Element ? event.target : null
        const overEditable = element?.closest(EDITABLE_SELECTOR) != null
        if (overEditable !== hiddenOverEditable) {
          hiddenOverEditable = overEditable
          gsap.to(container, { opacity: overEditable ? 0 : 1, duration: 0.2, overwrite: "auto" })
        }
        setTarget(element?.closest<HTMLElement>(TARGET_SELECTOR) ?? null)
        if (target) targetRect = readRect(target)
      })
    }

    // Scrolling can move a target out from under a stationary pointer.
    // Capture phase so scrolls of any scroller are seen, not just the window.
    const onScroll = () => {
      if (scrollFrame) return
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0
        const element = document.elementFromPoint(pointer.x, pointer.y)
        setTarget(element?.closest<HTMLElement>(TARGET_SELECTOR) ?? null)
        if (target) targetRect = readRect(target)
      })
    }

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "touch") return
      gsap.to(dot, { scale: 0.7, duration: 0.3 })
      gsap.to(container, { scale: 0.9, duration: 0.2 })
    }

    const onPointerUp = () => {
      gsap.to(dot, { scale: 1, duration: 0.3 })
      gsap.to(container, { scale: 1, duration: 0.2 })
    }

    gsap.set(container, { x: pointer.x, y: pointer.y })
    gsap.to(container, { opacity: 1, duration: 0.3 })
    startSpin()
    gsap.ticker.add(renderBrackets)

    window.addEventListener("pointermove", onPointerMove, { passive: true })
    window.addEventListener("pointerdown", onPointerDown, { passive: true })
    window.addEventListener("pointerup", onPointerUp, { passive: true })
    window.addEventListener("blur", onPointerUp)
    document.addEventListener("scroll", onScroll, { passive: true, capture: true })

    return () => {
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerdown", onPointerDown)
      window.removeEventListener("pointerup", onPointerUp)
      window.removeEventListener("blur", onPointerUp)
      document.removeEventListener("scroll", onScroll, { capture: true })
      if (moveFrame) cancelAnimationFrame(moveFrame)
      if (scrollFrame) cancelAnimationFrame(scrollFrame)
      gsap.ticker.remove(renderBrackets)
      spin?.kill()
      gsap.killTweensOf([container, dot, ...corners, blend])
      document.documentElement.classList.remove("custom-cursor")
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[9999] isolate h-0 w-0 opacity-0 mix-blend-difference"
      style={{ willChange: "transform" }}
    >
      <span
        ref={dotRef}
        className="absolute left-0 top-0 -ml-px -mt-px block h-0.5 w-0.5 rounded-full bg-white"
        style={{ willChange: "transform" }}
      />
      <div ref={bracketsRef}>
        {BRACKET_CLASSES.map((className) => (
          <span
            key={className}
            className={`absolute left-0 top-0 block h-3 w-3 border-white ${className}`}
            style={{ willChange: "transform" }}
          />
        ))}
      </div>
    </div>
  )
}
