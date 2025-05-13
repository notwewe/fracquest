import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DebugButton } from "@/components/debug/debug-button"

export default async function ForceCompletePage() {
  const supabase = createClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get all waypoints
  const { data: waypoints } = await supabase.from("waypoints").select("*").order("section_id, order_index")

  if (!waypoints) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Force Complete Waypoints</h1>
        <p>No waypoints found.</p>
      </div>
    )
  }

  // Get all sections
  const { data: sections } = await supabase.from("game_sections").select("*").order("order_index")

  // Create a map of section IDs to names
  const sectionNames: Record<number, string> = {}
  if (sections) {
    sections.forEach((section) => {
      sectionNames[section.id] = section.name
    })
  }

  // Group waypoints by section
  const waypointsBySection: Record<number, typeof waypoints> = {}
  waypoints.forEach((waypoint) => {
    if (!waypointsBySection[waypoint.section_id]) {
      waypointsBySection[waypoint.section_id] = []
    }
    waypointsBySection[waypoint.section_id].push(waypoint)
  })

  // Get student progress
  const { data: progress } = await supabase.from("student_progress").select("*").eq("student_id", user.id)

  // Create a map of waypoint IDs to completion status
  const completionStatus: Record<number, boolean> = {}
  if (progress) {
    progress.forEach((p) => {
      completionStatus[p.waypoint_id] = p.completed
    })
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Force Complete Waypoints</h1>

      <div className="mb-4 flex space-x-4">
        <Link href="/student/game">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">Return to Game</Button>
        </Link>
        <Link href="/debug/progress">
          <Button variant="outline">View Progress</Button>
        </Link>
      </div>

      {Object.entries(waypointsBySection).map(([sectionId, sectionWaypoints]) => (
        <div key={sectionId} className="mb-8">
          <h2 className="text-xl font-bold mb-2">
            {sectionNames[Number.parseInt(sectionId)] || `Section ${sectionId}`}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sectionWaypoints.map((waypoint) => (
              <div
                key={waypoint.id}
                className={`border p-4 rounded-lg ${
                  completionStatus[waypoint.id] ? "bg-green-50 border-green-300" : "bg-white"
                }`}
              >
                <div className="font-bold mb-2">{waypoint.name}</div>
                <div className="text-sm mb-2">ID: {waypoint.id}</div>
                <div className="text-sm mb-2">Type: {waypoint.type}</div>
                <div className="text-sm mb-2">Order: {waypoint.order_index}</div>
                <div className="text-sm mb-4">
                  Status:{" "}
                  {completionStatus[waypoint.id] ? (
                    <span className="text-green-600 font-bold">Completed</span>
                  ) : (
                    <span className="text-amber-600">Not Completed</span>
                  )}
                </div>
                <DebugButton
                  waypointId={waypoint.id}
                  label={completionStatus[waypoint.id] ? "Mark Complete Again" : "Force Complete"}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
