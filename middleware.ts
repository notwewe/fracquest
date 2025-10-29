import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })
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

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) => 
            res.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Validate session with the server
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  // If there's no user, redirect to login (except for auth pages)
  if (!user) {
    if (pathname.startsWith("/auth/")) {
      return res
    }
    console.log("No user found in middleware, redirecting to login")
    const loginUrl = new URL("/auth/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  // User is authenticated - just allow access
  // Role-based checks are now handled by the individual pages for simplicity
  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
