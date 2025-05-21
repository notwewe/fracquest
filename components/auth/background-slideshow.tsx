import { useState, useEffect } from "react"

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

  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      )
    }, interval)

    return () => clearInterval(slideTimer)
  }, [images.length, interval])

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden">
      {images.map((src, index) => (
        <img
          key={src}
          src={src}
          alt={`Background slide ${index + 1}`}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity: index === currentIndex ? 1 : 0,
            transition: `opacity ${fadeTime}ms ease-in-out`,
          }}
        />
      ))}
    </div>
  )
}
