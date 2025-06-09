import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { gameContent } from "@/lib/game-content"

export default async function PlayLevelPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get the waypoint data
  const { data: waypoint } = await supabase.from("waypoints").select("*").eq("id", params.id).single()

  if (!waypoint) {
    redirect("/student/game")
  }

  // Allow access to any level (for revisiting completed levels)
  const { data: progress } = await supabase
    .from("student_progress")
    .select("*")
    .eq("student_id", user.id)
    .eq("waypoint_id", Number.parseInt(params.id))
    .maybeSingle()

  // Check if this is the first level (always accessible) or if user has progress OR completed previous levels
  const isFirstLevel = Number.parseInt(params.id) === 1

  // Check if user has completed previous levels (for sequential access)
  const { data: previousProgress } = await supabase
    .from("student_progress")
    .select("*")
    .eq("student_id", user.id)
    .lt("waypoint_id", Number.parseInt(params.id))
    .order("waypoint_id", { ascending: false })
    .limit(1)
    .maybeSingle()

  const hasAccess = isFirstLevel || progress !== null || previousProgress !== null

  if (!hasAccess) {
    redirect("/student/game")
  }

  // Get the component for this level
  const LevelComponent = gameContent[Number.parseInt(params.id) as keyof typeof gameContent]

  if (!LevelComponent) {
    redirect("/student/game")
  }

  return (
    <div className="relative">
      <LevelComponent />
    </div>
  )
}
