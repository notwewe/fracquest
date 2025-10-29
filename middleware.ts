import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const pathname = request.nextUrl.pathname

  if (
    pathname.includes("/_next") ||
    pathname.includes("/api/") ||
    pathname.includes("/favicon.ico") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".css") ||
    pathname.endsWith(".js")
  ) {
    return res
  }

  if (
    pathname === "/" ||
    pathname === "/auth/login" ||
    pathname === "/auth/register" ||
    pathname === "/auth/select-role" ||
    pathname === "/auth/select-role-register" ||
    pathname === "/auth/register-redirect-test" ||
    pathname === "/auth/callback" ||
    pathname === "/api/auth/callback"
  ) {
    return res
  }

  const supabase = createMiddlewareClient({ req: request, res })

  // Refresh session if expired
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    if (pathname.startsWith("/auth/")) {
      return res
    }
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  // User is authenticated, check role-based access and account status
  const { data: profile } = await supabase
    .from("profiles")
    .select("role_id, is_active") // Select is_active
    .eq("id", session.user.id)
    .single()

  const role = profile?.role_id || 0
  const isActive = profile?.is_active !== false // Default to true if null or undefined

  // Check if account is deactivated
  if (!isActive) {
    // Sign out the user and redirect to login
    await supabase.auth.signOut()
    const loginUrl = new URL("/auth/login", request.url)
    loginUrl.searchParams.set("message", "account-deactivated")
    return NextResponse.redirect(loginUrl)
  }

  // Admin routes
  if (pathname.startsWith("/admin")) {
    if (role !== 3) {
      return NextResponse.redirect(new URL("/", request.url))
    }
    return res
  }

  // Teacher routes
  if (pathname.startsWith("/teacher")) {
    if (role !== 2 && role !== 3) {
      return NextResponse.redirect(new URL("/", request.url))
    }
    return res
  }

  // Student routes
  if (pathname.startsWith("/student")) {
    if (role !== 1 && role !== 3) {
      return NextResponse.redirect(new URL("/", request.url))
    }
    return res
  }

  // Debug routes - admin only
  if (pathname.startsWith("/debug")) {
    if (role !== 3) {
      return NextResponse.redirect(new URL("/", request.url))
    }
    return res
  }

  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
