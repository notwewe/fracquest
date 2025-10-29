import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"

// Create a singleton instance
let supabaseClient: ReturnType<typeof createClientComponentClient<Database>> | null = null

// Create a single supabase client for the entire client-side application
export const createClient = () => {
  if (!supabaseClient) {
    supabaseClient = createClientComponentClient<Database>()
  }
  return supabaseClient
}
