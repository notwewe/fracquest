import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = createClient()

  try {
    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Delete all progress for this user
    await supabase.from("student_progress").delete().eq("student_id", user.id)

    // Try to refresh the student_progress table
    try {
      await supabase.rpc("refresh_student_progress")
    } catch (error) {
      console.error("Error refreshing student progress:", error)
    }

    return NextResponse.redirect(new URL("/student/game", request.url))
  } catch (error) {
    console.error("Error resetting progress:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
