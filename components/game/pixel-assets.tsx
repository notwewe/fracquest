"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

type PixelAssetProps = {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
  animation?: "none" | "pulse" | "bounce" | "float" | "shake"
  interactive?: boolean
}

export function PixelAsset({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  animation = "none",
  interactive = false,
}: PixelAssetProps) {
  // Get animation class based on animation type
  const getAnimationClass = () => {
    switch (animation) {
      case "pulse":
        return "animate-pulse"
      case "bounce":
        return "animate-pixel-bounce"
      case "float":
        return "animate-pixel-bounce"
      case "shake":
        return "animate-pixel-shake"
      default:
        return ""
    }
  }

  return (
    <div
      className={cn(
        "pixel-asset",
        getAnimationClass(),
        interactive && "cursor-pointer hover:scale-110 transition-transform duration-300",
        className,
      )}
    >
      <Image
        src={src || "/placeholder.svg"}
        alt={alt}
        width={width}
        height={height}
        className="pixelated"
        priority={priority}
      />
    </div>
  )
}
