"use client"

import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

type PixelSpriteProps = {
  className?: string
  size?: number
  color?: string
  type: "character" | "item" | "location" | "ui"
  variant: string
  animate?: boolean
}

export function PixelSprite({
  className,
  size = 64,
  color = "orange",
  type,
  variant,
  animate = true,
}: PixelSpriteProps) {
  const [hover, setHover] = useState(false)
  const [frame, setFrame] = useState(0)

  // Simple animation effect
  useEffect(() => {
    if (!animate) return

    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % 4)
    }, 250)

    return () => clearInterval(interval)
  }, [animate])

  // Get the appropriate sprite based on type and variant
  const getSprite = () => {
    // Character sprites
    if (type === "character") {
      switch (variant) {
        case "whiskers":
          return (
            <div className="relative w-full h-full">
              {/* Cat body */}
              <div className="absolute w-3/5 h-3/5 bg-orange-400 rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"></div>
              {/* Cat head */}
              <div className="absolute w-2/5 h-2/5 bg-orange-400 rounded-full left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2"></div>
              {/* Cat ears */}
              <div className="absolute w-1/6 h-1/6 bg-orange-400 transform rotate-45 left-1/3 top-1/6"></div>
              <div className="absolute w-1/6 h-1/6 bg-orange-400 transform -rotate-45 right-1/3 top-1/6"></div>
              {/* Cat eyes */}
              <div className="absolute w-1/12 h-1/12 bg-black rounded-full left-[40%] top-1/4"></div>
              <div className="absolute w-1/12 h-1/12 bg-black rounded-full right-[40%] top-1/4"></div>
              {/* Green tunic */}
              <div className="absolute w-1/2 h-1/3 bg-green-500 left-1/2 top-[60%] -translate-x-1/2 -translate-y-1/2 rounded-md"></div>
            </div>
          )
        case "squeaks":
          return (
            <div className="relative w-full h-full">
              {/* Mouse body */}
              <div className="absolute w-1/2 h-1/2 bg-gray-400 rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"></div>
              {/* Mouse head */}
              <div className="absolute w-1/3 h-1/3 bg-gray-400 rounded-full left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2"></div>
              {/* Mouse ears */}
              <div className="absolute w-1/8 h-1/8 bg-gray-400 rounded-full left-[40%] top-1/5"></div>
              <div className="absolute w-1/8 h-1/8 bg-gray-400 rounded-full right-[40%] top-1/5"></div>
              {/* Mouse eyes */}
              <div className="absolute w-1/16 h-1/16 bg-black rounded-full left-[45%] top-1/3"></div>
              <div className="absolute w-1/16 h-1/16 bg-black rounded-full right-[45%] top-1/3"></div>
              {/* Glasses */}
              <div className="absolute w-1/4 h-1/16 bg-black left-1/2 top-1/3 -translate-x-1/2"></div>
            </div>
          )
        case "decimal-phantom":
          return (
            <div className="relative w-full h-full">
              {/* Ghost body */}
              <div className="absolute w-3/5 h-3/5 bg-purple-500 rounded-t-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"></div>
              {/* Ghost tail */}
              <div className="absolute w-1/5 h-1/5 bg-purple-500 left-[40%] bottom-1/4 transform rotate-45"></div>
              <div className="absolute w-1/5 h-1/5 bg-purple-500 right-[40%] bottom-1/4 transform -rotate-45"></div>
              {/* Ghost eyes */}
              <div className="absolute w-1/10 h-1/10 bg-white rounded-full left-[40%] top-[40%]"></div>
              <div className="absolute w-1/10 h-1/10 bg-white rounded-full right-[40%] top-[40%]"></div>
              {/* Math symbols */}
              <div className="absolute text-white text-xs left-1/3 top-[60%]">+</div>
              <div className="absolute text-white text-xs right-1/3 top-[60%]">÷</div>
            </div>
          )
        case "king-equalis":
          return (
            <div className="relative w-full h-full">
              {/* King body */}
              <div className="absolute w-1/2 h-1/2 bg-blue-600 bottom-1/4 left-1/2 -translate-x-1/2"></div>
              {/* King head */}
              <div className="absolute w-1/3 h-1/3 bg-[#FFD700] rounded-full left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2"></div>
              {/* Crown */}
              <div className="absolute w-1/3 h-1/6 bg-yellow-500 left-1/2 top-1/6 -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute w-1/12 h-1/8 bg-yellow-500 left-[40%] top-1/10"></div>
              <div className="absolute w-1/12 h-1/8 bg-yellow-500 left-1/2 top-1/12 -translate-x-1/2"></div>
              <div className="absolute w-1/12 h-1/8 bg-yellow-500 right-[40%] top-1/10"></div>
            </div>
          )
        case "elder-pebble":
          return (
            <div className="relative w-full h-full">
              {/* Stone body */}
              <div className="absolute w-3/5 h-3/5 bg-gray-600 rounded-lg left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"></div>
              {/* Stone head */}
              <div className="absolute w-2/5 h-2/5 bg-gray-600 rounded-lg left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2"></div>
              {/* Glowing runes */}
              <div className="absolute w-1/10 h-1/10 bg-blue-400 left-[40%] top-[40%]"></div>
              <div className="absolute w-1/10 h-1/10 bg-blue-400 right-[40%] top-[40%]"></div>
              <div className="absolute w-1/10 h-1/10 bg-blue-400 left-1/2 top-[60%] -translate-x-1/2"></div>
            </div>
          )
        default:
          return <div className="w-full h-full bg-gray-300 rounded-full"></div>
      }
    }

    // Item sprites
    if (type === "item") {
      switch (variant) {
        case "fraction-orb":
          return (
            <div className="relative w-full h-full">
              <div className="absolute w-4/5 h-4/5 bg-blue-400 rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-80"></div>
              <div className="absolute w-3/5 h-3/5 bg-blue-300 rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute text-white text-xs left-[45%] top-[40%]">½</div>
            </div>
          )
        case "fraction-compass":
          return (
            <div className="relative w-full h-full">
              <div className="absolute w-4/5 h-4/5 bg-yellow-600 rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute w-3/5 h-3/5 bg-yellow-200 rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"></div>
              <div
                className="absolute w-1/2 h-[2px] bg-red-500 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 origin-center"
                style={{ transform: `rotate(${frame * 90}deg)` }}
              ></div>
            </div>
          )
        case "cheese-wheel-whole":
          return (
            <div className="relative w-full h-full">
              <div className="absolute w-4/5 h-4/5 bg-yellow-300 rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"></div>
            </div>
          )
        case "cheese-wheel-half":
          return (
            <div className="relative w-full h-full">
              <div className="absolute w-4/5 h-4/5 bg-yellow-300 rounded-l-full left-1/4 top-1/2 -translate-y-1/2"></div>
            </div>
          )
        case "cheese-wheel-quarters":
          return (
            <div className="relative w-full h-full">
              <div className="absolute w-2/5 h-2/5 bg-yellow-300 rounded-tl-full left-1/4 top-1/4"></div>
              <div className="absolute w-2/5 h-2/5 bg-yellow-300 rounded-tr-full right-1/4 top-1/4"></div>
              <div className="absolute w-2/5 h-2/5 bg-yellow-300 rounded-bl-full left-1/4 bottom-1/4"></div>
              <div className="absolute w-2/5 h-2/5 bg-yellow-300 rounded-br-full right-1/4 bottom-1/4 transform translate-x-[10%] translate-y-[10%]"></div>
            </div>
          )
        default:
          return <div className="w-full h-full bg-yellow-300 rounded-full"></div>
      }
    }

    // Location sprites (simplified versions)
    if (type === "location") {
      switch (variant) {
        case "arithmetown":
          return (
            <div className="relative w-full h-full bg-blue-100">
              {/* Buildings */}
              <div className="absolute w-1/4 h-1/2 bg-brown-500 bottom-0 left-1/4"></div>
              <div className="absolute w-1/4 h-2/3 bg-brown-700 bottom-0 right-1/4"></div>
              {/* Roofs */}
              <div className="absolute w-1/3 h-1/6 bg-red-500 bottom-1/2 left-1/5 transform -rotate-12"></div>
              <div className="absolute w-1/3 h-1/6 bg-red-700 bottom-2/3 right-1/5 transform rotate-12"></div>
              {/* Math symbol */}
              <div className="absolute text-black text-lg font-bold left-[45%] top-[40%]">+</div>
            </div>
          )
        case "lessmoore-bridge":
          return (
            <div className="relative w-full h-full bg-blue-200">
              {/* Bridge base */}
              <div className="absolute w-full h-1/6 bg-gray-600 top-1/2 -translate-y-1/2"></div>
              {/* Bridge gaps */}
              <div className="absolute w-1/5 h-1/6 bg-blue-200 top-1/2 left-2/5 -translate-y-1/2"></div>
              {/* Bridge supports */}
              <div className="absolute w-1/12 h-1/3 bg-gray-700 bottom-1/2 left-1/6"></div>
              <div className="absolute w-1/12 h-1/3 bg-gray-700 bottom-1/2 right-1/6"></div>
            </div>
          )
        case "fraction-forest":
          return (
            <div className="relative w-full h-full bg-green-100">
              {/* Trees */}
              <div className="absolute w-1/6 h-1/3 bg-brown-600 bottom-0 left-1/4"></div>
              <div className="absolute w-1/4 h-1/3 bg-green-700 bottom-1/3 left-1/5 rounded-full"></div>
              <div className="absolute w-1/6 h-1/3 bg-brown-600 bottom-0 right-1/4"></div>
              <div className="absolute w-1/4 h-1/3 bg-green-700 bottom-1/3 right-1/5 rounded-full"></div>
              {/* Fraction symbol */}
              <div className="absolute text-black text-lg font-bold left-[45%] top-[40%]">¼</div>
            </div>
          )
        case "dreadpoint-hollow":
          return (
            <div className="relative w-full h-full bg-purple-900">
              {/* Cave entrance */}
              <div className="absolute w-1/2 h-2/3 bg-gray-900 rounded-t-full bottom-0 left-1/2 -translate-x-1/2"></div>
              {/* Mist */}
              <div className="absolute w-1/3 h-1/6 bg-purple-500 opacity-50 bottom-1/6 left-1/2 -translate-x-1/2"></div>
            </div>
          )
        case "realm-of-balance":
          return (
            <div className="relative w-full h-full bg-sky-300">
              {/* Floating islands */}
              <div className="absolute w-1/3 h-1/6 bg-green-600 rounded-full top-1/3 left-1/4"></div>
              <div className="absolute w-1/3 h-1/6 bg-green-600 rounded-full bottom-1/3 right-1/4"></div>
              {/* Balance scale */}
              <div className="absolute w-1/12 h-1/4 bg-brown-700 bottom-1/3 left-1/2 -translate-x-1/2"></div>
              <div className="absolute w-1/3 h-[2px] bg-brown-700 top-1/2 left-1/2 -translate-x-1/2"></div>
            </div>
          )
        default:
          return <div className="w-full h-full bg-green-200"></div>
      }
    }

    // UI elements
    if (type === "ui") {
      switch (variant) {
        case "dialog-box":
          return (
            <div className="relative w-full h-full bg-gray-800 bg-opacity-80 border-2 border-blue-500 rounded-lg p-2">
              <div className="w-full h-full flex items-center justify-center text-white">Dialog Text</div>
            </div>
          )
        case "button":
          return (
            <div className="relative w-full h-full bg-brown-600 border-2 border-brown-800 rounded-md flex items-center justify-center text-white">
              Button
            </div>
          )
        default:
          return <div className="w-full h-full bg-gray-400 rounded-md"></div>
      }
    }

    return <div className="w-full h-full bg-gray-300"></div>
  }

  return (
    <div
      className={cn(
        "relative inline-block transition-transform",
        animate && "animate-pixel-idle",
        hover && "scale-110",
        className,
      )}
      style={{ width: size, height: size }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {getSprite()}
    </div>
  )
}
