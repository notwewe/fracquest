"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { PlusIcon, UsersIcon, BarChartIcon, UserIcon, BookOpenIcon, TrophyIcon, Loader2 } from "lucide-react"
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

        const { data: classesData } = await supabase
          .from("classes")
          .select("id, name, description, class_code, created_at")
          .eq("teacher_id", user.id)
          .order("created_at", { ascending: false })

        setClasses(classesData || [])

        if (classesData && classesData.length > 0) {
          const classIds = classesData.map((c) => c.id)
          const { data: studentCounts } = await supabase
            .from("student_classes")
            .select("student_id, class_id")
            .in("class_id", classIds)

          const uniqueStudents = new Set(studentCounts?.map((s) => s.student_id) || [])
          setTotalStudents(uniqueStudents.size)

          if (uniqueStudents.size > 0) {
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

            const { data: sections } = await supabase.from("game_sections").select("id, name").order("order_index")
            if (sections) {
              const { data: waypoints } = await supabase.from("waypoints").select("id, section_id").order("order_index")
              const { data: progress } = await supabase
                .from("student_progress")
                .select("waypoint_id, completed, updated_at")
                .in("student_id", Array.from(uniqueStudents))
                .eq("completed", true)

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

              const last7Days = Array.from({ length: 7 }, (_, i) => {
                const date = new Date()
                date.setDate(date.getDate() - (6 - i))
                return date.toISOString().split("T")[0]
              })

              const progressByDay = last7Days.map((day) => {
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
  }, [router])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#FAF7F0] font-sans">
        <Loader2 className="h-12 w-12 animate-spin text-[#8B4513]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#FAF7F0] font-sans">
        <div className="w-full max-w-md p-6 border-2 border-[#a0522d] rounded-lg shadow-md bg-[#f5e9d0] font-sans">
          <h2 className="text-2xl font-bold text-[#8B4513] mb-4 text-center">Error!</h2>
          <p className="text-[#8B4513] mb-6 text-center">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-2 px-4 bg-[#8B4513] text-[#f5e9d0] font-semibold rounded-md hover:bg-[#a0522d] transition-colors"
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
      transition: { staggerChildren: 0.1 },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  const chartTextStyle = { fontFamily: "Inter, sans-serif", fill: "#8B4513" }

  return (
    <div
      className="min-h-screen p-6 font-sans"
      style={{
        backgroundImage: "url('/dashboard/bg1_castle.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        WebkitBackgroundSize: 'cover',
        MozBackgroundSize: 'cover',
        OBackgroundSize: 'cover',
      }}
    >
      <motion.div className="max-w-7xl mx-auto font-sans" variants={container} initial="hidden" animate="show">
        {/* Header */}
        <motion.div variants={item} className="mb-8">
          <div className="relative bg-[#8B4513] p-4 rounded-lg border-2 border-[#a0522d] shadow-md mb-6">
            <h1 className="text-3xl md:text-4xl font-sans font-bold text-[#f5e9d0] text-center">Teacher Dashboard</h1>
          </div>

          <div className="bg-[#f5e9d0] p-4 rounded-lg border-2 border-[#a0522d] shadow-md">
            <h2 className="text-xl md:text-2xl font-sans font-bold text-[#8B4513]">
              Welcome, Teacher {userData?.username || "User"}!
            </h2>
            <p className="text-[#8B4513] font-sans text-sm md:text-base">
              Oversee your students' progress in the realm of fractions.
            </p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#f5e9d0] p-4 rounded-lg border-2 border-[#a0522d] shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg md:text-xl font-sans font-semibold text-[#8B4513]">Classes</h3>
                <p className="text-3xl md:text-4xl font-sans font-bold text-[#a0522d]">{classes?.length || 0}</p>
              </div>
              <div className="h-12 w-12 md:h-16 md:w-16 bg-[#a0522d] rounded-full flex items-center justify-center">
                <BookOpenIcon className="text-[#f5e9d0] h-6 w-6 md:h-8 md:w-8" />
              </div>
            </div>
          </div>

          <div className="bg-[#f5e9d0] p-4 rounded-lg border-2 border-[#a0522d] shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg md:text-xl font-sans font-semibold text-[#8B4513]">Students</h3>
                <p className="text-3xl md:text-4xl font-sans font-bold text-[#a0522d]">{totalStudents}</p>
              </div>
              <div className="h-12 w-12 md:h-16 md:w-16 bg-[#a0522d] rounded-full flex items-center justify-center">
                <UsersIcon className="text-[#f5e9d0] h-6 w-6 md:h-8 md:w-8" />
              </div>
            </div>
          </div>

          <div className="bg-[#f5e9d0] p-4 rounded-lg border-2 border-[#a0522d] shadow-md flex flex-col justify-center">
            <h3 className="text-lg md:text-xl font-sans font-semibold text-[#8B4513] mb-2 text-center md:text-left">
              Create New Class
            </h3>
            <Link href="/teacher/classes/new">
              <button className="w-full py-2 md:py-3 bg-[#a0522d] text-[#f5e9d0] font-sans font-semibold rounded-md hover:bg-[#8B4513] transition-colors flex items-center justify-center gap-2 text-sm md:text-base">
                <PlusIcon className="h-[18px] w-[18px] md:h-5 md:w-5" />
                <span>New Class</span>
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Charts */}
        <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#f5e9d0] p-4 rounded-lg border-2 border-[#a0522d] shadow-md lg:col-span-2">
            <h3 className="text-lg md:text-xl font-sans font-semibold text-[#8B4513] mb-2">Student Progress Trend</h3>
            <p className="text-xs md:text-sm text-[#8B4513] mb-4 font-sans">Completed waypoints over the last 7 days</p>
            <div className="h-[250px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressTrend} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d9c8a9" />
                  <XAxis dataKey="day" stroke="#8B4513" tick={{ ...chartTextStyle, fontSize: 12 }} />
                  <YAxis stroke="#8B4513" tick={{ ...chartTextStyle, fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fdfaf0",
                      borderColor: "#a0522d",
                      borderRadius: "0.375rem",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.875rem",
                    }}
                    itemStyle={{ color: "#8B4513" }}
                    labelStyle={{ color: "#8B4513", fontWeight: "bold" }}
                  />
                  <Legend wrapperStyle={{ fontFamily: "Inter, sans-serif", color: "#8B4513", fontSize: "0.875rem" }} />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    name="Completed Waypoints"
                    stroke="#a0522d"
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#f5e9d0] p-4 rounded-lg border-2 border-[#a0522d] shadow-md">
            <h3 className="text-lg md:text-xl font-sans font-semibold text-[#8B4513] mb-2">Recent Achievements</h3>
            <div className="space-y-3 max-h-[250px] md:max-h-[300px] overflow-y-auto pr-2">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 border-b border-[#d9c8a9] pb-2 last:border-b-0"
                  >
                    <div className="mt-1 h-8 w-8 bg-[#a0522d] rounded-full flex items-center justify-center flex-shrink-0">
                      <TrophyIcon className="text-[#f5e9d0] h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-sans font-medium text-[#8B4513] text-sm">
                        {activity.profiles?.username || "Student"}
                      </p>
                      <p className="text-xs text-[#a0522d] font-sans">
                        Completed: {activity.waypoints?.name || "Waypoint"}
                      </p>
                      <p className="text-xs text-[#8B4513] font-sans">Score: {activity.score} points</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-[#8B4513] font-sans text-sm">No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Completion Rates */}
        <motion.div variants={item} className="mb-8">
          <div className="bg-[#f5e9d0] p-4 rounded-lg border-2 border-[#a0522d] shadow-md">
            <h3 className="text-lg md:text-xl font-sans font-semibold text-[#8B4513] mb-2">Section Completion Rates</h3>
            <p className="text-xs md:text-sm text-[#8B4513] mb-4 font-sans">
              Percentage of students completing waypoints in each game section
            </p>
            <div className="h-[250px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={completionStats} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d9c8a9" />
                  <XAxis
                    dataKey="name"
                    stroke="#8B4513"
                    tick={{ ...chartTextStyle, fontSize: 10 }}
                    interval={0}
                    angle={-30}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis stroke="#8B4513" tick={{ ...chartTextStyle, fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fdfaf0",
                      borderColor: "#a0522d",
                      borderRadius: "0.375rem",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.875rem",
                    }}
                    itemStyle={{ color: "#8B4513" }}
                    labelStyle={{ color: "#8B4513", fontWeight: "bold" }}
                  />
                  <Legend wrapperStyle={{ fontFamily: "Inter, sans-serif", color: "#8B4513", fontSize: "0.875rem" }} />
                  <Bar
                    dataKey="completionRate"
                    fill="#a0522d"
                    name="Completion Rate (%)"
                    radius={[4, 4, 0, 0]}
                    label={{ position: "top", ...chartTextStyle, fontSize: 10 }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Classes */}
        <motion.div variants={item} className="mb-8">
          <div className="bg-[#f5e9d0] p-4 rounded-lg border-2 border-[#a0522d] shadow-md">
            <h3 className="text-xl md:text-2xl font-sans font-bold text-[#8B4513] mb-4">Your Classes</h3>
            {classes && classes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classes.map((cls) => (
                  <div key={cls.id} className="bg-[#FAF7F0] p-4 rounded-md border border-[#d9c8a9] shadow">
                    <h4 className="text-md md:text-lg font-sans font-semibold text-[#8B4513] mb-1">{cls.name}</h4>
                    <p className="text-xs md:text-sm text-[#a0522d] mb-2 font-sans">
                      Class Code: <span className="font-bold">{cls.class_code}</span>
                    </p>
                    <p className="text-xs md:text-sm text-[#8B4513] mb-3 line-clamp-2 font-sans">
                      {cls.description || "No description"}
                    </p>
                    <div className="flex gap-2">
                      <Link href={`/teacher/classes/${cls.id}`} className="flex-1">
                        <button className="w-full py-2 bg-[#a0522d] text-[#f5e9d0] font-sans font-semibold rounded-md hover:bg-[#8B4513] transition-colors text-xs md:text-sm">
                          View
                        </button>
                      </Link>
                      <Link href={`/teacher/classes/${cls.id}/analytics`} className="flex-1">
                        <button className="w-full py-2 bg-[#a0522d] text-[#f5e9d0] font-sans font-semibold rounded-md hover:bg-[#8B4513] transition-colors text-xs md:text-sm">
                          Stats
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-[#FAF7F0] rounded-md">
                <p className="font-sans font-semibold text-[#8B4513] mb-4 text-sm md:text-base">
                  You haven't created any classes yet.
                </p>
                <Link href="/teacher/classes/new">
                  <button className="py-2 px-4 md:px-6 bg-[#a0522d] text-[#f5e9d0] font-sans font-semibold rounded-md hover:bg-[#8B4513] transition-colors flex items-center gap-2 mx-auto text-sm md:text-base">
                    <PlusIcon className="h-[18px] w-[18px] md:h-5 md:w-5" />
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
            <div className="bg-[#a0522d] p-4 md:p-6 rounded-lg border-2 border-[#8B4513] shadow-md hover:bg-[#8B4513] transition-colors text-center">
              <UsersIcon className="text-[#f5e9d0] mx-auto mb-2 h-6 w-6 md:h-8 md:w-8" />
              <span className="font-sans font-semibold text-md md:text-xl text-[#f5e9d0]">Manage Classes</span>
            </div>
          </Link>

          <Link href="/teacher/analytics">
            <div className="bg-[#a0522d] p-4 md:p-6 rounded-lg border-2 border-[#8B4513] shadow-md hover:bg-[#8B4513] transition-colors text-center">
              <BarChartIcon className="text-[#f5e9d0] mx-auto mb-2 h-6 w-6 md:h-8 md:w-8" />
              <span className="font-sans font-semibold text-md md:text-xl text-[#f5e9d0]">Overall Analytics</span>
            </div>
          </Link>

          <Link href="/teacher/profile">
            <div className="bg-[#a0522d] p-4 md:p-6 rounded-lg border-2 border-[#8B4513] shadow-md hover:bg-[#8B4513] transition-colors text-center">
              <UserIcon className="text-[#f5e9d0] mx-auto mb-2 h-6 w-6 md:h-8 md:w-8" />
              <span className="font-sans font-semibold text-md md:text-xl text-[#f5e9d0]">Profile</span>
            </div>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
