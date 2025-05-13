"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ArrowLeft, Save, Trash2 } from "lucide-react"

export default function EditClassPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const classId = Number.parseInt(params.id)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchClass = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/auth/login")
          return
        }

        const { data, error } = await supabase
          .from("classes")
          .select("*")
          .eq("id", classId)
          .eq("teacher_id", user.id)
          .single()

        if (error) {
          throw error
        }

        if (!data) {
          router.push("/teacher/dashboard")
          return
        }

        setName(data.name)
        setDescription(data.description || "")
      } catch (error) {
        console.error("Error fetching class:", error)
        router.push("/teacher/dashboard")
      } finally {
        setIsLoadingData(false)
      }
    }

    if (!isNaN(classId)) {
      fetchClass()
    } else {
      router.push("/teacher/dashboard")
    }
  }, [classId, router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("You must be logged in to update a class")
      }

      // Update the class
      const { error } = await supabase
        .from("classes")
        .update({
          name,
          description,
        })
        .eq("id", classId)
        .eq("teacher_id", user.id)

      if (error) {
        throw error
      }

      // Redirect to the class page
      router.push(`/teacher/classes/${classId}`)
    } catch (error: any) {
      setError(error.message || "An error occurred while updating the class")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this class? This action cannot be undone.")) {
      return
    }

    setIsDeleting(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("You must be logged in to delete a class")
      }

      // Delete the class
      const { error } = await supabase.from("classes").delete().eq("id", classId).eq("teacher_id", user.id)

      if (error) {
        throw error
      }

      // Redirect to the dashboard
      router.push("/teacher/dashboard")
    } catch (error: any) {
      setError(error.message || "An error occurred while deleting the class")
    } finally {
      setIsDeleting(false)
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
      <div className="max-w-2xl mx-auto">
        <Button
          variant="outline"
          className="mb-4 font-pixel border-amber-600 text-amber-700"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card className="border-2 border-amber-800 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-2xl font-pixel text-amber-900">Edit Class</CardTitle>
            <CardDescription className="font-pixel text-amber-700">Update your class information</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="font-pixel text-amber-900">
                    Class Name
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="border-amber-300 bg-amber-100"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description" className="font-pixel text-amber-900">
                    Description (Optional)
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="border-amber-300 bg-amber-100 min-h-[100px]"
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="font-pixel border-red-500 text-red-500 hover:bg-red-50"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Class
                      </>
                    )}
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="font-pixel bg-amber-600 hover:bg-amber-700 text-white"
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
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
