"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Users, BookOpen, Target, BarChart2 } from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function TeacherAnalyticsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [classes, setClasses] = useState<any[]>([])
  const [totalStudents, setTotalStudents] = useState(0)
  const [completionData, setCompletionData] = useState<any[]>([])
  const [difficultyData, setDifficultyData] = useState<any[]>([])
  const [progressTrend, setProgressTrend] = useState<any[]>([])
  const [studentPerformance, setStudentPerformance] = useState<any[]>([])
  const [studentScatterData, setStudentScatterData] = useState<any[]>([])
  const [classComparison, setClassComparison] = useState<any[]>([])
  const supabase = createClient()

  const COLORS = ["#f59e0b", "#d97706", "#b45309", "#92400e", "#78350f", "#a16207"]

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        // Check if user is authenticated and is a teacher
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/auth/login")
          return
        }

        const { data: profile } = await supabase.from("profiles").select("role_id").eq("id", user.id).single()

        if (!profile || profile.role_id !== 2) {
          router.push("/auth/login")
          return
        }

        // Get teacher's classes
        const { data: classesData } = await supabase.from("classes").select("id, name").eq("teacher_id", user.id)

        setClasses(classesData || [])

        // Get total students across all classes
        if (classesData && classesData.length > 0) {
          // Get class IDs
          const classIds = classesData.map((c) => c.id)

          // Count students in each class
          const { data: studentCounts } = await supabase
            .from("student_classes")
            .select("student_id, class_id")
            .in("class_id", classIds)

          // Count unique students
          const uniqueStudents = new Set(studentCounts?.map((s) => s.student_id) || [])
          setTotalStudents(uniqueStudents.size)

          // Create class comparison data
          const classComparisonData = await Promise.all(
            classesData.map(async (cls) => {
              const { data: classStudents } = await supabase
                .from("student_classes")
                .select("student_id")
                .eq("class_id", cls.id)

              const studentIds = classStudents?.map((s) => s.student_id) || []
              const studentCount = studentIds.length

              // Get progress data for this class
              let completionRate = 0
              let avgScore = 0

              if (studentIds.length > 0) {
                const { data: progress } = await supabase
                  .from("student_progress")
                  .select("completed, score")
                  .in("student_id", studentIds)

                if (progress && progress.length > 0) {
                  const completed = progress.filter((p) => p.completed).length
                  const totalScore = progress.reduce((sum, p) => sum + (p.score || 0), 0)

                  // Get waypoints count
                  const { count: waypointsCount } = await supabase
                    .from("waypoints")
                    .select("id", { count: "exact", head: true })

                  const totalPossible = studentCount * (waypointsCount || 1)
                  completionRate = totalPossible > 0 ? (completed / totalPossible) * 100 : 0
                  avgScore = completed > 0 ? totalScore / completed : 0
                }
              }

              return {
                name: cls.name,
                students: studentCount,
                completionRate: Math.round(completionRate),
                avgScore: Math.round(avgScore),
              }
            }),
          )

          setClassComparison(classComparisonData)

          if (uniqueStudents.size > 0) {
            // Get all game sections
            const { data: sections } = await supabase.from("game_sections").select("id, name").order("order_index")

            // Get all waypoints
            const { data: waypoints } = await supabase
              .from("waypoints")
              .select("id, name, section_id")
              .order("order_index")

            // Get student progress
            const studentIds = Array.from(uniqueStudents)

            if (studentIds.length > 0 && sections && waypoints) {
              const { data: progress } = await supabase
                .from("student_progress")
                .select(`
                  student_id,
                  waypoint_id,
                  completed,
                  score,
                  mistakes,
                  attempts,
                  updated_at
                `)
                .in("student_id", studentIds)

              if (progress) {
                // Calculate completion rates by section
                const sectionCompletionData = sections.map((section) => {
                  const sectionWaypoints = waypoints.filter((w) => w.section_id === section.id)
                  const waypointIds = sectionWaypoints.map((w) => w.id)

                  const totalPossible = waypointIds.length * studentIds.length
                  const completed = progress.filter((p) => waypointIds.includes(p.waypoint_id) && p.completed).length

                  const completionRate = totalPossible > 0 ? (completed / totalPossible) * 100 : 0

                  return {
                    name: section.name,
                    value: Math.round(completionRate),
                  }
                })

                setCompletionData(sectionCompletionData)

                // Calculate difficulty by waypoint
                const waypointDifficulty = waypoints
                  .map((waypoint) => {
                    const waypointProgress = progress.filter((p) => p.waypoint_id === waypoint.id && p.completed)
                    const totalAttempts = waypointProgress.reduce((sum, p) => sum + (p.attempts || 0), 0)
                    const totalMistakes = waypointProgress.reduce((sum, p) => sum + (p.mistakes || 0), 0)

                    const avgAttempts = waypointProgress.length > 0 ? totalAttempts / waypointProgress.length : 0
                    const avgMistakes = waypointProgress.length > 0 ? totalMistakes / waypointProgress.length : 0

                    // Difficulty score is a combination of attempts and mistakes
                    const difficultyScore = avgAttempts + avgMistakes

                    return {
                      name: waypoint.name,
                      section: sections.find((s) => s.id === waypoint.section_id)?.name || "Unknown",
                      attempts: Math.round(avgAttempts * 10) / 10,
                      mistakes: Math.round(avgMistakes * 10) / 10,
                      difficulty: Math.round(difficultyScore * 10) / 10,
                    }
                  })
                  .filter((w) => w.difficulty > 0) // Only include waypoints with actual data
                  .sort((a, b) => b.difficulty - a.difficulty)
                  .slice(0, 10) // Top 10 most difficult

                setDifficultyData(waypointDifficulty)

                // Generate progress trend data from actual data
                // Group by day for the last 7 days
                const last7Days = Array.from({ length: 7 }, (_, i) => {
                  const date = new Date()
                  date.setDate(date.getDate() - (6 - i))
                  return date.toISOString().split("T")[0]
                })

                const progressByDay = last7Days.map((day) => {
                  // Filter progress by this day
                  const dayProgress = progress.filter((p) => {
                    if (!p.updated_at) return false
                    const progressDate = new Date(p.updated_at).toISOString().split("T")[0]
                    return progressDate === day && p.completed
                  })

                  const totalScore = dayProgress.reduce((sum, p) => sum + (p.score || 0), 0)

                  return {
                    day: new Date(day).toLocaleDateString("en-US", { weekday: "short" }),
                    completed: dayProgress.length,
                    score: totalScore,
                  }
                })

                setProgressTrend(progressByDay)

                // Calculate student performance
                const studentStats = studentIds
                  .map((studentId) => {
                    const studentProgress = progress.filter((p) => p.student_id === studentId)
                    const completed = studentProgress.filter((p) => p.completed).length
                    const totalScore = studentProgress.reduce((sum, p) => sum + (p.score || 0), 0)
                    const totalMistakes = studentProgress.reduce((sum, p) => sum + (p.mistakes || 0), 0)
                    const totalAttempts = studentProgress.reduce((sum, p) => sum + (p.attempts || 0), 0)

                    return {
                      id: studentId,
                      name: `Student ${studentId.substring(0, 4)}`, // Anonymized for privacy
                      completed,
                      score: totalScore,
                      mistakes: totalMistakes,
                      attempts: totalAttempts,
                      efficiency: totalAttempts > 0 ? Math.round((totalScore / totalAttempts) * 10) / 10 : 0,
                    }
                  })
                  .filter((s) => s.completed > 0) // Only include students with completed waypoints
                  .sort((a, b) => b.score - a.score)

                setStudentPerformance(studentStats)

                // Create scatter plot data for student performance
                const scatterData = studentStats.map((student) => ({
                  name: student.name,
                  completed: student.completed,
                  score: student.score,
                  efficiency: student.efficiency,
                }))

                setStudentScatterData(scatterData)
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching analytics data:", error)
        setError("Failed to load analytics data. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [router, supabase])

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-screen">
        <Card className="border-2 border-amber-800 bg-amber-50 w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-xl font-pixel text-amber-900">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-700">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-4 w-full font-pixel bg-amber-600 hover:bg-amber-700 text-white"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <motion.div className="container mx-auto p-4" variants={container} initial="hidden" animate="show">
      <motion.div variants={item} className="mb-6">
        <Button asChild variant="outline" className="font-pixel border-amber-600 text-amber-700">
          <Link href="/teacher/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </motion.div>

      <motion.div variants={item}>
        <div className="mb-6">
          <h1 className="text-3xl font-pixel text-amber-900">Analytics Dashboard</h1>
          <p className="text-amber-700">Comprehensive view of student performance across all classes</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-2 border-amber-800 bg-amber-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-pixel text-amber-900">Classes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-amber-600 mr-3" />
                <p className="text-3xl font-pixel text-amber-700">{classes.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-amber-800 bg-amber-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-pixel text-amber-900">Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="h-8 w-8 text-amber-600 mr-3" />
                <p className="text-3xl font-pixel text-amber-700">{totalStudents}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-amber-800 bg-amber-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-pixel text-amber-900">Avg. Completion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Target className="h-8 w-8 text-amber-600 mr-3" />
                <p className="text-3xl font-pixel text-amber-700">
                  {completionData.length > 0
                    ? Math.round(completionData.reduce((sum, item) => sum + item.value, 0) / completionData.length)
                    : 0}
                  %
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-amber-800 bg-amber-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-pixel text-amber-900">Total Waypoints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <BarChart2 className="h-8 w-8 text-amber-600 mr-3" />
                <p className="text-3xl font-pixel text-amber-700">
                  {studentPerformance.reduce((sum, student) => sum + student.completed, 0)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-amber-100 border-2 border-amber-300">
            <TabsTrigger
              value="overview"
              className="font-pixel data-[state=active]:bg-amber-600 data-[state=active]:text-white"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="classes"
              className="font-pixel data-[state=active]:bg-amber-600 data-[state=active]:text-white"
            >
              Classes
            </TabsTrigger>
            <TabsTrigger
              value="students"
              className="font-pixel data-[state=active]:bg-amber-600 data-[state=active]:text-white"
            >
              Students
            </TabsTrigger>
            <TabsTrigger
              value="content"
              className="font-pixel data-[state=active]:bg-amber-600 data-[state=active]:text-white"
            >
              Content
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="space-y-8">
              <Card className="border-2 border-amber-800 bg-amber-50">
                <CardHeader>
                  <CardTitle className="text-xl font-pixel text-amber-900">Section Completion</CardTitle>
                  <CardDescription className="font-pixel text-amber-700">
                    Completion rates by game section
                  </CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <div className="h-[300px] min-w-[300px]">
                    {completionData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={completionData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {completionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => [`${value}%`, "Completion Rate"]}
                            contentStyle={{ backgroundColor: "#fffbeb", borderColor: "#92400e" }}
                            itemStyle={{ color: "#92400e" }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-amber-700">No completion data available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-amber-800 bg-amber-50">
                <CardHeader>
                  <CardTitle className="text-xl font-pixel text-amber-900">Progress Trend</CardTitle>
                  <CardDescription className="font-pixel text-amber-700">
                    Completed waypoints and scores over the last week
                  </CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <div className="h-[400px] min-w-[600px]">
                    {progressTrend.length > 0 && progressTrend.some((item) => item.completed > 0) ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={progressTrend} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f3e8d2" />
                          <XAxis dataKey="day" stroke="#92400e" />
                          <YAxis yAxisId="left" stroke="#92400e" />
                          <YAxis yAxisId="right" orientation="right" stroke="#92400e" />
                          <Tooltip
                            contentStyle={{ backgroundColor: "#fffbeb", borderColor: "#92400e" }}
                            itemStyle={{ color: "#92400e" }}
                          />
                          <Legend />
                          <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="completed"
                            name="Completed Waypoints"
                            stroke="#d97706"
                            strokeWidth={2}
                            activeDot={{ r: 8 }}
                          />
                          <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="score"
                            name="Total Score"
                            stroke="#92400e"
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-amber-700">No progress trend data available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="classes" className="mt-6">
            <div className="space-y-8">
              <Card className="border-2 border-amber-800 bg-amber-50">
                <CardHeader>
                  <CardTitle className="text-xl font-pixel text-amber-900">Class Comparison</CardTitle>
                  <CardDescription className="font-pixel text-amber-700">
                    Performance metrics across different classes
                  </CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <div className="h-[400px] min-w-[600px]">
                    {classComparison.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={classComparison}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 70,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f3e8d2" />
                          <XAxis
                            dataKey="name"
                            stroke="#92400e"
                            angle={-45}
                            textAnchor="end"
                            height={70}
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis yAxisId="left" stroke="#92400e" domain={[0, 100]} />
                          <YAxis yAxisId="right" orientation="right" stroke="#92400e" />
                          <Tooltip
                            formatter={(value, name) => {
                              if (name === "Completion Rate") return [`${value}%`, name]
                              return [value, name]
                            }}
                            contentStyle={{ backgroundColor: "#fffbeb", borderColor: "#92400e" }}
                            itemStyle={{ color: "#92400e" }}
                          />
                          <Legend />
                          <Bar
                            yAxisId="left"
                            dataKey="completionRate"
                            name="Completion Rate"
                            fill="#f59e0b"
                            radius={[4, 4, 0, 0]}
                          />
                          <Bar
                            yAxisId="right"
                            dataKey="avgScore"
                            name="Average Score"
                            fill="#d97706"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-amber-700">No class comparison data available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-amber-800 bg-amber-50">
                <CardHeader>
                  <CardTitle className="text-xl font-pixel text-amber-900">Class Analytics</CardTitle>
                  <CardDescription className="font-pixel text-amber-700">
                    View detailed analytics for each class
                  </CardDescription>
                </CardHeader>
                <CardContent className="max-h-[400px] overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {classes.map((cls) => (
                      <Card key={cls.id} className="border border-amber-300">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg font-pixel text-amber-900">{cls.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Button asChild className="w-full font-pixel bg-amber-600 hover:bg-amber-700 text-white">
                            <Link href={`/teacher/classes/${cls.id}/analytics`}>View Analytics</Link>
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="students" className="mt-6">
            <div className="space-y-8">
              <Card className="border-2 border-amber-800 bg-amber-50">
                <CardHeader>
                  <CardTitle className="text-xl font-pixel text-amber-900">Completed Waypoints</CardTitle>
                  <CardDescription className="font-pixel text-amber-700">
                    Number of waypoints completed by each student
                  </CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <div className="h-[300px] min-w-[600px]">
                    {studentPerformance.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={studentPerformance.slice(0, 10)}
                          layout="vertical"
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f3e8d2" />
                          <XAxis type="number" stroke="#92400e" />
                          <YAxis dataKey="name" type="category" stroke="#92400e" width={100} tick={{ fontSize: 12 }} />
                          <Tooltip
                            contentStyle={{ backgroundColor: "#fffbeb", borderColor: "#92400e" }}
                            itemStyle={{ color: "#92400e" }}
                          />
                          <Legend />
                          <Bar dataKey="completed" name="Completed Waypoints" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-amber-700">No student data available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-amber-800 bg-amber-50">
                <CardHeader>
                  <CardTitle className="text-xl font-pixel text-amber-900">Total Score</CardTitle>
                  <CardDescription className="font-pixel text-amber-700">
                    Total points earned by each student
                  </CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <div className="h-[300px] min-w-[600px]">
                    {studentPerformance.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={studentPerformance.slice(0, 10)}
                          layout="vertical"
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f3e8d2" />
                          <XAxis type="number" stroke="#92400e" />
                          <YAxis dataKey="name" type="category" stroke="#92400e" width={100} tick={{ fontSize: 12 }} />
                          <Tooltip
                            contentStyle={{ backgroundColor: "#fffbeb", borderColor: "#92400e" }}
                            itemStyle={{ color: "#92400e" }}
                          />
                          <Legend />
                          <Bar dataKey="score" name="Total Score" fill="#d97706" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-amber-700">No student data available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-amber-800 bg-amber-50">
                <CardHeader>
                  <CardTitle className="text-xl font-pixel text-amber-900">Score vs. Completion</CardTitle>
                  <CardDescription className="font-pixel text-amber-700">
                    Relationship between completed waypoints and total score
                  </CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <div className="h-[400px] min-w-[600px]">
                    {studentScatterData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart
                          margin={{
                            top: 20,
                            right: 20,
                            bottom: 20,
                            left: 20,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f3e8d2" />
                          <XAxis
                            type="number"
                            dataKey="completed"
                            name="Completed Waypoints"
                            stroke="#92400e"
                            label={{
                              value: "Completed Waypoints",
                              position: "insideBottomRight",
                              offset: -5,
                              fill: "#92400e",
                            }}
                          />
                          <YAxis
                            type="number"
                            dataKey="score"
                            name="Score"
                            stroke="#92400e"
                            label={{
                              value: "Score",
                              angle: -90,
                              position: "insideLeft",
                              fill: "#92400e",
                            }}
                          />
                          <ZAxis type="number" dataKey="efficiency" range={[50, 400]} name="Efficiency" />
                          <Tooltip
                            cursor={{ strokeDasharray: "3 3" }}
                            formatter={(value, name, props) => {
                              if (name === "Efficiency") return [`${value}`, name]
                              return [value, name]
                            }}
                            contentStyle={{ backgroundColor: "#fffbeb", borderColor: "#92400e" }}
                            itemStyle={{ color: "#92400e" }}
                            labelFormatter={(label) => studentScatterData[label]?.name || ""}
                          />
                          <Legend />
                          <Scatter name="Students" data={studentScatterData} fill="#f59e0b" />
                        </ScatterChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-amber-700">No student data available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="content" className="mt-6">
            <div className="space-y-8">
              <Card className="border-2 border-amber-800 bg-amber-50">
                <CardHeader>
                  <CardTitle className="text-xl font-pixel text-amber-900">Most Challenging Waypoints</CardTitle>
                  <CardDescription className="font-pixel text-amber-700">
                    Waypoints with highest difficulty scores
                  </CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <div className="h-[400px] min-w-[600px]">
                    {difficultyData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={difficultyData.slice(0, 10)}
                          layout="vertical"
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f3e8d2" />
                          <XAxis type="number" stroke="#92400e" />
                          <YAxis dataKey="name" type="category" stroke="#92400e" width={150} tick={{ fontSize: 12 }} />
                          <Tooltip
                            contentStyle={{ backgroundColor: "#fffbeb", borderColor: "#92400e" }}
                            itemStyle={{ color: "#92400e" }}
                          />
                          <Legend />
                          <Bar dataKey="attempts" name="Avg. Attempts" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                          <Bar dataKey="mistakes" name="Avg. Mistakes" fill="#d97706" radius={[0, 4, 4, 0]} />
                          <Bar dataKey="difficulty" name="Difficulty Score" fill="#92400e" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-amber-700">No difficulty data available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-amber-800 bg-amber-50">
                <CardHeader>
                  <CardTitle className="text-xl font-pixel text-amber-900">Waypoint Details</CardTitle>
                  <CardDescription className="font-pixel text-amber-700">
                    Detailed difficulty metrics for all waypoints
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border border-amber-300 overflow-x-auto max-h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-amber-100">
                          <TableHead className="font-pixel">Waypoint</TableHead>
                          <TableHead className="font-pixel">Section</TableHead>
                          <TableHead className="font-pixel text-right">Avg. Attempts</TableHead>
                          <TableHead className="font-pixel text-right">Avg. Mistakes</TableHead>
                          <TableHead className="font-pixel text-right">Difficulty</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {difficultyData.map((waypoint, index) => (
                          <TableRow key={waypoint.id} className={index % 2 === 0 ? "bg-amber-50" : "bg-amber-100/50"}>
                            <TableCell className="font-medium">{waypoint.name}</TableCell>
                            <TableCell>{waypoint.section}</TableCell>
                            <TableCell className="text-right">{waypoint.attempts}</TableCell>
                            <TableCell className="text-right">{waypoint.mistakes}</TableCell>
                            <TableCell className="text-right">{waypoint.difficulty}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}
