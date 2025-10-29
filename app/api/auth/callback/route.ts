import { createServerClient } from '@supabase/ssr'
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
            }
          },
        },
      }
    )

    try {
      // Exchange code for session
      await supabase.auth.exchangeCodeForSession(code)

      // Get user data
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Check if profile exists
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .maybeSingle()

        // If no profile exists, create one based on user metadata
        if (!profile && !profileError) {
          const roleId = user.user_metadata?.role_id

          if (roleId) {
            try {
              // Create profile
              const { error: insertError } = await supabase.from("profiles").insert({
                id: user.id,
                role_id: roleId,
                username: user.user_metadata?.username || user.email?.split("@")[0] || "User",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })

              if (insertError) {
                console.error("Profile creation error in callback:", insertError)
              } else {
                console.log("Profile created successfully")

                // If student, create story progress
                if (roleId === 1) {
                  try {
                    await supabase.from("story_progress").insert({
                      student_id: user.id,
                      has_seen_intro: false,
                      last_dialogue_index: 0,
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                    })
                    console.log("Story progress created successfully")
                  } catch (storyError) {
                    console.error("Error creating story progress:", storyError)
                  }
                }
              }
            } catch (err) {
              console.error("Error creating profile:", err)
            }
          }
        }
      }
    } catch (err) {
      console.error("Error in auth callback:", err)
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin + "/auth/login")
}
