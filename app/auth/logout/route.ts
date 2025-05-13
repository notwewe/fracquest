import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url)
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    await supabase.auth.signOut()

    return NextResponse.redirect(new URL("/auth/login", request.url))
  } catch (error) {
    console.error("Logout route error:", error)
    // Even if there's an error, redirect to login
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }
}
