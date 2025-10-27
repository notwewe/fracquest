"use client"

import type React from "react" // Ensure React is typed correctly

import { useState, useEffect } from "react" // Added useEffect
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js" // Import User type
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, PlusCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Basic UUID regex (not exhaustive but good for a quick check)
const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

export default function NewClassPage() {
  const router = useRouter()
  const [className, setClassName] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null) // State for user
  const supabase = createClient()

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()
      if (authError) {
        console.error("Auth error on page load:", authError)
        setError(`Authentication error: ${authError.message}. Please try logging in again.`)
        // router.push("/auth/login") // Optionally redirect immediately
        return
      }
      if (user) {
        console.log("Fetched user on page load:", JSON.stringify(user, null, 2))
        setCurrentUser(user)
        if (!user.id || typeof user.id !== "string" || !UUID_REGEX.test(user.id)) {
          console.error("Invalid user ID on page load:", user.id)
          setError(
            `Your user ID ('${user.id}') appears to be invalid. Please log out and log back in. If the issue persists, contact support.`,
          )
        }
      } else {
        console.log("No user found on page load.")
        setError("You must be logged in to create a class. Redirecting to login...")
        router.push("/auth/login")
      }
    }
    fetchUser()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!currentUser) {
      setError("User not available. Please ensure you are logged in.")
      setIsLoading(false)
      // router.push("/auth/login") // Optionally redirect
      return
    }

    const teacherId = currentUser.id
    console.log("Attempting to create class with Teacher ID:", teacherId)

    if (!teacherId || typeof teacherId !== "string" || !UUID_REGEX.test(teacherId)) {
      setError(`Invalid Teacher ID format: '${teacherId}'. Expected a valid UUID. Please try logging out and back in.`)
      setIsLoading(false)
      return
    }

    try {
      const { data: rpcData, error: functionError } = await supabase.rpc("create_class_with_code", {
        p_teacher_id: teacherId,
        p_name: className,
        p_description: description,
      })

      if (functionError) {
        console.error("RPC Function Error:", JSON.stringify(functionError, null, 2))
        let specificError = `Error creating class: ${functionError.message}`
        if (functionError.message.includes("invalid input syntax for type uuid")) {
          specificError = `Database error: The provided Teacher ID ('${teacherId}') was rejected by the database as not a valid UUID. This indicates an issue with your user session. Please log out, log back in, and try again. If the problem continues, contact support.`
        } else if (functionError.message.includes("Failed to generate a unique class code")) {
          specificError =
            "Could not generate a unique class code for the new class. This is a rare issue, please try again."
        }
        setError(specificError)
        // No need to re-throw here, error is set.
        return // Stop execution
      }

      if (rpcData && rpcData.new_class_id) {
        router.push(`/teacher/classes/${rpcData.new_class_id}`)
      } else {
        console.error("Unexpected RPC response:", rpcData)
        setError(
          "Failed to create class: The operation seemed to succeed but did not return the new class ID. Please check your class list or try again.",
        )
      }
    } catch (err: any) {
      console.error("Unexpected error during class creation (outer catch):", err)
      if (!error) {
        // Only set if not already set by RPC error handling
        setError(err.message || "An unexpected error occurred. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F0] p-4 font-sans">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-6">
          <Button
            asChild
            variant="outline"
            className="border-[#a0522d] text-[#8B4513] hover:bg-[#f5e9d0] hover:text-[#8B4513] font-semibold"
          >
            <Link href="/teacher/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <Card className="border-2 border-[#a0522d] bg-[#f5e9d0] shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl font-bold text-[#8B4513]">Create New Class</CardTitle>
            <CardDescription className="text-[#a0522d] mt-1">
              Set up a new virtual classroom for your students. Once created, you&apos;ll receive a unique Class Code
              for students to enroll and begin their FracQuest adventure!
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4 bg-red-100 border-red-400 text-red-700">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="className" className="block text-sm font-semibold text-[#8B4513] mb-1">
                  Class Name
                </Label>
                <Input
                  id="className"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  required
                  placeholder="e.g., Morning Math Whizzes, Block A Fractions"
                  className="border-[#d9c8a9] bg-[#FAF7F0] focus:border-[#a0522d]"
                />
                <p className="mt-1 text-xs text-[#a0522d]">
                  This name will be visible to you and your students. Choose something recognizable.
                </p>
              </div>
              <div>
                <Label htmlFor="description" className="block text-sm font-semibold text-[#8B4513] mb-1">
                  Description (Optional)
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="E.g., Focusing on adding and subtracting fractions, preparing for the unit test."
                  className="border-[#d9c8a9] bg-[#FAF7F0] focus:border-[#a0522d] min-h-[100px]"
                />
                <p className="mt-1 text-xs text-[#a0522d]">
                  Provide details like the subject, grade level, or specific topics covered. This helps you (and your
                  students, if shared) identify the class.
                </p>
              </div>
              <Button
                type="submit"
                disabled={isLoading || !className.trim() || !currentUser} // Also disable if no current user
                className="w-full font-semibold bg-[#8B4513] hover:bg-[#a0522d] text-[#f5e9d0]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Class...
                  </>
                ) : (
                  <>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Class
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
