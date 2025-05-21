import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export default async function LogoutPage() {
  // Create a server component client
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  try {
    // Sign out the user
    await supabase.auth.signOut()
  } catch (error) {
    console.error("Logout error:", error)
    // Continue with redirect even if there's an error
  }

  // Redirect to login page
  redirect("/auth/login")
}
