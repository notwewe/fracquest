import { createClient } from "@/lib/supabase/client"

export async function trackWaypointTime(studentId: string, waypointId: number, timeSpent: number) {
  try {
    const supabase = createClient()

    // Get existing time record
    const { data: existingRecord } = await supabase
      .from("student_progress")
      .select("timeSpent")
      .eq("student_id", studentId)
      .eq("waypoint_id", waypointId)
      .maybeSingle()

    // Calculate new time spent
    const newTimeSpent = (existingRecord?.timeSpent || 0) + Math.floor(timeSpent / 1000)

    // Update the record
    await supabase.from("student_progress").upsert({
      student_id: studentId,
      waypoint_id: waypointId,
      timeSpent: newTimeSpent,
      updated_at: new Date().toISOString(),
    })

    return true
  } catch (error) {
    console.error("Error tracking time:", error)
    return false
  }
}

export async function updateStudentProgress(
  studentId: string,
  waypointId: number,
  data: {
    completed?: boolean
    score?: number
    mistakes?: number
    attempts?: number
    timeSpent?: number
  },
) {
  try {
    const supabase = createClient()

    // Get existing record
    const { data: existingRecord } = await supabase
      .from("student_progress")
      .select("*")
      .eq("student_id", studentId)
      .eq("waypoint_id", waypointId)
      .maybeSingle()

    // Prepare update data with proper typing
    const updateData: any = {
      student_id: studentId,
      waypoint_id: waypointId,
      ...data,
      updated_at: new Date().toISOString(),
    }

    // If no record exists, add created_at
    if (!existingRecord) {
      updateData.created_at = new Date().toISOString()
    }

    // Update or insert the record
    await supabase.from("student_progress").upsert(updateData)

    return true
  } catch (error) {
    console.error("Error updating student progress:", error)
    return false
  }
}
