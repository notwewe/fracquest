"use client"

import { useState } from "react"
import { PixelAsset } from "./pixel-assets"
import Link from "next/link"
import { cn } from "@/lib/utils"

type Location = {
  id: string
  name: string
  position: string
  icon: string
  unlocked: boolean
  completed: boolean
}

type PixelWorldMapProps = {
  locations: Location[]
  currentLocationId?: string
}

export function PixelWorldMap({ locations, currentLocationId }: PixelWorldMapProps) {
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null)

  return (
    <div className="pixel-world-map relative w-full h-[640px] bg-black border-4 border-amber-900 rounded-none overflow-hidden">
      {/* Map background with pixel art styling */}
      <PixelAsset
        src="/pixel-locations/numeria-kingdom.png"
        alt="World Map"
        width={640}
        height={640}
        className="absolute inset-0 w-full h-full pixelated"
      />

      {/* Ambient particles for atmosphere */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white opacity-30 rounded-full animate-pixel-bounce"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 7}s`,
          }}
        />
      ))}

      {/* Map locations */}
      {locations.map((location) => (
        <div
          key={location.id}
          className={cn(
            "absolute transition-all duration-300",
            location.position,
            location.id === currentLocationId && "scale-125 z-10",
          )}
          onMouseEnter={() => setHoveredLocation(location.id)}
          onMouseLeave={() => setHoveredLocation(null)}
        >
          {location.unlocked ? (
            <Link href={`/student/game/${location.id}`}>
              <div
                className={cn(
                  "relative cursor-pointer transition-transform duration-300",
                  location.completed ? "opacity-100" : "animate-pixel-bounce",
                  "hover:scale-110",
                )}
              >
                <PixelAsset src={location.icon} alt={location.name} width={48} height={48} className="pixelated" />

                {/* Location status indicator */}
                <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-none flex items-center justify-center">
                  {location.completed ? (
                    <div className="w-6 h-6 bg-green-600 border-2 border-black flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  ) : (
                    <div className="w-6 h-6 bg-yellow-500 border-2 border-black animate-pulse"></div>
                  )}
                </div>

                {/* Location tooltip */}
                {hoveredLocation === location.id && (
                  <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap z-20">
                    <div className="pixel-tooltip">{location.name}</div>
                  </div>
                )}
              </div>
            </Link>
          ) : (
            <div className="relative opacity-50 grayscale">
              <PixelAsset src={location.icon} alt={location.name} width={48} height={48} className="pixelated" />
              <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
                <span className="text-2xl">🔒</span>
              </div>

              {/* Location tooltip */}
              {hoveredLocation === location.id && (
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap z-20">
                  <div className="pixel-tooltip">{location.name} (Locked)</div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Map legend */}
      <div className="absolute bottom-4 right-4 bg-black bg-opacity-80 p-3 border-2 border-amber-700">
        <h3 className="text-white text-sm font-pixel mb-2">Legend</h3>
        <div className="flex items-center text-xs text-white mb-1">
          <div className="w-3 h-3 bg-green-600 border-1 border-black mr-2"></div>
          <span className="font-pixel">Completed</span>
        </div>
        <div className="flex items-center text-xs text-white mb-1">
          <div className="w-3 h-3 bg-yellow-500 border-1 border-black mr-2 animate-pulse"></div>
          <span className="font-pixel">Available</span>
        </div>
        <div className="flex items-center text-xs text-white">
          <div className="w-3 h-3 bg-gray-700 border-1 border-black mr-2"></div>
          <span className="font-pixel">Locked</span>
        </div>
      </div>
    </div>
  )
}
