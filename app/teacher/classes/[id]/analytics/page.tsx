import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

export default async function ClassAnalyticsPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const classId = Number.parseInt(params.id)

  if (isNaN(classId)) {
    return notFound()
  }

  // Check if user is authenticated and is a teacher
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get class details
  const { data: classData, error: classError } = await supabase
    .from("classes")
    .select("*")
    .eq("id", classId)
    .eq("teacher_id", user.id)
    .single()

  if (classError || !classData) {
    return notFound()
  }

  // Get students in this class
  const { data: students, error: studentsError } = await supabase
    .from("student_classes")
    .select(`
      student_id,
      profiles:student_id (
        id,
        username
      )
    `)
    .eq("class_id", classId)

  // Get all game sections
  const { data: sections } = await supabase.from("game_sections").select("*").order("order_index")

  // Get all waypoints
  const { data: waypoints } = await supabase.from("waypoints").select("*").order("order_index")

  // Get student progress
  const studentIds = students?.map((s) => s.student_id) || []

  let progressData: any[] = []

  if (studentIds.length > 0) {
    const { data: progress } = await supabase
      .from("student_progress")
      .select(`
        student_id,
        waypoint_id,
        completed,
        score,
        mistakes,
        attempts,
        time_spent
      `)
      .in("student_id", studentIds)

    progressData = progress || []
  }

  // Calculate analytics
  const totalStudents = students?.length || 0

  // Section completion rates
  const sectionAnalytics = sections?.map((section) => {
    const sectionWaypoints = waypoints?.filter((w) => w.section_id === section.id) || []
    const waypointIds = sectionWaypoints.map((w) => w.id)

    const studentsCompletedSection = new Set()
    let totalScore = 0
    let totalMistakes = 0
    let totalAttempts = 0

    // Track difficulty by waypoint
    const waypointDifficulty = sectionWaypoints.map((waypoint) => {
      const waypointProgress = progressData.filter((p) => p.waypoint_id === waypoint.id)
      const completions = waypointProgress.filter((p) => p.completed).length
      const attempts = waypointProgress.reduce((sum, p) => sum + p.attempts, 0)
      const mistakes = waypointProgress.reduce((sum, p) => sum + p.mistakes, 0)

      return {
        id: waypoint.id,
        name: waypoint.name,
        completionRate: totalStudents > 0 ? (completions / totalStudents) * 100 : 0,
        averageMistakes: completions > 0 ? mistakes / completions : 0,
        averageAttempts: completions > 0 ? attempts / completions : 0,
        difficulty: completions > 0 ? mistakes / completions + attempts / completions : 0,
      }
    })

    // Find the most difficult waypoint
    const mostDifficult = [...waypointDifficulty].sort((a, b) => b.difficulty - a.difficulty)[0]

    // Calculate section stats
    progressData.forEach((progress) => {
      if (waypointIds.includes(progress.waypoint_id) && progress.completed) {
        studentsCompletedSection.add(progress.student_id)
        totalScore += progress.score
        totalMistakes += progress.mistakes
        totalAttempts += progress.attempts
      }
    })

    return {
      id: section.id,
      name: section.name,
      completionRate: totalStudents > 0 ? (studentsCompletedSection.size / totalStudents) * 100 : 0,
      averageScore: studentsCompletedSection.size > 0 ? totalScore / studentsCompletedSection.size : 0,
      mostDifficultWaypoint: mostDifficult,
      waypointDifficulty,
    }
  })

  // Overall class stats
  const overallCompletedWaypoints = progressData.filter((p) => p.completed).length
  const totalPossibleWaypoints = totalStudents * (waypoints?.length || 0)
  const overallCompletionRate =
    totalPossibleWaypoints > 0 ? (overallCompletedWaypoints / totalPossibleWaypoints) * 100 : 0

  const totalScore = progressData.reduce((sum, p) => sum + p.score, 0)
  const totalMistakes = progressData.reduce((sum, p) => sum + p.mistakes, 0)
  const totalAttempts = progressData.reduce((sum, p) => sum + p.attempts, 0)

  const averageScore = overallCompletedWaypoints > 0 ? totalScore / overallCompletedWaypoints : 0
  const averageMistakes = overallCompletedWaypoints > 0 ? totalMistakes / overallCompletedWaypoints : 0
  const averageAttempts = overallCompletedWaypoints > 0 ? totalAttempts / overallCompletedWaypoints : 0

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Button asChild variant="outline" className="font-pixel border-amber-600 text-amber-700">
          <Link href={`/teacher/classes/${classId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Class
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        <div>
          <h1 className="text-3xl font-pixel text-amber-900">{classData.name} Analytics</h1>
          <p className="text-amber-700 mt-1">Performance data for your class</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-2 border-amber-800 bg-amber-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-pixel text-amber-900">Overall Completion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-700">{overallCompletionRate.toFixed(1)}%</div>
              <p className="text-sm text-amber-600">of all possible waypoints completed</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-amber-800 bg-amber-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-pixel text-amber-900">Average Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-700">{averageScore.toFixed(1)}</div>
              <p className="text-sm text-amber-600">points per completed waypoint</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-amber-800 bg-amber-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-pixel text-amber-900">Average Attempts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-700">{averageAttempts.toFixed(1)}</div>
              <p className="text-sm text-amber-600">attempts per completed waypoint</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-2 border-amber-800 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-xl font-pixel text-amber-900">Section Performance</CardTitle>
            <CardDescription className="font-pixel text-amber-700">
              How students are progressing through each game section
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {sectionAnalytics?.map((section) => (
                <Card key={section.id} className="border border-amber-300">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-pixel text-amber-900">{section.name}</CardTitle>
                    <CardDescription className="font-pixel text-amber-700">
                      {section.completionRate.toFixed(1)}% completion rate
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-amber-800 mb-1">Average Score</h4>
                        <p className="text-2xl font-bold text-amber-700">{section.averageScore.toFixed(1)}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-amber-800 mb-1">Most Challenging Waypoint</h4>
                        <p className="text-amber-700">{section.mostDifficultWaypoint?.name || "N/A"}</p>
                        {section.mostDifficultWaypoint && (
                          <p className="text-sm text-amber-600">
                            Avg. {section.mostDifficultWaypoint.averageMistakes.toFixed(1)} mistakes,
                            {section.mostDifficultWaypoint.averageAttempts.toFixed(1)} attempts
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
