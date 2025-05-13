"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ArrowLeft, Save, LogOut, Trophy, BookOpen, UserPlus } from "lucide-react"
import { JoinClassForm } from "@/components/student/join-class-form"

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
  const supabase = createClient()

  const searchParams = useSearchParams()
  const [redirectMessage, setRedirectMessage] = useState<string | null>(null)

  useEffect(() => {
    const message = searchParams.get("message")
    if (message === "join-class-required") {
      setRedirectMessage("You need to join a class to access this feature.")
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
    // Refresh the page to show the updated class info
    window.location.reload()
  }

  if (isLoadingData) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Button asChild variant="outline" className="font-pixel border-amber-600 text-amber-700">
          <Link href="/student/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="max-w-2xl mx-auto">
        {!isEnrolled && (
          <Alert className="mb-6 bg-amber-100 border-amber-300">
            <AlertDescription className="text-amber-800 font-pixel">
              You need to join a class to play the game and see leaderboards. Join a class below!
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-2 border-amber-800 bg-amber-50 mb-6">
          <CardHeader>
            <CardTitle className="text-2xl font-pixel text-amber-900">Your Profile</CardTitle>
            <CardDescription className="font-pixel text-amber-700">Update your profile information</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="mb-4 bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}
            {redirectMessage && (
              <Alert className="mb-4 bg-amber-50 border-amber-200">
                <AlertDescription className="text-amber-800">{redirectMessage}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="username" className="font-pixel text-amber-900">
                    Username
                  </Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="border-amber-300 bg-amber-100"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email" className="font-pixel text-amber-900">
                    Email
                  </Label>
                  <Input id="email" value={email} disabled className="border-amber-300 bg-amber-100 opacity-70" />
                  <p className="text-xs text-amber-600">Email cannot be changed</p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="class" className="font-pixel text-amber-900">
                    Class
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="class"
                      value={className || "Not enrolled in any class"}
                      disabled
                      className="border-amber-300 bg-amber-100 opacity-70"
                    />
                    {!isEnrolled && (
                      <Button
                        type="button"
                        onClick={() => setShowJoinClass(true)}
                        className="font-pixel bg-amber-600 hover:bg-amber-700 text-white"
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Join Class
                      </Button>
                    )}
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full font-pixel bg-amber-600 hover:bg-amber-700 text-white mt-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {showJoinClass && (
          <Card className="border-2 border-amber-800 bg-amber-50 mb-6">
            <CardHeader>
              <CardTitle className="text-2xl font-pixel text-amber-900">Join a Class</CardTitle>
              <CardDescription className="font-pixel text-amber-700">
                Enter the class code provided by your teacher
              </CardDescription>
            </CardHeader>
            <CardContent>
              <JoinClassForm onSuccess={handleJoinClassSuccess} />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setShowJoinClass(false)}
                className="font-pixel border-amber-600 text-amber-700"
              >
                Cancel
              </Button>
            </CardFooter>
          </Card>
        )}

        <Card className="border-2 border-amber-800 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-2xl font-pixel text-amber-900">Your Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-amber-100 p-4 rounded-lg border border-amber-300">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-6 w-6 text-amber-700" />
                  <div>
                    <p className="text-sm text-amber-700">Levels Completed</p>
                    <p className="text-2xl font-bold font-pixel text-amber-900">{completedLevels}</p>
                  </div>
                </div>
              </div>

              <div className="bg-amber-100 p-4 rounded-lg border border-amber-300">
                <div className="flex items-center gap-3">
                  <Trophy className="h-6 w-6 text-amber-700" />
                  <div>
                    <p className="text-sm text-amber-700">Total Score</p>
                    <p className="text-2xl font-bold font-pixel text-amber-900">{totalScore}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild variant="outline" className="font-pixel border-amber-600 text-amber-700">
              <Link href="/auth/logout">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
