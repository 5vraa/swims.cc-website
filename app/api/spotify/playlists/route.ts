import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get user from auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's Spotify tokens
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('spotify_access_token, spotify_refresh_token, spotify_token_expires_at')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.spotify_access_token) {
      return NextResponse.json({ error: 'Spotify not connected' }, { status: 400 })
    }

    // Check if token is expired and refresh if needed
    let accessToken = profile.spotify_access_token
    if (profile.spotify_token_expires_at && new Date(profile.spotify_token_expires_at) <= new Date()) {
      // Token expired, refresh it
      const refreshResponse = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
          ).toString('base64')}`
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: profile.spotify_refresh_token
        })
      })

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json()
        accessToken = refreshData.access_token

        // Update the token in database
        await supabase
          .from('profiles')
          .update({
            spotify_access_token: accessToken,
            spotify_token_expires_at: new Date(Date.now() + refreshData.expires_in * 1000).toISOString()
          })
          .eq('id', user.id)
      }
    }

    // Fetch user's playlists from Spotify
    const playlistsResponse = await fetch('https://api.spotify.com/v1/me/playlists?limit=50', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (!playlistsResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch Spotify playlists' }, { status: 400 })
    }

    const playlistsData = await playlistsResponse.json()
    const playlists = playlistsData.items.map((playlist: any) => ({
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      images: playlist.images,
      tracks_count: playlist.tracks.total,
      owner: playlist.owner.display_name,
      public: playlist.public
    }))

    return NextResponse.json(playlists)

  } catch (error) {
    console.error('Error fetching Spotify playlists:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
