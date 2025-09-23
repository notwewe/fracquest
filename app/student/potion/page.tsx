import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PotionMasterGame } from "@/components/game/potion-master-game"

export default async function StudentPotion() {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-black/20 backdrop-blur-md border border-purple-500/30 rounded-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-white mb-2 text-center">
            🧪 Potion Master
          </h1>
          <p className="text-purple-200 text-center">
            Welcome to Potion Master, {profile.username}! Use fractions to brew the perfect magical potions.
          </p>
        </div>

        <PotionMasterGame />
      </div>
    </div>
  )
}
