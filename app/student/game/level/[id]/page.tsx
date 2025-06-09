import { createClient } from "@/lib/supabase/server"
import { SimpleLevelContent } from "@/components/game/simple-level-content"
import { getLevelDialogue } from "@/lib/game-content"
import { redirect } from "next/navigation"
import FractionForestGame from "@/components/game/levels/fraction-forest-game"
import RealmOfBalanceGame from "@/components/game/levels/realm-of-balance-game"
import DreadpointHollowGame from "@/components/game/levels/dreadpoint-hollow-game"

export default async function LevelPage({ params }: { params: { id: string } }) {
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
  // Check if user has access to this level OR if they've completed previous levels
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

  // Get the dialogue for this level
  const dialogue = getLevelDialogue(params.id)

  // Special handling for the final three waypoints
  if (params.id === "8") {
    return <FractionForestGame />
  } else if (params.id === "9") {
    return <RealmOfBalanceGame />
  } else if (params.id === "10") {
    return <DreadpointHollowGame />
  }

  return (
    <div className="relative">
      <SimpleLevelContent levelId={params.id} dialogue={dialogue} levelName={waypoint.name} />
    </div>
  )
}
