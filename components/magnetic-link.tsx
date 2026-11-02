"use client"

import { useEffect, useRef, type ReactNode } from "react"
import gsap from "gsap"
import { CustomEase } from "gsap/CustomEase"
import { CustomWiggle } from "gsap/CustomWiggle"
import TransitionLink from "@/components/transition-link"

interface MagneticLinkProps {
  href: string
  children: ReactNode
  className: string
  download?: string
  target?: string
  rel?: string
  transition?: boolean
  wiggle?: boolean
}

export default function MagneticLink({
  href,
  children,
  className,
  download,
  target,
  rel,
  transition = false,
  wiggle = false,
}: MagneticLinkProps) {
  const zoneRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const zone = zoneRef.current
    const link = zone?.querySelector<HTMLAnchorElement>("a")
    const label = link?.querySelector<HTMLElement>("[data-magnetic-label]")
    if (!zone || !link || !label) return

    const hasFinePointer = window.matchMedia("(pointer: fine)").matches
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (!hasFinePointer || prefersReducedMotion) return

    gsap.registerPlugin(CustomEase, CustomWiggle)

    if (wiggle) {
      gsap.to(link, {
        rotation: 1.5,
        duration: 1.1,
        repeat: -1,
        repeatDelay: 4,
        ease: "wiggle({wiggles: 3, type: easeOut})",
      })
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return

      const bounds = zone.getBoundingClientRect()
      const buttonStrength = 0.4
      const labelStrength = 0.24
      const pointerX = gsap.utils.mapRange(bounds.left, bounds.right, -bounds.width / 2, bounds.width / 2, event.clientX)
      const pointerY = gsap.utils.mapRange(bounds.top, bounds.bottom, -bounds.height / 2, bounds.height / 2, event.clientY)
      const x = pointerX * buttonStrength
      const y = pointerY * buttonStrength

      gsap.to(link, {
        x,
        y,
        duration: 0.4,
        ease: "power2.out",
        overwrite: "auto",
      })
      gsap.to(label, {
        x: pointerX * labelStrength,
        y: pointerY * labelStrength,
        duration: 0.4,
        ease: "power2.out",
        overwrite: "auto",
      })
    }

    const handlePointerLeave = () => {
      gsap.to(link, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: "elastic.out(1, 0.4)",
        overwrite: "auto",
      })
      gsap.to(label, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: "power2.out",
        overwrite: "auto",
      })
    }

    zone.addEventListener("pointermove", handlePointerMove)
    zone.addEventListener("pointerleave", handlePointerLeave)

    return () => {
      zone.removeEventListener("pointermove", handlePointerMove)
      zone.removeEventListener("pointerleave", handlePointerLeave)
      gsap.killTweensOf([link, label])
    }
  }, [wiggle])

  const label = <span data-magnetic-label className="inline-flex items-center whitespace-nowrap">{children}</span>

  return (
    <span ref={zoneRef} className="relative inline-flex p-2 -m-2">
      {transition ? (
        <TransitionLink href={href} className={className}>
          {label}
        </TransitionLink>
      ) : (
        <a href={href} download={download} target={target} rel={rel} className={className}>
          {label}
        </a>
      )}
    </span>
  )
}
