"use client"

import Image from "next/image"
import { useState } from "react"

interface ResponsiveImageProps {
  src: string
  alt: string
  sizes?: string
  priority?: boolean
  className?: string
  fill?: boolean
  width?: number
  height?: number
}

export default function ResponsiveImage({
  src,
  alt,
  sizes = "100vw",
  priority = false,
  className = "",
  fill = false,
  width,
  height,
}: ResponsiveImageProps) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className={`relative overflow-hidden ${className} ${isLoading ? "bg-purple/5 animate-pulse" : ""}`}>
      <Image
        src={src || "/placeholder.svg"}
        alt={alt}
        sizes={sizes}
        priority={priority}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        className={`transition-opacity duration-500 ${isLoading ? "opacity-0" : "opacity-100"}`}
        onLoadingComplete={() => setIsLoading(false)}
      />
    </div>
  )
}
