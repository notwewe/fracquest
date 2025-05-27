"use client"

import type React from "react"
import { useRef, useEffect } from "react"

interface PixelWorldMapProps {
  width: number
  height: number
  tileData: number[][]
  tileWidth?: number
  tileHeight?: number
}

const PixelWorldMap: React.FC<PixelWorldMapProps> = ({ width, height, tileData, tileWidth = 16, tileHeight = 16 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = width * tileWidth
    canvas.height = height * tileHeight

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const tileValue = tileData[y][x]

        // Simple color mapping based on tile value (can be expanded)
        let color = "black"
        switch (tileValue) {
          case 0:
            color = "black"
            break
          case 1:
            color = "green"
            break
          case 2:
            color = "blue"
            break
          case 3:
            color = "brown"
            break
          default:
            color = "gray"
        }

        ctx.fillStyle = color
        ctx.fillRect(x * tileWidth, y * tileHeight, tileWidth, tileHeight)
      }
    }
  }, [width, height, tileData, tileWidth, tileHeight])

  return <canvas ref={canvasRef} />
}

export default PixelWorldMap
