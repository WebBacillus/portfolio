"use client"

import { useState, useEffect } from "react"

interface DebugInfo {
  particleCount: number
  fps: number
  scrollY: number
  isVisible: boolean
}

export default function BackgroundDebug() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    particleCount: 0,
    fps: 0,
    scrollY: 0,
    isVisible: false,
  })
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV === "development") {
      const updateDebug = () => {
        const particles = document.querySelectorAll(".animated-background-particle")
        setDebugInfo({
          particleCount: particles.length,
          fps: 60, // Placeholder - would need actual FPS monitoring
          scrollY: window.scrollY,
          isVisible: particles.length > 0,
        })
      }

      const interval = setInterval(updateDebug, 1000)
      window.addEventListener("scroll", updateDebug)

      return () => {
        clearInterval(interval)
        window.removeEventListener("scroll", updateDebug)
      }
    }
  }, [])

  // Only render in development
  if (process.env.NODE_ENV !== "development") return null

  return (
    <>
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="fixed bottom-4 right-4 z-50 bg-purple text-white px-3 py-2 rounded text-xs"
        style={{ fontSize: "10px" }}
      >
        Debug BG
      </button>

      {showDebug && (
        <div className="fixed top-20 right-4 z-50 bg-black/80 text-white p-3 rounded text-xs max-w-xs">
          <h3 className="font-bold mb-2">Background Debug</h3>
          <div>Particles: {debugInfo.particleCount}</div>
          <div>Scroll Y: {Math.round(debugInfo.scrollY)}</div>
          <div>Visible: {debugInfo.isVisible ? "Yes" : "No"}</div>
          <div className="mt-2">
            <div className="w-4 h-4 bg-purple rounded opacity-50 inline-block mr-2"></div>
            Sample Particle
          </div>
        </div>
      )}
    </>
  )
}
