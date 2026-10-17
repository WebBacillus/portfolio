"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { X, Menu, Home, Briefcase, User, Mail, Instagram, Linkedin, Github, Twitter } from "lucide-react"
import gsap from "gsap"
import TransitionLink from "@/components/transition-link"

interface MobileMenuProps {
  variant?: "sidebar" | "bottom"
}

export default function MobileMenu({ variant = "sidebar" }: MobileMenuProps) {
  const pathname = usePathname()
  const [menuState, setMenuState] = useState({ pathname, isOpen: false })
  const isOpen = menuState.pathname === pathname && menuState.isOpen
  const setIsOpen = useCallback((open: boolean) => setMenuState({ pathname, isOpen: open }), [pathname])
  const menuRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const menuContentRef = useRef<HTMLDivElement>(null)

  const navItems = [
    { path: "/", label: "Home", icon: <Home className="w-5 h-5" /> },
    { path: "/work", label: "Work", icon: <Briefcase className="w-5 h-5" /> },
    { path: "/about", label: "About", icon: <User className="w-5 h-5" /> },
    { path: "/contact", label: "Contact", icon: <Mail className="w-5 h-5" /> },
  ]

  const socialLinks = [
    { href: "https://instagram.com/meesverberne", icon: <Instagram className="w-5 h-5" />, label: "Instagram" },
    { href: "https://twitter.com/meesverberne", icon: <Twitter className="w-5 h-5" />, label: "Twitter" },
    { href: "https://linkedin.com/in/meesverberne", icon: <Linkedin className="w-5 h-5" />, label: "LinkedIn" },
    { href: "https://github.com/meesverberne", icon: <Github className="w-5 h-5" />, label: "GitHub" },
  ]

  // Check if a path is active
  const isActive = (path: string) => pathname === path

  // Toggle menu
  const toggleMenu = () => setIsOpen(!isOpen)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen, setIsOpen])

  // Handle menu animations
  useEffect(() => {
    if (variant !== "sidebar") return

    if (isOpen) {
      // Animate overlay
      if (overlayRef.current) {
        gsap.to(overlayRef.current, {
          opacity: 1,
          duration: 0.3,
          ease: "power2.out",
        })
      }

      // Animate menu
      if (menuContentRef.current) {
        gsap.fromTo(menuContentRef.current, { x: "-100%" }, { x: 0, duration: 0.4, ease: "power3.out" })

        // Animate menu items
        const menuItems = menuContentRef.current.querySelectorAll(".menu-item")
        gsap.fromTo(
          menuItems,
          { x: -20, opacity: 0 },
          { x: 0, opacity: 1, stagger: 0.05, delay: 0.2, duration: 0.3, ease: "power2.out" },
        )
      }
    } else {
      // Animate overlay out
      if (overlayRef.current) {
        gsap.to(overlayRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: "power2.in",
        })
      }

      // Animate menu out
      if (menuContentRef.current) {
        gsap.to(menuContentRef.current, {
          x: "-100%",
          duration: 0.3,
          ease: "power3.in",
        })
      }
    }

    const animatedElements = [overlayRef.current, menuContentRef.current].filter(
      (element): element is HTMLDivElement => element !== null,
    )
    const menuItems = menuContentRef.current?.querySelectorAll(".menu-item")
    return () => {
      gsap.killTweensOf(animatedElements)
      if (menuItems) gsap.killTweensOf(menuItems)
    }
  }, [isOpen, variant])

  // Handle body scroll lock
  useEffect(() => {
    if (variant === "sidebar" && isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen, variant])

  // Render sidebar menu
  if (variant === "sidebar") {
    return (
      <>
        {/* Menu Button */}
        <button
          onClick={toggleMenu}
          className="md:hidden fixed top-6 right-4 z-50 w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-md"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Overlay */}
        <div
          ref={overlayRef}
          className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden ${isOpen ? "block" : "hidden"}`}
          style={{ opacity: 0 }}
          aria-hidden="true"
        ></div>

        {/* Sidebar Menu */}
        <div
          ref={menuRef}
          className={`fixed top-0 left-0 bottom-0 w-[280px] bg-white z-50 md:hidden transform ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 ease-in-out`}
        >
          <div
            ref={menuContentRef}
            className="h-full flex flex-col overflow-y-auto pb-safe"
            style={{ transform: "translateX(-100%)" }}
          >
            {/* Menu Header */}
            <div className="p-6 border-b border-purple/10">
              <TransitionLink href="/" className="flex items-center" onClick={() => setIsOpen(false)}>
                <div className="w-10 h-10 mr-3 relative">
                  <Image src="/images/logo.png" alt="Ghost Logo" fill className="object-contain" sizes="40px" />
                </div>
                <span className="text-xl font-bold">Mees Verberne</span>
              </TransitionLink>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 p-6">
              <ul className="space-y-4">
                {navItems.map((item) => (
                  <li key={item.path} className="menu-item">
                    <TransitionLink
                      href={item.path}
                      className={`flex items-center py-3 px-4 rounded-lg transition-colors ${
                        isActive(item.path) ? "bg-purple text-white" : "hover:bg-purple/10 active:bg-purple/20"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="mr-3">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </TransitionLink>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Social Links */}
            <div className="p-6 border-t border-purple/10">
              <p className="text-sm text-black/60 mb-4">Connect with me</p>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    className="w-10 h-10 rounded-full bg-purple/10 flex items-center justify-center hover:bg-purple hover:text-white transition-colors"
                  >
                    {link.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  // Render bottom navigation
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-purple/10 shadow-lg md:hidden z-40 pb-safe">
      <nav className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <TransitionLink
            key={item.path}
            href={item.path}
            className={`flex flex-col items-center justify-center w-full h-full ${
              isActive(item.path) ? "text-purple" : "text-black/70"
            }`}
          >
            <div className={`p-1.5 rounded-full ${isActive(item.path) ? "bg-purple/10" : "bg-transparent"}`}>
              {item.icon}
            </div>
            <span className="text-xs mt-1">{item.label}</span>
          </TransitionLink>
        ))}
      </nav>
    </div>
  )
}
