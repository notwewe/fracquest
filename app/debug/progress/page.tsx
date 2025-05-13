import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function DebugProgressPage() {
  const supabase = createClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get student progress
  const { data: progress } = await supabase
    .from("student_progress")
    .select("*")
    .eq("student_id", user.id)
    .order("waypoint_id")

  // Get all waypoints
  const { data: waypoints } = await supabase.from("waypoints").select("*").order("id")

  // Create a map of waypoint IDs to waypoint data
  const waypointMap: Record<number, any> = {}
  if (waypoints) {
    waypoints.forEach((waypoint) => {
      waypointMap[waypoint.id] = waypoint
    })
  }

  // Create a map of waypoint IDs to progress data
  const progressMap: Record<number, any> = {}
  if (progress) {
    progress.forEach((p) => {
      progressMap[p.waypoint_id] = p
    })
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Debug Progress</h1>

      <div className="mb-6 flex space-x-4">
        <Link href="/student/game">
          <Button variant="outline">Return to Game</Button>
        </Link>
        <Link href="/debug/reset">
          <Button variant="destructive">Reset Progress</Button>
        </Link>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-2">Student Progress</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 px-4 py-2">Waypoint ID</th>
                <th className="border border-gray-300 px-4 py-2">Name</th>
                <th className="border border-gray-300 px-4 py-2">Type</th>
                <th className="border border-gray-300 px-4 py-2">Completed</th>
                <th className="border border-gray-300 px-4 py-2">Current Line</th>
                <th className="border border-gray-300 px-4 py-2">Last Updated</th>
                <th className="border border-gray-300 px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {waypoints &&
                waypoints.map((waypoint) => {
                  const progressData = progressMap[waypoint.id]
                  return (
                    <tr key={waypoint.id}>
                      <td className="border border-gray-300 px-4 py-2">{waypoint.id}</td>
                      <td className="border border-gray-300 px-4 py-2">{waypoint.name}</td>
                      <td className="border border-gray-300 px-4 py-2">{waypoint.type}</td>
                      <td className="border border-gray-300 px-4 py-2">{progressData?.completed ? "✅" : "❌"}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        {progressData?.current_line !== undefined ? progressData.current_line : "N/A"}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {progressData?.last_updated ? new Date(progressData.last_updated).toLocaleString() : "Never"}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {waypoint.type === "intro" || waypoint.type === "story" ? (
                          <Link href={`/student/game/level/${waypoint.id}`}>
                            <Button variant="outline" size="sm">
                              Play
                            </Button>
                          </Link>
                        ) : waypoint.type === "game" ? (
                          <Link href={`/student/game/play/${waypoint.id}`}>
                            <Button variant="outline" size="sm">
                              Play
                            </Button>
                          </Link>
                        ) : waypoint.type === "boss" ? (
                          <Link href={`/student/game/boss/${waypoint.id}`}>
                            <Button variant="outline" size="sm">
                              Play
                            </Button>
                          </Link>
                        ) : null}
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-2">Raw Progress Data</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-x-auto">{JSON.stringify(progress, null, 2)}</pre>
      </div>
    </div>
  )
}
