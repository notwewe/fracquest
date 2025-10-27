"use client"

import { useState, useEffect } from "react"
import React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Users, Award, AlertTriangle, BarChart2, Loader2 } from "lucide-react"
import {
  BarChart,
  Bar,
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

export default function ClassAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [classData, setClassData] = useState<any>(null)
  const [students, setStudents] = useState<any[]>([])
  // const [sections, setSections] = useState<any[]>([]) // Not directly used for display, derived data is
  // const [waypoints, setWaypoints] = useState<any[]>([]) // Not directly used for display, derived data is
  // const [progressData, setProgressData] = useState<any[]>([]) // Not directly used for display, derived data is
  const [sectionAnalytics, setSectionAnalytics] = useState<any[]>([])
  const [studentPerformance, setStudentPerformance] = useState<any[]>([])
  const [difficultyData, setDifficultyData] = useState<any[]>([])
  const [studentScatterData, setStudentScatterData] = useState<any[]>([])
  const [overallStats, setOverallStats] = useState({
    completionRate: 0,
    averageScore: 0,
    averageMistakes: 0,
    averageAttempts: 0,
  })
  const supabase = createClient()
  const unwrappedParams = React.use(params)
  const classId = Number.parseInt(unwrappedParams.id)

  // const COLORS = ["#f59e0b", "#d97706", "#b45309", "#92400e", "#78350f", "#a16207"] // Amber colors, can be adjusted

  useEffect(() => {
    const fetchClassAnalytics = async () => {
      setIsLoading(true)
      try {
        if (isNaN(classId)) {
          router.push("/teacher/dashboard")
          return
        }

        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          router.push("/auth/login")
          return
        }

        const { data: classDetails, error: classError } = await supabase
          .from("classes")
          .select("*")
          .eq("id", classId)
          .eq("teacher_id", user.id)
          .single()

        if (classError || !classDetails) {
          router.push("/teacher/dashboard")
          return
        }
        setClassData(classDetails)

        const { data: studentsData } = await supabase
          .from("student_classes")
          .select(`id, student_id, profiles:student_id (id, username)`)
          .eq("class_id", classId)
        setStudents(studentsData || [])

        const { data: sectionsData } = await supabase.from("game_sections").select("*").order("order_index")
        // setSections(sectionsData || [])

        const { data: waypointsData } = await supabase.from("waypoints").select("*").order("order_index")
        // setWaypoints(waypointsData || [])

        const studentIds = studentsData?.map((s) => s.student_id) || []
        if (studentIds.length > 0 && sectionsData && waypointsData) {
          const { data: progress } = await supabase
            .from("student_progress")
            .select(`student_id, waypoint_id, completed, score, mistakes, attempts, updated_at`)
            .in("student_id", studentIds)
          // setProgressData(progress || [])

          if (progress) {
            const totalStudentsCount = studentIds.length
            const totalPossibleWaypoints = totalStudentsCount * waypointsData.length
            const completedWaypoints = progress.filter((p) => p.completed).length
            const overallCompletionRate =
              totalPossibleWaypoints > 0 ? (completedWaypoints / totalPossibleWaypoints) * 100 : 0
            const totalScore = progress.reduce((sum, p) => sum + (p.score || 0), 0)
            const totalMistakes = progress.reduce((sum, p) => sum + (p.mistakes || 0), 0)
            const totalAttempts = progress.reduce((sum, p) => sum + (p.attempts || 0), 0)
            const averageScore = completedWaypoints > 0 ? totalScore / completedWaypoints : 0
            const averageMistakes = completedWaypoints > 0 ? totalMistakes / completedWaypoints : 0
            const averageAttempts = completedWaypoints > 0 ? totalAttempts / completedWaypoints : 0

            setOverallStats({
              completionRate: Math.round(overallCompletionRate * 10) / 10,
              averageScore: Math.round(averageScore * 10) / 10,
              averageMistakes: Math.round(averageMistakes * 10) / 10,
              averageAttempts: Math.round(averageAttempts * 10) / 10,
            })

            const sectionStats = sectionsData.map((section) => {
              const sectionWaypoints = waypointsData.filter((w) => w.section_id === section.id)
              const waypointIds = sectionWaypoints.map((w) => w.id)
              const studentsCompletedSection = new Set()
              let sectionTotalScore = 0
              // let sectionTotalMistakes = 0
              // let sectionTotalAttempts = 0

              const waypointDifficulty = sectionWaypoints.map((waypoint) => {
                const waypointProgress = progress.filter((p) => p.waypoint_id === waypoint.id)
                const completions = waypointProgress.filter((p) => p.completed).length
                const wpAttempts = waypointProgress.reduce((sum, p) => sum + (p.attempts || 0), 0)
                const wpMistakes = waypointProgress.reduce((sum, p) => sum + (p.mistakes || 0), 0)
                return {
                  id: waypoint.id,
                  name: waypoint.name,
                  completionRate: totalStudentsCount > 0 ? (completions / totalStudentsCount) * 100 : 0,
                  averageMistakes: completions > 0 ? wpMistakes / completions : 0,
                  averageAttempts: completions > 0 ? wpAttempts / completions : 0,
                  difficulty: completions > 0 ? wpMistakes / completions + wpAttempts / completions : 0,
                }
              })
              const mostDifficult = [...waypointDifficulty]
                .filter((w) => w.difficulty > 0)
                .sort((a, b) => b.difficulty - a.difficulty)[0]

              progress.forEach((p) => {
                if (waypointIds.includes(p.waypoint_id) && p.completed) {
                  studentsCompletedSection.add(p.student_id)
                  sectionTotalScore += p.score || 0
                  // sectionTotalMistakes += p.mistakes || 0
                  // sectionTotalAttempts += p.attempts || 0
                }
              })
              return {
                id: section.id,
                name: section.name,
                completionRate: totalStudentsCount > 0 ? (studentsCompletedSection.size / totalStudentsCount) * 100 : 0,
                averageScore: studentsCompletedSection.size > 0 ? sectionTotalScore / studentsCompletedSection.size : 0,
                mostDifficultWaypoint: mostDifficult,
                waypointDifficulty,
              }
            })
            setSectionAnalytics(sectionStats)

            const studentStats = studentIds
              .map((studentId) => {
                const studentProgress = progress.filter((p) => p.student_id === studentId)
                const completed = studentProgress.filter((p) => p.completed).length
                const studTotalScore = studentProgress.reduce((sum, p) => sum + (p.score || 0), 0)
                const studTotalMistakes = studentProgress.reduce((sum, p) => sum + (p.mistakes || 0), 0)
                const studTotalAttempts = studentProgress.reduce((sum, p) => sum + (p.attempts || 0), 0)
                const student = studentsData?.find((s) => s.student_id === studentId)
                return {
                  id: studentId,
                  name: student?.profiles?.username || `Student ${studentId.substring(0, 4)}`,
                  completed,
                  score: studTotalScore,
                  mistakes: studTotalMistakes,
                  attempts: studTotalAttempts,
                  efficiency: studTotalAttempts > 0 ? Math.round((studTotalScore / studTotalAttempts) * 10) / 10 : 0,
                }
              })
              .sort((a, b) => b.score - a.score)
            setStudentPerformance(studentStats)

            const scatterData = studentStats.map((student) => ({
              name: student.name,
              completed: student.completed,
              score: student.score,
              efficiency: student.efficiency,
            }))
            setStudentScatterData(scatterData)

            const difficultyByWaypoint = waypointsData
              .filter((waypoint) => waypoint.type === "game")
              .map((waypoint) => {
                // For each waypoint, sum the attempts field from student_progress for all students
                const totalAttempts = progress
                  .filter((p) => p.waypoint_id === waypoint.id)
                  .reduce((sum, p) => sum + (p.attempts || 0), 0);
                return {
                  id: waypoint.id,
                  name: waypoint.name,
                  section: sectionsData.find((s) => s.id === waypoint.section_id)?.name || "Unknown",
                  studentsRetried: totalAttempts,
                };
              });
            setDifficultyData(difficultyByWaypoint)
          }
        }
      } catch (err) {
        console.error("Error fetching class analytics:", err)
        setError("Failed to load class analytics. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchClassAnalytics()
  }, [router, classId])

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-[calc(100vh-100px)] bg-[#FAF7F0]">
        <Loader2 className="h-12 w-12 animate-spin text-[#8B4513]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-screen bg-[#FAF7F0]">
        <Card className="border-2 border-[#a0522d] bg-[#f5e9d0] w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-sans font-bold text-[#8B4513]">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[#8B4513] font-sans">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-4 w-full font-sans font-semibold bg-[#8B4513] hover:bg-[#a0522d] text-[#f5e9d0]"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const containerMotion = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  }
  const itemMotion = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }
  const chartTextStyle = { fontFamily: "Inter, sans-serif", fill: "#8B4513", fontSize: 12 }
  const chartTooltipStyle = {
    backgroundColor: "#fdfaf0",
    borderColor: "#a0522d",
    borderRadius: "0.375rem",
    fontFamily: "Inter, sans-serif",
    fontSize: "0.875rem",
  }
  const chartLegendStyle = { fontFamily: "Inter, sans-serif", color: "#8B4513", fontSize: "0.875rem" }

  return (
    <motion.div
      className="min-h-screen bg-[#FAF7F0] p-4 font-sans"
      variants={containerMotion}
      initial="hidden"
      animate="show"
    >
      <div className="container mx-auto">
        <motion.div variants={itemMotion} className="mb-6">
          <Button
            asChild
            variant="outline"
            className="border-[#a0522d] text-[#8B4513] hover:bg-[#f5e9d0] hover:text-[#8B4513]"
          >
            <Link href={`/teacher/classes/${classId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Class
            </Link>
          </Button>
        </motion.div>

        <motion.div variants={itemMotion}>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#8B4513]">{classData?.name || "Class"} Analytics</h1>
            <p className="text-[#a0522d] mt-1">Performance data for your class</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              {
                title: "Overall Completion",
                value: `${overallStats.completionRate}%`,
                icon: Award,
                desc: "of all waypoints",
              },
              {
                title: "Average Score",
                value: overallStats.averageScore,
                icon: BarChart2,
                desc: "points per waypoint",
              },
              {
                title: "Average Attempts",
                value: overallStats.averageAttempts,
                icon: AlertTriangle,
                desc: "attempts per waypoint",
              },
              { title: "Students", value: students.length, icon: Users, desc: "enrolled" },
            ].map((stat, idx) => (
              <Card key={idx} className="border-2 border-[#a0522d] bg-[#f5e9d0] shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md font-semibold text-[#8B4513]">{stat.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <stat.icon className="h-6 w-6 text-[#8B4513] mr-3" />
                    <div>
                      <p className="text-2xl font-bold text-[#a0522d]">{stat.value}</p>
                      <p className="text-xs text-[#a0522d]">{stat.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemMotion}>
          <Tabs defaultValue="sections" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-[#e5d9c0] border-2 border-[#d9c8a9] rounded-lg">
              {["Sections", "Students", "Difficulty"].map((tabName) => (
                <TabsTrigger
                  key={tabName.toLowerCase()}
                  value={tabName.toLowerCase()}
                  className="font-semibold data-[state=active]:bg-[#8B4513] data-[state=active]:text-[#f5e9d0] text-[#a0522d] rounded-md"
                >
                  {tabName}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="sections" className="mt-6">
              <div className="space-y-6">
                <Card className="border-2 border-[#a0522d] bg-[#f5e9d0] shadow-md">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-[#8B4513]">Section Performance</CardTitle>
                    <CardDescription className="text-[#a0522d]">
                      How students are progressing through each game section
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[350px]">
                      {sectionAnalytics.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={sectionAnalytics} margin={{ top: 5, right: 20, left: -10, bottom: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#d9c8a9" />
                            <XAxis
                              dataKey="name"
                              stroke="#8B4513"
                              angle={-40}
                              textAnchor="end"
                              height={70}
                              tick={{ ...chartTextStyle, fontSize: 10 }}
                              interval={0}
                            />
                            <YAxis yAxisId="left" stroke="#8B4513" domain={[0, 100]} tick={chartTextStyle} />
                            <YAxis yAxisId="right" orientation="right" stroke="#8B4513" tick={chartTextStyle} />
                            <Tooltip
                              contentStyle={chartTooltipStyle}
                              itemStyle={{ color: "#8B4513" }}
                              labelStyle={{ color: "#8B4513", fontWeight: "bold" }}
                              formatter={(value, name) => {
                                const numValue = Number(value)
                                if (isNaN(numValue)) return [String(value), name]
                                return name === "Completion Rate"
                                  ? [`${numValue.toFixed(1)}%`, name]
                                  : [numValue.toFixed(1), name]
                              }}
                            />
                            <Legend wrapperStyle={chartLegendStyle} />
                            <Bar
                              yAxisId="left"
                              dataKey="completionRate"
                              name="Completion Rate"
                              fill="#8B4513"
                              radius={[4, 4, 0, 0]}
                            />
                            <Bar
                              yAxisId="right"
                              dataKey="averageScore"
                              name="Average Score"
                              fill="#a0522d"
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <p className="text-center text-[#a0522d] py-10">No section data available.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-[#a0522d] bg-[#f5e9d0] shadow-md">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-[#8B4513]">Section Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 max-h-[400px] overflow-y-auto pr-2">
                      {sectionAnalytics.map((section) => (
                        <Card key={section.id} className="border border-[#d9c8a9] bg-[#FAF7F0] shadow">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-semibold text-[#8B4513]">{section.name}</CardTitle>
                            <CardDescription className="text-[#a0522d]">
                              {section.completionRate.toFixed(1)}% completion
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="text-sm">
                            <p>
                              <strong className="text-[#8B4513]">Avg Score:</strong> {section.averageScore.toFixed(1)}
                            </p>
                            {section.mostDifficultWaypoint && (
                              <div>
                                <strong className="text-[#8B4513]">Most Challenging:</strong>{" "}
                                {section.mostDifficultWaypoint.name}
                                <p className="text-xs text-[#a0522d] pl-2">
                                  Avg. {section.mostDifficultWaypoint.averageAttempts.toFixed(1)} attempts
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="students" className="mt-6">
              <div className="space-y-6">
                {[
                  { title: "Completed Waypoints", dataKey: "completed", color: "#8B4513" },
                  { title: "Total Score", dataKey: "score", color: "#a0522d" },
                ].map((chart) => (
                  <Card key={chart.title} className="border-2 border-[#a0522d] bg-[#f5e9d0] shadow-md">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-[#8B4513]">{chart.title}</CardTitle>
                      <CardDescription className="text-[#a0522d]">
                        Top 10 students by {chart.title.toLowerCase()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        {studentPerformance.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={studentPerformance.slice(0, 10)}
                              layout="vertical"
                              margin={{ top: 5, right: 20, left: 80, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#d9c8a9" />
                              <XAxis type="number" stroke="#8B4513" tick={chartTextStyle} />
                              <YAxis
                                dataKey="name"
                                type="category"
                                stroke="#8B4513"
                                width={100}
                                tick={{ ...chartTextStyle, fontSize: 10 }}
                                interval={0}
                              />
                              <Tooltip
                                contentStyle={chartTooltipStyle}
                                itemStyle={{ color: "#8B4513" }}
                                labelStyle={{ color: "#8B4513", fontWeight: "bold" }}
                              />
                              <Legend wrapperStyle={chartLegendStyle} />
                              <Bar
                                dataKey={chart.dataKey}
                                name={chart.title}
                                fill={chart.color}
                                radius={[0, 4, 4, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <p className="text-center text-[#a0522d] py-10">No student data available.</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Card className="border-2 border-[#a0522d] bg-[#f5e9d0] shadow-md">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-[#8B4513]">Score vs. Completion</CardTitle>
                    <CardDescription className="text-[#a0522d]">
                      Relationship between completed waypoints and total score. Bubble size indicates efficiency.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      {studentScatterData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#d9c8a9" />
                            <XAxis
                              type="number"
                              dataKey="completed"
                              name="Completed Waypoints"
                              stroke="#8B4513"
                              tick={chartTextStyle}
                              label={{
                                value: "Completed Waypoints",
                                position: "insideBottom",
                                dy: 10,
                                ...chartTextStyle,
                                fontSize: 10,
                              }}
                            />
                            <YAxis
                              type="number"
                              dataKey="score"
                              name="Score"
                              stroke="#8B4513"
                              tick={chartTextStyle}
                              label={{
                                value: "Score",
                                angle: -90,
                                position: "insideLeft",
                                dx: -5,
                                ...chartTextStyle,
                                fontSize: 10,
                              }}
                            />
                            <ZAxis
                              type="number"
                              dataKey="efficiency"
                              range={[50, 500]}
                              name="Efficiency (Score/Attempts)"
                            />
                            <Tooltip
                              cursor={{ strokeDasharray: "3 3" }}
                              contentStyle={chartTooltipStyle}
                              itemStyle={{ color: "#8B4513" }}
                              labelStyle={{ color: "#8B4513", fontWeight: "bold" }}
                              labelFormatter={(label) => studentScatterData[label]?.name || ""}
                            />
                            <Legend wrapperStyle={chartLegendStyle} />
                            <Scatter name="Students" data={studentScatterData} fill="#8B4513" />
                          </ScatterChart>
                        </ResponsiveContainer>
                      ) : (
                        <p className="text-center text-[#a0522d] py-10">No student data available.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-[#a0522d] bg-[#f5e9d0] shadow-md">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-[#8B4513]">Student Rankings</CardTitle>
                    <CardDescription className="text-[#a0522d]">
                      Detailed performance metrics for all students
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border border-[#d9c8a9] overflow-x-auto max-h-[400px]">
                      <Table>
                        <TableHeader className="bg-[#e5d9c0]">
                          <TableRow>
                            {["Rank", "Student", "Completed", "Score", "Efficiency"].map((head) => (
                              <TableHead
                                key={head}
                                className={`font-semibold text-[#8B4513] ${["Completed", "Score", "Efficiency"].includes(head) ? "text-right" : ""}`}
                              >
                                {head}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {studentPerformance.map((student, index) => (
                            <TableRow key={student.id} className={index % 2 === 0 ? "bg-[#FAF7F0]" : "bg-[#f5e9d0]"}>
                              <TableCell className="font-medium text-[#8B4513]">{index + 1}</TableCell>
                              <TableCell className="text-[#8B4513]">{student.name}</TableCell>
                              <TableCell className="text-right text-[#8B4513]">{student.completed}</TableCell>
                              <TableCell className="text-right text-[#8B4513]">{student.score}</TableCell>
                              <TableCell className="text-right text-[#8B4513]">
                                {student.efficiency.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="difficulty" className="mt-6">
              <div className="space-y-6">
                <Card className="border-2 border-[#a0522d] bg-[#f5e9d0] shadow-md">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-[#8B4513]">Most Challenging Waypoints</CardTitle>
                    <CardDescription className="text-[#a0522d]">
                      Waypoints with the most students who had to retry (failed at least once before passing)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      {difficultyData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={difficultyData.slice(0, 10)}
                            layout="vertical"
                            margin={{ top: 5, right: 20, left: 120, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#d9c8a9" />
                            <XAxis type="number" stroke="#8B4513" tick={chartTextStyle} />
                            <YAxis
                              dataKey="name"
                              type="category"
                              stroke="#8B4513"
                              width={140}
                              tick={{ ...chartTextStyle, fontSize: 10 }}
                              interval={0}
                            />
                            <Tooltip
                              contentStyle={chartTooltipStyle}
                              itemStyle={{ color: "#8B4513" }}
                              labelStyle={{ color: "#8B4513", fontWeight: "bold" }}
                            />
                            <Legend wrapperStyle={chartLegendStyle} />
                            <Bar dataKey="studentsRetried" name="Students Who Retried" fill="#8B4513" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <p className="text-center text-[#a0522d] py-10">No difficulty data available.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-[#a0522d] bg-[#f5e9d0] shadow-md">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-[#8B4513]">Waypoint Difficulty Details</CardTitle>
                    <CardDescription className="text-[#a0522d]">
                      Detailed difficulty metrics for all waypoints
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border border-[#d9c8a9] overflow-x-auto max-h-[400px]">
                      <Table>
                        <TableHeader className="bg-[#e5d9c0]">
                          <TableRow>
                            {["Level", "Waypoint", "Students Who Retried"].map((head) => (
                              <TableHead
                                key={head}
                                className={`font-semibold text-[#8B4513] ${["Students Who Retried"].includes(head) ? "text-right" : ""}`}
                              >
                                {head}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {difficultyData.map((waypoint, index) => (
                            <TableRow key={waypoint.id} className={index % 2 === 0 ? "bg-[#FAF7F0]" : "bg-[#f5e9d0]"}>
                              <TableCell className="font-medium text-[#8B4513]">{waypoint.section}</TableCell>
                              <TableCell className="text-[#8B4513]">{waypoint.name.replace(/ Game$/, "")}</TableCell>
                              <TableCell className="text-right text-[#8B4513]">{waypoint.studentsRetried}</TableCell>
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
      </div>
    </motion.div>
  )
}
