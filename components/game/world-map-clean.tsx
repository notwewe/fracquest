"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface Waypoint {
  id: number
  name: string
  description: string
  type: string
  completed: boolean
  section_id: number
  order_index: number
}

interface Location {
  id: number
  name: string
  position: string
  unlocked: boolean
  completed: boolean
  waypoints: Waypoint[]
}

interface WorldMapProps {
  locations: Location[]
}

export function WorldMap({ locations }: WorldMapProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="relative">
      {/* Map background */}
      <div className="relative w-full h-[400px] overflow-hidden rounded-lg">
        <Image src="/fantasy-map-pixel-art.png" alt="Fantasy Map" fill className="object-cover" priority />

        {/* Location markers */}
        {locations.map((location) => (
          <button
            key={location.id}
            className={`absolute ${location.position} transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 ${
              location.completed
                ? "bg-green-500 border-4 border-green-700"
                : location.unlocked
                  ? "bg-amber-500 border-4 border-amber-700"
                  : "bg-gray-400 border-4 border-gray-600 cursor-not-allowed opacity-70"
            }`}
            onClick={() => setSelectedLocation(location)}
            disabled={!location.unlocked}
          >
            <span className="text-white font-pixel text-xs text-center px-1">{location.name}</span>
          </button>
        ))}

        {/* Refresh button */}
        <Button
          variant="outline"
          size="sm"
          className="absolute top-2 right-2 bg-white bg-opacity-80 hover:bg-white"
          onClick={handleRefresh}
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh Map
        </Button>
      </div>

      {/* Selected location details */}
      {selectedLocation && (
        <div className="mt-4 p-4 bg-amber-800 text-amber-50 rounded-md">
          <h2 className="text-xl font-bold mb-4">{selectedLocation.name}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {selectedLocation.waypoints
              .sort((a, b) => a.order_index - b.order_index)
              .map((waypoint) => {
                const isAvailable =
                  waypoint.order_index === 1 ||
                  selectedLocation.waypoints.find((w) => w.order_index === waypoint.order_index - 1)?.completed

                return (
                  <div
                    key={waypoint.id}
                    className={`p-4 rounded-md ${
                      waypoint.completed ? "bg-green-600" : isAvailable ? "bg-amber-600" : "bg-gray-600"
                    }`}
                  >
                    <h3 className="font-pixel text-lg mb-2">{waypoint.name}</h3>
                    <div className="text-sm mb-2">{waypoint.type === "story" ? "Story" : "Game"}</div>
                    <div className="text-xs mb-2">ID: {waypoint.id}</div>
                    <div className="text-xs mb-2">Completed: {waypoint.completed ? "Yes" : "No"}</div>
                    <div className="text-xs mb-4">Available: {isAvailable ? "Yes" : "No"}</div>
                    {(waypoint.completed || isAvailable) && (
                      <Link
                        href={`/student/game/${waypoint.id}`}
                        className="inline-block w-full text-center bg-amber-900 hover:bg-amber-950 text-white py-1 px-2 rounded text-sm transition-colors"
                      >
                        {waypoint.completed ? "Replay" : "Start"}
                      </Link>
                    )}
                  </div>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}
