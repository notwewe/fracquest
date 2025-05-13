"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GamepadIcon as GameController, BookOpen, Trophy, User, UserPlus } from "lucide-react"

interface StudentDashboardClientProps {
  username: string
  isEnrolled: boolean
  className: string
}

export function StudentDashboardClient({ username, isEnrolled, className }: StudentDashboardClientProps) {
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex flex-col items-center justify-center p-4">
      {showAlert && (
        <Alert className="mb-6 max-w-2xl w-full bg-amber-100 border-amber-300">
          <AlertDescription className="text-amber-800">{alertMessage}</AlertDescription>
        </Alert>
      )}

      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-amber-900 mb-2">Welcome to FracQuest</h1>
        <p className="text-xl text-amber-700">Hello, {username}!</p>
        {isEnrolled ? (
          <p className="text-amber-700 mt-2">Class: {className}</p>
        ) : (
          <div className="mt-4">
            <p className="text-amber-700 mb-2">You are not enrolled in any class.</p>
            <Button
              onClick={() => router.push("/student/profile")}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Join a Class
            </Button>
          </div>
        )}
        <p className="text-amber-700 mt-4 max-w-md mx-auto">
          Join Whiskers the Fraction Explorer on a quest to restore the Fraction Orb and save the kingdom of Numeria!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl w-full">
        {isEnrolled ? (
          <Button
            asChild
            className="h-32 bg-amber-600 hover:bg-amber-700 text-white border-4 border-amber-800 rounded-xl shadow-lg transform hover:scale-105 transition-transform"
          >
            <Link href="/student/game" className="flex flex-col items-center justify-center gap-2">
              <GameController className="h-12 w-12" />
              <span className="text-xl">Play</span>
            </Link>
          </Button>
        ) : (
          <Button
            onClick={() => handleUnenrolledClick("play the game")}
            className="h-32 bg-gray-400 text-white border-4 border-amber-800 rounded-xl shadow-lg transform hover:scale-105 transition-transform"
          >
            <div className="flex flex-col items-center justify-center gap-2">
              <GameController className="h-12 w-12" />
              <span className="text-xl">Play</span>
            </div>
          </Button>
        )}

        <Button
          asChild
          className="h-32 bg-amber-600 hover:bg-amber-700 text-white border-4 border-amber-800 rounded-xl shadow-lg transform hover:scale-105 transition-transform"
        >
          <Link href="/student/practice" className="flex flex-col items-center justify-center gap-2">
            <BookOpen className="h-12 w-12" />
            <span className="text-xl">Practice</span>
          </Link>
        </Button>

        {isEnrolled ? (
          <Button
            asChild
            className="h-32 bg-amber-600 hover:bg-amber-700 text-white border-4 border-amber-800 rounded-xl shadow-lg transform hover:scale-105 transition-transform"
          >
            <Link href="/student/leaderboard" className="flex flex-col items-center justify-center gap-2">
              <Trophy className="h-12 w-12" />
              <span className="text-xl">Leaderboard</span>
            </Link>
          </Button>
        ) : (
          <Button
            onClick={() => handleUnenrolledClick("view the leaderboard")}
            className="h-32 bg-gray-400 text-white border-4 border-amber-800 rounded-xl shadow-lg transform hover:scale-105 transition-transform"
          >
            <div className="flex flex-col items-center justify-center gap-2">
              <Trophy className="h-12 w-12" />
              <span className="text-xl">Leaderboard</span>
            </div>
          </Button>
        )}

        <Button
          asChild
          className="h-32 bg-amber-600 hover:bg-amber-700 text-white border-4 border-amber-800 rounded-xl shadow-lg transform hover:scale-105 transition-transform"
        >
          <Link href="/student/profile" className="flex flex-col items-center justify-center gap-2">
            <User className="h-12 w-12" />
            <span className="text-xl">Profile</span>
          </Link>
        </Button>
      </div>

      <div className="mt-8 text-center">
        <Button asChild variant="outline" className="border-amber-600 text-amber-700">
          <Link href="/auth/logout">Logout</Link>
        </Button>
      </div>
    </div>
  )
}
