import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Get the pathname from the URL
  const pathname = req.nextUrl.pathname

  // Redirect root path to login immediately
  if (pathname === "/" || pathname === "") {
    return NextResponse.redirect(new URL("/auth/login", req.url))
  }

  // Skip middleware for logout-related routes
  if (pathname.startsWith("/auth/logout") || pathname.startsWith("/api/logout")) {
    return res
  }

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Check auth condition
    const isAuthRoute = pathname.startsWith("/auth")
    const isApiRoute = pathname.startsWith("/api")
    const isCallbackRoute = pathname === "/auth/callback"

    // Always allow access to callback routes
    if (isCallbackRoute) {
      return res
    }

    // If user is logged in
    if (session) {
      // If accessing auth routes while logged in, redirect to student dashboard
      if (isAuthRoute && pathname !== "/auth/logout") {
        return NextResponse.redirect(new URL("/student/dashboard", req.url))
      }

      // Allow access to all student routes when logged in
      return res
    } else if (!isAuthRoute && !isApiRoute) {
      // If accessing protected routes while not logged in, redirect to login
      return NextResponse.redirect(new URL("/auth/login", req.url))
    }

    return res
  } catch (error) {
    console.error("Middleware error:", error)
    return res
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
}
