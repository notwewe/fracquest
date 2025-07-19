"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"

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

  // Track window size
  useEffect(() => {
    setWindowWidth(window.innerWidth)
    setWindowHeight(window.innerHeight)

    const handleResize = () => {
      setWindowWidth(window.innerWidth)
      setWindowHeight(window.innerHeight)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Function to create a new cloud
  const createNewCloud = (forcedDirection?: -1 | 1): Cloud => {
    const cloudNumber = Math.floor(Math.random() * 3) + 1
    // Increased cloud sizes
    const baseSize = windowWidth < 640 ? 200 : windowWidth < 1024 ? 250 : 300
    const sizeVariation = windowWidth < 640 ? 100 : 150
    const size = Math.floor(Math.random() * sizeVariation) + baseSize
    const speedFactor = windowWidth < 640 ? 0.7 : 1
    // Slightly reduced speed for larger clouds
    const speed = (Math.random() * 0.1 + 0.05) * speedFactor
    const direction = forcedDirection || (Math.random() > 0.5 ? 1 : -1)
    const top = `${Math.floor(Math.random() * 80) + 5}%`
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

  // Initialize clouds
  useEffect(() => {
    if (!windowWidth) return

    const initialClouds: Cloud[] = []
    const cloudCount = windowWidth < 640 ? 3 : 5

    for (let i = 0; i < cloudCount; i++) {
      initialClouds.push(createNewCloud())
    }

    setClouds(initialClouds)

    const intervalId = setInterval(() => {
      setClouds((prevClouds) => {
        return prevClouds.map((cloud) => {
          const currentLeft = Number.parseFloat(cloud.left)
          const newLeft = currentLeft + cloud.speed * cloud.direction

          if ((cloud.direction === 1 && newLeft > 110) || (cloud.direction === -1 && newLeft < -30)) {
            return createNewCloud(cloud.direction === 1 ? -1 : 1)
          }

          return {
            ...cloud,
            left: `${newLeft}%`,
          }
        })
      })
    }, 33)

    return () => clearInterval(intervalId)
  }, [windowWidth])

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
          src="/dashboard/bg1_castle.png"
          alt="Castle Background"
          fill
          className="object-cover object-center"
          priority
        />
      </div>

      {/* Cloud container */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-10">
        {clouds.map((cloud) => (
          <div
            key={cloud.id}
            className="absolute pixelated"
            style={{
              top: cloud.top,
              left: cloud.left,
              width: `${cloud.size}px`,
              height: "auto",
              transition: "left 0.033s linear",
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

      {/* Main Content Area - Centered */}
      <div className="flex flex-col items-center justify-center w-full h-full z-20 px-4">
        {/* Background container for content - Slightly lower positioning */}
        <div className="relative flex flex-col items-center max-w-5xl w-full -mt-8">
          {/* Background image - Same size */}
          <Image
            src="/dashboard/blank.png"
            alt="Background Panel"
            width={1800}
            height={2160}
            className="w-full h-auto"
          />
          
          {/* Content positioned over background */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-0 px-20">
            {/* Title and Welcome - Same as before */}
            <div className="text-center mb-6">
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-blaka text-[#333333] mb-1">
                FRACQUEST
              </h1>
              <p className="text-2xl sm:text-3xl font-blaka">
                WELCOME, {username.toUpperCase()}!
              </p>  
              <p className="text-lg sm:text-xl font-blaka">
                class: {isEnrolled ? className : "No Class"}
              </p>
            </div>
            
            {/* Alert */}
            {showAlert && (
              <Alert className="z-20 mb-3 w-full bg-amber-100 border-amber-300">
                <AlertDescription className="text-amber-800 text-lg">{alertMessage}</AlertDescription>
              </Alert>
            )}

            {/* Navigation Buttons - With larger text */}
            <div className="flex flex-col items-center gap-3 w-full">
              {isEnrolled ? (
                <Link href="/student/game" className="w-2/5 mx-auto">
                  <button className="bg-[#4d3e3a] text-white font-blaka text-2xl px-4 py-3 w-full rounded hover:bg-[#3b302c] transition-colors">
                    Play
                  </button>
                </Link>
              ) : (
                <button
                  onClick={() => handleUnenrolledClick("play the game")}
                  className="bg-[#4d3e3a] text-white font-blaka text-2xl px-4 py-3 w-2/5 mx-auto rounded opacity-70"
                >
                  Play
                </button>
              )}

              {isEnrolled ? (
                <Link href="/student/practice" className="w-2/5 mx-auto">
                  <button className="bg-[#4d3e3a] text-white font-blaka text-2xl px-4 py-3 w-full rounded hover:bg-[#3b302c] transition-colors">
                    Practice
                  </button>
                </Link>
              ) : (
                <button
                  onClick={() => handleUnenrolledClick("practice")}
                  className="bg-[#4d3e3a] text-white font-blaka text-2xl px-4 py-3 w-2/5 mx-auto rounded opacity-70"
                >
                  Practice
                </button>
              )}

              <Link href="/student/profile" className="w-2/5 mx-auto">
                <button className="bg-[#4d3e3a] text-white font-blaka text-2xl px-4 py-3 w-full rounded hover:bg-[#3b302c] transition-colors">
                  Profile
                </button>
              </Link>

              {isEnrolled ? (
                <Link href="/student/leaderboard" className="w-2/5 mx-auto">
                  <button className="bg-[#4d3e3a] text-white font-blaka text-2xl px-4 py-3 w-full rounded hover:bg-[#3b302c] transition-colors">
                    Leaderboards
                  </button>
                </Link>
              ) : (
                <button
                  onClick={() => handleUnenrolledClick("view the leaderboard")}
                  className="bg-[#4d3e3a] text-white font-blaka text-2xl px-4 py-3 w-2/5 mx-auto rounded opacity-70"
                >
                  Leaderboards
                </button>
              )}

              {/* Logout button - Moved up by reducing top margin */}
              <Link href="/auth/logout" className="w-1/5 mx-auto mt-3">
                <button className="bg-[#8B3734] text-white font-blaka text-xl px-4 py-2 w-full rounded hover:bg-[#6d2b29] transition-colors">
                  Logout
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
