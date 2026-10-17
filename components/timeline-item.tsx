"use client"

import { useRef, useEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

interface TimelineItemProps {
  year: string
  title: string
  description: string
  index: number
  skills?: string[]
}

export default function TimelineItem({ year, title, description, index, skills = [] }: TimelineItemProps) {
  const itemRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (typeof window === "undefined" || !itemRef.current) return

    gsap.registerPlugin(ScrollTrigger)

    const item = itemRef.current
    const isLeft = index % 2 === 0
    const dot = item.querySelector(".timeline-dot")

    // Set initial states
    gsap.set(item, {
      opacity: 0,
      x: isLeft ? -120 : 120,
      y: 60,
      scale: 0.8,
      rotationY: isLeft ? -15 : 15,
    })

    if (dot) {
      gsap.set(dot, {
        scale: 0,
        opacity: 0,
        rotation: 180,
      })
    }

    // Create scroll trigger for each timeline item
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: item,
        start: "top 85%",
        end: "bottom 15%",
        toggleActions: "play none none reverse",
        onEnter: () => {
          // Add pulse animation to dot when item enters
          if (dot) {
            gsap.to(dot, {
              boxShadow: "0 0 20px rgba(107, 70, 193, 0.6)",
              duration: 1,
              yoyo: true,
              repeat: -1,
              ease: "sine.inOut",
            })
          }
        },
        onLeave: () => {
          // Stop pulse animation when leaving
          if (dot) {
            gsap.killTweensOf(dot)
            gsap.set(dot, { boxShadow: "none" })
          }
        },
        onEnterBack: () => {
          // Restart pulse animation when scrolling back
          if (dot) {
            gsap.to(dot, {
              boxShadow: "0 0 20px rgba(107, 70, 193, 0.6)",
              duration: 1,
              yoyo: true,
              repeat: -1,
              ease: "sine.inOut",
            })
          }
        },
        onLeaveBack: () => {
          // Stop pulse animation when leaving upward
          if (dot) {
            gsap.killTweensOf(dot)
            gsap.set(dot, { boxShadow: "none" })
          }
        },
      },
    })

    // Animate the timeline dot first
    if (dot) {
      tl.to(dot, {
        scale: 1,
        opacity: 1,
        rotation: 0,
        duration: 0.6,
        ease: "back.out(1.7)",
      })
    }

    // Then animate the main content
    tl.to(
      item,
      {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        rotationY: 0,
        duration: 1,
        ease: "power3.out",
      },
      "-=0.3",
    )

    // Animate skills tags if they exist
    const skillTags = item.querySelectorAll(".skill-tag-timeline")
    if (skillTags.length > 0) {
      gsap.set(skillTags, {
        opacity: 0,
        scale: 0.7,
        y: 20,
      })

      tl.to(
        skillTags,
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: "back.out(1.7)",
        },
        "-=0.5",
      )
    }

    // Add hover animations
    const handleMouseEnter = () => {
      gsap.to(item, {
        scale: 1.03,
        y: -8,
        duration: 0.4,
        ease: "power2.out",
      })

      if (dot) {
        gsap.to(dot, {
          scale: 1.3,
          duration: 0.3,
          ease: "back.out(1.7)",
        })
      }
    }

    const handleMouseLeave = () => {
      gsap.to(item, {
        scale: 1,
        y: 0,
        duration: 0.4,
        ease: "power2.out",
      })

      if (dot) {
        gsap.to(dot, {
          scale: 1,
          duration: 0.3,
          ease: "power2.out",
        })
      }
    }

    item.addEventListener("mouseenter", handleMouseEnter)
    item.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      tl.kill()
      item.removeEventListener("mouseenter", handleMouseEnter)
      item.removeEventListener("mouseleave", handleMouseLeave)
      tl.scrollTrigger?.kill()
      gsap.killTweensOf([item, ...(dot ? [dot] : []), ...Array.from(skillTags)])
    }
  }, [index])

  return (
    <div className={`flex ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} flex-col mb-12 relative`}>
      <div className="md:w-1/2 flex justify-center items-center">
        <div ref={itemRef} className="bg-purple/10 p-4 rounded-lg backdrop-blur-sm w-full md:max-w-md transform-gpu">
          <div className="text-purple font-bold text-lg md:text-xl mb-2">{year}</div>
          <h3 className="text-xl md:text-2xl font-bold mb-2">{title}</h3>
          <p className="text-black/70 mb-3 text-sm md:text-base">{description}</p>

          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {skills.map((skill, i) => (
                <span
                  key={i}
                  className="skill-tag-timeline text-xs px-2 py-1 rounded-full bg-purple/20 text-purple font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="md:w-1/2 relative flex justify-center">
        {/* For mobile, show a horizontal line */}
        <div className="md:hidden absolute w-px h-full bg-purple/30 left-4 top-0"></div>
        <div className="md:hidden timeline-dot absolute left-4 top-0 w-4 h-4 rounded-full bg-purple -translate-x-1/2"></div>

        {/* For desktop, show a vertical line */}
        <div className="hidden md:block absolute h-full w-px bg-purple/30 top-0"></div>
        <div className="hidden md:block timeline-dot absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-purple"></div>
      </div>
    </div>
  )
}
