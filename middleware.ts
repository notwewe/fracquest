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

  // For protected routes, just let them through
  // The individual pages will handle auth checks using localStorage
  // This avoids cookie sync issues between middleware and client
  console.log(`✅ Allowing access to ${pathname} (auth check delegated to page)`)
  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
