"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Save, Trophy, BookOpen, UserPlus } from "lucide-react"
import { JoinClassForm } from "@/components/student/join-class-form"
import { isMobileDevice } from "@/lib/utils/deviceDetection"

export default function StudentProfilePage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [className, setClassName] = useState("")
  const [completedLevels, setCompletedLevels] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [showJoinClass, setShowJoinClass] = useState(false)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const supabase = createClient()

  const searchParams = useSearchParams()
  const [redirectMessage, setRedirectMessage] = useState<string | null>(null)

  useEffect(() => {
    const message = searchParams.get("message")
    if (message === "join-class-required") {
      // Only show the join class modal without the message
      setShowJoinClass(true)
    }
  }, [searchParams])

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/auth/login")
          return
        }

        setEmail(user.email || "")

        // Get profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .single()

        if (profileError) {
          throw profileError
        }

        setUsername(profile.username || "")

        // Get class
        const { data: studentClass, error: classError } = await supabase
          .from("student_classes")
          .select("classes(name)")
          .eq("student_id", user.id)
          .single()

        if (!classError && studentClass) {
          setClassName(studentClass.classes?.name || "")
          setIsEnrolled(true)
        } else {
          setIsEnrolled(false)
        }

        // Get progress
        const { data: progress } = await supabase
          .from("student_progress")
          .select("completed, score")
          .eq("student_id", user.id)
          .eq("completed", true)

        setCompletedLevels(progress?.length || 0)
        setTotalScore(progress?.reduce((sum, p) => sum + p.score, 0) || 0)
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchProfile()
  }, [router, supabase, showJoinClass])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("You must be logged in to update your profile")
      }

      // Update profile
      const { error } = await supabase
        .from("profiles")
        .update({
          username,
        })
        .eq("id", user.id)

      if (error) {
        throw error
      }

      setSuccess("Profile updated successfully!")
    } catch (error: any) {
      setError(error.message || "An error occurred while updating your profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinClassSuccess = () => {
    setShowJoinClass(false)
    setIsEnrolled(true)

    // Remove the query parameter from the URL
    const params = new URLSearchParams(window.location.search)
    params.delete("message")

    // Update the URL without the message parameter
    const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : "")
    window.history.replaceState({}, "", newUrl)

    // Fetch updated class info without full page reload
    const fetchUpdatedClassInfo = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          // Get updated class info
          const { data: studentClass } = await supabase
            .from("student_classes")
            .select("classes(name)")
            .eq("student_id", user.id)
            .single()

          if (studentClass && studentClass.classes) {
            // Handle both object and array formats
            if (Array.isArray(studentClass.classes)) {
              setClassName(studentClass.classes[0]?.name || "")
            } else {
              setClassName(studentClass.classes.name || "")
            }
          }
        }
      } catch (error) {
        console.error("Error fetching updated class info:", error)
      }
    }

    fetchUpdatedClassInfo()
  }

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(isMobileDevice())
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  if (isMobile) {
    return (
      <MobileProfileView
        username={username}
        email={email}
        className={className}
        completedLevels={completedLevels}
        totalScore={totalScore}
        isEnrolled={isEnrolled}
        isLoading={isLoading}
        error={error}
        success={success}
        showJoinClass={showJoinClass}
        onUsernameChange={setUsername}
        onSubmit={handleSubmit}
        onJoinClassClick={() => setShowJoinClass(true)}
        onJoinClassSuccess={handleJoinClassSuccess}
        onCloseJoinClass={() => setShowJoinClass(false)}
      />
    )
  }

  if (isLoadingData) {
    return (
      <div
        className="h-screen flex justify-center items-center"
        style={{
          backgroundImage: "url('/dashboard/castle-background.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    )
  }

  return (
    <div
      className="h-screen p-4 overflow-hidden flex flex-col justify-center"
      style={{
        backgroundImage: "url('/dashboard/castle-background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Back to Dashboard Button */}
      <div className="absolute top-4 left-4 z-10">
        <Link href="/student/dashboard">
          <div
            className="relative w-64 h-20 cursor-pointer hover:scale-105 transition-transform"
            style={{
              backgroundImage: "url('/dashboard/logout.png')",
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center" style={{ marginTop: "-4px" }}>
              <span className="text-amber-200 font-bold text-2xl" style={{ fontFamily: "var(--font-blaka)" }}>
                Dashboard
              </span>
            </div>
          </div>
        </Link>
      </div>

      <div className="flex flex-col items-center">
        {/* Profile Title */}
        <div
          className="relative mb-6"
          style={{
            backgroundImage: "url('/dashboard/welcome.png')",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            width: "500px",
            height: "100px",
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-4xl font-bold text-amber-900 font-blaka" style={{ fontFamily: "var(--font-blaka)" }}>
              Profile
            </h1>
          </div>
        </div>

        {!isEnrolled && (
          <Alert className="mb-4 bg-amber-100 border-amber-300 max-w-2xl">
            <AlertDescription className="text-amber-800">
              You need to join a class to play the game and see leaderboards. Join a class below!
            </AlertDescription>
          </Alert>
        )}

        {/* Row layout with responsive sizing */}
        <div className="flex flex-col lg:flex-row justify-center items-center gap-6 w-full max-w-[1400px] mx-auto">
          {/* Profile Information Section */}
          <div className="flex flex-col items-center w-full lg:w-3/5 max-w-full">
            {/* Profile Information Container */}
            <div
              style={{
                backgroundImage: "url('/dashboard/scroll.png')",
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                width: "100%",
                height: "550px",
                position: "relative",
                maxWidth: "800px",
              }}
            >
              <div className="absolute inset-0 flex flex-col justify-center px-20 py-12">
                <div className="max-w-md mx-auto w-full space-y-4">
                  {error && (
                    <Alert variant="destructive" className="mb-2">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  {success && (
                    <Alert className="mb-2 bg-green-50 border-green-200">
                      <AlertDescription className="text-green-800">{success}</AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <Label
                        htmlFor="username"
                        className="text-amber-900 font-bold text-xl"
                        style={{ fontFamily: "var(--font-blaka)" }}
                      >
                        Username
                      </Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="border border-amber-600 bg-amber-50/80 text-amber-900 p-2 h-12 text-lg"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label
                        htmlFor="email"
                        className="text-amber-900 font-bold text-xl"
                        style={{ fontFamily: "var(--font-blaka)" }}
                      >
                        Email
                      </Label>
                      <Input
                        id="email"
                        value={email}
                        disabled
                        className="border border-amber-400 bg-amber-100/80 opacity-70 text-amber-800 p-2 h-12 text-lg"
                      />
                      <p className="text-sm text-amber-700">Email cannot be changed</p>
                    </div>
                    <div className="space-y-1">
                      <Label
                        htmlFor="class"
                        className="text-amber-900 font-bold text-xl"
                        style={{ fontFamily: "var(--font-blaka)" }}
                      >
                        Class
                      </Label>
                      <div className="flex items-center gap-3">
                        <Input
                          id="class"
                          value={className || "Not enrolled in any class"}
                          disabled
                          className="border border-amber-400 bg-amber-100/80 opacity-70 text-amber-800 p-2 h-12 text-lg flex-1"
                        />
                        {!isEnrolled && (
                          <Button
                            type="button"
                            onClick={() => setShowJoinClass(true)}
                            className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 h-10 text-sm"
                          >
                            <UserPlus className="mr-1 h-4 w-4" />
                            Join
                          </Button>
                        )}
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-amber-800 hover:bg-amber-700 text-amber-100 font-blaka py-1.5 px-8 rounded-md transition-colors duration-200 text-base"
                      style={{ fontFamily: "var(--font-blaka)" }}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-5 w-5" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="flex flex-col items-center w-full lg:w-2/5 max-w-full">
            {/* Progress Container */}
            <div
              style={{
                backgroundImage: "url('/dashboard/blank.png')",
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                width: "100%",
                height: "550px",
                position: "relative",
                maxWidth: "600px",
              }}
            >
              <div className="absolute inset-0 flex flex-col justify-center px-16 py-12">
                <div className="w-full max-w-[320px] mx-auto">
                  <div className="space-y-8">
                    {/* Progress items */}
                    <div className="bg-amber-100/80 p-5 rounded-lg border border-amber-300">
                      <div className="flex items-center gap-4">
                        <BookOpen className="h-8 w-8 text-amber-700" />
                        <div>
                          <p
                            className="text-lg text-amber-800 font-semibold"
                            style={{ fontFamily: "var(--font-blaka)" }}
                          >
                            Levels Completed
                          </p>
                          <p className="text-3xl font-bold text-amber-900" style={{ fontFamily: "var(--font-blaka)" }}>
                            {completedLevels}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-amber-100/80 p-5 rounded-lg border border-amber-300">
                      <div className="flex items-center gap-4">
                        <Trophy className="h-8 w-8 text-amber-700" />
                        <div>
                          <p
                            className="text-lg text-amber-800 font-semibold"
                            style={{ fontFamily: "var(--font-blaka)" }}
                          >
                            Total Score
                          </p>
                          <p className="text-3xl font-bold text-amber-900" style={{ fontFamily: "var(--font-blaka)" }}>
                            {totalScore}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Join Class Form */}
        {showJoinClass && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-amber-50 border-4 border-amber-800 rounded-xl p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-amber-900 text-center mb-6">Join a Class</h2>
              <p className="text-amber-700 text-center mb-6">Enter the class code provided by your teacher</p>
              <JoinClassForm onSuccess={handleJoinClassSuccess} />
              <div className="flex justify-end mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowJoinClass(false)}
                  className="border-amber-600 text-amber-700"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
