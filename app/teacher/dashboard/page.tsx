"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusIcon, UsersIcon, BarChartIcon, UserIcon, BookOpenIcon, TrophyIcon } from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

export default function TeacherDashboard() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userData, setUserData] = useState<any>(null)
  const [classes, setClasses] = useState<any[]>([])
  const [totalStudents, setTotalStudents] = useState(0)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [completionStats, setCompletionStats] = useState<any[]>([])
  const [progressTrend, setProgressTrend] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Check if user is authenticated and is a teacher
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/auth/login")
          return
        }

        const { data: profile } = await supabase.from("profiles").select("role_id, username").eq("id", user.id).single()

        if (!profile || profile.role_id !== 2) {
          router.push("/auth/login")
          return
        }

        setUserData({ ...user, username: profile.username })

        // Get teacher's classes
        const { data: classesData } = await supabase
          .from("classes")
          .select("id, name, description, class_code, created_at")
          .eq("teacher_id", user.id)
          .order("created_at", { ascending: false })

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

          if (uniqueStudents.size > 0) {
            // Get recent student progress
            const { data: recentProgress } = await supabase
              .from("student_progress")
              .select(`
                id,
                student_id,
                waypoint_id,
                completed,
                score,
                updated_at,
                profiles:student_id (username),
                waypoints:waypoint_id (name)
              `)
              .in("student_id", Array.from(uniqueStudents))
              .eq("completed", true)
              .order("updated_at", { ascending: false })
              .limit(5)

            setRecentActivity(recentProgress || [])

            // Get completion stats by section
            const { data: sections } = await supabase.from("game_sections").select("id, name").order("order_index")

            if (sections) {
              // Get all waypoints
              const { data: waypoints } = await supabase.from("waypoints").select("id, section_id").order("order_index")

              // Get all student progress
              const { data: progress } = await supabase
                .from("student_progress")
                .select("waypoint_id, completed, updated_at")
                .in("student_id", Array.from(uniqueStudents))
                .eq("completed", true)

              // Calculate completion rates by section
              const sectionStats = sections.map((section) => {
                const sectionWaypoints = waypoints?.filter((w) => w.section_id === section.id) || []
                const waypointIds = sectionWaypoints.map((w) => w.id)

                const totalPossible = waypointIds.length * uniqueStudents.size
                const completed =
                  progress?.filter((p) => waypointIds.includes(p.waypoint_id) && p.completed).length || 0

                const completionRate = totalPossible > 0 ? (completed / totalPossible) * 100 : 0

                return {
                  name: section.name,
                  completionRate: Math.round(completionRate),
                }
              })

              setCompletionStats(sectionStats)

              // Generate progress trend data from actual data
              // Group by day for the last 7 days
              const last7Days = Array.from({ length: 7 }, (_, i) => {
                const date = new Date()
                date.setDate(date.getDate() - (6 - i))
                return date.toISOString().split("T")[0]
              })

              const progressByDay = last7Days.map((day) => {
                // Filter progress by this day
                const dayProgress = progress?.filter((p) => {
                  const progressDate = new Date(p.updated_at).toISOString().split("T")[0]
                  return progressDate === day
                })

                return {
                  day: new Date(day).toLocaleDateString("en-US", { weekday: "short" }),
                  completed: dayProgress?.length || 0,
                }
              })

              setProgressTrend(progressByDay)
            }
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        setError("Failed to load dashboard data. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
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
      <motion.div variants={item} className="grid gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-pixel text-amber-900">Teacher Dashboard</h1>
            <p className="text-amber-700">Welcome back, {userData?.username || "Teacher"}!</p>
          </div>
          <Button asChild variant="outline" className="font-pixel border-amber-600 text-amber-700">
            <Link href="/auth/logout">Logout</Link>
          </Button>
        </div>

        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-2 border-amber-800 bg-amber-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-pixel text-amber-900">Total Classes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <BookOpenIcon className="h-8 w-8 text-amber-600 mr-3" />
                <p className="text-3xl font-pixel text-amber-700">{classes?.length || 0}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-amber-800 bg-amber-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-pixel text-amber-900">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <UsersIcon className="h-8 w-8 text-amber-600 mr-3" />
                <p className="text-3xl font-pixel text-amber-700">{totalStudents}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-amber-800 bg-amber-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-pixel text-amber-900">Create New Class</CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full font-pixel bg-amber-600 hover:bg-amber-700 text-white">
                <Link href="/teacher/classes/new">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  New Class
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-2 border-amber-800 bg-amber-50 md:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl font-pixel text-amber-900">Student Progress Trend</CardTitle>
              <CardDescription className="font-pixel text-amber-700">
                Completed waypoints over the last week
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <div className="h-[300px] min-w-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressTrend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3e8d2" />
                    <XAxis dataKey="day" stroke="#92400e" />
                    <YAxis stroke="#92400e" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#fffbeb", borderColor: "#92400e" }}
                      itemStyle={{ color: "#92400e" }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="completed"
                      name="Completed Waypoints"
                      stroke="#d97706"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-amber-800 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-xl font-pixel text-amber-900">Recent Activity</CardTitle>
              <CardDescription className="font-pixel text-amber-700">Latest student achievements</CardDescription>
            </CardHeader>
            <CardContent className="max-h-[300px] overflow-y-auto">
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <div key={activity.id} className="flex items-start space-x-3 border-b border-amber-200 pb-2">
                      <TrophyIcon className="h-5 w-5 text-amber-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-amber-900">{activity.profiles?.username || "Student"}</p>
                        <p className="text-xs text-amber-700">Completed: {activity.waypoints?.name || "Waypoint"}</p>
                        <p className="text-xs text-amber-600">Score: {activity.score} points</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-amber-700 text-center py-4">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-2 border-amber-800 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-xl font-pixel text-amber-900">Section Completion Rates</CardTitle>
              <CardDescription className="font-pixel text-amber-700">
                How students are progressing through each game section
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <div className="h-[300px] min-w-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={completionStats} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3e8d2" />
                    <XAxis dataKey="name" stroke="#92400e" />
                    <YAxis stroke="#92400e" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#fffbeb", borderColor: "#92400e" }}
                      itemStyle={{ color: "#92400e" }}
                    />
                    <Legend />
                    <Bar
                      dataKey="completionRate"
                      fill="#d97706"
                      name="Completion Rate (%)"
                      radius={[4, 4, 0, 0]}
                      label={{ position: "top", fill: "#92400e" }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-2 border-amber-800 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-2xl font-pixel text-amber-900">Your Classes</CardTitle>
              <CardDescription className="font-pixel text-amber-700">
                Manage your classes and view student progress
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto">
              {classes && classes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {classes.map((cls) => (
                    <Card key={cls.id} className="border border-amber-300">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-pixel text-amber-900">{cls.name}</CardTitle>
                        <CardDescription className="font-pixel text-amber-700">
                          Class Code: <span className="font-bold">{cls.class_code}</span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-4 line-clamp-2">{cls.description || "No description"}</p>
                        <div className="flex space-x-2">
                          <Button asChild className="flex-1 font-pixel bg-amber-600 hover:bg-amber-700 text-white">
                            <Link href={`/teacher/classes/${cls.id}`}>View</Link>
                          </Button>
                          <Button asChild className="flex-1 font-pixel bg-amber-600 hover:bg-amber-700 text-white">
                            <Link href={`/teacher/classes/${cls.id}/analytics`}>Stats</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="font-pixel text-amber-700 mb-4">You haven't created any classes yet.</p>
                  <Button asChild className="font-pixel bg-amber-600 hover:bg-amber-700 text-white">
                    <Link href="/teacher/classes/new">
                      <PlusIcon className="mr-2 h-4 w-4" />
                      Create Your First Class
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button asChild className="h-auto py-6 font-pixel bg-amber-600 hover:bg-amber-700 text-white">
            <Link href="/teacher/classes" className="flex flex-col items-center gap-2">
              <UsersIcon className="h-8 w-8" />
              <span>Manage Classes</span>
            </Link>
          </Button>

          <Button asChild className="h-auto py-6 font-pixel bg-amber-600 hover:bg-amber-700 text-white">
            <Link href="/teacher/analytics" className="flex flex-col items-center gap-2">
              <BarChartIcon className="h-8 w-8" />
              <span>Analytics</span>
            </Link>
          </Button>

          <Button asChild className="h-auto py-6 font-pixel bg-amber-600 hover:bg-amber-700 text-white">
            <Link href="/teacher/profile" className="flex flex-col items-center gap-2">
              <UserIcon className="h-8 w-8" />
              <span>Profile</span>
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
