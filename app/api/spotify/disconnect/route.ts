import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get user from auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Remove Spotify connection from profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        spotify_connected: false,
        spotify_username: null,
        spotify_access_token: null,
        spotify_refresh_token: null,
        spotify_token_expires_at: null
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error removing Spotify connection:', updateError)
      return NextResponse.json({ error: 'Failed to remove Spotify connection' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error in Spotify disconnect:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
