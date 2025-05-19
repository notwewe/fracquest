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
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      if (data.user) {
        // Get user metadata to check for role_id
        const roleIdFromMetadata = data.user.user_metadata?.role_id

        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("role_id")
          .eq("id", data.user.id)
          .maybeSingle()

        if (profileError) {
          console.error("Profile retrieval error:", profileError)
        }

        // Determine the role - prefer metadata over profile
        const roleId = roleIdFromMetadata || (profileData && profileData.role_id)

        // If we have a role from either source, use it
        if (roleId) {
          // Create profile if it doesn't exist but role is in metadata
          if (!profileData && roleIdFromMetadata) {
            try {
              await supabase.from("profiles").upsert({
                id: data.user.id,
                username: data.user.user_metadata?.username || data.user.email?.split("@")[0] || "User",
                role_id: roleIdFromMetadata,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              console.log("Profile created from metadata during login")
            } catch (err) {
              console.error("Error creating profile from metadata:", err)
            }
          }

          if (roleId === 1) {
            // Student
            // Check if student has seen intro story
            const { data: storyData } = await supabase
              .from("story_progress")
              .select("has_seen_intro")
              .eq("student_id", data.user.id)
              .maybeSingle()

            if (storyData && storyData.has_seen_intro) {
              router.push("/student/dashboard")
            } else {
              router.push("/student/story")
            }
          } else if (roleId === 2) {
            // Teacher
            router.push("/teacher/dashboard")
          } else {
            // Default to student dashboard if role is unknown
            router.push("/student/dashboard")
          }
        } else {
          // If no role found anywhere, create a default student role
          try {
            await supabase.from("profiles").upsert({
              id: data.user.id,
              username: data.user.user_metadata?.username || data.user.email?.split("@")[0] || "User",
              role_id: 1, // Default to student
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })

            // Create story progress for the new student
            await supabase.from("story_progress").insert({
              student_id: data.user.id,
              has_seen_intro: false,
              last_dialogue_index: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })

            console.log("Created default student profile")
            router.push("/student/story")
          } catch (err) {
            console.error("Error creating default profile:", err)
            // Even if there's an error, still redirect to student dashboard
            router.push("/student/dashboard")
          }
        }
      }
    } catch (error: any) {
      setError(error.message || "An error occurred during login")
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
