"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export function JoinClassForm({ onSuccess }: { onSuccess?: () => void }) {
  const [classCode, setClassCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (!classCode.trim()) {
        throw new Error("Please enter a class code")
      }

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("You must be logged in to join a class")
      }

      // Find the class with this code
      const { data: classData, error: classError } = await supabase
        .from("classes")
        .select("id, name")
        .eq("class_code", classCode.trim())
        .single()

      if (classError) {
        console.error("Class lookup error:", classError)
        throw new Error(`Invalid class code: ${classCode}. Please check and try again.`)
      }

      if (!classData) {
        throw new Error(`No class found with code: ${classCode}`)
      }

      // Check if already enrolled
      const { data: existingEnrollment, error: enrollmentError } = await supabase
        .from("student_classes")
        .select("id")
        .eq("student_id", user.id)
        .eq("class_id", classData.id)
        .maybeSingle()

      if (existingEnrollment) {
        throw new Error(`You are already enrolled in ${classData.name}`)
      }

      // Join the class
      const { error: joinError } = await supabase.from("student_classes").insert({
        student_id: user.id,
        class_id: classData.id,
        joined_at: new Date().toISOString(),
      })

      if (joinError) {
        console.error("Class join error:", joinError)
        throw new Error(`Error joining class: ${joinError.message}`)
      }

      setSuccess(`Successfully joined ${classData.name}!`)
      setClassCode("")

      // Call the success callback if provided
      if (onSuccess) {
        // Clear the URL query parameter and call the success callback immediately
        onSuccess()
      }
    } catch (error: any) {
      setError(error.message || "An error occurred while joining the class")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
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
      <form onSubmit={handleJoinClass}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="classCode" className="font-pixel text-amber-900">
              Class Code
            </Label>
            <Input
              id="classCode"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value)}
              placeholder="Enter 6-digit code (e.g., ABC123)"
              className="border-amber-300 bg-amber-100"
              required
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full font-pixel bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Joining...
              </>
            ) : (
              "Join Class"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
