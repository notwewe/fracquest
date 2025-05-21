"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

export function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [email, setEmail] = useState("")
  const [classCode, setClassCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [roleId, setRoleId] = useState<number | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Get role from URL params
    const role = searchParams.get("role")
    if (role) {
      setRoleId(Number.parseInt(role))
    } else {
      // If no role is provided, redirect back to role selection
      router.push("/auth/select-role-register")
    }
  }, [searchParams, router])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!roleId) {
      setError("Please select a role first")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Register user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            username,
            role_id: roleId,
          },
        },
      })

      if (error) throw error

      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase.from("profiles").upsert({
          id: data.user.id,
          username,
          role_id: roleId,
          created_at: new Date().toISOString(),
        })

        if (profileError) console.error("Error creating profile:", profileError)

        // Create story progress for student
        if (roleId === 1) {
          const { error: progressError } = await supabase.from("story_progress").insert({
            student_id: data.user.id,
            has_seen_intro: false,
            last_dialogue_index: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

          if (progressError) console.error("Error creating story progress:", progressError)
        }

        // If class code provided and user is a student, join class
        if (roleId === 1 && classCode.trim()) {
          const { data: classData, error: classError } = await supabase
            .from("classes")
            .select("id")
            .eq("class_code", classCode.trim())
            .single()

          if (classError) {
            console.error("Class lookup error:", classError)
            setError(`Invalid class code: ${classCode}`)
            setIsLoading(false)
            return
          }

          if (classData) {
            const { error: joinError } = await supabase.from("student_classes").insert({
              student_id: data.user.id,
              class_id: classData.id,
            })

            if (joinError) console.error("Error joining class:", joinError)
          }
        }

        // Redirect to login
        setTimeout(() => {
          router.push("/auth/login")
        }, 2000)
      }
    } catch (error: any) {
      setError(error.message || "Registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  // Show class code field only for students
  const isStudent = roleId === 1

  return (
    <div className="relative w-full">
      {error && (
        <div className="absolute -top-12 left-0 right-0 bg-red-200 border border-red-500 text-red-700 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="relative">
        {/* Username input */}
        <div className="relative mb-[2hv] mt-[70px]">
          <label
            htmlFor="username"
            className="block text-[#323232] font-blaka text-[1.5vw] mb-[0.5vh] transform -rotate-3"
          >
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full px-[1vw] py-[0.5vh] bg-[#DBC69F] border-[0.2vw] border-black rounded-[1vw] font-blaka text-[1.3vw] text-[#323232] placeholder-black focus:outline-none focus:bg-[#DBC69F] transform -rotate-3 opacity-75"
          />
        </div>

        {/* Password input */}
        <div className="relative mb-[2hv]">
          <label
            htmlFor="password"
            className="block text-[#323232] font-blaka text-[1.5vw] mb-[0.5vh] transform -rotate-3"
          >
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-[1vw] py-[0.5vh] bg-[#DBC69F] border-[0.2vw] border-black rounded-[1vw] font-blaka text-[1.3vw] text-[#323232] placeholder-black focus:outline-none focus:bg-[#DBC69F] transform -rotate-3 opacity-75"
          />
        </div>

        {/* Email input */}
        <div className="relative mb-[2hv]">
          <label
            htmlFor="email"
            className="block text-[#323232] font-blaka text-[1.5vw] mb-[0.5vh] transform -rotate-3"
          >
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-[1vw] py-[0.5vh] bg-[#DBC69F] border-[0.2vw] border-black rounded-[1vw] font-blaka text-[1.3vw] text-[#323232] placeholder-black focus:outline-none focus:bg-[#DBC69F] transform -rotate-3 opacity-75"
          />
        </div>

        {/* Class Code input - only for students */}
        {isStudent && (
          <div className="relative mb-[2hv]">
            <label
              htmlFor="class_code"
              className="block text-[#323232] font-blaka text-[1.5vw] mb-[0.5vh] transform -rotate-3"
            >
              Class Code (Optional)
            </label>
            <input
              type="text"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value)}
              className="w-full px-[1vw] py-[0.5vh] bg-[#DBC69F] border-[0.2vw] border-black rounded-[1vw] font-blaka text-[1.3vw] text-[#323232] placeholder-black focus:outline-none focus:bg-[#DBC69F] transform -rotate-3 opacity-75"
            />
          </div>
        )}

        {/* Register button */}
        <div className="relative mt-[3vh]">
          <button
            type="submit"
            disabled={isLoading || !roleId}
            className="w-full bg-[#ba4c3c] hover:bg-[#a04234] text-[#f8d78b] font-blaka text-[1.5vw] py-[0.6vh] px-[1vw] rounded-[1vw] transition-colors duration-200 mb-[1.5vh] transform -rotate-3 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#e8c170]" />
                <span className="text-[#e8c170]">Registering...</span>
              </div>
            ) : (
              "Register"
            )}
          </button>
        </div>

        {/* Back to role selection */}
        <div className="text-center transform -rotate-3">
          <Link
            href="/auth/select-role-register"
            className="text-[#ba4c3c] hover:text-[#a04234] font-blaka text-[1.2vw] mr-4"
          >
            Change Role
          </Link>
          <span className="text-[#323232] font-blaka text-[1.2vw]">Already have an account? </span>
          <Link href="/auth/login" className="text-[#ba4c3c] hover:text-[#a04234] font-blaka text-[1.2vw]">
            Login
          </Link>
        </div>
      </form>
    </div>
  )
}
