"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

export function ProcessClassJoin() {
  const { toast } = useToast()
  const [processed, setProcessed] = useState(false)

  useEffect(() => {
    const processPendingJoin = async () => {
      const pendingJoinData = localStorage.getItem("pendingClassJoin")

      if (pendingJoinData && !processed) {
        try {
          const { userId, classId, className } = JSON.parse(pendingJoinData)
          const supabase = createClient()

          // Get current user
          const {
            data: { user },
          } = await supabase.auth.getUser()

          if (user && user.id === userId) {
            // Join the class
            const { error: joinError } = await supabase.from("student_classes").insert({
              student_id: userId,
              class_id: classId,
              joined_at: new Date().toISOString(),
            })

            if (joinError) {
              console.error("Error joining class:", joinError)
              toast({
                title: "Couldn't join class",
                description: `There was an error joining ${className}. You can try again later.`,
                variant: "destructive",
              })
            } else {
              toast({
                title: "Class joined!",
                description: `You've successfully joined ${className}!`,
              })
            }
          }

          // Clear the pending join data
          localStorage.removeItem("pendingClassJoin")
          setProcessed(true)
        } catch (err) {
          console.error("Error processing class join:", err)
        }
      }
    }

    processPendingJoin()
  }, [toast, processed])

  return null
}
