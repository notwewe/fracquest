import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const pathname = request.nextUrl.pathname

  // Skip middleware for static assets and API routes
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

  // Create a Supabase client configured to use cookies
  const supabase = createMiddlewareClient({ req: request, res })

  // Refresh session if expired
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If no session and trying to access protected routes
  if (!session) {
    // Allow access to public routes
    if (pathname === "/" || pathname.startsWith("/auth/") || pathname === "/api/auth/callback") {
      return res
    }

    // Redirect to login for protected routes
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  // User is authenticated, check role-based access
  const { data: profile } = await supabase.from("profiles").select("role_id").eq("id", session.user.id).single()

  const role = profile?.role_id || 0

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
