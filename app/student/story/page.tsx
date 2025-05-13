import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SimpleStoryDialogue } from "@/components/game/simple-story-dialogue"

export default async function StoryPage() {
  const supabase = createClient()

  // Check if user is authenticated and is a student
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role_id").eq("id", user.id).single()

  if (!profile || profile.role_id !== 1) {
    redirect("/auth/login")
  }

  // Check if student has already seen the intro
  const { data: storyProgress } = await supabase
    .from("story_progress")
    .select("has_seen_intro")
    .eq("student_id", user.id)
    .single()

  if (storyProgress && storyProgress.has_seen_intro) {
    redirect("/student/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-100 p-4">
      <SimpleStoryDialogue />
    </div>
  )
}
