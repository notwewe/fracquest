"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function SimpleLogoutPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function handleLogout() {
      try {
        await supabase.auth.signOut()
      } catch (error) {
        console.error("Client logout error:", error)
      } finally {
        router.push("/auth/login")
      }
    }

    handleLogout()
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Logging out...</h1>
        <p>You will be redirected to the login page shortly.</p>
      </div>
    </div>
  )
}
