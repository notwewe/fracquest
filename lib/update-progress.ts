import { createClient } from "@/lib/supabase/client"

export async function updateStudentProgress(
  studentId: string,
  waypointId: number,
  updates: {
    completed?: boolean
    score?: number
    mistakes?: number
    attempts?: number
    timeSpent?: number
    current_line?: number
  },
) {
  const supabase = createClient()

  try {
    // First check if record exists
    const { data: existingProgress } = await supabase
      .from("student_progress")
      .select("*")
      .eq("student_id", studentId)
      .eq("waypoint_id", waypointId)
      .maybeSingle()

    let result

    if (existingProgress) {
      // Update existing record
      result = await supabase
        .from("student_progress")
        .update({
          ...updates,
          can_revisit: true,
          last_updated: new Date().toISOString(),
        })
        .eq("student_id", studentId)
        .eq("waypoint_id", waypointId)
    } else {
      // Insert new record
      result = await supabase.from("student_progress").insert({
        student_id: studentId,
        waypoint_id: waypointId,
        ...updates,
        can_revisit: true,
        last_updated: new Date().toISOString(),
      })
    }

    if (result.error) {
      throw new Error(`Failed to update progress: ${result.error.message}`)
    }

    // If level is completed, trigger the unlock function
    if (updates.completed) {
      await supabase.rpc("unlock_next_level", {
        student_uuid: studentId,
        completed_waypoint_id: waypointId,
      })
    }

    return result
  } catch (error) {
    console.error("Error updating student progress:", error)
    throw error
  }
}
