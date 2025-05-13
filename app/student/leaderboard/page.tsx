import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Trophy, Medal } from "lucide-react"

export default async function StudentLeaderboardPage() {
  const supabase = createClient()

  // Check if user is authenticated and is a student
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if student is enrolled in a class - do this first!
  const { data: studentClass, error: classError } = await supabase
    .from("student_classes")
    .select("class_id, classes(id, name)")
    .eq("student_id", user.id)
    .single()

  if (classError || !studentClass) {
    // Redirect to profile page with message if student isn't in a class
    redirect("/student/profile?message=join-class-required")
  }

  const { data: profile } = await supabase.from("profiles").select("role_id").eq("id", user.id).single()

  if (!profile || profile.role_id !== 1) {
    redirect("/auth/login")
  }

  // Get classmates
  const { data: classmates } = await supabase
    .from("student_classes")
    .select(`
      student_id,
      profiles:student_id (
        id,
        username,
        avatar_url
      )
    `)
    .eq("class_id", studentClass.class_id)

  // Get progress for all students in the class
  const studentIds = classmates?.map((c) => c.student_id) || []

  let leaderboardData: any[] = []

  if (studentIds.length > 0) {
    // Get all student progress
    const { data: progress } = await supabase
      .from("student_progress")
      .select("student_id, completed, score, mistakes")
      .in("student_id", studentIds)
      .eq("completed", true)

    // Calculate total scores and stats for each student
    const studentScores = studentIds.map((studentId) => {
      const studentProgress = progress?.filter((p) => p.student_id === studentId) || []
      const totalScore = studentProgress.reduce((sum, p) => sum + p.score, 0)
      const totalMistakes = studentProgress.reduce((sum, p) => sum + p.mistakes, 0)
      const completedLevels = studentProgress.length

      const student = classmates?.find((c) => c.student_id === studentId)

      return {
        id: studentId,
        username: student?.profiles.username || "Unknown",
        avatarUrl: student?.profiles.avatar_url,
        totalScore,
        totalMistakes,
        completedLevels,
        isCurrentUser: studentId === user.id,
      }
    })

    // Sort by score (descending)
    leaderboardData = studentScores.sort((a, b) => b.totalScore - a.totalScore)
  }

  // Find current user's rank
  const currentUserRank = leaderboardData.findIndex((student) => student.id === user.id) + 1

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Button asChild variant="outline" className="font-pixel border-amber-600 text-amber-700">
          <Link href="/student/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        <div>
          <h1 className="text-3xl font-pixel text-amber-900">Class Leaderboard</h1>
          <p className="text-amber-700">
            {studentClass.classes?.name || "Your class"} - {leaderboardData.length} students
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-2 border-amber-800 bg-amber-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-pixel text-amber-900">Your Rank</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-700">#{currentUserRank}</div>
              <p className="text-sm text-amber-600">out of {leaderboardData.length} students</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-amber-800 bg-amber-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-pixel text-amber-900">Your Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-700">
                {leaderboardData.find((s) => s.id === user.id)?.totalScore || 0}
              </div>
              <p className="text-sm text-amber-600">total points earned</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-amber-800 bg-amber-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-pixel text-amber-900">Levels Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-700">
                {leaderboardData.find((s) => s.id === user.id)?.completedLevels || 0}
              </div>
              <p className="text-sm text-amber-600">challenges finished</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-2 border-amber-800 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-xl font-pixel text-amber-900">Top Students</CardTitle>
            <CardDescription className="font-pixel text-amber-700">Students ranked by total score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-pixel w-16">Rank</TableHead>
                    <TableHead className="font-pixel">Student</TableHead>
                    <TableHead className="font-pixel text-right">Score</TableHead>
                    <TableHead className="font-pixel text-right">Levels</TableHead>
                    <TableHead className="font-pixel text-right">Mistakes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboardData.map((student, index) => (
                    <TableRow key={student.id} className={student.isCurrentUser ? "bg-amber-100" : ""}>
                      <TableCell className="font-medium">
                        {index === 0 ? (
                          <Trophy className="h-5 w-5 text-yellow-500" />
                        ) : index === 1 ? (
                          <Medal className="h-5 w-5 text-gray-400" />
                        ) : index === 2 ? (
                          <Medal className="h-5 w-5 text-amber-700" />
                        ) : (
                          `#${index + 1}`
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {student.username}
                        {student.isCurrentUser && " (You)"}
                      </TableCell>
                      <TableCell className="text-right">{student.totalScore}</TableCell>
                      <TableCell className="text-right">{student.completedLevels}</TableCell>
                      <TableCell className="text-right">{student.totalMistakes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
