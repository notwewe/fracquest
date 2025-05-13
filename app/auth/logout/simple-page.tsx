import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export default async function SimpleLogoutPage() {
  const supabase = createServerComponentClient({ cookies })

  try {
    await supabase.auth.signOut()
  } catch (error) {
    console.error("Server logout error:", error)
  }

  redirect("/auth/login")
}
