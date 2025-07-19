import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { GameContent } from "@/components/game/game-content"

export default async function GamePage(props: any) {
  const { params } = await props;
  const supabase = createClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get the waypoint data
  const { data: waypoint, error } = await supabase.from("waypoints").select("*").eq("id", params.id).single()

  if (error || !waypoint) {
    console.error("Error fetching waypoint:", error)
    redirect("/student/game")
  }

  return (
    <div className="min-h-screen bg-amber-50">
      <GameContent waypoint={waypoint} />
    </div>
  )
}
