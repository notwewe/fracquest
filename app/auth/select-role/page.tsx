"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { RoleSelector } from "@/components/auth/role-selector"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SelectRolePage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleRoleSelect = async (roleId: number) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      // Create profile with selected role
      const { error: profileError } = await supabase.from("profiles").insert({
        id: user.id,
        role_id: roleId,
        username: user.email?.split("@")[0] || "User",
      })

      if (profileError) {
        throw profileError
      }

      // If student, create story progress entry
      if (roleId === 1) {
        const { error: storyError } = await supabase.from("story_progress").insert({
          student_id: user.id,
          has_seen_intro: false,
          last_dialogue_index: 0,
        })

        if (storyError) {
          console.error("Story progress creation error:", storyError)
        }

        router.push("/student/story")
      } else if (roleId === 2) {
        // Teacher
        router.push("/teacher/dashboard")
      }
    } catch (error: any) {
      setError(error.message || "An error occurred while setting up your profile")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-100 p-4">
      <div className="w-full max-w-md">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <RoleSelector onRoleSelect={handleRoleSelect} />
      </div>
    </div>
  )
}
