"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ArrowLeft, Save, LogOut, BookOpen, Users, School } from "lucide-react"

export default function TeacherProfilePage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [schoolName, setSchoolName] = useState("")
  const [savedSchoolName, setSavedSchoolName] = useState("")
  const [totalClasses, setTotalClasses] = useState(0)
  const [totalStudents, setTotalStudents] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const supabase = createClient()

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
          .select("username, school_name")
          .eq("id", user.id)
          .single()

        if (profileError) {
          throw profileError
        }

        setUsername(profile.username || "")
        setSchoolName(profile.school_name || "")
        setSavedSchoolName(profile.school_name || "")

        // Get classes count
        const { data: classes, error: classesError } = await supabase
          .from("classes")
          .select("id", { count: "exact" })
          .eq("teacher_id", user.id)

        if (classesError) {
          throw classesError
        }

        setTotalClasses(classes?.length || 0)

        // Get total students
        if (classes && classes.length > 0) {
          const classIds = classes.map((c) => c.id)
          const { count: studentCount, error: studentsError } = await supabase
            .from("student_classes")
            .select("*", { count: "exact" })
            .in("class_id", classIds)

          if (studentsError) {
            throw studentsError
          }

          setTotalStudents(studentCount || 0)
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchProfile()
  }, [router, supabase])

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
          school_name: schoolName,
        })
        .eq("id", user.id)

      if (error) {
        throw error
      }

      setSavedSchoolName(schoolName)
      setSuccess("Profile updated successfully!")
    } catch (error: any) {
      setError(error.message || "An error occurred while updating your profile")
    } finally {
      setIsLoading(false)
    }
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
          <Link href="/teacher/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="border-2 border-amber-800 bg-amber-50 mb-6">
            <CardHeader>
              <CardTitle className="text-2xl font-pixel text-amber-900">Teacher Profile</CardTitle>
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
                    <Label htmlFor="school" className="font-pixel text-amber-900">
                      School Name
                    </Label>
                    <Input
                      id="school"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      placeholder="Enter your school name"
                      className="border-amber-300 bg-amber-100"
                    />
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-2 border-amber-800 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-2xl font-pixel text-amber-900">Your Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-amber-100 p-4 rounded-lg border border-amber-300">
                  <div className="flex items-center gap-3">
                    <School className="h-6 w-6 text-amber-700" />
                    <div>
                      <p className="text-sm text-amber-700">School</p>
                      <p className="text-xl font-bold font-pixel text-amber-900">
                        {savedSchoolName || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-100 p-4 rounded-lg border border-amber-300">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-6 w-6 text-amber-700" />
                    <div>
                      <p className="text-sm text-amber-700">Classes</p>
                      <p className="text-2xl font-bold font-pixel text-amber-900">{totalClasses}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-100 p-4 rounded-lg border border-amber-300">
                  <div className="flex items-center gap-3">
                    <Users className="h-6 w-6 text-amber-700" />
                    <div>
                      <p className="text-sm text-amber-700">Students</p>
                      <p className="text-2xl font-bold font-pixel text-amber-900">{totalStudents}</p>
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
        </motion.div>
      </div>
    </div>
  )
}
