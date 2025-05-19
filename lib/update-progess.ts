import { createClient } from "@/lib/supabase/server"

/**
 * Updates student progress
 */
export async function updateStudentProgress(
  studentId: string,
  waypointId: number,
  data: {
    completed?: boolean
    score?: number
    mistakes?: number
    attempts?: number
  },
) {
  const supabase = createClient()

  try {
    await supabase.rpc("update_student_progress", {
      p_student_id: studentId,
      p_waypoint_id: waypointId,
      p_completed: data.completed,
      p_score: data.score,
      p_mistakes: data.mistakes,
      p_attempts: data.attempts,
    })
  } catch (error) {
    console.error("Error updating student progress:", error)
  }
}
