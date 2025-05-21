"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export function LogoutButton({ className = "" }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)

      // Try to sign out directly
      await supabase.auth.signOut()

      // Redirect to login page
      router.push("/auth/login")
      router.refresh()
    } catch (error) {
      console.error("Logout error:", error)

      // If direct logout fails, try the simple logout page
      router.push("/auth/logout")
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
