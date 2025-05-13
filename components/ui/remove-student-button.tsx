"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { UserMinus, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface RemoveStudentButtonProps {
  studentClassId: number
  onRemove?: () => void
}

export function RemoveStudentButton({ studentClassId, onRemove }: RemoveStudentButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleRemove = async () => {
    if (!confirm("Are you sure you want to remove this student from the class?")) {
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase.from("student_classes").delete().eq("id", studentClassId)

      if (error) {
        throw error
      }

      if (onRemove) {
        onRemove()
      } else {
        // Refresh the page if no callback is provided
        window.location.reload()
      }
    } catch (error) {
      console.error("Error removing student:", error)
      alert("Failed to remove student. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
      onClick={handleRemove}
      disabled={isLoading}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserMinus className="h-4 w-4" />}
      <span className="sr-only">Remove</span>
    </Button>
  )
}
