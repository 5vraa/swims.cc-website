import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current user session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Redirect to Supabase Discord OAuth
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?provider=discord`,
        scopes: 'identify guilds guilds.members.read'
      }
    })

    if (error) {
      console.error('Discord OAuth error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Redirect to Discord OAuth
    return NextResponse.redirect(data.url)

  } catch (error) {
    console.error('Discord OAuth handler error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
