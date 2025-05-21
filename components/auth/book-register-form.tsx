"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"
import { Volume2, VolumeX } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { BackgroundSlideshow } from "./background-slideshow"

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

@keyframes bannerWave {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-3px);
  }
  100% {
    transform: translateY(0px);
  }
}

.animate-banner {
  animation: bannerWave 3s ease-in-out infinite;
}

/* Book content positioning */
.book-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
}

.left-page {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 50%;
  height: 100%;
  padding: 5% 8% 15% 8%;
  padding-left: 9%; /* Slightly increased left padding to shift content right */
  padding-right: 7%; /* Slightly decreased right padding */
}

.right-page {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 50%;
  height: 100%;
  padding: 5% 8% 15% 8%;
  padding-left: 7%; /* Slightly decreased left padding to shift content left */
  padding-right: 9%; /* Slightly increased right padding */
}

.welcome-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transform: translateY(-15%) translateX(2%); /* Move content higher and slightly right */
}

.register-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transform: translateY(-8%) translateX(-2%); /* Changed from 0% to -8% to move content up */
  padding-top: 0;
}

@media (max-width: 768px) {
  .left-page {
    padding: 5% 6% 15% 6%;
    padding-left: 8%;
    padding-right: 4%;
  }
  .right-page {
    padding: 5% 6% 15% 6%;
    padding-left: 4%;
    padding-right: 8%;
  }
  .welcome-content {
    transform: translateY(-12%) translateX(1.5%);
  }
  .register-content {
    transform: translateY(-8%) translateX(-1.5%);
  }
}

@media (max-width: 640px) {
  .left-page {
    padding: 5% 5% 15% 5%;
    padding-left: 7%;
    padding-right: 3%;
  }
  .right-page {
    padding: 5% 5% 15% 5%;
    padding-left: 3%;
    padding-right: 7%;
  }
  .welcome-content {
    transform: translateY(-10%) translateX(1%);
  }
  .register-content {
    transform: translateY(-8%) translateX(-1%);
  }
}

@media (max-width: 480px) {
  .left-page {
    padding: 5% 4% 15% 4%;
    padding-left: 6%;
    padding-right: 2%;
  }
  .right-page {
    padding: 5% 4% 15% 4%;
    padding-left: 2%;
    padding-right: 6%;
  }
  .welcome-content {
    transform: translateY(-8%) translateX(0.5%);
  }
  .register-content {
    transform: translateY(-8%) translateX(-0.5%);
  }
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

export function BookRegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [email, setEmail] = useState("")
  const [classCode, setClassCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [roleId, setRoleId] = useState<number | null>(null)
  const [clouds, setClouds] = useState<Cloud[]>([])
  const [windowWidth, setWindowWidth] = useState(0)
  const [windowHeight, setWindowHeight] = useState(0)
  const [isMuted, setIsMuted] = useState(true) // Start muted
  const [audioEnabled, setAudioEnabled] = useState(true) // Track if audio is available
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const cloudIdCounter = useRef(0)
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

  // Track window size for responsive adjustments
  useEffect(() => {
    // Set initial window dimensions
    setWindowWidth(window.innerWidth)
    setWindowHeight(window.innerHeight)

    // Update window dimensions on resize
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
      setWindowHeight(window.innerHeight)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Initialize audio with error handling
  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      // Create audio element if it doesn't exist
      if (!audioRef.current) {
        const audio = new Audio()

        // Set up event listeners before setting src to catch load errors
        audio.addEventListener("error", (e) => {
          console.error("Audio error details:", {
            code: audio.error?.code,
            message: audio.error?.message,
          })
          setAudioEnabled(false) // Disable audio functionality
        })

        // Set audio properties
        audio.loop = true
        audio.volume = 0 // Start with volume at 0
        audio.preload = "auto"

        // Set source last
        audio.src = "/audio/auththeme.mp3"

        audioRef.current = audio
      }
    } catch (error) {
      console.error("Audio initialization error:", error)
      setAudioEnabled(false) // Disable audio functionality
    }

    return () => {
      // Clean up
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current)
        fadeIntervalRef.current = null
      }

      if (audioRef.current) {
        try {
          audioRef.current.pause()
          audioRef.current.src = ""
          audioRef.current = null
        } catch (error) {
          console.error("Audio cleanup error:", error)
        }
      }
    }
  }, [])

  // Handle mute state changes
  useEffect(() => {
    // Skip if audio is not enabled or ref doesn't exist
    if (!audioEnabled || !audioRef.current) return

    try {
      if (isMuted) {
        // When muted, pause the audio and reset volume
        audioRef.current.pause()
        audioRef.current.volume = 0

        // Clear any fade interval
        if (fadeIntervalRef.current) {
          clearInterval(fadeIntervalRef.current)
          fadeIntervalRef.current = null
        }
      } else {
        // When unmuted, play the audio and fade in volume
        const playPromise = audioRef.current.play()

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // Clear any existing interval
              if (fadeIntervalRef.current) {
                clearInterval(fadeIntervalRef.current)
                fadeIntervalRef.current = null
              }

              // Start fade in
              fadeIntervalRef.current = setInterval(() => {
                if (audioRef.current) {
                  // Calculate new volume, ensuring it doesn't exceed 1.0
                  const newVolume = Math.min(audioRef.current.volume + 0.1, 0.5) // Max volume 0.5
                  audioRef.current.volume = newVolume

                  // If we've reached target volume, clear the interval
                  if (newVolume >= 0.5) {
                    if (fadeIntervalRef.current) {
                      clearInterval(fadeIntervalRef.current)
                      fadeIntervalRef.current = null
                    }
                  }
                } else {
                  // Audio element no longer exists, clear interval
                  if (fadeIntervalRef.current) {
                    clearInterval(fadeIntervalRef.current)
                    fadeIntervalRef.current = null
                  }
                }
              }, 100)
            })
            .catch((error) => {
              console.error("Audio play failed:", error)
              // Reset to muted state if play fails
              setIsMuted(true)
            })
        }
      }
    } catch (error) {
      console.error("Audio control error:", error)
      setAudioEnabled(false) // Disable audio functionality on error
    }
  }, [isMuted, audioEnabled])

  // Toggle mute state
  const toggleMute = () => {
    if (!audioEnabled) return // Don't toggle if audio is disabled
    setIsMuted(!isMuted)
  }

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

  // Show class code field only for students
  const isStudent = roleId === 1

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center min-h-screen overflow-hidden">
      {/* Background slideshow */}
      <BackgroundSlideshow interval={8000} fadeTime={1500} />

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

      {/* Audio toggle button - only show if audio is enabled */}
      {audioEnabled && (
        <button
          onClick={toggleMute}
          className="absolute top-4 right-4 z-30 bg-amber-800 hover:bg-amber-700 text-amber-100 p-2 rounded-full transition-all duration-200 animate-pulse-slow"
          aria-label={isMuted ? "Unmute background music" : "Mute background music"}
        >
          {isMuted ? (
            <VolumeX size={20} className="text-amber-100" /> // Show muted icon when muted (click to unmute)
          ) : (
            <Volume2 size={20} className="text-amber-100" /> // Show volume icon when not muted (click to mute)
          )}
        </button>
      )}

      {/* Open Book Register Form */}
      <div className="relative z-20 w-[92%] max-w-[900px] mx-auto">
        <div className="relative">
          {/* Book image container */}
          <div className="relative w-full">
            <Image
              src="/book.png"
              alt="Open book"
              width={900}
              height={675}
              className="w-full h-auto pixelated scale-105 transform-gpu"
              priority
            />

            {/* Content positioned over the book image */}
            <div className="book-content">
              {/* Left page content */}
              <div className="left-page">
                <div className="welcome-content">
                  <p className="font-blaka text-[#8B3734] text-xl sm:text-2xl md:text-3xl mb-1">Welcome to</p>
                  <h1 className="font-blaka text-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl">FracQuest</h1>
                </div>
              </div>

              {/* Right page - register form */}
              <div className="right-page">
                <div className="register-content">
                  {/* Animated banner for Register text */}
                  <div className="animate-banner mb-2 relative">
                    <div className="relative">
                      <Image
                        src="/auth/header-banner.png"
                        alt="Banner"
                        width={240}
                        height={60}
                        className="pixelated w-[160px] sm:w-[180px] md:w-[200px] lg:w-[240px]"
                      />
                      <h2 className="font-blaka text-[#8B3734] text-xl sm:text-2xl absolute inset-0 flex items-center justify-center">
                        Register
                      </h2>
                    </div>
                  </div>

                  {/* Register form */}
                  <form onSubmit={handleRegister} className="w-full max-w-[90%] mx-auto">
                    {/* Error message */}
                    {error && (
                      <div className="w-full bg-red-800 bg-opacity-70 border border-red-900 text-amber-100 px-3 py-2 rounded mb-4 text-xs">
                        {error}
                      </div>
                    )}

                    {/* Username field */}
                    <div className="mb-1.5">
                      <label
                        htmlFor="username"
                        className="block text-[#8B3734] font-blaka text-base sm:text-lg md:text-xl mb-0.5"
                      >
                        Username
                      </label>
                      <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="w-full px-4 py-2 bg-[#f5e9d0] bg-opacity-50 border-2 border-[#8B3734] rounded-sm text-[#8B3734] text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#8B3734]"
                      />
                    </div>

                    {/* Password field */}
                    <div className="mb-1.5">
                      <label
                        htmlFor="password"
                        className="block text-[#8B3734] font-blaka text-base sm:text-lg md:text-xl mb-0.5"
                      >
                        Password
                      </label>
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-2 bg-[#f5e9d0] bg-opacity-50 border-2 border-[#8B3734] rounded-sm text-[#8B3734] text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#8B3734]"
                      />
                    </div>

                    {/* Email field */}
                    <div className="mb-1.5">
                      <label
                        htmlFor="email"
                        className="block text-[#8B3734] font-blaka text-base sm:text-lg md:text-xl mb-0.5"
                      >
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-2 bg-[#f5e9d0] bg-opacity-50 border-2 border-[#8B3734] rounded-sm text-[#8B3734] text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#8B3734]"
                      />
                    </div>

                    {/* Class Code field - only for students */}
                    {isStudent && (
                      <div className="mb-1.5">
                        <label
                          htmlFor="class_code"
                          className="block text-[#8B3734] font-blaka text-base sm:text-lg md:text-xl mb-0.5"
                        >
                          Class Code (Optional)
                        </label>
                        <input
                          id="class_code"
                          type="text"
                          value={classCode}
                          onChange={(e) => setClassCode(e.target.value)}
                          className="w-full px-4 py-2 bg-[#f5e9d0] bg-opacity-50 border-2 border-[#8B3734] rounded-sm text-[#8B3734] text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#8B3734]"
                        />
                      </div>
                    )}

                    {/* Register button */}
                    <div className="mt-3">
                      <button
                        type="submit"
                        disabled={isLoading || !roleId}
                        className="w-full bg-[#8B3734] hover:bg-[#a04234] text-[#f5e9d0] font-blaka py-2 px-4 rounded-sm border border-black transition-colors duration-200 pixelated disabled:opacity-50"
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center">
                            <Loader2 className="mr-2 h-3 w-3 animate-spin text-[#f5e9d0]" />
                            <span>Registering...</span>
                          </div>
                        ) : (
                          "Register"
                        )}
                      </button>
                    </div>

                    {/* Back to role selection and login links */}
                    <div className="text-center mt-3 flex flex-col gap-2">
                      <div>
                        <Link
                          href="/auth/select-role-register"
                          className="text-[#8B3734] hover:text-[#a04234] font-bold text-xs sm:text-sm md:text-lg font-blaka underline"
                        >
                          Change Role
                        </Link>
                      </div>
                      <div>
                        <span className="text-black text-xs sm:text-sm md:text-lg font-blaka">
                          Already have an account?{" "}
                        </span>
                        <Link
                          href="/auth/login"
                          className="text-[#8B3734] hover:text-[#a04234] font-bold text-xs sm:text-sm md:text-lg font-blaka underline"
                        >
                          Login
                        </Link>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
