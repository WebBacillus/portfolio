"use client"

import { useEffect, useRef, useState } from "react"
import gsap from "gsap"

export default function PageTransition() {
  const [isAnimating, setIsAnimating] = useState(true)
  const bannerOneRef = useRef<HTMLDivElement>(null)
  const bannerTwoRef = useRef<HTMLDivElement>(null)
  const bannerThreeRef = useRef<HTMLDivElement>(null)
  const bannerFourRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Initial animation when the page loads
    const bannerOne = bannerOneRef.current
    const bannerTwo = bannerTwoRef.current
    const bannerThree = bannerThreeRef.current
    const bannerFour = bannerFourRef.current
    const container = containerRef.current

    if (bannerOne && bannerTwo && bannerThree && bannerFour && container) {
      // Set initial state
      gsap.set([bannerOne, bannerTwo, bannerThree, bannerFour], {
        yPercent: 0,
        autoAlpha: 1,
      })

      // Create animation timeline
      const tl = gsap.timeline({
        onComplete: () => {
          // Ensure banners are hidden and not interfering with UI after animation
          setIsAnimating(false)
          gsap.set(container, { display: "none", autoAlpha: 0 })
        },
      })

      // Animate banners up with stagger
      tl.to([bannerOne, bannerTwo, bannerThree, bannerFour], {
        yPercent: 100,
        stagger: 0.2,
        ease: "power4.inOut",
        duration: 0.8,
      })
    }

    // Make transition container visible for global access
    window.pageTransitionContainer = container

    return () => {
      // Clean up on unmount
      // if (container) {
      //   gsap.killTweensOf([bannerOne, bannerTwo, bannerThree, bannerFour])
      // }
    }
  }, [])

  return (
    <div
      id="page-transition-container"
      ref={containerRef}
      className={`fixed inset-0 pointer-events-none z-50 ${!isAnimating ? "hidden" : ""}`}
      style={{ visibility: isAnimating ? "visible" : "hidden" }}
    >
      <div
        id="banner-1"
        ref={bannerOneRef}
        className="min-h-screen bg-purple z-10 fixed top-0 left-0 w-1/4"
        style={{ transformOrigin: "bottom" }}
      ></div>
      <div
        id="banner-2"
        ref={bannerTwoRef}
        className="min-h-screen bg-purple z-10 fixed top-0 left-1/4 w-1/4"
        style={{ transformOrigin: "bottom" }}
      ></div>
      <div
        id="banner-3"
        ref={bannerThreeRef}
        className="min-h-screen bg-purple z-10 fixed top-0 left-2/4 w-1/4"
        style={{ transformOrigin: "bottom" }}
      ></div>
      <div
        id="banner-4"
        ref={bannerFourRef}
        className="min-h-screen bg-purple z-10 fixed top-0 left-3/4 w-1/4"
        style={{ transformOrigin: "bottom" }}
      ></div>
    </div>
  )
}
