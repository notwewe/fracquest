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
    pathname.endsWith(".js") ||
    pathname.endsWith(".webp")
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
    pathname === "/api/auth/callback" ||
    pathname === "/auth/logout"
  ) {
    return res
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const allCookies = request.cookies.getAll()
          console.log(`🍪 [${pathname}] Cookies:`, allCookies.length)
          allCookies.forEach(c => {
            console.log(`   - ${c.name}: ${c.value.substring(0, 30)}...`)
          })
          return allCookies
        },
        setAll(cookiesToSet) {
          console.log(`📝 [${pathname}] Setting ${cookiesToSet.length} cookies`)
          cookiesToSet.forEach(({ name, value, options }) => {
            // Ensure cookies work in production by setting explicit options
            const cookieOptions = {
              ...options,
              httpOnly: options?.httpOnly ?? true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax' as const,
              path: '/',
            }
            
            console.log(`   + ${name} (maxAge: ${options?.maxAge}, secure: ${cookieOptions.secure})`)
            request.cookies.set(name, value)
            res.cookies.set(name, value, cookieOptions)
          })
        },
      },
    }
  )

  // Validate session with the server
  const {
    data: { user },
    error
  } = await supabase.auth.getUser()

  console.log(`🔐 [${pathname}] Auth:`, user ? `✅ ${user.id.substring(0, 8)}` : `❌ No user`, error ? `Error: ${error.message}` : '')

  // If there's no user, redirect to login (except for auth pages)
  if (!user) {
    if (pathname.startsWith("/auth/")) {
      return res
    }
    const loginUrl = new URL("/auth/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  // User is authenticated - allow access
  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
