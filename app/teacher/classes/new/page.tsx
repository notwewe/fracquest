"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ArrowLeft } from "lucide-react"

export default function NewClassPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

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
        throw new Error("You must be logged in to create a class")
      }

      console.log("Creating class with:", {
        name,
        description,
        teacher_id: user.id,
      })

      // Use the RPC function to bypass RLS
      const { data, error: rpcError } = await supabase.rpc("create_class_bypass_rls", {
        p_name: name,
        p_description: description,
        p_teacher_id: user.id,
      })

      if (rpcError) {
        console.error("Error creating class:", rpcError)
        throw new Error(`Failed to create class: ${rpcError.message}`)
      }

      if (!data) {
        throw new Error("No data returned from class creation")
      }

      setSuccess(`Class "${name}" created successfully with code: ${data.class_code}`)

      // Redirect after a short delay to show the success message
      setTimeout(() => {
        router.push(`/teacher/classes/${data.id}`)
      }, 1500)
    } catch (error: any) {
      console.error("Error in class creation:", error)
      setError(error.message || "An error occurred while creating the class")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="outline"
          className="mb-4 font-pixel border-amber-600 text-amber-700"
          onClick={() => router.push("/teacher/dashboard")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card className="border-2 border-amber-800 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-2xl font-pixel text-amber-900">Create New Class</CardTitle>
            <CardDescription className="font-pixel text-amber-700">
              Create a new class for your students to join
            </CardDescription>
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
                  <Label htmlFor="name" className="font-pixel text-amber-900">
                    Class Name
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="border-amber-300 bg-amber-100"
                    placeholder="e.g. Math 101"
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
                    placeholder="Describe your class..."
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
                      Creating...
                    </>
                  ) : (
                    "Create Class"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
