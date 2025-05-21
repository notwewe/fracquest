"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"
import { Volume2, VolumeX } from "lucide-react"
import Link from "next/link"
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

.login-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transform: translateY(0%) translateX(-2%); /* Remove the negative translateY value */
  padding-top: 0; /* Add explicit padding-top: 0 */
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
  .login-content {
    transform: translateY(0%) translateX(-1.5%);
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
  .login-content {
    transform: translateY(0%) translateX(-1%);
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
  .login-content {
    transform: translateY(0%) translateX(-0.5%);
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

export function BookLoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [clouds, setClouds] = useState<Cloud[]>([])
  const [windowWidth, setWindowWidth] = useState(0)
  const [windowHeight, setWindowHeight] = useState(0)
  const [isMuted, setIsMuted] = useState(true) // Start muted
  const [audioEnabled, setAudioEnabled] = useState(true) // Track if audio is available
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const cloudIdCounter = useRef(0)
  const supabase = createClient()

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

      {/* Open Book Login Form */}
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

              {/* Right page - login form */}
              <div className="right-page">
                <div className="login-content">
                  {/* Animated banner for Login text */}
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
                        Login
                      </h2>
                    </div>
                  </div>

                  {/* Login form */}
                  <form onSubmit={handleLogin} className="w-full max-w-[90%] mx-auto">
                    {/* Error message */}
                    {error && (
                      <div className="w-full bg-red-800 bg-opacity-70 border border-red-900 text-amber-100 px-3 py-2 rounded mb-4 text-xs">
                        {error}
                      </div>
                    )}

                    {/* Username/Email field */}
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

                    {/* Password field */}
                    <div className="mb-3">
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

                    {/* Login button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-[#8B3734] hover:bg-[#a04234] text-[#f5e9d0] font-blaka py-2 px-4 rounded-sm border border-black transition-colors duration-200 pixelated"
                    >
                      {isLoading ? "Loading..." : "Login"}
                    </button>

                    {/* Register link */}
                    <div className="text-center mt-3">
                      <span className="text-black text-xs sm:text-sm md:text-lg font-blaka">
                        Don't have an account?{" "}
                      </span>
                      <Link
                        href="/auth/select-role-register"
                        className="text-[#8B3734] hover:text-[#a04234] font-bold text-xs sm:text-sm md:text-lg font-blaka underline"
                      >
                        Register
                      </Link>
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
