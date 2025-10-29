import { createBrowserClient } from '@supabase/ssr'
import type { Database } from "@/lib/database.types"

// Create a single supabase client for the entire client-side application
export const createClient = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // Read from localStorage first, then cookies
          if (typeof window !== 'undefined') {
            const item = localStorage.getItem(name)
            if (item) return item
            
            // Fallback to cookies
            const value = `; ${document.cookie}`
            const parts = value.split(`; ${name}=`)
            if (parts.length === 2) return parts.pop()?.split(';').shift()
          }
          return undefined
        },
        set(name: string, value: string, options: any) {
          if (typeof window !== 'undefined') {
            // Store in localStorage
            localStorage.setItem(name, value)
            
            // Also set cookie for SSR
            const cookieOptions = {
              ...options,
              path: '/',
              sameSite: 'lax' as const,
            }
            
            let cookieString = `${name}=${value}`
            if (cookieOptions.maxAge) cookieString += `; max-age=${cookieOptions.maxAge}`
            if (cookieOptions.path) cookieString += `; path=${cookieOptions.path}`
            if (cookieOptions.domain) cookieString += `; domain=${cookieOptions.domain}`
            if (cookieOptions.sameSite) cookieString += `; samesite=${cookieOptions.sameSite}`
            if (cookieOptions.secure) cookieString += `; secure`
            
            document.cookie = cookieString
            console.log('Set cookie+localStorage:', name)
          }
        },
        remove(name: string, options: any) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem(name)
            
            const cookieOptions = {
              ...options,
              path: '/',
              maxAge: -1,
            }
            document.cookie = `${name}=; path=${cookieOptions.path}; max-age=${cookieOptions.maxAge}`
            console.log('Removed cookie+localStorage:', name)
          }
        },
      },
    }
  )
}


