"use client"

import { useState } from "react"
import Image from "next/image"

interface GameItemProps {
  src: string
  alt: string
  interactive?: boolean
  onClick?: () => void
  size?: "sm" | "md" | "lg"
}

export function GameItem({ src, alt, interactive = false, onClick, size = "md" }: GameItemProps) {
  const [isHovered, setIsHovered] = useState(false)

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  }

  return (
    <div
      className={`relative ${sizeClasses[size]} ${interactive ? "cursor-pointer transform transition-transform duration-200" : ""} ${isHovered && interactive ? "scale-110" : ""}`}
      onMouseEnter={() => interactive && setIsHovered(true)}
      onMouseLeave={() => interactive && setIsHovered(false)}
      onClick={interactive ? onClick : undefined}
    >
      <Image
        src={src || "/placeholder.svg"}
        alt={alt}
        width={size === "sm" ? 32 : size === "md" ? 48 : 64}
        height={size === "sm" ? 32 : size === "md" ? 48 : 64}
        className={`object-contain ${isHovered && interactive ? "animate-pulse" : ""}`}
      />
      {isHovered && interactive && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-xs text-amber-300 whitespace-nowrap">
          Click me!
        </div>
      )}
    </div>
  )
}
