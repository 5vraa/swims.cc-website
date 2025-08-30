import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function getSpotifyAccessToken() {
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials'
      })
    })

    if (!response.ok) {
      throw new Error('Failed to get Spotify access token')
    }

    const data = await response.json()
    return data.access_token
  } catch (error) {
    console.error('Error getting Spotify access token:', error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user token with Supabase
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if user has Spotify connected
    const { data: profile } = await supabase
      .from('profiles')
      .select('spotify_connected')
      .eq('id', user.id)
      .single()

    if (!profile?.spotify_connected) {
      return NextResponse.json({ error: 'Spotify not connected' }, { status: 403 })
    }

    // Get search query
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json({ error: 'Query parameter required' }, { status: 400 })
    }

    // Get Spotify access token
    const accessToken = await getSpotifyAccessToken()
    if (!accessToken) {
      return NextResponse.json({ error: 'Failed to authenticate with Spotify' }, { status: 500 })
    }

    // Search Spotify
    const searchResponse = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=20`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    )

    if (!searchResponse.ok) {
      throw new Error('Spotify search failed')
    }

    const searchData = await searchResponse.json()
    
    // Format tracks for the frontend
    const tracks = searchData.tracks.items.map((track: any) => ({
      id: track.id,
      name: track.name,
      artists: track.artists,
      album: {
        name: track.album.name,
        images: track.album.images
      },
      duration_ms: track.duration_ms,
      external_urls: track.external_urls,
      uri: track.uri
    }))

    return NextResponse.json({ tracks })

  } catch (error) {
    console.error('Spotify search error:', error)
    return NextResponse.json(
      { error: 'Failed to search Spotify' }, 
      { status: 500 }
    )
  }
}
