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
    const { playlist_id, track_limit = 1 } = body

    if (!playlist_id) {
      return NextResponse.json({ error: 'Playlist ID required' }, { status: 400 })
    }

    // Get user's Spotify access token
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('spotify_access_token')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.spotify_access_token) {
      return NextResponse.json({ error: 'Spotify not connected' }, { status: 400 })
    }

    // Check if user already has a track (limit to 1)
    const { data: existingTracks } = await supabase
      .from('music_tracks')
      .select('id')
      .eq('profile_id', user.id)

    if (existingTracks && existingTracks.length >= 1) {
      return NextResponse.json({ error: 'You can only have 1 music track per profile' }, { status: 400 })
    }

    // Fetch playlist tracks from Spotify
    const tracksResponse = await fetch(
      `https://api.spotify.com/v1/playlists/${playlist_id}/tracks?limit=${track_limit}`,
      {
        headers: {
          'Authorization': `Bearer ${profile.spotify_access_token}`
        }
      }
    )

    if (!tracksResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch playlist tracks' }, { status: 400 })
    }

    const tracksData = await tracksResponse.json()
    const tracks = tracksData.items.slice(0, track_limit)

    // Import tracks to user's profile
    const importedTracks = []
    for (const item of tracks) {
      const track = item.track
      
      // Create music track
      const { data: musicTrack, error: insertError } = await supabase
        .from('music_tracks')
        .insert({
          profile_id: user.id,
          title: track.name,
          artist: track.artists.map((a: any) => a.name).join(', '),
          audio_url: track.external_urls.spotify, // Spotify preview URL
          cover_image_url: track.album.images[0]?.url,
          duration: Math.round(track.duration_ms / 1000),
          sort_order: 0,
          is_visible: true,
          spotify_track_id: track.id,
          spotify_playlist_id: playlist_id
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error inserting track:', insertError)
        continue
      }

      importedTracks.push(musicTrack)
    }

    return NextResponse.json({ 
      success: true, 
      imported_tracks: importedTracks.length,
      tracks: importedTracks
    })

  } catch (error) {
    console.error('Error importing Spotify tracks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
