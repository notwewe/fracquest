"use client"

import Image from "next/image"
import { useState, useEffect } from "react"

type CharacterSpriteProps = {
  character: "whiskers" | "squeaks" | "decimal-phantom" | "king-equalis" | "elder-pebble"
  size?: number
  animate?: boolean
  state?: "idle" | "walk" | "talk"
  direction?: "left" | "right"
}

export function CharacterSprite({
  character,
  size = 64,
  animate = false,
  state = "idle",
  direction = "right",
}: CharacterSpriteProps) {
  const [frame, setFrame] = useState(0)

  // Animation effect
  useEffect(() => {
    if (!animate) return

    const frameCount = 4 // Most pixel sprites have 4 frames
    const frameInterval = state === "walk" ? 150 : 300 // Walk animation is faster

    const animationInterval = setInterval(() => {
      setFrame((prev) => (prev + 1) % frameCount)
    }, frameInterval)

    return () => clearInterval(animationInterval)
  }, [animate, state])

  // Get character sprite path
  const getCharacterSprite = () => {
    return `/pixel-characters/${character}.png`
  }

  // Get animation class based on state
  const getAnimationClass = () => {
    if (!animate) return ""

    switch (state) {
      case "idle":
        return "sprite-idle"
      case "walk":
        return "sprite-walk"
      case "talk":
        return "sprite-talk"
      default:
        return ""
    }
  }

  return (
    <div
      className={`character-sprite ${getAnimationClass()}`}
      style={{
        transform: direction === "left" ? "scaleX(-1)" : "none",
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      <Image
        src={getCharacterSprite() || "/placeholder.svg"}
        alt={`${character} character`}
        width={size}
        height={size}
        className="pixelated"
      />
    </div>
  )
}
