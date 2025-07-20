"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"

// Cloud object type
export type Cloud = {
  id: number
  cloudNumber: number
  top: string
  left: string
  speed: number
  direction: 1 | -1
  size: number
  isActive: boolean
}

export function AnimatedClouds() {
  const [clouds, setClouds] = useState<Cloud[]>([])
  const [windowWidth, setWindowWidth] = useState(0)
  const cloudIdCounter = useRef(0)

  useEffect(() => {
    setWindowWidth(window.innerWidth)
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const createNewCloud = (forcedDirection?: -1 | 1): Cloud => {
    const cloudNumber = Math.floor(Math.random() * 3) + 1
    const baseSize = windowWidth < 640 ? 200 : windowWidth < 1024 ? 250 : 300
    const sizeVariation = windowWidth < 640 ? 100 : 150
    const size = Math.floor(Math.random() * sizeVariation) + baseSize
    const speedFactor = windowWidth < 640 ? 0.7 : 1
    const speed = (Math.random() * 0.1 + 0.05) * speedFactor
    const direction = forcedDirection || (Math.random() > 0.5 ? 1 : -1)
    const top = `${Math.floor(Math.random() * 80) + 5}%`
    const left = direction === 1 ? `${Math.floor(Math.random() * 10) - 20}%` : `${Math.floor(Math.random() * 10) + 110}%`
    return {
      id: cloudIdCounter.current++,
      cloudNumber,
      top,
      left,
      speed,
      direction,
      size,
      isActive: true,
    }
  }

  useEffect(() => {
    if (!windowWidth) return
    const initialClouds: Cloud[] = []
    const cloudCount = windowWidth < 640 ? 3 : 5
    for (let i = 0; i < cloudCount; i++) {
      initialClouds.push(createNewCloud())
    }
    setClouds(initialClouds)
    const intervalId = setInterval(() => {
      setClouds((prevClouds) => {
        return prevClouds.map((cloud) => {
          const currentLeft = Number.parseFloat(cloud.left)
          const newLeft = currentLeft + cloud.speed * cloud.direction
          if ((cloud.direction === 1 && newLeft > 110) || (cloud.direction === -1 && newLeft < -30)) {
            return createNewCloud(cloud.direction === 1 ? -1 : 1)
          }
          return {
            ...cloud,
            left: `${newLeft}%`,
          }
        })
      })
    }, 33)
    return () => clearInterval(intervalId)
  }, [windowWidth])

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden z-10 pointer-events-none">
      {clouds.map((cloud) => (
        <div
          key={cloud.id}
          className="absolute pixelated drop-shadow-lg"
          style={{
            top: cloud.top,
            left: cloud.left,
            width: `${cloud.size}px`,
            height: "auto",
            transition: "left 0.033s linear",
          }}
        >
          <Image
            src={`/auth/cloud-${cloud.cloudNumber}.webp`}
            alt="Cloud"
            width={cloud.size}
            height={cloud.size / 2}
            className="pixelated"
          />
        </div>
      ))}
    </div>
  )
}
