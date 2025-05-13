"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { RoleSelector } from "./role-selector"

export function RegisterForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [roleId, setRoleId] = useState<number | null>(null)
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [classCode, setClassCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleRoleSelect = (selectedRoleId: number) => {
    setRoleId(selectedRoleId)
    setStep(2)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Register user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            username,
            role_id: roleId,
          },
        },
      })

      if (error) {
        throw error
      }

      if (data.user) {
        // Create profile immediately to ensure role is saved
        const { error: profileError } = await supabase.from("profiles").upsert({
          id: data.user.id,
          username,
          role_id: roleId,
          created_at: new Date().toISOString(),
        })

        if (profileError) {
          console.error("Error creating profile:", profileError)
          // Continue with registration even if profile creation fails
        }

        // If student, create story progress entry
        if (roleId === 1) {
          try {
            const { error: progressError } = await supabase.from("story_progress").insert({
              student_id: data.user.id,
              has_seen_intro: false,
              last_dialogue_index: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })

            if (progressError) {
              console.error("Error creating story progress:", progressError)
              // Continue with registration even if progress creation fails
            } else {
              console.log("Story progress created successfully")
            }
          } catch (storyError) {
            console.error("Detailed story progress error:", storyError)
            // Continue with registration even if progress creation fails
          }
        }

        // If student and class code provided, try to join class
        if (roleId === 1 && classCode.trim()) {
          try {
            // Find the class with this code
            const { data: classData, error: classError } = await supabase
              .from("classes")
              .select("id, name")
              .eq("class_code", classCode.trim())
              .single()

            if (classError) {
              console.error("Class lookup error:", classError)
              setError(`Invalid class code: ${classCode}. Please check and try again.`)
              setIsLoading(false)
              return
            }

            if (!classData) {
              setError(`No class found with code: ${classCode}`)
              setIsLoading(false)
              return
            }

            // Join class immediately
            const { error: joinError } = await supabase.from("student_classes").insert({
              student_id: data.user.id,
              class_id: classData.id,
            })

            if (joinError) {
              console.error("Error joining class:", joinError)
              // Continue with registration even if class joining fails
            }
          } catch (err) {
            console.error("Error processing class code:", err)
            // Continue with registration even if class joining fails
          }
        }

        setSuccess("Registration successful! Please check your email to verify your account.")
        setTimeout(() => {
          router.push("/auth/login")
        }, 3000)
      }
    } catch (error: any) {
      setError(error.message || "An error occurred during registration")
    } finally {
      setIsLoading(false)
    }
  }

  if (step === 1) {
    return <RoleSelector onRoleSelect={handleRoleSelect} />
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive" className="transform -rotate-3 bg-red-200 border-red-500">
          <AlertDescription className="text-black text-sm sm:text-base">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="transform -rotate-3 bg-green-200 border-green-500">
          <AlertDescription className="text-black text-sm sm:text-base">{success}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="space-y-2">
          <Input
            id="username"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-[#e3c17d] border-2 border-black rounded-[15px] font-blaka text-black placeholder:text-black focus:outline-none focus:bg-[#e3c17d] focus:text-black transform -rotate-3 text-sm sm:text-base"
          />
        </div>

        <div className="space-y-2">
          <Input
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-[#e3c17d] border-2 border-black rounded-[15px] font-blaka text-black placeholder:text-black focus:outline-none focus:bg-[#e3c17d] focus:text-black transform -rotate-3 text-sm sm:text-base"
          />
        </div>

        <div className="space-y-2">
          <Input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-[#e3c17d] border-2 border-black rounded-[15px] font-blaka text-black placeholder:text-black focus:outline-none focus:bg-[#e3c17d] focus:text-black transform -rotate-3 text-sm sm:text-base"
          />
        </div>

        {roleId === 1 && (
          <div className="space-y-2">
            <Input
              id="classCode"
              placeholder="Class Code (Optional)"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-[#e3c17d] border-2 border-black rounded-[15px] font-blaka text-black placeholder:text-black focus:outline-none focus:bg-[#e3c17d] focus:text-black transform -rotate-3 text-sm sm:text-base"
            />
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 sm:py-3 bg-[#ba4c3c] text-black font-blaka rounded-[15px] transform -rotate-3 hover:bg-[#a03c2c] transition-colors text-sm sm:text-base"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Registering...
            </>
          ) : (
            "Register"
          )}
        </Button>
      </form>

      <div className="text-center transform -rotate-3">
        <span className="text-black font-blaka text-xs sm:text-sm">Already have an account? </span>
        <Link href="/auth/login" className="text-[#ba4c3c] hover:text-[#a04234] font-blaka text-xs sm:text-sm">
          Login
        </Link>
      </div>
    </div>
  )
}
