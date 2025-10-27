"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Users, Award, BarChart2, Loader2, AlertCircle } from "lucide-react"
import {
  BarChart as RechartsBarChart, // Renamed to avoid conflict with lucide icon
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

// Define a type for overall analytics data
interface OverallAnalyticsData {
  totalStudents: number
  totalClasses: number
  averageStudentsPerClass: number
  totalWaypointsCompleted: number
  mostPopularSection: { name: string; completions: number } | null
  leastPopularSection: { name: string; completions: number } | null
  sectionCompletionDistribution: { name: string; value: number }[]
}

export default function OverallAnalyticsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analyticsData, setAnalyticsData] = useState<OverallAnalyticsData | null>(null)
  const supabase = createClient()

  const COLORS = ["#8B4513", "#a0522d", "#b45309", "#d97706", "#f59e0b", "#FBBF24"]

  useEffect(() => {
    const fetchOverallAnalytics = async () => {
      setIsLoading(true)
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          router.push("/auth/login")
          return
        }
        // Add role check if necessary, e.g., only admin or specific teacher roles can see this

        // Get current teacher's classes first
        const { data: teacherClasses, error: teacherClassesError } = await supabase
          .from("classes")
          .select("id")
          .eq("teacher_id", user.id)

        if (teacherClassesError) {
          throw new Error("Failed to fetch teacher's classes.")
        }

        const classIds = teacherClasses?.map((c) => c.id) || []

        if (classIds.length === 0) {
          // Teacher has no classes, set all counts to 0
          setAnalyticsData({
            totalStudents: 0,
            totalClasses: 0,
            averageStudentsPerClass: 0,
            totalWaypointsCompleted: 0,
            mostPopularSection: null,
            leastPopularSection: null,
            sectionCompletionDistribution: [],
          })
          return
        }

        // Count teacher's classes
        const totalClasses = classIds.length

        // Count students in teacher's classes
        const { count: totalStudents, error: studentsError } = await supabase
          .from("student_classes")
          .select("*", { count: "exact", head: true })
          .in("class_id", classIds)

        // Get student class counts for teacher's classes only
        const { data: studentClassCounts, error: studentClassError } = await supabase
          .from("student_classes")
          .select("class_id, student_id")
          .in("class_id", classIds)

        // Get students in teacher's classes for progress filtering
        const { data: teacherStudents, error: teacherStudentsError } = await supabase
          .from("student_classes")
          .select("student_id")
          .in("class_id", classIds)

        if (teacherStudentsError) {
          throw new Error("Failed to fetch teacher's students.")
        }

        const studentIds = teacherStudents?.map((s) => s.student_id) || []

        // Count waypoints completed by teacher's students
        const { count: totalWaypointsCompleted, error: waypointsError } = await supabase
          .from("student_progress")
          .select("*", { count: "exact", head: true })
          .eq("completed", true)
          .in("student_id", studentIds)

        // Get section progress for teacher's students only
        const { data: sectionProgress, error: sectionProgressError } = await supabase
          .from("student_progress")
          .select(`
            waypoints (
              section_id,
              game_sections (name)
            )
          `)
          .eq("completed", true)
          .in("student_id", studentIds)

        if (studentsError || studentClassError || waypointsError || sectionProgressError) {
          throw new Error("Failed to fetch some analytics data.")
        }

        const averageStudentsPerClass =
          totalClasses && studentClassCounts ? studentClassCounts.length / totalClasses : 0

        const sectionCompletions: { [key: string]: number } = {}
        sectionProgress?.forEach((item) => {
          const sectionName = item.waypoints?.game_sections?.name
          if (sectionName) {
            sectionCompletions[sectionName] = (sectionCompletions[sectionName] || 0) + 1
          }
        })

        const sectionCompletionDistribution = Object.entries(sectionCompletions).map(([name, value]) => ({
          name,
          value,
        }))

        let mostPopularSection = null
        let leastPopularSection = null
        if (sectionCompletionDistribution.length > 0) {
          mostPopularSection = sectionCompletionDistribution.reduce((max, section) =>
            section.value > max.value ? section : max,
          )
          leastPopularSection = sectionCompletionDistribution.reduce((min, section) =>
            section.value < min.value ? section : min,
          )
        }

        setAnalyticsData({
          totalStudents: totalStudents || 0,
          totalClasses: totalClasses || 0,
          averageStudentsPerClass: Number.parseFloat(averageStudentsPerClass.toFixed(1)) || 0,
          totalWaypointsCompleted: totalWaypointsCompleted || 0,
          mostPopularSection: mostPopularSection
            ? { name: mostPopularSection.name, completions: mostPopularSection.value }
            : null,
          leastPopularSection: leastPopularSection
            ? { name: leastPopularSection.name, completions: leastPopularSection.value }
            : null,
          sectionCompletionDistribution,
        })
      } catch (err: any) {
        console.error("Error fetching overall analytics:", err)
        setError(err.message || "Failed to load overall analytics.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchOverallAnalytics()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF7F0] p-4 flex justify-center items-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#8B4513]" />
      </div>
    )
  }

  if (error || !analyticsData) {
    return (
      <div className="min-h-screen bg-[#FAF7F0] p-4 flex justify-center items-center">
        <Card className="border-2 border-[#a0522d] bg-[#f5e9d0] w-full max-w-md shadow-lg">
          <CardHeader className="items-center">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <CardTitle className="text-xl font-sans font-bold text-[#8B4513] mt-2">Error Loading Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[#8B4513] font-sans text-center">{error || "Analytics data could not be loaded."}</p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-6 w-full font-sans font-semibold bg-[#8B4513] hover:bg-[#a0522d] text-[#f5e9d0]"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
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

  const {
    totalStudents,
    totalClasses,
    averageStudentsPerClass,
    totalWaypointsCompleted,
    mostPopularSection,
    leastPopularSection,
    sectionCompletionDistribution,
  } = analyticsData

  const statsCards = [
    { title: "My Classes", value: totalClasses, icon: Award },
    { title: "My Students", value: totalStudents, icon: Users },
    { title: "Avg. Students/Class", value: averageStudentsPerClass, icon: BarChart2 },
    { title: "Waypoints Completed", value: totalWaypointsCompleted, icon: Award },
  ]

  return (
    <motion.div
      className="min-h-screen bg-[#FAF7F0] p-4 font-sans"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
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

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#8B4513]">My Classes Analytics</h1>
          <p className="text-[#a0522d] mt-1">Overview of your classes' performance and student progress.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
          {statsCards.map((stat, idx) => (
            <Card key={idx} className="border-2 border-[#a0522d] bg-[#f5e9d0] shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-[#8B4513]">{stat.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <stat.icon className="h-5 w-5 text-[#8B4513] mr-2" />
                  <p className="text-2xl font-bold text-[#a0522d]">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="border-2 border-[#a0522d] bg-[#f5e9d0] shadow-md">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-[#8B4513]">Section Completion Distribution</CardTitle>
              <CardDescription className="text-[#a0522d]">
                Number of completed waypoints per game section.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              {sectionCompletionDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={sectionCompletionDistribution}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#d9c8a9" />
                    <XAxis type="number" stroke="#8B4513" tick={chartTextStyle} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="#8B4513"
                      tick={{ ...chartTextStyle, fontSize: 10 }}
                      width={100}
                      interval={0}
                    />
                    <Tooltip
                      contentStyle={chartTooltipStyle}
                      itemStyle={{ color: "#8B4513" }}
                      labelStyle={{ color: "#8B4513", fontWeight: "bold" }}
                    />
                    <Bar dataKey="value" name="Completions" radius={[0, 4, 4, 0]}>
                      {sectionCompletionDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </RechartsBarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-[#a0522d] py-10">No section completion data available.</p>
              )}
            </CardContent>
          </Card>
          <div className="space-y-6">
            <Card className="border-2 border-[#a0522d] bg-[#f5e9d0] shadow-md">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-[#8B4513]">Engagement Highlights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mostPopularSection ? (
                  <p className="text-sm text-[#8B4513]">
                    <strong className="text-[#a0522d]">Most Popular Section:</strong> {mostPopularSection.name} (
                    {mostPopularSection.completions} completions)
                  </p>
                ) : (
                  <p className="text-sm text-[#8B4513]">Most popular section data not available.</p>
                )}

                {leastPopularSection ? (
                  <p className="text-sm text-[#8B4513]">
                    <strong className="text-[#a0522d]">Least Popular Section:</strong> {leastPopularSection.name} (
                    {leastPopularSection.completions} completions)
                  </p>
                ) : (
                  <p className="text-sm text-[#8B4513]">Least popular section data not available.</p>
                )}
              </CardContent>
            </Card>
            <Card className="border-2 border-[#a0522d] bg-[#f5e9d0] shadow-md">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-[#8B4513]">Section Popularity (Pie)</CardTitle>
                <CardDescription className="text-[#a0522d]">
                  Visual representation of section completions.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[220px]">
                {sectionCompletionDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sectionCompletionDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {sectionCompletionDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={chartTooltipStyle} itemStyle={{ color: "#8B4513" }} />
                      <Legend
                        wrapperStyle={chartLegendStyle}
                        layout="vertical"
                        align="right"
                        verticalAlign="middle"
                        iconSize={10}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-[#a0522d] py-10">No data for pie chart.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
