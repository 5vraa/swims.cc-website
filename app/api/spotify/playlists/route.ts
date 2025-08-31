import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get user from auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's Spotify access token
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('spotify_access_token, spotify_refresh_token, spotify_token_expires_at')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.spotify_access_token) {
      return NextResponse.json({ error: 'Spotify not connected' }, { status: 400 })
    }

    // Check if token is expired
    if (profile.spotify_token_expires_at && new Date(profile.spotify_token_expires_at) <= new Date()) {
      return NextResponse.json({ error: 'Spotify token expired' }, { status: 400 })
    }

    // Fetch playlists from Spotify
    const response = await fetch('https://api.spotify.com/v1/me/playlists?limit=50', {
      headers: {
        'Authorization': `Bearer ${profile.spotify_access_token}`
      }
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch Spotify playlists' }, { status: 400 })
    }

    const data = await response.json()
    return NextResponse.json(data.items || [])

  } catch (error) {
    console.error('Error fetching Spotify playlists:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
