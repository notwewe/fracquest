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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Loader2, ArrowLeft, Save, LogOut, BookOpen, Users, Trash2, School } from "lucide-react"

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
  const [isDeactivating, setIsDeactivating] = useState(false) // Renamed from isDeleting
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState("")
  const [deactivateError, setDeactivateError] = useState<string | null>(null) // Renamed from deleteError
  const supabase = createClient()

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoadingData(true)
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
          console.error("Auth error or no user:", authError)
          router.push("/auth/login")
          return
        }

        setEmail(user.email || "")

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("username, school_name, is_active") // Ensure is_active is selected
          .eq("id", user.id)
          .single()

        if (profileError) throw profileError
        if (profile && profile.is_active === false) {
          // This case should ideally be caught by middleware, but as a fallback:
          await supabase.auth.signOut()
          router.push("/auth/login?message=account-deactivated")
          return
        }

        setUsername(profile.username || "")
        setSchoolName(profile.school_name || "")
        setSavedSchoolName(profile.school_name || "")

        const { data: classes, error: classesError } = await supabase
          .from("classes")
          .select("id", { count: "exact" })
          .eq("teacher_id", user.id)

        if (classesError) throw classesError
        setTotalClasses(classes?.length || 0)

        if (classes && classes.length > 0) {
          const classIds = classes.map((c) => c.id)
          const { count: studentCount, error: studentsError } = await supabase
            .from("student_classes")
            .select("*", { count: "exact" })
            .in("class_id", classIds)

          if (studentsError) throw studentsError
          setTotalStudents(studentCount || 0)
        }
      } catch (err: any) {
        console.error("Error fetching profile:", err)
        setError(err.message || "Failed to load profile data.")
      } finally {
        setIsLoadingData(false)
      }
    }
    fetchProfile()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("You must be logged in to update your profile")

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ username, school_name: schoolName })
        .eq("id", user.id)

      if (updateError) throw updateError
      setSavedSchoolName(schoolName)
      setSuccess("Profile updated successfully!")
    } catch (err: any) {
      setError(err.message || "An error occurred while updating your profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeactivateAccount = async () => {
    setIsDeactivating(true)
    setDeactivateError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("You must be logged in to deactivate your account")

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: confirmPassword,
      })

      if (signInError) {
        throw new Error("Incorrect password. Please try again.")
      }

      const { data: classes, error: classesError } = await supabase
        .from("classes")
        .select("id")
        .eq("teacher_id", user.id)

      if (classesError) throw classesError

      if (classes && classes.length > 0) {
        const classIds = classes.map((c) => c.id)
        console.log(`Deleting ${classes.length} classes with IDs:`, classIds)

        const { error: deleteEnrollmentsError } = await supabase
          .from("student_classes")
          .delete()
          .in("class_id", classIds)
        if (deleteEnrollmentsError) throw deleteEnrollmentsError

        const { error: deleteClassesError } = await supabase.from("classes").delete().in("id", classIds)
        if (deleteClassesError) throw deleteClassesError
      }

      // Deactivate the teacher's profile instead of deleting
      const { error: profileError } = await supabase.from("profiles").update({ is_active: false }).eq("id", user.id)
      if (profileError) throw profileError

      // DO NOT delete auth.users record:
      // const { error: deleteUserError } = await supabase.auth.admin.deleteUser(user.id)
      // if (deleteUserError) console.warn("Could not delete auth user, but profile was deactivated")

      await supabase.auth.signOut()
      router.push("/auth/login?message=account-deactivated")
    } catch (err: any) {
      console.error("Error deactivating account:", err)
      setDeactivateError(err.message || "An error occurred while deactivating your account")
    } finally {
      setIsDeactivating(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-[calc(100vh-100px)] bg-[#FAF7F0]">
        <Loader2 className="h-12 w-12 animate-spin text-[#8B4513]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF7F0] p-4 font-sans">
      <div className="container mx-auto">
        <div className="mb-6">
          <Button
            asChild
            variant="outline"
            className="border-[#a0522d] text-[#8B4513] hover:bg-[#f5e9d0] hover:text-[#8B4513]"
          >
            <Link href="/teacher/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="border-2 border-[#a0522d] bg-[#f5e9d0] mb-6 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-[#8B4513]">Teacher Profile</CardTitle>
                <CardDescription className="text-[#a0522d]">Update your profile information</CardDescription>
              </CardHeader>
              <CardContent>
                {error && !success && (
                  <Alert variant="destructive" className="mb-4 bg-red-100 border-red-400 text-red-700">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert className="mb-4 bg-green-100 border-green-400 text-green-700">
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4">
                    {/* Form fields for username, email, schoolName */}
                    <div className="grid gap-2">
                      <Label htmlFor="username" className="font-semibold text-[#8B4513]">
                        Username
                      </Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="border-[#d9c8a9] bg-[#FAF7F0] focus:border-[#a0522d]"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email" className="font-semibold text-[#8B4513]">
                        Email
                      </Label>
                      <Input id="email" value={email} disabled className="border-[#d9c8a9] bg-[#e5d9c0] opacity-70" />
                      <p className="text-xs text-[#a0522d]">Email cannot be changed</p>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="school" className="font-semibold text-[#8B4513]">
                        School Name
                      </Label>
                      <Input
                        id="school"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        placeholder="Enter your school name"
                        className="border-[#d9c8a9] bg-[#FAF7F0] focus:border-[#a0522d]"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-[#8B4513] hover:bg-[#a0522d] text-[#f5e9d0] mt-2 font-semibold"
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

                    <Dialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
                      <DialogTrigger asChild>
                        <Button
                          type="button"
                          variant="destructive"
                          className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white font-semibold"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Deactivate Account
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#f5e9d0] border-2 border-[#a0522d]">
                        <DialogHeader>
                          <DialogTitle className="text-[#8B4513]">Deactivate Account</DialogTitle>
                          <DialogDescription className="text-[#a0522d]">
                            Are you sure you want to deactivate your account? This action will:
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <ul className="list-disc list-inside space-y-2 text-sm text-[#8B4513]">
                            <li>Prevent you from logging in with this account.</li>
                            <li>Delete all your classes and associated student enrollments.</li>
                            <li>Your profile data will be kept but marked as inactive.</li>
                            <li>Student profiles and their progress data will remain intact.</li>
                          </ul>
                          <p className="mt-4 text-sm font-semibold text-red-600">
                            Your classes will be permanently deleted. To reactivate your account, you will need to
                            contact an administrator.
                          </p>
                          <div className="mt-6">
                            <Label htmlFor="confirm-password" className="font-semibold text-[#8B4513]">
                              Enter your password to confirm deactivation:
                            </Label>
                            <Input
                              id="confirm-password"
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Enter your password"
                              className="mt-2 border-[#d9c8a9] bg-[#FAF7F0] focus:border-[#a0522d]"
                            />
                          </div>
                          {deactivateError && (
                            <Alert variant="destructive" className="mt-4 bg-red-100 border-red-400 text-red-700">
                              <AlertDescription>{deactivateError}</AlertDescription>
                            </Alert>
                          )}
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowDeactivateDialog(false)
                              setConfirmPassword("")
                              setDeactivateError(null)
                            }}
                            className="border-[#a0522d] text-[#8B4513] hover:bg-[#e5d9c0]"
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={handleDeactivateAccount}
                            disabled={isDeactivating || !confirmPassword.trim()}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {isDeactivating ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deactivating...
                              </>
                            ) : (
                              "Deactivate Account"
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Card - no changes needed here as it already filters by active classes/students implicitly */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="border-2 border-[#a0522d] bg-[#f5e9d0] shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-[#8B4513]">Your Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#FAF7F0] p-4 rounded-lg border border-[#d9c8a9]">
                    <div className="flex items-center gap-3">
                      <School className="h-6 w-6 text-[#8B4513]" />
                      <div>
                        <p className="text-sm text-[#a0522d]">School</p>
                        <p className="text-lg font-bold text-[#8B4513]">{savedSchoolName || "Not specified"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#FAF7F0] p-4 rounded-lg border border-[#d9c8a9]">
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-6 w-6 text-[#8B4513]" />
                      <div>
                        <p className="text-sm text-[#a0522d]">Classes</p>
                        <p className="text-xl font-bold text-[#8B4513]">{totalClasses}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#FAF7F0] p-4 rounded-lg border border-[#d9c8a9]">
                    <div className="flex items-center gap-3">
                      <Users className="h-6 w-6 text-[#8B4513]" />
                      <div>
                        <p className="text-sm text-[#a0522d]">Students</p>
                        <p className="text-xl font-bold text-[#8B4513]">{totalStudents}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center pt-4">
                <Button
                  asChild
                  variant="outline"
                  className="border-[#a0522d] text-[#8B4513] hover:bg-[#e5d9c0] hover:text-[#8B4513] font-semibold"
                >
                  <Link href="/auth/logout" prefetch={false}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
