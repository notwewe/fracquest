"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { UserMinus, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface RemoveStudentButtonProps {
  studentClassId: number
  onRemove?: () => void
}

export function RemoveStudentButton({ studentClassId, onRemove }: RemoveStudentButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const supabase = createClient()

  const handleRemove = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.from("student_classes").delete().eq("id", studentClassId)

      if (error) {
        throw error
      }

      setShowDialog(false)
      if (onRemove) {
        onRemove()
      } else {
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
    <>
      <Button
        variant="outline"
        size="sm"
        className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
        onClick={() => setShowDialog(true)}
        disabled={isLoading}
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserMinus className="h-4 w-4" />}
        <span className="sr-only">Remove</span>
      </Button>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Student</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            Are you sure you want to remove this student from the class?
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemove} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
