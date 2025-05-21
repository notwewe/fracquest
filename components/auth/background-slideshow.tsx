"use client"

import { useState, useEffect, useRef } from "react"

interface BackgroundSlideshowProps {
  interval?: number // Time in ms between slides
  fadeTime?: number // Transition fade time in ms
}

export function BackgroundSlideshow({
  interval = 8000,
  fadeTime = 1500,
}: BackgroundSlideshowProps) {
  const images = [
    "/auth/backgrounds/numeria-castle.png",
    "/auth/backgrounds/arithmetown.png",
    "/auth/backgrounds/fraction-forest.png",
    "/auth/backgrounds/lessmoore-bridge.png",
  ]
  const len = images.length

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFading, setIsFading] = useState(false)

  // Refs to store timeout IDs so we can clear them on cleanup
  const fadeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const advanceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // start the fade shortly before interval ends
    fadeTimeout.current = setTimeout(() => {
      setIsFading(true)
    }, interval - fadeTime)

    // actually advance slide when interval elapses
    advanceTimeout.current = setTimeout(() => {
      setCurrentIndex((i) => (i + 1) % len)
      setIsFading(false)
    }, interval)

    // cleanup on unmount or params change
    return () => {
      if (fadeTimeout.current) clearTimeout(fadeTimeout.current)
      if (advanceTimeout.current) clearTimeout(advanceTimeout.current)
    }
  }, [currentIndex, interval, fadeTime, len])

  // compute next index for preloading
  const nextIndex = (currentIndex + 1) % len

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Current image */}
      <div
        className="absolute inset-0 transition-opacity ease-in-out"
        style={{
          opacity: isFading ? 0 : 1,
          transitionDuration: `${fadeTime}ms`,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: `url(${images[currentIndex]}) center/cover no-repeat`,
            filter: "brightness(0.7)",
          }}
        />
      </div>

      {/* Next image */}
      <div
        className="absolute inset-0 transition-opacity ease-in-out"
        style={{
          opacity: isFading ? 1 : 0,
          transitionDuration: `${fadeTime}ms`,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: `url(${images[nextIndex]}) center/cover no-repeat`,
            filter: "brightness(0.7)",
          }}
        />
      </div>

      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.3)",
          backdropFilter: "blur(1px)",
        }}
      />
    </div>
  )
}
