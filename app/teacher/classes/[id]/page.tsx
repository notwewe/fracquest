import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Edit, BarChart, Users } from "lucide-react"
import { CopyButton } from "@/components/ui/copy-button"
import { RemoveStudentButton } from "@/components/ui/remove-student-button"

export default async function ClassDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const classId = Number.parseInt(params.id)

  if (isNaN(classId)) {
    return notFound()
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: classData, error: classError } = await supabase.from("classes").select("*").eq("id", classId).single()
  if (classError || !classData) {
    console.error("Error fetching class:", classError)
    return notFound()
  }
  if (classData.teacher_id !== user.id) {
    console.error("User is not the teacher of this class")
    redirect("/teacher/dashboard")
  }

  // Fetch students enrolled in the class with their profiles
  const { data: studentClasses, error: studentsError } = await supabase
    .from("student_classes")
    .select("id, student_id")
    .eq("class_id", classId)

  if (studentsError) {
    console.error("Error fetching students:", studentsError)
  }

  // Get student IDs from student_classes
  const studentIds = studentClasses?.map((sc) => sc.student_id) || []

  // Fetch profile information for these students
  const { data: profiles } = await supabase.from("profiles").select("id, username").in("id", studentIds)

  // Create a map of student IDs to their profiles for easy lookup
  const profileMap = new Map()
  profiles?.forEach((profile) => {
    profileMap.set(profile.id, profile)
  })

  // Fetch ALL progress data for these students
  const { data: progressData } = await supabase
    .from("student_progress")
    .select("student_id, score, mistakes, completed, waypoint_id")
    .in("student_id", studentIds)

  // Group progress data by student_id
  const progressByStudent = new Map()
  progressData?.forEach((progress) => {
    if (!progressByStudent.has(progress.student_id)) {
      progressByStudent.set(progress.student_id, [])
    }
    progressByStudent.get(progress.student_id).push(progress)
  })

  // Combine student_classes with profiles and progress data
  const studentsWithProgress =
    studentClasses?.map((sc) => {
      const profile = profileMap.get(sc.student_id)
      const progressEntries = progressByStudent.get(sc.student_id) || []

      // Calculate total score, mistakes, and completed levels
      const totalScore = progressEntries.reduce((sum, entry) => sum + (entry.score || 0), 0)
      const totalMistakes = progressEntries.reduce((sum, entry) => sum + (entry.mistakes || 0), 0)
      const completedLevels = progressEntries.filter((entry) => entry.completed).length

      // Determine current level (just use "In Progress" if they have any entries)
      const currentLevel = progressEntries.length > 0 ? "In Progress" : "Not started"

      return {
        id: sc.id,
        student_id: sc.student_id,
        profiles: profile || { username: "Unknown" },
        progress: {
          totalScore,
          totalMistakes,
          completedLevels,
          currentLevel,
        },
      }
    }) || []

  // Fetch all students in the class
  const { data: students } = await supabase.from("student_classes").select("student_id").eq("class_id", classId)

  return (
    <div className="min-h-screen bg-[#FAF7F0] p-4 font-sans">
      <div className="container mx-auto">
        <div className="mb-6">
          <Button
            asChild
            variant="outline"
            className="border-[#a0522d] text-[#8B4513] hover:bg-[#f5e9d0] hover:text-[#8B4513] font-semibold"
          >
            <Link href="/teacher/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <div className="grid gap-6">
          <Card className="border-2 border-[#a0522d] bg-[#f5e9d0] shadow-lg">
            <CardHeader className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <CardTitle className="text-2xl md:text-3xl font-bold text-[#8B4513]">{classData.name}</CardTitle>
                {classData.description && (
                  <CardDescription className="text-[#a0522d] mt-1">{classData.description}</CardDescription>
                )}
              </div>
              <Button
                asChild
                className="font-semibold bg-[#8B4513] hover:bg-[#a0522d] text-[#f5e9d0] self-start md:self-center"
              >
                <Link href={`/teacher/classes/${classId}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Class
                </Link>
              </Button>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1 border-2 border-[#a0522d] bg-[#f5e9d0] shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl font-bold text-[#8B4513]">Class Code</CardTitle>
                    <CardDescription className="text-[#a0522d]">Share this code with students</CardDescription>
                  </div>
                  <CopyButton
                    text={classData.class_code}
                    className="border-[#a0522d] text-[#8B4513] hover:bg-[#e5d9c0]"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-[#FAF7F0] p-4 rounded-md border border-[#d9c8a9]">
                  <p className="text-2xl font-bold text-center text-[#8B4513] tracking-wider">{classData.class_code}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 border-2 border-[#a0522d] bg-[#f5e9d0] shadow-lg">
              <CardHeader className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <CardTitle className="text-xl font-bold text-[#8B4513]">Students</CardTitle>
                  <CardDescription className="text-[#a0522d]">
                    {studentsWithProgress?.length || 0} students enrolled
                  </CardDescription>
                </div>
                <Button
                  asChild
                  className="font-semibold bg-[#8B4513] hover:bg-[#a0522d] text-[#f5e9d0] self-start md:self-center"
                >
                  <Link href={`/teacher/classes/${classId}/analytics`}>
                    <BarChart className="mr-2 h-4 w-4" />
                    View Analytics
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {studentsWithProgress && studentsWithProgress.length > 0 ? (
                  <div className="rounded-md border border-[#d9c8a9] overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-[#e5d9c0]">
                        <TableRow>
                          <TableHead className="font-semibold text-[#8B4513]">Student</TableHead>
                          <TableHead className="font-semibold text-[#8B4513]">Current Level</TableHead>
                          <TableHead className="font-semibold text-[#8B4513] text-right">Score</TableHead>
                          <TableHead className="font-semibold text-[#8B4513] text-right">Mistakes</TableHead>
                          <TableHead className="font-semibold text-[#8B4513] text-right">Levels Completed</TableHead>
                          <TableHead className="font-semibold text-[#8B4513] text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {studentsWithProgress.map((studentItem, index) => (
                          <TableRow key={studentItem.id} className={index % 2 === 0 ? "bg-[#FAF7F0]" : "bg-[#f5e9d0]"}>
                            <TableCell className="font-medium text-[#8B4513]">
                              {studentItem.profiles?.username || "N/A"}
                            </TableCell>
                            <TableCell className="text-[#a0522d]">{studentItem.progress.currentLevel}</TableCell>
                            <TableCell className="text-right text-[#a0522d]">
                              {studentItem.progress.totalScore}
                            </TableCell>
                            <TableCell className="text-right text-[#a0522d]">
                              {studentItem.progress.totalMistakes}
                            </TableCell>
                            <TableCell className="text-right text-[#a0522d]">
                              {studentItem.progress.completedLevels} levels
                            </TableCell>
                            <TableCell className="text-center">
                              <RemoveStudentButton
                                studentClassId={studentItem.id}
                                className="text-red-600 hover:text-red-700 hover:bg-red-100"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-[#FAF7F0] rounded-md border border-[#d9c8a9]">
                    <Users className="mx-auto h-12 w-12 text-[#a0522d] mb-3" />
                    <p className="font-semibold text-[#8B4513] mb-2">
                      {students && students.length > 0
                        ? "No progress data found for enrolled students."
                        : "No students have joined this class yet."}
                    </p>
                    <p className="text-sm text-[#a0522d]">
                      {!(students && students.length > 0) &&
                        "Share the class code with your students so they can join."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
