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

    // Get user's profile ID first
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, spotify_access_token')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('Error fetching profile:', profileError)
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    if (!profile.spotify_access_token) {
      return NextResponse.json({ error: 'Spotify not connected' }, { status: 400 })
    }

    const body = await request.json()
    const { playlist_id } = body

    if (!playlist_id) {
      return NextResponse.json({ error: 'Playlist ID required' }, { status: 400 })
    }

    // Fetch playlist tracks from Spotify
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlist_id}/tracks`, {
      headers: {
        'Authorization': `Bearer ${profile.spotify_access_token}`
      }
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch playlist tracks' }, { status: 400 })
    }

    const data = await response.json()
    const tracks = data.items || []

    // Import tracks to user's profile
    const importedTracks = []
    for (const item of tracks.slice(0, 5)) { // Limit to 5 tracks
      const track = item.track
      if (track) {
        const { data: importedTrack, error: importError } = await supabase
          .from('music_tracks')
          .insert({
            profile_id: profile.id,
            title: track.name,
            artist: track.artists?.[0]?.name || 'Unknown Artist',
            audio_url: track.preview_url || '',
            cover_image_url: track.album?.images?.[0]?.url || '',
            duration: Math.round(track.duration_ms / 1000),
            order_index: importedTracks.length,
            is_visible: true
          })
          .select()
          .single()

        if (!importError) {
          importedTracks.push(importedTrack)
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      imported_count: importedTracks.length,
      tracks: importedTracks 
    })

  } catch (error) {
    console.error('Error importing Spotify playlist:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
