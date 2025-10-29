import { createBrowserClient } from '@supabase/ssr'
import type { Database } from "@/lib/database.types"

// Create a single supabase client for the entire client-side application
export const createClient = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
