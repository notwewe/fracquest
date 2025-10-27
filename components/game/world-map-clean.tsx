"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

type Waypoint = {
  id: number
  name: string
  description: string
  section_id: number
  order_index: number
  waypoint_type: "story" | "game"
  is_unlocked_by_default: boolean
}

type Progress = {
  waypoint_id: number
  completed: boolean
  can_revisit: boolean
}

type Location = {
  id: number
  name: string
  waypoints: Waypoint[]
  position: string
  isUnlocked: boolean
  completedCount: number
  totalCount: number
}

export function WorldMapClean() {
  const [locations, setLocations] = useState<Location[]>([])
  const [progress, setProgress] = useState<Progress[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        // Fetch waypoints
        const { data: waypoints } = await supabase.from("waypoints").select("*").order("section_id, order_index")

        // Fetch user progress
        const { data: userProgress } = await supabase
          .from("student_progress")
          .select("waypoint_id, completed, can_revisit")
          .eq("student_id", user.id)

        if (waypoints && userProgress) {
          setProgress(userProgress)

          // Group waypoints by section
          const locationMap = new Map<number, Location>()

          waypoints.forEach((waypoint) => {
            if (!locationMap.has(waypoint.section_id)) {
              locationMap.set(waypoint.section_id, {
                id: waypoint.section_id,
                name: getSectionName(waypoint.section_id),
                waypoints: [],
                position: getSectionPosition(waypoint.section_id),
                isUnlocked: false,
                completedCount: 0,
                totalCount: 0,
              })
            }

            const location = locationMap.get(waypoint.section_id)!
            location.waypoints.push(waypoint)
            location.totalCount++

            // Check if waypoint is completed
            const waypointProgress = userProgress.find((p) => p.waypoint_id === waypoint.id)
            if (waypointProgress?.completed) {
              location.completedCount++
            }

            // Check if location is unlocked (has any progress or is first level)
            if (waypoint.is_unlocked_by_default || waypointProgress) {
              location.isUnlocked = true
            }
          })

          setLocations(Array.from(locationMap.values()))
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getSectionName = (sectionId: number): string => {
    const names = {
      1: "Arithmetown",
      2: "Lessmore Bridge",
      3: "Fraction Forest",
      4: "Realm of Balance",
      5: "Dreadpoint Hollow",
    }
    return names[sectionId as keyof typeof names] || `Section ${sectionId}`
  }

  const getSectionPosition = (sectionId: number): string => {
    const positions = {
      1: "top-20 left-20",
      2: "top-32 right-32",
      3: "bottom-40 left-16",
      4: "bottom-32 right-20",
      5: "bottom-8 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
    }
    return positions[sectionId as keyof typeof positions] || "top-1/2 left-1/2"
  }

  const isWaypointUnlocked = (waypoint: Waypoint): boolean => {
    // First waypoint is always unlocked
    if (waypoint.is_unlocked_by_default) return true

    // Check if user has progress for this waypoint (either completed or in progress)
    const waypointProgress = progress.find((p) => p.waypoint_id === waypoint.id)
    if (waypointProgress) return true

    // Check if previous waypoint in same section is completed
    const location = locations.find((l) => l.id === waypoint.section_id)
    if (location) {
      const waypointIndex = location.waypoints.findIndex((w) => w.id === waypoint.id)
      if (waypointIndex > 0) {
        const previousWaypoint = location.waypoints[waypointIndex - 1]
        const previousProgress = progress.find((p) => p.waypoint_id === previousWaypoint.id)
        return previousProgress?.completed || false
      }
    }

    // Check if previous section is completed (for first waypoint of new section)
    if (waypoint.order_index === 1 && waypoint.section_id > 1) {
      const previousSection = locations.find((l) => l.id === waypoint.section_id - 1)
      if (previousSection) {
        return previousSection.completedCount === previousSection.totalCount
      }
    }

    return false
  }

  const isWaypointCompleted = (waypointId: number): boolean => {
    const waypointProgress = progress.find((p) => p.waypoint_id === waypointId)
    return waypointProgress?.completed || false
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-white text-2xl font-pixel">Loading world map...</div>
      </div>
    )
  }

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900 via-blue-900 to-black"></div>

      {/* Back to Dashboard Button */}
      <div className="absolute top-8 left-8 z-20">
        <Button asChild variant="outline" className="font-pixel border-amber-600 text-amber-200 bg-black/50">
          <Link href="/student/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      {/* Title */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20">
        <h1 className="text-4xl font-pixel text-amber-200">World of Numeria</h1>
      </div>

      {/* Locations */}
      {locations.map((location) => (
        <div key={location.id} className={`absolute ${location.position} z-10`}>
          <div className="relative">
            {/* Location Button */}
            <Button
              className={`w-32 h-32 rounded-full font-pixel text-sm ${
                location.isUnlocked
                  ? location.completedCount === location.totalCount
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-amber-600 hover:bg-amber-700 text-white"
                  : "bg-gray-600 text-gray-400 cursor-not-allowed"
              }`}
              disabled={!location.isUnlocked}
            >
              <div className="text-center">
                <div className="text-xs">{location.name}</div>
                <div className="text-xs mt-1">
                  {location.completedCount}/{location.totalCount}
                </div>
              </div>
            </Button>

            {/* Waypoint List */}
            {location.isUnlocked && (
              <div className="absolute top-36 left-1/2 transform -translate-x-1/2 bg-black/80 rounded-lg p-4 min-w-64">
                <h3 className="text-amber-200 font-pixel text-lg mb-2 text-center">{location.name}</h3>
                <div className="space-y-2">
                  {location.waypoints.map((waypoint) => {
                    const unlocked = isWaypointUnlocked(waypoint)
                    const completed = isWaypointCompleted(waypoint.id)

                    return (
                      <div key={waypoint.id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-white font-pixel text-sm">{waypoint.name}</div>
                          <div className="text-gray-400 text-xs">
                            {waypoint.waypoint_type === "story" ? "📖 Story" : "🎮 Game"}
                          </div>
                        </div>
                        <div className="ml-2">
                          {unlocked ? (
                            <Button
                              asChild
                              size="sm"
                              className={`font-pixel ${
                                completed ? "bg-green-600 hover:bg-green-700" : "bg-amber-600 hover:bg-amber-700"
                              } text-white`}
                            >
                              <Link
                                href={
                                  waypoint.waypoint_type === "story"
                                    ? `/student/game/level/${waypoint.id}`
                                    : `/student/game/play/${waypoint.id}`
                                }
                              >
                                {completed ? "Replay" : "Play"}
                              </Link>
                            </Button>
                          ) : (
                            <Button size="sm" disabled className="font-pixel bg-gray-600 text-gray-400">
                              Locked
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Legend */}
      <div className="absolute bottom-8 right-8 bg-black/80 rounded-lg p-4">
        <h3 className="text-amber-200 font-pixel text-lg mb-2">Legend</h3>
        <div className="space-y-1 text-sm font-pixel">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-600 rounded mr-2"></div>
            <span className="text-white">Completed</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-amber-600 rounded mr-2"></div>
            <span className="text-white">Available</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-600 rounded mr-2"></div>
            <span className="text-gray-400">Locked</span>
          </div>
        </div>
      </div>
    </div>
  )
}
