"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function LevelDebug() {
  const router = useRouter()
  const [isDebugVisible, setIsDebugVisible] = useState(false)

  return (
    <div className="fixed top-0 right-0 z-50">
      <Button onClick={() => setIsDebugVisible(!isDebugVisible)} className="bg-red-600 hover:bg-red-700 text-white">
        Debug
      </Button>

      {isDebugVisible && (
        <div className="bg-black bg-opacity-90 p-4 text-white">
          <h3 className="text-lg font-bold mb-2">Debug Tools</h3>
          <div className="space-y-2">
            <Button
              onClick={() => router.push("/student/game")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Return to Game
            </Button>
            <Button onClick={() => router.refresh()} className="w-full bg-green-600 hover:bg-green-700 text-white">
              Refresh Page
            </Button>
            <Button
              onClick={() => router.push("/student/dashboard")}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
