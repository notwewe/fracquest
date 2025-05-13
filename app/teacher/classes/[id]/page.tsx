import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Edit, BarChart } from "lucide-react"
import { CopyButton } from "@/components/ui/copy-button"
import { RemoveStudentButton } from "@/components/ui/remove-student-button"

export default async function ClassDetailPage({ params }: { params: { id: string } }) {
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
  const { data: classData, error: classError } = await supabase.from("classes").select("*").eq("id", classId).single()

  if (classError || !classData) {
    console.error("Error fetching class:", classError)
    return notFound()
  }

  // Verify the user is the teacher of this class
  if (classData.teacher_id !== user.id) {
    console.error("User is not the teacher of this class")
    redirect("/teacher/dashboard")
  }

  // Get students in this class
  const { data: students, error: studentsError } = await supabase
    .from("student_classes")
    .select(`
      id,
      joined_at,
      profiles:student_id (
        id,
        username,
        avatar_url
      )
    `)
    .eq("class_id", classId)

  if (studentsError) {
    console.error("Error fetching students:", studentsError)
  }

  // Get student progress
  const studentIds = students?.map((s) => s.profiles.id) || []

  let progressData: any[] = []

  if (studentIds.length > 0) {
    const { data: progress, error: progressError } = await supabase
      .from("student_progress")
      .select(`
        student_id,
        waypoint_id,
        completed,
        score,
        mistakes,
        attempts,
        time_spent,
        waypoints:waypoint_id (
          name,
          section_id,
          game_sections:section_id (
            name
          )
        )
      `)
      .in("student_id", studentIds)
      .eq("completed", true)

    if (progressError) {
      console.error("Error fetching progress:", progressError)
    } else {
      progressData = progress || []
    }
  }

  // Process student data with progress
  const studentsWithProgress =
    students?.map((student) => {
      const studentProgress = progressData.filter((p) => p.student_id === student.profiles.id)
      const totalScore = studentProgress.reduce((sum, p) => sum + p.score, 0)
      const totalMistakes = studentProgress.reduce((sum, p) => sum + p.mistakes, 0)
      const completedLevels = studentProgress.length

      // Find the current section/level
      let currentSection = "Not started"
      let currentLevel = "Not started"

      if (studentProgress.length > 0) {
        // Sort by most recent
        const sortedProgress = [...studentProgress].sort((a, b) => {
          return new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime()
        })

        const latest = sortedProgress[0]
        if (latest.waypoints && latest.waypoints.game_sections) {
          currentSection = latest.waypoints.game_sections.name
          currentLevel = latest.waypoints.name
        }
      }

      return {
        ...student,
        progress: {
          totalScore,
          totalMistakes,
          completedLevels,
          currentSection,
          currentLevel,
        },
      }
    }) || []

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Button asChild variant="outline" className="font-pixel border-amber-600 text-amber-700">
          <Link href="/teacher/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-pixel text-amber-900">{classData.name}</h1>
            {classData.description && <p className="text-amber-700 mt-1">{classData.description}</p>}
          </div>
          <Button asChild className="font-pixel bg-amber-600 hover:bg-amber-700 text-white">
            <Link href={`/teacher/classes/${classId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Class
            </Link>
          </Button>
        </div>

        <Card className="border-2 border-amber-800 bg-amber-50">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl font-pixel text-amber-900">Class Code</CardTitle>
                <CardDescription className="font-pixel text-amber-700">
                  Share this code with your students to join the class
                </CardDescription>
              </div>
              <CopyButton text={classData.class_code} className="font-pixel border-amber-600 text-amber-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-amber-100 p-4 rounded-md border-2 border-amber-300">
              <p className="text-2xl font-pixel text-center text-amber-900 tracking-wider">{classData.class_code}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-amber-800 bg-amber-50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-pixel text-amber-900">Students</CardTitle>
              <CardDescription className="font-pixel text-amber-700">
                {studentsWithProgress?.length || 0} students enrolled in this class
              </CardDescription>
            </div>
            <Button asChild className="font-pixel bg-amber-600 hover:bg-amber-700 text-white">
              <Link href={`/teacher/classes/${classId}/analytics`}>
                <BarChart className="mr-2 h-4 w-4" />
                View Analytics
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {studentsWithProgress && studentsWithProgress.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-pixel">Student</TableHead>
                      <TableHead className="font-pixel">Current Level</TableHead>
                      <TableHead className="font-pixel">Score</TableHead>
                      <TableHead className="font-pixel">Mistakes</TableHead>
                      <TableHead className="font-pixel">Completed</TableHead>
                      <TableHead className="font-pixel">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentsWithProgress.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.profiles.username}</TableCell>
                        <TableCell>{student.progress.currentLevel}</TableCell>
                        <TableCell>{student.progress.totalScore}</TableCell>
                        <TableCell>{student.progress.totalMistakes}</TableCell>
                        <TableCell>{student.progress.completedLevels} levels</TableCell>
                        <TableCell>
                          <RemoveStudentButton studentClassId={student.id} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="font-pixel text-amber-700 mb-4">No students have joined this class yet.</p>
                <p className="text-sm text-amber-600">Share the class code with your students so they can join.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
