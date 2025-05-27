import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PixelDashboard } from "@/components/student/pixel-dashboard"

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

  // Fix: Extract class name properly from the nested structure
  let className = ""
  if (studentClass && studentClass.classes) {
    // Handle both object and array formats
    if (Array.isArray(studentClass.classes)) {
      className = studentClass.classes[0]?.name || ""
    } else {
      className = studentClass.classes.name || ""
    }
  }

  console.log("Class data:", studentClass) // Debug log
  console.log("Class name:", className) // Debug log

  return <PixelDashboard username={profile.username || "Student"} isEnrolled={isEnrolled} className={className} />
}
