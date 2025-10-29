import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // We'll collect the cookies to set
    let responseCookies: Array<{ name: string; value: string; options: any }> = []
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            // Store cookies to set on the response later
            responseCookies = cookiesToSet
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
    console.log('🍪 Setting', responseCookies.length, 'cookies')

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

    // Create response and set all cookies
    const response = NextResponse.json({ 
      success: true, 
      redirectUrl,
      user: data.user 
    })

    // Apply all cookies to the response
    responseCookies.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options)
    })

    return response
  } catch (error: any) {
    console.error('Login API error:', error)
    return NextResponse.json(
      { error: error.message || 'An error occurred during login' },
      { status: 500 }
    )
  }
}
