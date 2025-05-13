"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface DebugButtonProps {
  waypointId: number
  label?: string
}

export function DebugButton({ waypointId, label = "Force Complete" }: DebugButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleClick = async () => {
    setIsLoading(true)
    try {
      await fetch(`/debug/force-complete/${waypointId}`)
      router.refresh()
      router.push("/student/game")
    } catch (error) {
      console.error("Error forcing completion:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleClick} disabled={isLoading} className="bg-purple-600 hover:bg-purple-700 text-white w-full">
      {isLoading ? "Processing..." : label}
    </Button>
  )
}
