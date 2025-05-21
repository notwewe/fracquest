"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { PlusIcon, UsersIcon, BarChartIcon, UserIcon, BookOpenIcon, TrophyIcon, LogOutIcon } from "lucide-react"
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
      <div className="flex justify-center items-center min-h-screen bg-[#8B4513] bg-opacity-20">
        <div className="pixel-loader"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#8B4513] bg-opacity-20">
        <div className="w-full max-w-md p-6 pixel-border bg-[#f5e9d0]">
          <h2 className="text-2xl font-blaka text-[#8B4513] mb-4 text-center">Error!</h2>
          <p className="text-[#8B4513] mb-6 text-center">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-2 px-4 bg-[#8B4513] text-[#f5e9d0] font-blaka hover:bg-[#a0522d] transition-colors"
          >
            Try Again
          </button>
        </div>
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
    <div
      className="min-h-screen p-6 bg-[#8B4513] bg-opacity-20"
      style={{
        backgroundImage: "url('/pixel-ui/parchment-bg.png')",
        backgroundSize: "cover",
        backgroundRepeat: "repeat",
      }}
    >
      <motion.div className="max-w-7xl mx-auto" variants={container} initial="hidden" animate="show">
        {/* Header */}
        <motion.div variants={item} className="mb-8">
          <div className="relative bg-[#8B4513] p-4 rounded-lg pixel-border mb-6">
            <h1 className="text-4xl font-blaka text-[#f5e9d0] text-center">Teacher's Quest Board</h1>
            <div className="absolute top-2 right-2">
              <Link href="/auth/logout">
                <button className="flex items-center gap-2 px-4 py-2 bg-[#a0522d] text-[#f5e9d0] rounded hover:bg-[#8B4513] transition-colors">
                  <LogOutIcon size={16} />
                  <span className="font-blaka">Logout</span>
                </button>
              </Link>
            </div>
          </div>

          <div className="bg-[#f5e9d0] p-4 rounded-lg pixel-border">
            <h2 className="text-2xl font-blaka text-[#8B4513]">Welcome, Master {userData?.username || "Teacher"}!</h2>
            <p className="text-[#8B4513]">Your students await your guidance in the realm of fractions.</p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#f5e9d0] p-4 rounded-lg pixel-border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-blaka text-[#8B4513]">Classes</h3>
                <p className="text-4xl font-blaka text-[#a0522d]">{classes?.length || 0}</p>
              </div>
              <div className="h-16 w-16 bg-[#a0522d] rounded-full flex items-center justify-center">
                <BookOpenIcon size={32} className="text-[#f5e9d0]" />
              </div>
            </div>
          </div>

          <div className="bg-[#f5e9d0] p-4 rounded-lg pixel-border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-blaka text-[#8B4513]">Students</h3>
                <p className="text-4xl font-blaka text-[#a0522d]">{totalStudents}</p>
              </div>
              <div className="h-16 w-16 bg-[#a0522d] rounded-full flex items-center justify-center">
                <UsersIcon size={32} className="text-[#f5e9d0]" />
              </div>
            </div>
          </div>

          <div className="bg-[#f5e9d0] p-4 rounded-lg pixel-border">
            <h3 className="text-xl font-blaka text-[#8B4513] mb-2">Create New Class</h3>
            <Link href="/teacher/classes/new">
              <button className="w-full py-3 bg-[#a0522d] text-[#f5e9d0] font-blaka rounded hover:bg-[#8B4513] transition-colors flex items-center justify-center gap-2">
                <PlusIcon size={20} />
                <span>New Class</span>
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Charts */}
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#f5e9d0] p-4 rounded-lg pixel-border md:col-span-2">
            <h3 className="text-xl font-blaka text-[#8B4513] mb-2">Student Progress</h3>
            <p className="text-sm text-[#8B4513] mb-4">Completed waypoints over the last week</p>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressTrend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d9c8a9" />
                  <XAxis dataKey="day" stroke="#8B4513" />
                  <YAxis stroke="#8B4513" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#f5e9d0", borderColor: "#8B4513" }}
                    itemStyle={{ color: "#8B4513" }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    name="Completed Waypoints"
                    stroke="#a0522d"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#f5e9d0] p-4 rounded-lg pixel-border">
            <h3 className="text-xl font-blaka text-[#8B4513] mb-2">Recent Achievements</h3>
            <div className="space-y-4 max-h-[300px] overflow-y-auto">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 border-b border-[#d9c8a9] pb-2">
                    <div className="mt-1 h-8 w-8 bg-[#a0522d] rounded-full flex items-center justify-center flex-shrink-0">
                      <TrophyIcon size={16} className="text-[#f5e9d0]" />
                    </div>
                    <div>
                      <p className="font-blaka text-[#8B4513]">{activity.profiles?.username || "Student"}</p>
                      <p className="text-sm text-[#a0522d]">Completed: {activity.waypoints?.name || "Waypoint"}</p>
                      <p className="text-xs text-[#8B4513]">Score: {activity.score} points</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-[#8B4513]">No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Completion Rates */}
        <motion.div variants={item} className="mb-8">
          <div className="bg-[#f5e9d0] p-4 rounded-lg pixel-border">
            <h3 className="text-xl font-blaka text-[#8B4513] mb-2">Section Completion</h3>
            <p className="text-sm text-[#8B4513] mb-4">How students are progressing through each game section</p>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={completionStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d9c8a9" />
                  <XAxis dataKey="name" stroke="#8B4513" />
                  <YAxis stroke="#8B4513" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#f5e9d0", borderColor: "#8B4513" }}
                    itemStyle={{ color: "#8B4513" }}
                  />
                  <Legend />
                  <Bar
                    dataKey="completionRate"
                    fill="#a0522d"
                    name="Completion Rate (%)"
                    radius={[4, 4, 0, 0]}
                    label={{ position: "top", fill: "#8B4513" }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Classes */}
        <motion.div variants={item} className="mb-8">
          <div className="bg-[#f5e9d0] p-4 rounded-lg pixel-border">
            <h3 className="text-2xl font-blaka text-[#8B4513] mb-4">Your Classes</h3>

            {classes && classes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classes.map((cls) => (
                  <div key={cls.id} className="bg-[#e5d9c0] p-4 rounded border-2 border-[#d9c8a9]">
                    <h4 className="text-lg font-blaka text-[#8B4513] mb-1">{cls.name}</h4>
                    <p className="text-sm text-[#a0522d] mb-3">
                      Class Code: <span className="font-bold">{cls.class_code}</span>
                    </p>
                    <p className="text-sm text-[#8B4513] mb-4 line-clamp-2">{cls.description || "No description"}</p>
                    <div className="flex gap-2">
                      <Link href={`/teacher/classes/${cls.id}`} className="flex-1">
                        <button className="w-full py-2 bg-[#a0522d] text-[#f5e9d0] font-blaka rounded hover:bg-[#8B4513] transition-colors">
                          View
                        </button>
                      </Link>
                      <Link href={`/teacher/classes/${cls.id}/analytics`} className="flex-1">
                        <button className="w-full py-2 bg-[#a0522d] text-[#f5e9d0] font-blaka rounded hover:bg-[#8B4513] transition-colors">
                          Stats
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-[#e5d9c0] rounded">
                <p className="font-blaka text-[#8B4513] mb-4">You haven't created any classes yet.</p>
                <Link href="/teacher/classes/new">
                  <button className="py-2 px-6 bg-[#a0522d] text-[#f5e9d0] font-blaka rounded hover:bg-[#8B4513] transition-colors flex items-center gap-2 mx-auto">
                    <PlusIcon size={20} />
                    <span>Create Your First Class</span>
                  </button>
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Navigation */}
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/teacher/classes">
            <div className="bg-[#a0522d] p-6 rounded-lg pixel-border hover:bg-[#8B4513] transition-colors text-center">
              <UsersIcon size={32} className="text-[#f5e9d0] mx-auto mb-2" />
              <span className="font-blaka text-xl text-[#f5e9d0]">Manage Classes</span>
            </div>
          </Link>

          <Link href="/teacher/analytics">
            <div className="bg-[#a0522d] p-6 rounded-lg pixel-border hover:bg-[#8B4513] transition-colors text-center">
              <BarChartIcon size={32} className="text-[#f5e9d0] mx-auto mb-2" />
              <span className="font-blaka text-xl text-[#f5e9d0]">Analytics</span>
            </div>
          </Link>

          <Link href="/teacher/profile">
            <div className="bg-[#a0522d] p-6 rounded-lg pixel-border hover:bg-[#8B4513] transition-colors text-center">
              <UserIcon size={32} className="text-[#f5e9d0] mx-auto mb-2" />
              <span className="font-blaka text-xl text-[#f5e9d0]">Profile</span>
            </div>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
