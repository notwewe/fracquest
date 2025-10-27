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
    <div 
      className="relative min-h-screen bg-cover bg-center bg-no-repeat p-4"
      style={{
        backgroundImage: "url('/potion-assets/BG_Potion.png')"
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/20"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto">
        <PotionMasterGame />
      </div>
    </div>
  )
}
