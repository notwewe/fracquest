import { createServerClient } from '@supabase/ssr'
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { name, description } = await request.json()

    // Create a client with service role capabilities
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

    // Get the authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "You must be logged in to create a class" }, { status: 401 })
    }

    // Verify the user is a teacher
    const { data: profile } = await supabase.from("profiles").select("role_id").eq("id", user.id).single()

    if (!profile || profile.role_id !== 2) {
      return NextResponse.json({ error: "Only teachers can create classes" }, { status: 403 })
    }

    // Generate a class code
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let class_code = ""
    for (let i = 0; i < 6; i++) {
      class_code += characters.charAt(Math.floor(Math.random() * characters.length))
    }

    // Create the class using a raw SQL query to bypass RLS
    // This is safer than using service role keys in client code
    const { data, error } = await supabase.rpc("create_class", {
      p_name: name,
      p_description: description,
      p_teacher_id: user.id,
      p_class_code: class_code,
    })

    if (error) {
      console.error("Error creating class:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data,
      message: "Class created successfully",
    })
  } catch (error: any) {
    console.error("Error in class creation API:", error)
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 })
  }
}
