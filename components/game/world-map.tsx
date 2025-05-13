"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

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
  const [studentProgress, setStudentProgress] = useState<Record<number, boolean>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const supabase = createClient()

  // Fetch student progress
  const fetchStudentProgress = async () => {
    setIsRefreshing(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Force a refresh of the student_progress table
        try {
          await supabase.rpc("refresh_student_progress")
        } catch (err) {
          console.error("Error refreshing student progress:", err)
        }

        const { data } = await supabase.from("student_progress").select("*").eq("student_id", user.id)

        if (data) {
          const progressMap: Record<number, boolean> = {}
          data.forEach((progress) => {
            progressMap[progress.waypoint_id] = progress.completed
          })
          setStudentProgress(progressMap)
          console.log("Student progress loaded:", progressMap)
        }
      }
    } catch (error) {
      console.error("Error fetching student progress:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchStudentProgress()

    // Set up a refresh interval to keep the map updated
    const intervalId = setInterval(fetchStudentProgress, 5000)

    return () => clearInterval(intervalId)
  }, [])

  // Auto-select the first location when the component mounts
  useEffect(() => {
    if (locations && locations.length > 0 && !selectedLocation) {
      const firstUnlockedLocation = locations.find((loc) => loc.unlocked)
      if (firstUnlockedLocation) {
        setSelectedLocation(firstUnlockedLocation)
      } else if (locations[0]) {
        // If no unlocked locations, select the first one
        setSelectedLocation(locations[0])
      }
    }
  }, [locations, selectedLocation])

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
  }

  const handleWaypointClick = async (waypoint: Waypoint) => {
    if (isLoading) return
    setIsLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "Authentication Error",
          description: "Please log in to continue.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Get all waypoints for the current location
      const currentLocationWaypoints = selectedLocation?.waypoints?.sort((a, b) => a.order_index - b.order_index) || []

      // Find the index of the clicked waypoint
      const waypointIndex = currentLocationWaypoints.findIndex((wp) => wp.id === waypoint.id)

      // Check if all previous waypoints are completed
      const allPreviousCompleted =
        waypointIndex === 0 ||
        (waypointIndex > 0 && currentLocationWaypoints.slice(0, waypointIndex).every((wp) => studentProgress[wp.id]))

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
      console.error("Error handling waypoint click:", error)
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
      {/* Refresh button */}
      <div className="flex justify-end mb-4">
        <Button
          onClick={fetchStudentProgress}
          disabled={isRefreshing}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Refreshing..." : "Refresh Map"}
        </Button>
      </div>

      {/* Map with locations */}
      <div className="relative w-full h-[300px] md:h-[400px] bg-amber-100 rounded-lg border-4 border-amber-800 overflow-hidden mb-4">
        <div className="absolute inset-0 bg-[url('/fantasy-map-pixel-art.png')] bg-cover bg-center opacity-50"></div>

        {/* Locations */}
        {locations.map((location) => {
          // Check if all waypoints in this location are completed
          const allWaypointsCompleted =
            location.waypoints &&
            location.waypoints.length > 0 &&
            location.waypoints.every((waypoint) => studentProgress[waypoint.id])

          return (
            <div
              key={location.id}
              className={`absolute ${location.position} transform -translate-x-1/2 -translate-y-1/2`}
            >
              <button
                onClick={() => handleLocationClick(location)}
                disabled={!location.unlocked || isLoading}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                  allWaypointsCompleted
                    ? "bg-green-500 border-4 border-green-700"
                    : location.unlocked
                      ? "bg-amber-500 border-4 border-amber-700"
                      : "bg-gray-400 border-4 border-gray-600 opacity-50"
                } ${selectedLocation?.id === location.id ? "ring-4 ring-white" : ""}`}
              >
                <span className="text-xs font-bold text-white">{location.name}</span>
              </button>
            </div>
          )
        })}
      </div>

      {/* Selected location waypoints */}
      {selectedLocation && (
        <div className="bg-amber-800 rounded-lg p-4 text-white">
          <h3 className="text-xl font-bold mb-4">{selectedLocation.name}</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            {selectedLocation.waypoints && selectedLocation.waypoints.length > 0 ? (
              selectedLocation.waypoints
                .sort((a, b) => a.order_index - b.order_index)
                .map((waypoint, index) => {
                  // Check if all previous waypoints are completed
                  const previousWaypoints = selectedLocation.waypoints
                    .filter((w) => w.order_index < waypoint.order_index)
                    .sort((a, b) => a.order_index - b.order_index)

                  const allPreviousCompleted =
                    previousWaypoints.length === 0 || previousWaypoints.every((w) => studentProgress[w.id])

                  // Determine if this waypoint is available
                  const isAvailable = allPreviousCompleted

                  // Determine if this waypoint is completed
                  const isCompleted = studentProgress[waypoint.id]

                  return (
                    <button
                      key={waypoint.id}
                      onClick={() => handleWaypointClick(waypoint)}
                      disabled={!isAvailable || isLoading}
                      className={`p-4 rounded-lg text-center transition-all ${
                        isCompleted
                          ? "bg-green-600 hover:bg-green-700"
                          : isAvailable
                            ? "bg-amber-600 hover:bg-amber-700"
                            : "bg-gray-600 opacity-50 cursor-not-allowed"
                      }`}
                    >
                      <div className="font-bold mb-1">{waypoint.name}</div>
                      <div className="text-xs">
                        {waypoint.type === "intro" || waypoint.type === "story" ? "Story" : "Game"}
                      </div>
                      {process.env.NODE_ENV === "development" && (
                        <>
                          <div className="text-xs mt-1">ID: {waypoint.id}</div>
                          <div className="text-xs">Completed: {isCompleted ? "Yes" : "No"}</div>
                          <div className="text-xs">Available: {isAvailable ? "Yes" : "No"}</div>
                        </>
                      )}
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

      {/* Debug info - only visible in development */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-4 bg-gray-100 p-4 rounded-lg">
          <h3 className="font-bold mb-2">Debug Info</h3>
          <div>Progress Data: {JSON.stringify(studentProgress)}</div>
        </div>
      )}
    </div>
  )
}
