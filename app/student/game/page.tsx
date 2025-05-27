import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { WorldMap } from "@/components/game/world-map"

export default async function GamePage() {
  const supabase = createClient()

  try {
    // Check if user is authenticated and is a student
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/auth/login")
    }

    // Check if student is enrolled in a class
    const { data: studentClasses, error: classError } = await supabase
      .from("student_classes")
      .select("*")
      .eq("student_id", user.id)

    if (classError) {
      throw new Error("Error loading class data")
    }

    if (!studentClasses || studentClasses.length === 0) {
      redirect("/student/profile?message=join-class-required")
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role_id")
      .eq("id", user.id)
      .single()

    if (profileError || !profile || profile.role_id !== 1) {
      redirect("/auth/login")
    }

    // Try to refresh the student_progress table
    try {
      await supabase.rpc("refresh_student_progress")
    } catch (error) {
      // Continue even if refresh fails
    }

    // Get all sections (locations)
    const { data: sections, error: sectionsError } = await supabase
      .from("game_sections")
      .select("*")
      .order("order_index")

    if (sectionsError) {
      throw new Error("Error loading game sections")
    }

    // Get all waypoints
    const { data: waypoints, error: waypointsError } = await supabase.from("waypoints").select("*").order("order_index")

    if (waypointsError) {
      throw new Error("Error loading waypoints")
    }

    // Get student progress
    const { data: progress, error: progressError } = await supabase
      .from("student_progress")
      .select("*")
      .eq("student_id", user.id)

    if (progressError) {
      throw new Error("Error loading progress")
    }

    // Create a map of completed waypoints
    const completedWaypoints: Record<number, boolean> = {}
    if (progress) {
      progress.forEach((p) => {
        completedWaypoints[p.waypoint_id] = p.completed
      })
    }

    // Determine which sections are unlocked and completed
    const locations = sections.map((section) => {
      // Get waypoints for this section
      const sectionWaypoints = waypoints.filter((w) => w.section_id === section.id)

      // A section is completed if all its waypoints are completed
      const isCompleted = sectionWaypoints.length > 0 && sectionWaypoints.every((w) => completedWaypoints[w.id])

      // A section is unlocked if it's the first one, or if the previous section is completed
      let isUnlocked = section.order_index === 1 // First section is always unlocked

      if (section.order_index > 1) {
        const previousSection = sections.find((s) => s.order_index === section.order_index - 1)
        if (previousSection) {
          const previousWaypoints = waypoints.filter((w) => w.section_id === previousSection.id)
          isUnlocked = previousWaypoints.every((w) => completedWaypoints[w.id])
        }
      }

      // Map waypoints with completion status
      const mappedWaypoints = sectionWaypoints.map((waypoint) => ({
        ...waypoint,
        completed: completedWaypoints[waypoint.id] || false,
      }))

      // Map section position based on order_index
      let position = ""
      switch (section.order_index) {
        case 1:
          position = "top-1/4 left-1/4"
          break
        case 2:
          position = "top-1/3 left-1/2"
          break
        case 3:
          position = "top-1/2 right-1/4"
          break
        case 4:
          position = "bottom-1/4 right-1/3"
          break
        case 5:
          position = "bottom-1/4 left-1/3"
          break
        default:
          position = "top-1/2 left-1/2"
      }

      return {
        id: section.id,
        name: section.name,
        position,
        unlocked: isUnlocked,
        completed: isCompleted,
        waypoints: mappedWaypoints,
      }
    })

    return (
      <div className="min-h-screen bg-amber-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Button asChild variant="outline" className="font-pixel border-amber-600 text-amber-700">
              <Link href="/student/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>

          <h1 className="text-3xl font-bold text-center mb-8 font-medieval text-amber-900">World of Numeria</h1>
          <div className="bg-amber-50 border-4 border-amber-800 rounded-xl p-4 shadow-lg">
            <WorldMap locations={locations} />
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-amber-100 p-4 rounded-lg border border-amber-300">
              <h3 className="font-pixel text-amber-900 text-lg mb-2">How to Play</h3>
              <p className="text-amber-700">
                Click on unlocked locations to start challenges. Complete challenges to unlock new areas!
              </p>
            </div>

            <div className="bg-amber-100 p-4 rounded-lg border border-amber-300">
              <h3 className="font-pixel text-amber-900 text-lg mb-2">Your Quest</h3>
              <p className="text-amber-700">
                Help Whiskers restore the Fraction Orb by mastering fraction skills in each region!
              </p>
            </div>

            <div className="bg-amber-100 p-4 rounded-lg border border-amber-300">
              <h3 className="font-pixel text-amber-900 text-lg mb-2">Legend</h3>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span className="text-amber-700">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                  <span className="text-amber-700">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gray-400"></div>
                  <span className="text-amber-700">Locked</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    return (
      <div className="min-h-screen bg-amber-50 p-4 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Unable to load game</h1>
        <Button asChild variant="outline" className="font-pixel border-amber-600 text-amber-700">
          <Link href="/student/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    )
  }
}
