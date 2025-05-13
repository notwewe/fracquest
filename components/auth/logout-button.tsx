"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function LogoutButton({ className = "" }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)

      // First try the API route
      const response = await fetch("/api/logout")

      // Redirect regardless of response
      router.push("/auth/login")
      router.refresh()
    } catch (error) {
      console.error("Logout error:", error)
      // If all else fails, just redirect to login
      router.push("/auth/login")
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded ${isLoggingOut ? "opacity-50" : ""} ${className}`}
    >
      {isLoggingOut ? "Logging out..." : "Logout"}
    </button>
  )
}
