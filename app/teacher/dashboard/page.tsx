import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusIcon, UsersIcon, BarChartIcon } from "lucide-react"

export default async function TeacherDashboard() {
  const supabase = createClient()

  // Check if user is authenticated and is a teacher
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role_id, username").eq("id", user.id).single()

  if (!profile || profile.role_id !== 2) {
    redirect("/auth/login")
  }

  // Get teacher's classes
  const { data: classes } = await supabase
    .from("classes")
    .select("id, name, description, class_code")
    .eq("teacher_id", user.id)

  // Get total students across all classes
  let totalStudents = 0

  if (classes && classes.length > 0) {
    // Get class IDs
    const classIds = classes.map((c) => c.id)

    // Count students in each class - using a simpler approach
    const { data: studentCounts } = await supabase
      .from("student_classes")
      .select("*", { count: "exact" })
      .in("class_id", classIds)

    // Just count the total number of rows returned
    totalStudents = studentCounts?.length || 0
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-pixel text-amber-900">Teacher Dashboard</h1>
          <Button asChild variant="outline" className="font-pixel border-amber-600 text-amber-700">
            <Link href="/auth/logout">Logout</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-2 border-amber-800 bg-amber-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-pixel text-amber-900">Total Classes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-pixel text-amber-700">{classes?.length || 0}</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-amber-800 bg-amber-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-pixel text-amber-900">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-pixel text-amber-700">{totalStudents}</p>
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
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Card className="border-2 border-amber-800 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-2xl font-pixel text-amber-900">Your Classes</CardTitle>
              <CardDescription className="font-pixel text-amber-700">
                Manage your classes and view student progress
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                        <p className="text-sm mb-4">{cls.description || "No description"}</p>
                        <Button asChild className="w-full font-pixel bg-amber-600 hover:bg-amber-700 text-white">
                          <Link href={`/teacher/classes/${cls.id}`}>View Class</Link>
                        </Button>
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <UsersIcon className="h-8 w-8" />
              <span>Profile</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
