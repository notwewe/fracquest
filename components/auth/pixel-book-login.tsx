"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export function PixelBookLogin() {
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
      // Use client-side login with proper error handling
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      if (!data.user) {
        throw new Error('No user returned from login')
      }

      console.log("✅ Login successful, user ID:", data.user.id)
      
      // Get user profile to determine redirect
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role_id")
        .eq("id", data.user.id)
        .single()

      if (profileError) {
        console.error("Profile retrieval error:", profileError)
        throw new Error("Error retrieving user profile")
      }

      // Determine redirect URL
      let redirectUrl = '/student/dashboard'

      if (profileData) {
        if (profileData.role_id === 1) {
          // Student - check if they've seen intro
          const { data: storyData } = await supabase
            .from('story_progress')
            .select('has_seen_intro')
            .eq('student_id', data.user.id)
            .maybeSingle()

          redirectUrl = storyData?.has_seen_intro
            ? '/student/dashboard'
            : '/student/story'
        } else if (profileData.role_id === 2) {
          redirectUrl = '/teacher/dashboard'
        } else if (profileData.role_id === 3) {
          redirectUrl = '/admin/dashboard'
        }
      }

      console.log("🔄 Redirecting to:", redirectUrl)
      
      // Use router.push for client-side navigation
      // Since we're using localStorage, this will work reliably
      router.push(redirectUrl)
      
    } catch (error: any) {
      console.error("❌ Login error:", error)
      setError(error.message || "An error occurred during login")
      setIsLoading(false)
    }
  }

  return (
    <div className="relative w-full max-w-4xl">
      {/* Book image */}
      <div className="relative">
        <Image
          src="/pixel-book-background.png"
          alt="Book"
          width={800}
          height={500}
          className="pixelated w-full h-auto"
        />

        {/* Content overlay */}
        <div className="absolute inset-0 flex">
          {/* Left page - Welcome */}
          <div className="flex-1 flex flex-col items-center justify-center pt-16 px-8">
            <h1 className="text-red-800 font-pixel text-2xl mb-2">Welcome to</h1>
            <h1 className="text-gray-800 font-pixel text-5xl transform -rotate-2">FracQuest</h1>
          </div>

          {/* Right page - Login form */}
          <div className="flex-1 flex flex-col pt-16 px-8">
            <h2 className="text-gray-800 font-pixel text-2xl mb-6 transform rotate-2">Login</h2>

            {error && (
              <div className="bg-red-800 bg-opacity-20 border border-red-800 text-red-900 px-3 py-2 rounded-md mb-4 text-sm font-pixel">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Username/Email input */}
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                  className="w-full px-3 py-2 bg-amber-100 border-2 border-amber-800 rounded-md font-pixel text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
              </div>

              {/* Password input */}
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="w-full px-3 py-2 bg-amber-100 border-2 border-amber-800 rounded-md font-pixel text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
              </div>

              {/* Login button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-amber-800 hover:bg-amber-700 text-amber-100 font-pixel py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Login"
                )}
              </button>

              {/* Register link */}
              <div className="text-center mt-4">
                <Link href="/auth/register" className="text-amber-800 hover:text-amber-600 font-pixel text-sm">
                  Don&apos;t have an account? Register
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Book bookmark */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/4">
        <Image src="/pixel-bookmark.png" alt="Bookmark" width={60} height={120} className="pixelated" />
      </div>
    </div>
  )
}
