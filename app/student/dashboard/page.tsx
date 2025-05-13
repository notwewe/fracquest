import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { StudentDashboardClient } from "@/components/student/student-dashboard-client"

export default async function StudentDashboard() {
  const supabase = createClient()

  // Check if user is authenticated and is a student
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role_id, username").eq("id", user.id).single()

  if (!profile || profile.role_id !== 1) {
    redirect("/auth/login")
  }

  // Check if student is enrolled in a class
  const { data: studentClass } = await supabase
    .from("student_classes")
    .select("class_id, classes(name)")
    .eq("student_id", user.id)
    .maybeSingle()

  const isEnrolled = !!studentClass

  return (
    <StudentDashboardClient
      username={profile.username || "Student"}
      isEnrolled={isEnrolled}
      className={studentClass?.classes?.name || ""}
    />
  )
}
