import { OpeningCutscene } from "@/components/game/opening-cutscene"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function IntroPage() {
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

  return <OpeningCutscene />
}
