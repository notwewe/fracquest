import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { ConversionGame } from "@/components/game/levels/conversion-game"
import { CompassGame } from "@/components/game/levels/compass-game"
import { FractionSubtractionGame } from "@/components/game/fraction-subtraction-game"

export default async function GamePlayPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const waypointId = Number.parseInt(params.id)

  if (isNaN(waypointId)) {
    return notFound()
  }

  // Check if user is authenticated and is a student
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role_id").eq("id", user.id).single()

  if (!profile || profile.role_id !== 1) {
    redirect("/auth/login")
  }

  // Get waypoint details
  const { data: waypoint, error: waypointError } = await supabase
    .from("waypoints")
    .select(`
      *,
      game_sections:section_id (
        name,
        description
      )
    `)
    .eq("id", waypointId)
    .single()

  if (waypointError || !waypoint) {
    return notFound()
  }

  // Get student's progress on this waypoint
  const { data: progress } = await supabase
    .from("student_progress")
    .select("*")
    .eq("student_id", user.id)
    .eq("waypoint_id", waypointId)
    .single()

  // Determine which game to show based on waypoint
  const getGameComponent = () => {
    if (waypoint.name === "Improper/Mixed Game") {
      return <ConversionGame waypointId={waypointId} userId={user.id} levelName={waypoint.name} />
    } else if (waypoint.name === "Addition Game") {
      return <CompassGame waypointId={waypointId} userId={user.id} levelName={waypoint.name} />
    } else if (waypoint.name === "Subtraction Game") {
      return <FractionSubtractionGame waypointId={waypointId} userId={user.id} />
    } else {
      // Default placeholder for other games
      return (
        <div className="p-6 text-center">
          <h2 className="text-2xl font-pixel text-amber-900 mb-4">{waypoint.name}</h2>
          <p className="text-amber-700 mb-6">This game is coming soon!</p>
          <Button asChild className="font-pixel bg-amber-600 hover:bg-amber-700 text-white">
            <Link href="/student/map">Return to Map</Link>
          </Button>
        </div>
      )
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Button asChild variant="outline" className="font-pixel border-amber-600 text-amber-700">
          <Link href="/student/map">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Map
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        <div>
          <h1 className="text-3xl font-pixel text-amber-900">{waypoint.name}</h1>
          <p className="text-amber-700">
            {waypoint.game_sections.name} - {waypoint.type.charAt(0).toUpperCase() + waypoint.type.slice(1)}
          </p>
        </div>

        <Card className="border-2 border-amber-800 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-xl font-pixel text-amber-900">
              {waypoint.type === "intro" ? "Learn" : waypoint.type === "boss" ? "Boss Challenge" : "Practice"}
            </CardTitle>
          </CardHeader>
          <CardContent>{getGameComponent()}</CardContent>
        </Card>
      </div>
    </div>
  )
}
