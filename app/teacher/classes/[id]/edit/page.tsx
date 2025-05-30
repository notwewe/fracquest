"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, Loader2, Trash2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function EditClassPage() {
  const router = useRouter()
  const params = useParams()
  const classId = Number.parseInt(params.id as string)

  const [className, setClassName] = useState("")
  const [description, setDescription] = useState("")
  const [originalClassName, setOriginalClassName] = useState("")
  const [originalDescription, setOriginalDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (isNaN(classId)) {
      setError("Invalid class ID.")
      setIsFetching(false)
      return
    }

    const fetchClassDetails = async () => {
      setIsFetching(true)
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          router.push("/auth/login")
          return
        }

        const { data, error: fetchError } = await supabase
          .from("classes")
          .select("name, description, teacher_id")
          .eq("id", classId)
          .single()

        if (fetchError) throw fetchError
        if (data.teacher_id !== user.id) {
          setError("You are not authorized to edit this class.")
          return
        }

        setClassName(data.name)
        setDescription(data.description || "")
        setOriginalClassName(data.name)
        setOriginalDescription(data.description || "")
      } catch (err: any) {
        console.error("Error fetching class details:", err)
        setError(err.message || "Failed to load class details.")
      } finally {
        setIsFetching(false)
      }
    }
    fetchClassDetails()
  }, [classId, router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { error: updateError } = await supabase
        .from("classes")
        .update({ name: className, description: description })
        .eq("id", classId)

      if (updateError) throw updateError
      setOriginalClassName(className)
      setOriginalDescription(description)
      setSuccess("Class details updated successfully!")
    } catch (err: any) {
      console.error("Error updating class:", err)
      setError(err.message || "An unexpected error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClass = async () => {
    setIsDeleting(true)
    setError(null)
    setSuccess(null)
    try {
      // First, delete associated student_classes entries
      const { error: studentClassesError } = await supabase.from("student_classes").delete().eq("class_id", classId)

      if (studentClassesError) throw studentClassesError

      // Then, delete the class itself
      const { error: classDeleteError } = await supabase.from("classes").delete().eq("id", classId)

      if (classDeleteError) throw classDeleteError

      setSuccess("Class deleted successfully. Redirecting...")
      setTimeout(() => router.push("/teacher/dashboard"), 2000)
    } catch (err: any) {
      console.error("Error deleting class:", err)
      setError(err.message || "Failed to delete class.")
    } finally {
      setIsDeleting(false)
    }
  }

  const hasChanges = className !== originalClassName || description !== originalDescription

  if (isFetching) {
    return (
      <div className="min-h-screen bg-[#FAF7F0] p-4 flex justify-center items-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#8B4513]" />
      </div>
    )
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
            <Link href={`/teacher/classes/${classId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Class Details
            </Link>
          </Button>
        </div>

        <Card className="border-2 border-[#a0522d] bg-[#f5e9d0] shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl font-bold text-[#8B4513]">Edit Class</CardTitle>
            <CardDescription className="text-[#a0522d]">Update the details for your class.</CardDescription>
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
                  className="border-[#d9c8a9] bg-[#FAF7F0] focus:border-[#a0522d]"
                />
              </div>
              <div>
                <Label htmlFor="description" className="block text-sm font-semibold text-[#8B4513] mb-1">
                  Description (Optional)
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="border-[#d9c8a9] bg-[#FAF7F0] focus:border-[#a0522d] min-h-[100px]"
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading || !hasChanges}
                className="w-full font-semibold bg-[#8B4513] hover:bg-[#a0522d] text-[#f5e9d0]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="border-t border-[#d9c8a9] pt-6 mt-6">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full font-semibold" disabled={isDeleting}>
                  {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                  Delete Class
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-[#f5e9d0] border-[#a0522d]">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-[#8B4513] font-bold">Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription className="text-[#a0522d]">
                    This action cannot be undone. This will permanently delete the class and all associated student data
                    for this class.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-[#a0522d] text-[#8B4513] hover:bg-[#e5d9c0]">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteClass}
                    className="bg-red-600 hover:bg-red-700 text-white"
                    disabled={isDeleting}
                  >
                    {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Yes, delete class
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
