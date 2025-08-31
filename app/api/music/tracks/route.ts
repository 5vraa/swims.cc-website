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

    // Get user's profile ID first
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('Error fetching profile:', profileError)
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get tracks for the user's profile
    const { data: tracks, error } = await supabase
      .from('music_tracks')
      .select('*')
      .eq('profile_id', profile.id)
      .order('order_index')

    if (error) {
      console.error('Error fetching tracks:', error)
      return NextResponse.json({ error: 'Failed to fetch tracks' }, { status: 500 })
    }

    return NextResponse.json(tracks || [])
  } catch (error) {
    console.error('Error in music tracks API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('Error fetching profile:', profileError)
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const body = await request.json()
    const { title, artist, audio_url, cover_image_url } = body

    // Check if user already has a track (limit to 1)
    const { data: existingTracks } = await supabase
      .from('music_tracks')
      .select('id')
      .eq('profile_id', profile.id)

    if (existingTracks && existingTracks.length >= 1) {
      return NextResponse.json({ error: 'You can only have 1 music track per profile' }, { status: 400 })
    }

    // Create new track
    const { data: track, error } = await supabase
      .from('music_tracks')
      .insert({
        profile_id: profile.id,
        title,
        artist,
        audio_url,
        cover_image_url,
        order_index: 0,
        is_visible: true
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating track:', error)
      return NextResponse.json({ error: 'Failed to create track' }, { status: 500 })
    }

    return NextResponse.json(track)
  } catch (error) {
    console.error('Error in music tracks API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
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
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('Error fetching profile:', profileError)
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get track ID from URL path
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const trackId = pathParts[pathParts.length - 1]

    if (!trackId) {
      return NextResponse.json({ error: 'Track ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const { title, artist, audio_url, cover_image_url, is_visible } = body

    // Update track
    const { data: track, error } = await supabase
      .from('music_tracks')
      .update({
        title,
        artist,
        audio_url,
        cover_image_url,
        is_visible
      })
      .eq('id', trackId)
      .eq('profile_id', profile.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating track:', error)
      return NextResponse.json({ error: 'Failed to update track' }, { status: 500 })
    }

    return NextResponse.json(track)
  } catch (error) {
    console.error('Error in music tracks API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
