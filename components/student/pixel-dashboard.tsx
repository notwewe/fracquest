"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Cloud object type (same as auth pages)
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

interface PixelDashboardProps {
  username: string
  isEnrolled: boolean
  className: string
}

export function PixelDashboard({ username, isEnrolled, className }: PixelDashboardProps) {
  const router = useRouter()
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [clouds, setClouds] = useState<Cloud[]>([])
  const [windowWidth, setWindowWidth] = useState(0)
  const [windowHeight, setWindowHeight] = useState(0)
  const cloudIdCounter = useRef(0)

  // Check for messages in URL
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search)
    const message = queryParams.get("message")
    if (message === "join-class-required") {
      setAlertMessage("You need to join a class to access this feature.")
      setShowAlert(true)
    }
  }, [])

  // Track window size for responsive adjustments (same as auth pages)
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

  // Initialize clouds (same as auth pages)
  useEffect(() => {
    if (!windowWidth) return

    // Create initial set of clouds
    const initialClouds: Cloud[] = []

    // Adjust number of clouds based on screen size
    const cloudCount = windowWidth < 640 ? 3 : 5

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

  // Function to create a new cloud (same as auth pages)
  const createNewCloud = (forcedDirection?: -1 | 1): Cloud => {
    // Randomly select cloud image (1, 2, or 3)
    const cloudNumber = Math.floor(Math.random() * 3) + 1

    // Adjust cloud size based on screen width
    const baseSize = windowWidth < 640 ? 80 : windowWidth < 1024 ? 100 : 120
    const sizeVariation = windowWidth < 640 ? 40 : 60

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

  const handleUnenrolledClick = (feature: string) => {
    setAlertMessage(`You need to join a class to ${feature}.`)
    setShowAlert(true)
    router.push("/student/profile?message=join-class-required")
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-between min-h-screen overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Image
          src="/dashboard/castle-background.jpg"
          alt="Castle Background"
          fill
          className="object-cover object-center"
          priority
        />
      </div>

      {/* Full-width container for clouds (same as auth pages) */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-10">
        {/* Render all active clouds */}
        {clouds.map((cloud) => (
          <div
            key={cloud.id}
            className="absolute pixelated"
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

      {/* Top section with name/class and welcome banner */}
      <div className="w-full flex flex-col items-center relative z-20 pt-2">
        {/* Name and Class Container - Top Left */}
        <div className="absolute top-2 left-2 sm:left-4">
          <div className="relative">
            <Image
              src="/dashboard/nameandclass.png"
              alt="Name and Class"
              width={260}
              height={312}
              className="pixelated"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-10 px-4">
              <p className="text-[#8B3734] font-blaka text-center text-2xl mb-3 max-w-[220px] break-words">
                {username}
              </p>
              {isEnrolled ? (
                <p className="text-[#8B3734] font-blaka text-center text-lg max-w-[220px] break-words">
                  Class: {className}
                </p>
              ) : (
                <p className="text-[#8B3734] font-blaka text-center text-lg max-w-[220px] break-words">No Class</p>
              )}
            </div>
          </div>
        </div>

        {/* Banner with enhanced hover animation */}
        <div
          className="mt-2 mb-3 w-full flex justify-center"
          style={{
            animation: "float 3s ease-in-out infinite",
          }}
        >
          <style jsx>{`
            @keyframes float {
              0% {
                transform: translateY(0px);
              }
              50% {
                transform: translateY(-8px);
              }
              100% {
                transform: translateY(0px);
              }
            }
          `}</style>
          <div className="relative top-6">
            <Image src="/dashboard/welcome.png" alt="Welcome Banner" width={500} height={80} className="pixelated" />
            <h1 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-lg sm:text-xl md:text-4xl whitespace-nowrap font-bold text-[#8B3734] font-blaka">
              Welcome to FracQuest
            </h1>
          </div>
        </div>
      </div>

      {/* Alert */}
      {showAlert && (
        <Alert className="z-20 mb-3 max-w-md w-full bg-amber-100 border-amber-300">
          <AlertDescription className="text-amber-800">{alertMessage}</AlertDescription>
        </Alert>
      )}

      {/* Main container - centered */}
      <div className="flex items-center justify-center w-full z-20 px-4">
        <div className="relative max-w-xl w-full">
          <Image
            src="/dashboard/con.png"
            alt="Container"
            width={500}
            height={333}
            className="pixelated w-full h-auto"
          />

          <div className="absolute inset-0 flex items-center justify-center">
            {/* Buttons grid - centered in container */}
            <div className="grid grid-cols-2 gap-4 sm:gap-5 md:gap-6 w-full max-w-md px-4">
              {/* Play button */}
              {isEnrolled ? (
                <Link href="/student/game" className="flex justify-center">
                  <div className="relative w-28 h-28 sm:w-32 sm:h-32 transform hover:scale-110 transition-transform hover:rotate-3">
                    <Image
                      src="/dashboard/play-btn.png"
                      alt="Play"
                      width={128}
                      height={128}
                      className="pixelated w-full h-full"
                    />
                  </div>
                </Link>
              ) : (
                <button
                  onClick={() => handleUnenrolledClick("play the game")}
                  className="flex justify-center opacity-70"
                >
                  <div className="relative w-28 h-28 sm:w-32 sm:h-32">
                    <Image
                      src="/dashboard/play-btn.png"
                      alt="Play"
                      width={128}
                      height={128}
                      className="pixelated grayscale w-full h-full"
                    />
                  </div>
                </button>
              )}

              {/* Practice button */}
              <Link href="/student/practice" className="flex justify-center">
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 transform hover:scale-110 transition-transform hover:rotate-3">
                  <Image
                    src="/dashboard/practice-btn.png"
                    alt="Practice"
                    width={128}
                    height={128}
                    className="pixelated w-full h-full"
                  />
                </div>
              </Link>

              {/* Leaderboard button */}
              {isEnrolled ? (
                <Link href="/student/leaderboard" className="flex justify-center">
                  <div className="relative w-28 h-28 sm:w-32 sm:h-32 transform hover:scale-110 transition-transform hover:rotate-3">
                    <Image
                      src="/dashboard/ranking-btn.png"
                      alt="Leaderboard"
                      width={128}
                      height={128}
                      className="pixelated w-full h-full"
                    />
                  </div>
                </Link>
              ) : (
                <button
                  onClick={() => handleUnenrolledClick("view the leaderboard")}
                  className="flex justify-center opacity-70"
                >
                  <div className="relative w-28 h-28 sm:w-32 sm:h-32">
                    <Image
                      src="/dashboard/ranking-btn.png"
                      alt="Leaderboard"
                      width={128}
                      height={128}
                      className="pixelated grayscale w-full h-full"
                    />
                  </div>
                </button>
              )}

              {/* Profile button */}
              <Link href="/student/profile" className="flex justify-center">
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 transform hover:scale-110 transition-transform hover:rotate-3">
                  <Image
                    src="/dashboard/profile-btn.png"
                    alt="Profile"
                    width={128}
                    height={128}
                    className="pixelated w-full h-full"
                  />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Logout button - bottom section */}
      <div className="mt-1 mb-4 z-20 w-full flex justify-center">
        <Link href="/auth/logout" className="flex justify-center">
          <div className="relative transform hover:scale-105 transition-transform">
            <Image src="/dashboard/logout.png" alt="Logout" width={200} height={45} className="pixelated" />
            <p className="absolute top-[40%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#f8d78b] font-blaka text-lg">
              Logout
            </p>
          </div>
        </Link>
      </div>
    </div>
  )
}
