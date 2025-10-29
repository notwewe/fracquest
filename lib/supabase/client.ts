import { createBrowserClient } from '@supabase/ssr'
import type { Database } from "@/lib/database.types"

// Create a singleton instance
let supabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null

// Create a single supabase client for the entire client-side application
export const createClient = () => {
  if (!supabaseClient) {
    supabaseClient = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return supabaseClient
}
