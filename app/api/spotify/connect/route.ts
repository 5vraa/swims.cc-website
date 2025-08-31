import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get user from auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { code, state } = body

    if (!code) {
      return NextResponse.json({ error: 'Authorization code required' }, { status: 400 })
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL}/api/spotify/callback`
      })
    })

    if (!tokenResponse.ok) {
      console.error('Spotify token error:', await tokenResponse.text())
      return NextResponse.json({ error: 'Failed to get Spotify access token' }, { status: 400 })
    }

    const tokenData = await tokenResponse.json()
    const { access_token, refresh_token, expires_in } = tokenData

    // Get user profile from Spotify
    const profileResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    })

    if (!profileResponse.ok) {
      return NextResponse.json({ error: 'Failed to get Spotify profile' }, { status: 400 })
    }

    const spotifyProfile = await profileResponse.json()

    // Update user profile with Spotify info
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        spotify_connected: true,
        spotify_username: spotifyProfile.display_name,
        spotify_access_token: access_token,
        spotify_refresh_token: refresh_token,
        spotify_token_expires_at: new Date(Date.now() + expires_in * 1000).toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating profile with Spotify info:', updateError)
      return NextResponse.json({ error: 'Failed to save Spotify connection' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      spotify_username: spotifyProfile.display_name 
    })

  } catch (error) {
    console.error('Error in Spotify connect:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
