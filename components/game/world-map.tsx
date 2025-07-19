"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

interface Waypoint {
  id: number
  name: string
  type: string
  order_index: number
  completed: boolean
  section_id: number
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

export function WorldMap({ locations = [] }: WorldMapProps) {
  const router = useRouter()
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Add the levitate animation CSS
  const levitateStyle = `
    @keyframes levitate {
      0% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-20px);
      }
      100% {
        transform: translateY(0px);
      }
    }
    
    .levitate {
      animation: levitate 3s ease-in-out infinite;
    }
  `

  // Auto-select the first location when the component mounts
  useState(() => {
    if (locations && locations.length > 0 && !selectedLocation) {
      const firstUnlockedLocation = locations.find((loc) => loc.unlocked)
      if (firstUnlockedLocation) {
        setSelectedLocation(firstUnlockedLocation)
      } else if (locations[0]) {
        // If no unlocked locations, select the first one
        setSelectedLocation(locations[0])
      }
    }
  })

  const handleLocationClick = (location: Location) => {
    if (!location.unlocked) {
      toast({
        title: "Location Locked",
        description: "Complete previous locations to unlock this one.",
        variant: "destructive",
      })
      return
    }

    setSelectedLocation(location)
    
    // Smooth scroll to the levels section
    setTimeout(() => {
      const waypointsSection = document.querySelector('[data-waypoints-section]')
      if (waypointsSection) {
        waypointsSection.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        })
      }
    }, 100)
  }

  const handleWaypointClick = async (waypoint: Waypoint) => {
    if (isLoading) return
    setIsLoading(true)

    try {
      // Get all waypoints for the current location
      const currentLocationWaypoints = selectedLocation?.waypoints?.sort((a, b) => a.order_index - b.order_index) || []

      // Find the index of the clicked waypoint
      const waypointIndex = currentLocationWaypoints.findIndex((wp) => wp.id === waypoint.id)

      // Check if all previous waypoints are completed
      const allPreviousCompleted =
        waypointIndex === 0 ||
        (waypointIndex > 0 && currentLocationWaypoints.slice(0, waypointIndex).every((wp) => wp.completed))

      if (!allPreviousCompleted) {
        toast({
          title: "Complete Previous Waypoints",
          description: "You need to complete all previous waypoints first.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Navigate based on waypoint type
      if (waypoint.type === "intro" || waypoint.type === "story") {
        router.push(`/student/game/level/${waypoint.id}`)
      } else if (waypoint.type === "game") {
        router.push(`/student/game/play/${waypoint.id}`)
      } else if (waypoint.type === "boss") {
        router.push(`/student/game/boss/${waypoint.id}`)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // If locations is undefined or empty, show a loading state
  if (!locations || locations.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-8">
        <div className="animate-pulse bg-amber-100 rounded-lg border-4 border-amber-800 p-8 text-center">
          <h2 className="text-xl font-bold mb-4">Loading Map...</h2>
          <p>Please wait while we prepare your adventure!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <style jsx global>{levitateStyle}</style>
      {/* Map with locations */}
      <div className="relative w-full h-[600px] md:h-[700px] bg-amber-100 rounded-lg border-4 border-amber-800 overflow-hidden mb-4">
        <div className="absolute inset-0 bg-[url('/world_map.png')] bg-cover bg-center opacity-100"></div>

        {/* Locations */}
        {locations.map((location) => {
          // Check if all waypoints in this location are completed
          const allWaypointsCompleted =
            location.waypoints &&
            location.waypoints.length > 0 &&
            location.waypoints.every((waypoint) => waypoint.completed)

          // Find the current (latest) uncompleted waypoint for this location
          const sortedWaypoints = location.waypoints
            ? location.waypoints.sort((a, b) => a.order_index - b.order_index)
            : []
          
          const firstUncompletedWaypoint = sortedWaypoints.find(wp => !wp.completed)
          const hasCurrentWaypoint = firstUncompletedWaypoint && location.unlocked

          const isSelectedLocation = selectedLocation?.id === location.id;
          return (
            <div
              key={location.id}
              className={`absolute ${location.position} transform -translate-x-1/4 -translate-y-1/6`}
            >
              {/* Compass image for selected location */}
              {isSelectedLocation && (
                <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 z-20">
                  <img
                    src="/pixel-items/magical-compass.png"
                    alt="Compass"
                    width={100}
                    height={100}
                    className="levitate"
                    style={{ 
                      imageRendering: "pixelated",
                      animation: "levitate 3s ease-in-out infinite"
                    }}
                  />
                </div>
              )}
              <p
                onClick={() => handleLocationClick(location)}
                className={`relative z-10 cursor-pointer text-center font-blaka text-4xl transition-all select-none
                  ${hasCurrentWaypoint && !allWaypointsCompleted
                    ? "text-orange-600 drop-shadow-[0_0_10px_rgba(251,146,60,0.8)] animate-pulse font-bold"
                    : allWaypointsCompleted && isSelectedLocation
                      ? "selected-gold text-black"
                      : allWaypointsCompleted
                        ? "completed-gold text-gray-600"
                        : location.unlocked && isSelectedLocation
                          ? "selected-gold text-black"
                          : location.unlocked
                            ? "text-gray-600 drop-shadow-lg hover:text-gray-700"
                            : "text-gray-300 opacity-50 cursor-not-allowed"}
                  ${(isSelectedLocation || location.unlocked) ? "transition-transform duration-200" : ""}
                  ${(isSelectedLocation || location.unlocked) ? "hover:scale-125" : ""}
                  ${isSelectedLocation ? "scale-125" : ""}`}
              >
                {location.name}
              </p>
            </div>
          )
        })}
      </div>

      {/* Selected location waypoints */}
      {selectedLocation && (
        <div className="bg-amber-800 rounded-lg p-4 text-white" data-waypoints-section>
          <h3 className="text-3xl font-medium mb-4 font-[Blaka]">{selectedLocation.name}</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            {selectedLocation.waypoints && selectedLocation.waypoints.length > 0 ? (
              selectedLocation.waypoints
                .sort((a, b) => a.order_index - b.order_index)
                .map((waypoint) => {
                  // Check if all previous waypoints are completed
                  const previousWaypoints = selectedLocation.waypoints
                    .filter((w) => w.order_index < waypoint.order_index)
                    .sort((a, b) => a.order_index - b.order_index)

                  const allPreviousCompleted =
                    previousWaypoints.length === 0 || previousWaypoints.every((w) => w.completed)

                  // Determine if this waypoint is available
                  const isAvailable = allPreviousCompleted

                  // Determine if this waypoint is completed
                  const isCompleted = waypoint.completed

                  const isSelected = selectedLocation && selectedLocation.waypoints && waypoint.id === selectedLocation.waypoints.find(wp => wp.id === waypoint.id)?.id;
                  return (
                    <button
                      type="button"
                      key={waypoint.id}
                      onClick={() => handleWaypointClick(waypoint)}
                      disabled={!isAvailable || isLoading}
                      className={`p-4 rounded-lg text-center transition-all min-h-[120px] flex flex-col justify-center
                        ${isCompleted
                          ? "bg-green-500 text-white"
                          : isAvailable
                            ? "bg-amber-500 text-white hover:bg-amber-600"
                            : "bg-gray-400 text-gray-200 opacity-60 cursor-not-allowed"}`}
                    >
                      <div className="font-bold mb-1">{waypoint.name}</div>
                      <div className="text-xs">
                        {waypoint.type === "intro" || waypoint.type === "story" ? "Story" : "Game"}
                      </div>
                    </button>
                  )
                })
            ) : (
              <div className="col-span-5 text-center p-4">
                <p>No waypoints available for this location yet.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
