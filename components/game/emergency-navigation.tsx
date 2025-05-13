"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { HelpCircle } from "lucide-react"

export function EmergencyNavigation() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed top-4 right-4 z-50">
      <Button
        variant="outline"
        size="icon"
        className="rounded-full bg-amber-600 hover:bg-amber-700 text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <HelpCircle className="h-5 w-5" />
      </Button>

      {isOpen && (
        <div className="absolute top-12 right-0 bg-gray-900 border-2 border-amber-600 rounded-md p-4 w-64 shadow-lg">
          <h3 className="text-amber-300 font-pixel text-lg mb-2">Need help?</h3>
          <p className="text-white text-sm mb-4">If you're stuck, try one of these options:</p>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full font-pixel text-white border-amber-600 hover:bg-amber-700"
              onClick={() => router.push("/student/dashboard")}
            >
              Go to Dashboard
            </Button>
            <Button
              variant="outline"
              className="w-full font-pixel text-white border-amber-600 hover:bg-amber-700"
              onClick={() => router.push("/student/game")}
            >
              Go to Game Map
            </Button>
            <Button
              variant="outline"
              className="w-full font-pixel text-white border-amber-600 hover:bg-amber-700"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
            <Button
              variant="outline"
              className="w-full font-pixel text-white border-amber-600 hover:bg-amber-700"
              onClick={() => {
                // Force click the Next button
                const nextButton = document.querySelector('button:contains("Next")') as HTMLButtonElement
                if (nextButton) {
                  nextButton.click()
                }
              }}
            >
              Force Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
