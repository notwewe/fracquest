"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"

// Add floating animation keyframes
const floatingAnimation = `
@keyframes float {
  0% {
    transform: translateY(0px) rotate(0deg);
  }
  25% {
    transform: translateY(-5px) rotate(0.5deg);
  }
  50% {
    transform: translateY(0px) rotate(0deg);
  }
  75% {
    transform: translateY(5px) rotate(-0.5deg);
  }
  100% {
    transform: translateY(0px) rotate(0deg);
  }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
}

.animate-pulse-slow {
  animation: pulse 2s ease-in-out infinite;
}
`

// Cloud object type
type Cloud = {
  id: number
  cloudNumber: number
  top: string
  left: string
  speed: number
  direction: 1 | -1
  size: number
  isActive: boolean
}

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [clouds, setClouds] = useState<Cloud[]>([])
  const [windowWidth, setWindowWidth] = useState(0)
  const cloudIdCounter = useRef(0)
  const supabase = createClient()

  // Track window size for responsive adjustments
  useEffect(() => {
    // Set initial window width
    setWindowWidth(window.innerWidth)

    // Update window width on resize
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Initialize clouds
  useEffect(() => {
    if (!windowWidth) return

    // Create initial set of clouds
    const initialClouds: Cloud[] = []

    // Adjust number of clouds based on screen size
    const cloudCount = windowWidth < 640 ? 5 : 8

    // Create clouds
    for (let i = 0; i < cloudCount; i++) {
      initialClouds.push(createNewCloud())
    }

    setClouds(initialClouds)

    // Start cloud animation
    const intervalId = setInterval(() => {
      setClouds((prevClouds) => {
        return prevClouds.map((cloud) => {
          // Move cloud based on its speed and direction
          const currentLeft = Number.parseFloat(cloud.left)
          const newLeft = currentLeft + cloud.speed * cloud.direction

          // Check if cloud has left the viewport
          if ((cloud.direction === 1 && newLeft > 110) || (cloud.direction === -1 && newLeft < -30)) {
            // Replace with a new cloud from the opposite side
            return createNewCloud(cloud.direction === 1 ? -1 : 1)
          }

          // Update cloud position
          return {
            ...cloud,
            left: `${newLeft}%`,
          }
        })
      })
    }, 33) // ~30fps for smooth animation

    return () => clearInterval(intervalId)
  }, [windowWidth])

  // Function to create a new cloud
  const createNewCloud = (forcedDirection?: -1 | 1): Cloud => {
    // Randomly select cloud image (1, 2, or 3)
    const cloudNumber = Math.floor(Math.random() * 3) + 1

    // Adjust cloud size based on screen width
    const baseSize = windowWidth < 640 ? 120 : windowWidth < 1024 ? 150 : 180
    const sizeVariation = windowWidth < 640 ? 60 : 100

    // Random cloud size
    const size = Math.floor(Math.random() * sizeVariation) + baseSize

    // Random speed between 0.08 and 0.2, adjusted for screen size
    const speedFactor = windowWidth < 640 ? 0.7 : 1
    const speed = (Math.random() * 0.12 + 0.08) * speedFactor

    // Random direction (left or right) if not forced
    const direction = forcedDirection || (Math.random() > 0.5 ? 1 : -1)

    // Random vertical position between 5% and 85%
    const top = `${Math.floor(Math.random() * 80) + 5}%`

    // Starting position based on direction
    // If moving right, start from left (-20% to -10%)
    // If moving left, start from right (110% to 120%)
    const left =
      direction === 1 ? `${Math.floor(Math.random() * 10) - 20}%` : `${Math.floor(Math.random() * 10) + 110}%`

    return {
      id: cloudIdCounter.current++,
      cloudNumber,
      top,
      left,
      speed,
      direction,
      size,
      isActive: true,
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      if (!data.user) throw new Error("No user returned from login")

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role_id, username")
        .eq("id", data.user.id)
        .single()

      if (profileError) throw new Error(`Failed to get profile: ${profileError.message}`)
      if (!profile) throw new Error("No profile found for user")

      // Redirect based on role
      if (profile.role_id === 3) {
        window.location.href = "/admin/dashboard"
      } else if (profile.role_id === 2) {
        window.location.href = "/teacher/dashboard"
      } else if (profile.role_id === 1) {
        // Check if student has seen intro
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
      } else {
        window.location.href = "/student/dashboard"
      }
    } catch (error: any) {
      setError(error.message || "An error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }

  // Add the animation styles to the document
  useEffect(() => {
    // Create style element
    const styleElement = document.createElement("style")
    styleElement.innerHTML = floatingAnimation
    document.head.appendChild(styleElement)

    // Clean up
    return () => {
      document.head.removeChild(styleElement)
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-[#8B3734] flex flex-col items-center justify-center min-h-screen overflow-hidden">
      {/* Full-width container for clouds */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {/* Render all active clouds */}
        {clouds.map((cloud) => (
          <div
            key={cloud.id}
            className="absolute pixelated z-10"
            style={{
              top: cloud.top,
              left: cloud.left,
              width: `${cloud.size}px`,
              height: "auto",
              transition: "left 0.033s linear", // Very smooth transition
            }}
          >
            <Image
              src={`/auth/cloud-${cloud.cloudNumber}.webp`}
              alt="Cloud"
              width={cloud.size}
              height={cloud.size / 2}
              className="pixelated"
            />
          </div>
        ))}
      </div>

      {/* Centered content container */}
      <div className="relative z-20 flex flex-col items-center justify-center w-full max-w-md mx-auto">
        {/* Title Banner with floating animation */}
        <div className="relative mb-4 flex justify-center w-full">
          <div className="relative animate-float w-[280px] sm:w-[320px] md:w-[360px]">
            <Image
              src="/auth/header-banner.png"
              alt="FracQuest Banner"
              width={400}
              height={100}
              className="w-full h-auto"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <h1 className="font-blaka text-amber-900 text-xl sm:text-2xl pt-1">FracQuest</h1>
            </div>
          </div>
        </div>

        {/* Container with task blank as background */}
        <div className="relative w-[340px] sm:w-[380px] md:w-[420px]">
          <div className="relative">
            {/* Task blank image as background */}
            <Image
              src="/auth/task-blank.png"
              alt="Login form background"
              width={420}
              height={630}
              className="w-full h-auto"
              priority
            />

            {/* Form content positioned over the task blank with adjusted positioning */}
            <div className="absolute inset-0 flex flex-col items-center pt-[30%]">
              {/* Inner container with adjusted width */}
              <div className="w-[65%] mx-auto">
                {/* Error message if any */}
                {error && (
                  <div className="w-full bg-red-800 bg-opacity-70 border border-red-900 text-amber-100 px-3 py-2 rounded mb-4 text-xs">
                    {error}
                  </div>
                )}

                <form onSubmit={handleLogin} className="w-full">
                  {/* Email field - positioned lower with smaller size */}
                  <div className="mb-8">
                    <label htmlFor="email" className="block text-amber-900 font-medieval text-xs mb-1">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-3 py-1.5 bg-[#fff8e7] border border-amber-800 rounded text-amber-900 text-xs focus:outline-none focus:ring-1 focus:ring-amber-600"
                    />
                  </div>

                  {/* Password field - positioned lower with smaller size */}
                  <div className="mb-10">
                    <label htmlFor="password" className="block text-amber-900 font-medieval text-xs mb-1">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-3 py-1.5 bg-[#fff8e7] border border-amber-800 rounded text-amber-900 text-xs focus:outline-none focus:ring-1 focus:ring-amber-600"
                    />
                  </div>

                  {/* Login button - centered */}
                  <div className="flex justify-center mb-6">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-amber-800 hover:bg-amber-700 text-amber-100 font-blaka py-1.5 px-8 rounded-md transition-colors duration-200 text-base"
                    >
                      {isLoading ? "Loading..." : "Login"}
                    </button>
                  </div>

                  {/* Register link - centered */}
                  <div className="text-center mb-4">
                    <span className="text-amber-900 text-xs">Don&apos;t have an account? </span>
                    <a
                      href="/auth/select-role-register"
                      className="text-amber-700 hover:text-amber-600 font-bold text-xs"
                    >
                      Register
                    </a>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
