"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function AdminLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    try {
      // Sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      if (!data.user) {
        throw new Error("No user returned from login")
      }

      // Get user profile directly from database
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role_id, username")
        .eq("id", data.user.id)
        .single()

      if (profileError) {
        throw new Error(`Failed to get profile: ${profileError.message}`)
      }

      if (!profile) {
        throw new Error("No profile found for user")
      }

      setMessage(`User role: ${profile.role_id}`)

      // Redirect based on role
      if (profile.role_id === 3) {
        // Admin - force redirect to admin dashboard
        setMessage("Admin login successful! Redirecting...")
        window.location.href = "/admin/dashboard"
      } else {
        setMessage("This user is not an admin. Role: " + profile.role_id)
        setIsLoading(false)
      }
    } catch (error: any) {
      setMessage(error.message || "An error occurred during login")
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Admin Login</h1>

      {message && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">{message}</div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="email" className="block mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label htmlFor="password" className="block mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          {isLoading ? "Loading..." : "Login"}
        </button>
      </form>
    </div>
  )
}
