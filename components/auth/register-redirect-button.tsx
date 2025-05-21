"use client"

import { useRouter } from "next/navigation"

export function RegisterRedirectButton() {
  const router = useRouter()

  const handleClick = () => {
    console.log("Register button clicked")
    // Try multiple navigation methods
    try {
      // Method 1: Direct window location change
      window.location.href = "/auth/select-role-register"
    } catch (error) {
      console.error("Navigation error:", error)
    }
  }

  return (
    <button
      onClick={handleClick}
      className="text-[#ba4c3c] hover:text-[#a04234] font-blaka text-[1.2vw] bg-transparent border-none cursor-pointer p-2"
    >
      Register (Test)
    </button>
  )
}
