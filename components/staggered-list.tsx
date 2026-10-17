"use client"

import { useRef, type ReactNode } from "react"
import { useStaggerAnimation } from "@/lib/gsap-utils"

interface StaggeredListProps {
  children: ReactNode
  className?: string
  itemSelector: string
  stagger?: number
  delay?: number
  threshold?: string
}

export default function StaggeredList({
  children,
  className = "",
  itemSelector,
  stagger = 0.1,
  delay = 0,
  threshold = "top 80%",
}: StaggeredListProps) {
  const listRef = useRef<HTMLDivElement>(null)

  useStaggerAnimation(listRef, itemSelector, {
    stagger,
    delay,
    start: threshold,
  })

  return (
    <div ref={listRef} className={className}>
      {children}
    </div>
  )
}
