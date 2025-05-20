"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

// Email component with viewport-relative styling
const Email = ({ value, onChange }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <div className="mb-[1.5vh]">
    <label htmlFor="email" className="block text-[#323232] font-blaka text-[1.5vw] mb-[0.5vh] transform rotate-3">
      Email
    </label>
    <input
      id="email"
      type="email"
      value={value}
      onChange={onChange}
      required
      className="w-full px-[1vw] py-[1vh] bg-[#DBC69F] border-[0.2vw] border-black rounded-[1vw] font-blaka text-[1.5vw] text-[#323232] placeholder-black focus:outline-none focus:bg-[#DBC69F] transform rotate-3 opacity-75"
    />
  </div>
)

// Password component with viewport-relative styling
const Password = ({
  value,
  onChange,
}: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <div className="mb-[2vh]">
    <label htmlFor="password" className="block text-[#323232] font-blaka text-[1.5vw] mb-[0.5vh] transform rotate-3">
      Password
    </label>
    <input
      id="password"
      type="password"
      value={value}
      onChange={onChange}
      required
      className="w-full px-[1vw] py-[1vh] bg-[#DBC69F] border-[0.2vw] border-black rounded-[1vw] font-blaka text-[1.5vw] text-[#323232] placeholder-black focus:outline-none focus:bg-[#DBC69F] transform rotate-3 opacity-75"
    />
  </div>
)

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    // Prevent multiple submissions
    if (isLoading) return

    setIsLoading(true)
    setError(null)

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

      // Redirect based on role
      if (profile.role_id === 3) {
        // Admin - force redirect to admin dashboard
        window.location.href = "/admin/dashboard"
        return
      } else if (profile.role_id === 2) {
        // Teacher
        window.location.href = "/teacher/dashboard"
        return
      } else if (profile.role_id === 1) {
        // Student - check if they've seen the intro
        const { data: storyData } = await supabase
          .from("story_progress")
          .select("has_seen_intro")
          .eq("student_id", data.user.id)
          .maybeSingle()

        if (storyData && storyData.has_seen_intro) {
          window.location.href = "/student/dashboard"
        } else {
          window.location.href = "/student/story"
        }
        return
      } else {
        // Unknown role - default to student dashboard
        window.location.href = "/student/dashboard"
        return
      }
    } catch (error: any) {
      setError(error.message || "An error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin} className="w-full">
      {error && (
        <div className="bg-red-800 bg-opacity-20 border border-red-800 text-red-900 px-[1vw] py-[0.5vh] rounded-[0.5vw] mb-[1vh] text-[1.2vw] font-blaka">
          {error}
        </div>
      )}

      {/* Email component */}
      <Email value={email} onChange={(e) => setEmail(e.target.value)} />

      {/* Password component */}
      <Password value={password} onChange={(e) => setPassword(e.target.value)} />

      {/* Login button with viewport-relative styling */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#ba4c3c] hover:bg-[#a04234] text-[#f8d78b] font-blaka text-[1.5vw] py-[1vh] px-[1vw] rounded-[1vw] transition-colors duration-200 mb-[1.5vh] transform rotate-3"
      >
        {isLoading ? "Loading..." : "Login"}
      </button>

      {/* Register link with viewport-relative styling - updated to point to role selection */}
      <div className="text-center transform rotate-3">
        <span className="text-[#323232] font-blaka text-[1.2vw]">Don&apos;t have an account? </span>
        <Link href="/auth/select-role-register" className="text-[#ba4c3c] hover:text-[#a04234] font-blaka text-[1.2vw]">
          Register
        </Link>
      </div>
    </form>
  )
}
