"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Users, BookOpen, UserCheck, UserX, GraduationCap, School } from "lucide-react"
import { AdminUsers } from "@/components/admin/admin-users"
import { AdminClasses } from "@/components/admin/admin-classes"
import { motion } from "framer-motion"

export default function AdminDashboard() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTeachers: 0,
    totalStudents: 0,
    totalClasses: 0,
  })
  const supabase = createClient()

  useEffect(() => {
    const checkAdminAndLoadStats = async () => {
      try {
        // Check if user is admin
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/auth/login")
          return
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role_id")
          .eq("id", user.id)
          .single()

        if (profileError || !profile) {
          console.error("Profile error:", profileError)
          setError("Failed to load profile data")
          return
        }

        if (profile.role_id !== 3) {
          console.log("User is not admin, redirecting")
          router.push("/")
          return
        }

        setIsAdmin(true)

        // Load stats
        const { data: users, error: usersError } = await supabase.from("profiles").select("role_id")

        if (usersError) {
          setError("Failed to load user statistics")
          return
        }

        if (users) {
          const teachers = users.filter((u) => u.role_id === 2)
          const students = users.filter((u) => u.role_id === 1)

          setStats({
            totalUsers: users.length,
            totalTeachers: teachers.length,
            totalStudents: students.length,
            totalClasses: 0, // Will be updated below
          })
        }

        const { count: classesCount, error: classesError } = await supabase
          .from("classes")
          .select("*", { count: "exact" })

        if (classesError) {
          setError("Failed to load class statistics")
          return
        }

        setStats((prev) => ({
          ...prev,
          totalClasses: classesCount || 0,
        }))
      } catch (error) {
        console.error("Error checking admin status:", error)
        setError("An unexpected error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminAndLoadStats()
  }, [router, supabase])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#FAF7F0]">
        <Loader2 className="h-12 w-12 animate-spin text-[#8B4513]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#FAF7F0]">
        <div className="w-full max-w-md p-6 border-2 border-[#a0522d] rounded-lg shadow-md bg-[#f5e9d0]">
          <h2 className="text-2xl font-sans font-bold text-[#8B4513] mb-4 text-center">Error!</h2>
          <p className="text-[#8B4513] mb-6 text-center font-sans">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-2 px-4 bg-[#8B4513] text-[#f5e9d0] font-sans font-semibold rounded-md hover:bg-[#a0522d] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null // Will redirect in useEffect
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

  return (
    <div className="min-h-screen w-full bg-[#FAF7F0] overflow-y-auto p-6">
      <motion.div
        className="max-w-7xl mx-auto font-sans h-full flex flex-col"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Header */}
        <motion.div variants={item} className="mb-6 flex-shrink-0">
          <div className="relative bg-[#8B4513] p-4 rounded-lg border-2 border-[#a0522d] shadow-md mb-4">
            <h1 className="text-3xl md:text-4xl font-sans font-bold text-[#f5e9d0] text-center">Admin Dashboard</h1>
          </div>

          <div className="bg-[#f5e9d0] p-4 rounded-lg border-2 border-[#a0522d] shadow-md">
            <h2 className="text-xl md:text-2xl font-sans font-bold text-[#8B4513]">Welcome, Administrator!</h2>
            <p className="text-[#8B4513] font-sans text-sm md:text-base">
              Manage the entire FracQuest platform and oversee all users.
            </p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 flex-shrink-0">
          <div className="bg-[#f5e9d0] p-4 rounded-lg border-2 border-[#a0522d] shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg md:text-xl font-sans font-semibold text-[#8B4513]">Total Users</h3>
                <p className="text-3xl md:text-4xl font-sans font-bold text-[#a0522d]">{stats.totalUsers}</p>
              </div>
              <div className="h-12 w-12 md:h-16 md:w-16 bg-[#a0522d] rounded-full flex items-center justify-center">
                <Users className="text-[#f5e9d0] h-6 w-6 md:h-8 md:w-8" />
              </div>
            </div>
          </div>

          <div className="bg-[#f5e9d0] p-4 rounded-lg border-2 border-[#a0522d] shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg md:text-xl font-sans font-semibold text-[#8B4513]">Teachers</h3>
                <p className="text-3xl md:text-4xl font-sans font-bold text-[#a0522d]">{stats.totalTeachers}</p>
              </div>
              <div className="h-12 w-12 md:h-16 md:w-16 bg-[#a0522d] rounded-full flex items-center justify-center">
                <School className="text-[#f5e9d0] h-6 w-6 md:h-8 md:w-8" />
              </div>
            </div>
          </div>

          <div className="bg-[#f5e9d0] p-4 rounded-lg border-2 border-[#a0522d] shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg md:text-xl font-sans font-semibold text-[#8B4513]">Students</h3>
                <p className="text-3xl md:text-4xl font-sans font-bold text-[#a0522d]">{stats.totalStudents}</p>
              </div>
              <div className="h-12 w-12 md:h-16 md:w-16 bg-[#a0522d] rounded-full flex items-center justify-center">
                <GraduationCap className="text-[#f5e9d0] h-6 w-6 md:h-8 md:w-8" />
              </div>
            </div>
          </div>

          <div className="bg-[#f5e9d0] p-4 rounded-lg border-2 border-[#a0522d] shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg md:text-xl font-sans font-semibold text-[#8B4513]">Classes</h3>
                <p className="text-3xl md:text-4xl font-sans font-bold text-[#a0522d]">{stats.totalClasses}</p>
              </div>
              <div className="h-12 w-12 md:h-16 md:w-16 bg-[#a0522d] rounded-full flex items-center justify-center">
                <BookOpen className="text-[#f5e9d0] h-6 w-6 md:h-8 md:w-8" />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex-1 overflow-hidden"
        >
          <Tabs defaultValue="users" className="w-full h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 bg-[#f5e9d0] border-2 border-[#a0522d] mb-4 h-16 flex-shrink-0">
              <TabsTrigger
                value="users"
                className="font-sans text-lg data-[state=active]:bg-[#8B4513] data-[state=active]:text-[#f5e9d0] h-12"
              >
                Users
              </TabsTrigger>
              <TabsTrigger
                value="classes"
                className="font-sans text-lg data-[state=active]:bg-[#8B4513] data-[state=active]:text-[#f5e9d0] h-12"
              >
                Classes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="flex-1 overflow-hidden min-h-[400px] md:min-h-[600px] max-h-[70vh] overflow-y-auto">
              <AdminUsers />
            </TabsContent>

            <TabsContent value="classes" className="flex-1 overflow-hidden min-h-[400px] md:min-h-[600px] max-h-[70vh] overflow-y-auto">
              <AdminClasses />
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  )
}
