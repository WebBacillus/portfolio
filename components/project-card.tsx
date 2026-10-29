"use client"

import Image from "next/image"
import Link from "next/link"
import { ExternalLink, Github, ArrowRight } from "lucide-react"
import { useRef, useEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { addHoverAnimation } from "@/lib/gsap-utils"

interface ProjectCardProps {
  slug: string
  title: string
  description: string
  image: string
  tags: string[]
  liveUrl?: string
  repoUrl?: string
  featured?: boolean
}

export default function ProjectCard({
  slug,
  title,
  description,
  image,
  tags,
  liveUrl,
  repoUrl,
  featured = false,
}: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const tagsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    gsap.registerPlugin(ScrollTrigger)

    const card = cardRef.current
    const image = imageRef.current
    const content = contentRef.current
    const tagsContainer = tagsRef.current

    if (!card || !image || !content || !tagsContainer) return

    // Create scroll trigger for the card
    const scrollTrigger = ScrollTrigger.create({
      trigger: card,
      start: "top bottom-=100",
      once: true,
      onEnter: () => {
        // Animate the card when it enters the viewport
        gsap.fromTo(card, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" })

        // Animate the image with a slight delay
        gsap.fromTo(
          image,
          { scale: 1.1, opacity: 0.8 },
          { scale: 1, opacity: 1, duration: 1, delay: 0.2, ease: "power2.out" },
        )

        // Animate the content
        gsap.fromTo(
          content.children,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, delay: 0.3, ease: "power2.out" },
        )

        // Animate the tags with a stagger effect
        gsap.fromTo(
          tagsContainer.children,
          { scale: 0.8, opacity: 0 },
          { scale: 1, opacity: 1, stagger: 0.05, duration: 0.4, delay: 0.5, ease: "back.out(1.7)" },
        )
      },
    })

    // Set up hover animations
    const hoverTimeline = gsap.timeline({ paused: true })

    hoverTimeline
      .to(image.firstChild, { scale: 1.05, duration: 0.5, ease: "power1.out" }, 0)
      .to(card, { boxShadow: "0 10px 30px rgba(107, 70, 193, 0.15)", y: -5, duration: 0.5, ease: "power2.out" }, 0)

    // Add event listeners for hover
    const handleMouseEnter = () => hoverTimeline.play()
    const handleMouseLeave = () => hoverTimeline.reverse()
    card.addEventListener("mouseenter", handleMouseEnter)
    card.addEventListener("mouseleave", handleMouseLeave)

    // Set up link hover animations
    const links = card.querySelectorAll("a")
    const cleanupFunctions: (() => void)[] = []

    links.forEach((link) => {
      if (link.querySelector("svg")) {
        const cleanup = addHoverAnimation(link as HTMLElement, { x: 3 }, { x: 0 })
        if (cleanup) cleanupFunctions.push(cleanup)
      }
    })

    return () => {
      // Clean up animations and event listeners
      scrollTrigger.kill()
      hoverTimeline.kill()
      card.removeEventListener("mouseenter", handleMouseEnter)
      card.removeEventListener("mouseleave", handleMouseLeave)
      gsap.killTweensOf([card, image, content.children, tagsContainer.children])
      cleanupFunctions.forEach((cleanup) => cleanup())
    }
  }, [])

  return (
    <div
      ref={cardRef}
      className={`bg-white/80 rounded-lg shadow-md overflow-hidden backdrop-blur-sm transform-gpu h-full ${featured ? "md:col-span-2" : ""}`}
      style={{ opacity: 0 }} // Initial state for animation
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 h-full">
        <div ref={imageRef} className={`relative overflow-hidden ${featured ? "h-[250px] md:h-[400px]" : "h-[200px]"} ${!featured && "md:h-full"}`}>
          <Link href={`/work/${slug}`} aria-label={`View details for ${title}`} className="relative block h-full w-full">
          <Image
            src={image || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 loaded"
            priority
          />
          </Link>
        </div>

        <div ref={contentRef} className="p-4 md:p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3 text-black">{title}</h3>
            <p className="text-black/70 mb-4 text-sm md:text-base">{description}</p>

            <div ref={tagsRef} className="flex flex-wrap gap-2 mb-4 md:mb-6">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="text-xs md:text-sm px-2 md:px-3 py-1 rounded-full bg-purple/10 text-dark-purple"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3 justify-end">
            {liveUrl && (
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-purple hover:text-dark-purple transition-colors duration-300 text-sm md:text-base"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                <span>Live Demo</span>
              </a>
            )}

            {repoUrl && (
              <a
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-purple hover:text-dark-purple transition-colors duration-300 text-sm md:text-base"
              >
                <Github className="w-4 h-4 mr-1" />
                <span>Repository</span>
              </a>
            )}
            <Link href={`/work/${slug}`} className="flex items-center ml-auto text-purple hover:text-dark-purple text-sm md:text-base">
              <span>Details</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
