"use client"
import Image from "next/image"
import { Github, Linkedin } from "lucide-react"
import { usePathname } from "next/navigation"
import { useRef, useEffect, useState } from "react"
import gsap from "gsap"
import useMobile from "@/hooks/use-mobile"
import TransitionLink from "@/components/transition-link"
import { addHoverAnimation } from "@/lib/gsap-utils"

export default function Header() {
  const pathname = usePathname()
  const headerRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const socialRef = useRef<HTMLDivElement>(null)
  const [scrolled, setScrolled] = useState(false)
  const isMobile = useMobile()

  // Check if a path is active
  const isActive = (path: string) => pathname === path

  // Initial animations
  useEffect(() => {
    const tl = gsap.timeline()

    // Header animation
    if (headerRef.current) {
      tl.fromTo(headerRef.current, { y: -50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" })
    }

    // Logo animation with bounce effect
    if (logoRef.current) {
      tl.fromTo(
        logoRef.current,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.8, ease: "elastic.out(1, 0.5)" },
        "-=0.3",
      )
    }

    // Nav items staggered animation
    if (navRef.current) {
      const navItems = navRef.current.querySelectorAll("a")
      tl.fromTo(
        navItems,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.5, ease: "power2.out" },
        "-=0.5",
      )
    }

    // Social icons animation
    if (socialRef.current) {
      const socialItems = socialRef.current.querySelectorAll("a")
      tl.fromTo(
        socialItems,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, stagger: 0.1, duration: 0.5, ease: "back.out(1.7)" },
        "-=0.3",
      )
    }

    return () => tl.kill()
  }, [])

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled)

        // Animate header on scroll
        if (headerRef.current) {
          gsap.to(headerRef.current, {
            backgroundColor: isScrolled ? "rgba(255, 255, 255, 0.9)" : "transparent",
            boxShadow: isScrolled ? "0 4px 20px rgba(0, 0, 0, 0.05)" : "none",
            height: isScrolled ? "70px" : "80px",
            duration: 0.3,
            ease: "power2.out",
          })
        }

        // Scale logo slightly on scroll
        if (logoRef.current) {
          gsap.to(logoRef.current, {
            scale: isScrolled ? 0.9 : 1,
            duration: 0.3,
            ease: "power2.out",
          })
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [scrolled])

  // Setup hover animations for nav links
  useEffect(() => {
    if (!navRef.current) return
    const cleanupFunctions: (() => void)[] = []

    const navLinks = navRef.current.querySelectorAll("a")
    navLinks.forEach((link) => {
      // Skip the active link
      if (link.getAttribute("href") === pathname) return

      const cleanup = addHoverAnimation(link as HTMLElement, { color: "#6b46c1", y: -2 }, { color: "#1a1a1a", y: 0 })

      if (cleanup) cleanupFunctions.push(cleanup)
    })

    // Clean up
    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup())
    }
  }, [pathname])

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-40 transition-all duration-300 pt-safe"
      style={{ height: "80px" }}
    >
      <div className="container mx-auto px-4">
        <div className="relative flex justify-between items-center h-full">
          {/* Logo */}
          <TransitionLink href="/" className="flex items-center">
            <div
              ref={logoRef}
              className="w-10 h-10 transition-transform duration-300 relative"
              onMouseEnter={() => {
                gsap.to(logoRef.current, {
                  rotate: 10,
                  scale: 1.1,
                  duration: 0.3,
                  ease: "power2.out",
                })
              }}
              onMouseLeave={() => {
                gsap.to(logoRef.current, {
                  rotate: 0,
                  scale: scrolled ? 0.9 : 1,
                  duration: 0.3,
                  ease: "power2.out",
                })
              }}
            >
              <Image src="/images/logo.png" alt="Ghost Logo" fill className="object-contain" sizes="40px" priority />
            </div>
          </TransitionLink>

          {/* Navigation - Only visible on desktop */}
          <nav ref={navRef} className="hidden md:flex space-x-8 relative">
            {[
              { path: "/", label: "INDEX" },
              { path: "/work", label: "WORK" },
              { path: "/about", label: "ABOUT" },
              { path: "/contact", label: "CONTACT" },
            ].map((item) => (
              <TransitionLink
                key={item.path}
                href={item.path}
                className={`py-2 px-1 transition-colors duration-300 relative ${
                  isActive(item.path) ? "text-purple font-medium" : "text-black"
                }`}
              >
                {item.label}
              </TransitionLink>
            ))}
          </nav>

          {/* Social icons - Only visible on desktop */}
          <div ref={socialRef} className="hidden md:flex space-x-4">
            {[
              {
                href: "https://github.com/WebBacillus",
                icon: <Github className="w-5 h-5" />,
                label: "Github",
              },
              {
                href: "https://www.linkedin.com/in/pasit-khumsena-918616352/",
                icon: <Linkedin className="w-5 h-5" />,
                label: "LinkedIn",
              },
            ].map((social, index) => (
              <a
                key={index}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="hover:text-purple transition-colors duration-300"
                onMouseEnter={(e) => {
                  gsap.to(e.currentTarget, {
                    scale: 1.2,
                    rotate: index === 0 ? 5 : -5,
                    duration: 0.3,
                    ease: "back.out(1.7)",
                  })
                }}
                onMouseLeave={(e) => {
                  gsap.to(e.currentTarget, {
                    scale: 1,
                    rotate: 0,
                    duration: 0.3,
                    ease: "power2.out",
                  })
                }}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}
