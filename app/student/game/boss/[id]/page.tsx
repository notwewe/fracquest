import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SimpleGameContent } from "@/components/game/simple-game-content"

export default async function BossGamePage(props: any) {
  const { params } = await props;
  const supabase = createClient()
  const waypointId = Number.parseInt(params.id)

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if student is enrolled in a class
  const { data: studentClasses } = await supabase.from("student_classes").select("*").eq("student_id", user.id)

  if (!studentClasses || studentClasses.length === 0) {
    redirect("/student/profile?message=You need to join a class to play the game")
  }

  // Get the waypoint data
  const { data: waypoint } = await supabase.from("waypoints").select("*").eq("id", waypointId).single()

  if (!waypoint) {
    redirect("/student/game")
  }

  // Check if all previous waypoints are completed
  const { data: waypoints } = await supabase
    .from("waypoints")
    .select("*")
    .eq("section_id", waypoint.section_id)
    .order("order_index")

  if (waypoints) {
    const previousWaypoints = waypoints.filter((w) => w.order_index < waypoint.order_index)

    if (previousWaypoints.length > 0) {
      // Get student progress for previous waypoints
      const { data: progress } = await supabase
        .from("student_progress")
        .select("*")
        .eq("student_id", user.id)
        .in(
          "waypoint_id",
          previousWaypoints.map((w) => w.id),
        )

      // Check if all previous waypoints are completed
      const completedWaypoints = new Set(progress?.map((p) => p.waypoint_id) || [])
      const allPreviousCompleted = previousWaypoints.every((w) => completedWaypoints.has(w.id))

      if (!allPreviousCompleted) {
        redirect("/student/game?message=Complete previous waypoints first")
      }
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <SimpleGameContent waypointId={waypointId} gameType="boss" levelName={waypoint.name || "Boss Challenge"} />
    </div>
  )
}
