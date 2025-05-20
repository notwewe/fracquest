"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PixelDashboardProps {
  username: string
  isEnrolled: boolean
  className: string
}

export function PixelDashboard({ username, isEnrolled, className }: PixelDashboardProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")

  useEffect(() => {
    const message = searchParams.get("message")
    if (message === "join-class-required") {
      setAlertMessage("You need to join a class to access this feature.")
      setShowAlert(true)
    }
  }, [searchParams])

  const handleUnenrolledClick = (feature: string) => {
    setAlertMessage(`You need to join a class to ${feature}.`)
    setShowAlert(true)
    router.push("/student/profile?message=join-class-required")
  }

  // Button hover animation
  const buttonHoverAnimation = {
    scale: 1.05,
    transition: { duration: 0.2 },
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Fixed size container for 1920x1080 resolution */}
      <div className="fixed inset-0 w-full h-full flex items-center justify-center">
        {/* Background image with fixed dimensions */}
        <div
          className="absolute w-[1920px] h-[1080px]"
          style={{
            backgroundImage: `url('/dashboard/dashboard-bg.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            imageRendering: "pixelated",
          }}
        >
          {/* Alert message */}
          {showAlert && (
            <Alert className="absolute top-6 left-1/2 transform -translate-x-1/2 z-50 max-w-md bg-amber-100 border-amber-300">
              <AlertDescription className="text-amber-800">{alertMessage}</AlertDescription>
            </Alert>
          )}

          {/* User details section - fixed position for 1920x1080 */}
          <div className="absolute top-[270px] left-[330px] text-center">
            <div className="font-pixel text-[#8b3734] text-2xl mb-3">Hello, {username}!</div>
            {isEnrolled ? (
              <div className="font-pixel text-[#8b3734] text-xl">Class: {className}</div>
            ) : (
              <div className="font-pixel text-[#8b3734] text-xl">Not enrolled in a class</div>
            )}
          </div>

          {/* Navigation buttons - fixed positions for 1920x1080 */}
          <div className="absolute top-[420px] left-[960px] grid grid-cols-2 gap-x-[150px] gap-y-[150px]">
            {/* Play button - Top Left */}
            {isEnrolled ? (
              <motion.div
                whileHover={buttonHoverAnimation}
                className="cursor-pointer w-[225px] h-[225px]"
                onClick={() => router.push("/student/game")}
              >
                <Image
                  src="/dashboard/play-btn.png"
                  alt="Play"
                  width={225}
                  height={225}
                  className="w-full h-full object-contain pixelated"
                />
              </motion.div>
            ) : (
              <motion.div
                whileHover={buttonHoverAnimation}
                className="cursor-pointer opacity-70 w-[225px] h-[225px]"
                onClick={() => handleUnenrolledClick("play the game")}
              >
                <Image
                  src="/dashboard/play-btn.png"
                  alt="Play"
                  width={225}
                  height={225}
                  className="w-full h-full object-contain pixelated"
                />
              </motion.div>
            )}

            {/* Practice button - Top Right */}
            <motion.div
              whileHover={buttonHoverAnimation}
              className="cursor-pointer w-[225px] h-[225px]"
              onClick={() => router.push("/student/practice")}
            >
              <Image
                src="/dashboard/practice-btn.png"
                alt="Practice"
                width={225}
                height={225}
                className="w-full h-full object-contain pixelated"
              />
            </motion.div>

            {/* Ranking button - Bottom Left */}
            {isEnrolled ? (
              <motion.div
                whileHover={buttonHoverAnimation}
                className="cursor-pointer w-[225px] h-[225px]"
                onClick={() => router.push("/student/leaderboard")}
              >
                <Image
                  src="/dashboard/ranking-btn.png"
                  alt="Ranking"
                  width={225}
                  height={225}
                  className="w-full h-full object-contain pixelated"
                />
              </motion.div>
            ) : (
              <motion.div
                whileHover={buttonHoverAnimation}
                className="cursor-pointer opacity-70 w-[225px] h-[225px]"
                onClick={() => handleUnenrolledClick("view the leaderboard")}
              >
                <Image
                  src="/dashboard/ranking-btn.png"
                  alt="Ranking"
                  width={225}
                  height={225}
                  className="w-full h-full object-contain pixelated"
                />
              </motion.div>
            )}

            {/* Profile button - Bottom Right */}
            <motion.div
              whileHover={buttonHoverAnimation}
              className="cursor-pointer w-[225px] h-[225px]"
              onClick={() => router.push("/student/profile")}
            >
              <Image
                src="/dashboard/profile-btn.png"
                alt="Profile"
                width={225}
                height={225}
                className="w-full h-full object-contain pixelated"
              />
            </motion.div>
          </div>

          {/* Logout button - fixed position for 1920x1080 */}
          <motion.div
            whileHover={buttonHoverAnimation}
            className="absolute bottom-[60px] right-[60px] cursor-pointer w-[180px] h-[180px]"
            onClick={() => router.push("/auth/logout")}
          >
            <Image
              src="/dashboard/logout-btn.png"
              alt="Logout"
              width={180}
              height={180}
              className="w-full h-full object-contain pixelated"
            />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
