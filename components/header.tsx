"use client"
import Image from "next/image"
import { Github, Linkedin } from "lucide-react"
import { usePathname } from "next/navigation"
import { useRef, useEffect } from "react"
import gsap from "gsap"
import { ScrollSmoother } from "gsap/ScrollSmoother"
import TransitionLink from "@/components/transition-link"

const NAV_ITEMS = [
  { path: "/", label: "INDEX" },
  { path: "/work", label: "AI & PROJECTS" },
  { path: "/about", label: "ABOUT" },
  { path: "/contact", label: "CONTACT" },
]

const SOCIALS = [
  { href: "https://github.com/WebBacillus", icon: <Github className="w-5 h-5" />, label: "GitHub" },
  { href: "https://www.linkedin.com/in/pasit-khumsena-918616352/", icon: <Linkedin className="w-5 h-5" />, label: "LinkedIn" },
]

export default function Header() {
  const pathname = usePathname()
  const headerRef = useRef<HTMLElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const leftRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const socialRef = useRef<HTMLDivElement>(null)
  const pillBgRef = useRef<HTMLDivElement>(null)

  // Check if a path is active
  const isActive = (path: string) => pathname === path

  // Initial animations
  useEffect(() => {
    const bar = barRef.current
    if (!bar) return

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const tl = gsap.timeline()

    if (reducedMotion) {
      gsap.set([bar, logoRef.current, socialRef.current].filter(Boolean), { opacity: 1 })
    } else {
      // Header animation
      tl.fromTo(bar, { y: -40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" })

      // Logo animation with bounce effect
      if (logoRef.current) {
        tl.fromTo(
          logoRef.current,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.8, ease: "elastic.out(1, 0.5)" },
          "-=0.3",
        )
      }

      // Nav items staggered animation. The pill clips its overflow, so the
      // items fade rather than slide.
      if (navRef.current) {
        const navItems = navRef.current.querySelectorAll(".nav-pill-item")
        tl.fromTo(
          navItems,
          { opacity: 0 },
          { opacity: 1, stagger: 0.1, duration: 0.5, ease: "power2.out" },
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
    }

    return () => {
      tl.kill()
    }
  }, [])

  // Scroll linkage, ported from the reference site:
  // - the pill's backdrop blur ramps from 0 up to 25px with the scroll
  // - past a third of the bar height the pill takes its solid face, the
  //   links turn accent, and the hairline dividers grow in
  // - the logo and the social icons ride the scroll up and out of the bar,
  //   clamped to the bar height, while the centred pill stays put
  useEffect(() => {
    const header = headerRef.current
    const bar = barRef.current
    const left = leftRef.current
    const right = rightRef.current
    const pillBg = pillBgRef.current
    if (!header || !bar || !left || !right || !pillBg) return

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let lastY = -1
    let lastBlur = -1
    let lastShift = -1
    let lastScrolled: boolean | null = null

    const apply = (y: number) => {
      const height = bar.offsetHeight

      const scrolled = y > height / 3
      if (scrolled !== lastScrolled) {
        lastScrolled = scrolled
        header.classList.toggle("nav-scrolled", scrolled)
      }

      const blur = Math.min(25, Math.round(y / 2))
      if (blur !== lastBlur) {
        lastBlur = blur
        pillBg.style.setProperty("--nav-blur", `${blur}px`)
      }

      if (!reducedMotion) {
        const shift = Math.min(Math.round(y), height)
        if (shift !== lastShift) {
          lastShift = shift
          gsap.set(left, { y: -shift })
          gsap.set(right, { y: -shift })
        }
      }
    }

    // ScrollSmoother owns the scroll position while it is running, so read
    // the smoothed value from it instead of the raw window scroll.
    const tick = () => {
      const smoother = ScrollSmoother.get()
      const y = smoother ? smoother.scrollTop() : window.scrollY
      if (y !== lastY) {
        lastY = y
        apply(y)
      }
    }

    gsap.ticker.add(tick)
    tick()

    return () => {
      gsap.ticker.remove(tick)
    }
  }, [])

  return (
    <header ref={headerRef} className="fixed top-0 left-0 right-0 z-40 pt-safe" style={{ height: "80px" }}>
      <div ref={barRef} className="nav-bar h-full">
        <div className="container mx-auto h-full px-4">
          <div className="grid h-full grid-cols-[1fr_auto_1fr] items-center">
            {/* Logo */}
            <div ref={leftRef} className="justify-self-start">
              <TransitionLink href="/" className="flex w-fit items-center pointer-events-auto">
                <div
                  ref={logoRef}
                  className="w-10 h-10 relative"
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
                      scale: 1,
                      duration: 0.3,
                      ease: "power2.out",
                    })
                  }}
                >
                  <Image src="/images/logo.png" alt="Ghost Logo" fill className="object-contain" sizes="40px" priority />
                </div>
              </TransitionLink>
            </div>

            {/* Navigation stays centered independently of the logo and social group widths. */}
            <nav
              ref={navRef}
              aria-label="Main navigation"
              className="hidden md:flex md:items-center justify-self-center"
            >
              <div className="nav-pill">
                <div ref={pillBgRef} className="nav-pill-bg" aria-hidden="true" />
                <ul className="nav-pill-list">
                  {NAV_ITEMS.map((item) => (
                    <li key={item.path} className={`nav-pill-item${isActive(item.path) ? " is-active" : ""}`}>
                      <TransitionLink
                        href={item.path}
                        data-cursor-target
                        className="nav-pill-link focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple"
                      >
                        {item.label}
                      </TransitionLink>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>

            {/* Social icons - Only visible on desktop */}
            <div
              ref={rightRef}
              role="group"
              aria-label="Social links"
              className="hidden md:flex items-center justify-self-end gap-4 pointer-events-auto"
            >
              {SOCIALS.map((social, index) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  data-cursor-target
                  className="transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple"
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
      </div>
    </header>
  )
}
