"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import ConversionGame from "./levels/conversion-game"
import { CompassGame } from "./levels/compass-game"

type GameContentProps = {
  waypoint: {
    id: number
    name: string
    description: string
    type: string
    section_id: number
    order_index: number
  }
}

export function GameContent({ waypoint }: GameContentProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const { data } = await supabase
            .from("student_progress")
            .select("*")
            .eq("student_id", user.id)
            .eq("waypoint_id", waypoint.id)
            .maybeSingle()

          setProgress(data)
        }
      } catch (error) {
        console.error("Error loading progress:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProgress()
  }, [waypoint.id])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-2xl font-pixel text-amber-800">Loading...</div>
      </div>
    )
  }

  // Render the appropriate game component based on the waypoint name
  if (waypoint.name === "Improper/Mixed Game") {
    return <ConversionGame levelId={waypoint.id.toString()} />
  }

  if (waypoint.name === "Addition Game") {
    return <CompassGame levelId={waypoint.id.toString()} />
  }

  // Fallback for other games that haven't been implemented yet
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-amber-50 p-6">
      <h1 className="text-3xl font-pixel text-amber-800 mb-6">{waypoint.name}</h1>
      <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl w-full">
        <p className="text-amber-700 mb-4">This game is coming soon! Check back later for more fraction adventures.</p>
      </div>
    </div>
  )
}
