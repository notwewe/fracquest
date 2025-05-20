"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Users, BookOpen, UserCheck, UserX } from "lucide-react"
import { AdminUsers } from "@/components/admin/admin-users"
import { AdminClasses } from "@/components/admin/admin-classes"
import { motion } from "framer-motion"

export default function AdminDashboard() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
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
          window.location.href = "/auth/login"
          return
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role_id")
          .eq("id", user.id)
          .single()

        if (profileError || !profile) {
          console.error("Profile error:", profileError)
          window.location.href = "/"
          return
        }

        if (profile.role_id !== 3) {
          console.log("User is not admin, redirecting")
          window.location.href = "/"
          return
        }

        setIsAdmin(true)

        // Load stats
        const { data: users, error: usersError } = await supabase.from("profiles").select("role_id")

        if (!usersError && users) {
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

        if (!classesError) {
          setStats((prev) => ({
            ...prev,
            totalClasses: classesCount || 0,
          }))
        }
      } catch (error) {
        console.error("Error checking admin status:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminAndLoadStats()
  }, [router, supabase])

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    )
  }

  if (!isAdmin) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto p-4">
      <motion.h1
        className="text-3xl font-pixel text-amber-900 mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Admin Dashboard
      </motion.h1>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, staggerChildren: 0.1 }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-2 border-amber-800 bg-amber-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-pixel text-amber-900 flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold font-pixel text-amber-700">{stats.totalUsers}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="border-2 border-amber-800 bg-amber-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-pixel text-amber-900 flex items-center">
                <UserCheck className="mr-2 h-5 w-5" />
                Teachers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold font-pixel text-amber-700">{stats.totalTeachers}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="border-2 border-amber-800 bg-amber-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-pixel text-amber-900 flex items-center">
                <UserX className="mr-2 h-5 w-5" />
                Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold font-pixel text-amber-700">{stats.totalStudents}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card className="border-2 border-amber-800 bg-amber-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-pixel text-amber-900 flex items-center">
                <BookOpen className="mr-2 h-5 w-5" />
                Classes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold font-pixel text-amber-700">{stats.totalClasses}</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-amber-100 border-2 border-amber-300 mb-6">
            <TabsTrigger
              value="users"
              className="font-pixel data-[state=active]:bg-amber-600 data-[state=active]:text-white"
            >
              Users
            </TabsTrigger>
            <TabsTrigger
              value="classes"
              className="font-pixel data-[state=active]:bg-amber-600 data-[state=active]:text-white"
            >
              Classes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <AdminUsers />
          </TabsContent>

          <TabsContent value="classes">
            <AdminClasses />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
