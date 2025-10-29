import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Create response object that we'll add cookies to
    const response = NextResponse.json({ success: false })
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            // Set cookies on both the request and response
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value)
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    // Perform the login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!data.user) {
      return NextResponse.json({ error: 'No user returned' }, { status: 400 })
    }

    console.log('✅ Login successful for user:', data.user.id)

    // Get user profile to determine redirect
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role_id')
      .eq('id', data.user.id)
      .single()

    let redirectUrl = '/student/dashboard'

    if (profileData) {
      if (profileData.role_id === 1) {
        // Student - check if they've seen intro
        const { data: storyData } = await supabase
          .from('story_progress')
          .select('has_seen_intro')
          .eq('student_id', data.user.id)
          .maybeSingle()

        redirectUrl = storyData?.has_seen_intro
          ? '/student/dashboard'
          : '/student/story'
      } else if (profileData.role_id === 2) {
        redirectUrl = '/teacher/dashboard'
      } else if (profileData.role_id === 3) {
        redirectUrl = '/admin/dashboard'
      }
    }

    // Return success response with cookies already set
    return NextResponse.json({ 
      success: true, 
      redirectUrl,
      user: data.user 
    }, {
      headers: response.headers, // Include the cookies we set
    })
  } catch (error: any) {
    console.error('Login API error:', error)
    return NextResponse.json(
      { error: error.message || 'An error occurred during login' },
      { status: 500 }
    )
  }
}
