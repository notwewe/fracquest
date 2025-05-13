import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()

  try {
    const waypointId = Number.parseInt(params.id)

    if (isNaN(waypointId)) {
      return NextResponse.json({ error: "Invalid waypoint ID" }, { status: 400 })
    }

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Force complete the waypoint
    await supabase.from("student_progress").upsert({
      student_id: user.id,
      waypoint_id: waypointId,
      completed: true,
      current_line: 999, // A high number to indicate completion
      score: 100,
      last_updated: new Date().toISOString(),
    })

    // Try to refresh the student_progress table
    try {
      await supabase.rpc("refresh_student_progress")
    } catch (error) {
      console.error("Error refreshing student progress:", error)
    }

    return NextResponse.redirect(new URL("/student/game", request.url))
  } catch (error) {
    console.error("Error forcing completion:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
