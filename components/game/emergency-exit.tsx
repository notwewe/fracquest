"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function EmergencyExit() {
  const router = useRouter()

  return (
    <div className="fixed top-4 right-4 z-50">
      <Button
        onClick={() => router.push("/student/game")}
        className="font-pixel bg-red-600 hover:bg-red-700 text-white"
      >
        Emergency Exit
      </Button>
    </div>
  )
}
