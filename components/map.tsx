"use client"

import { useRef, useEffect } from "react"

interface MapProps {
  address: string
  zoom?: number
}

export default function Map({ address, zoom = 15 }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // This is a placeholder for a real map implementation
    // In a real application, you would use a library like Google Maps, Mapbox, or Leaflet

    if (!mapRef.current) return

    const loadMap = async () => {
      try {
        // Simulate map loading with a colored background
        mapRef.current.innerHTML = `
          <div class="w-full h-full flex items-center justify-center bg-purple/10 rounded-lg">
            <div class="text-center">
              <div class="text-purple text-xl font-bold mb-2">Map Location</div>
              <div class="text-black/70">${address}</div>
            </div>
          </div>
        `
      } catch (error) {
        console.error("Error loading map:", error)
      }
    }

    loadMap()
  }, [address])

  return <div ref={mapRef} className="w-full h-[300px] rounded-lg overflow-hidden"></div>
}
