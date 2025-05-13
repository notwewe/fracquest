import { createClient } from "@/lib/supabase/server"
import { SimpleLevelContent } from "@/components/game/simple-level-content"
import { getLevelDialogue } from "@/lib/game-content"
import { redirect } from "next/navigation"

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

  // Get the dialogue for this level
  const dialogue = getLevelDialogue(params.id)

  return (
    <div className="relative">
      <SimpleLevelContent levelId={params.id} dialogue={dialogue} levelName={waypoint.name} />
      {/* Emergency exit is now built into SimpleLevelContent */}
    </div>
  )
}
