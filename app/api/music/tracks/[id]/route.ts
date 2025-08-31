import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const trackId = params.id
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const trackId = params.id

    // Delete track
    const { error } = await supabase
      .from('music_tracks')
      .delete()
      .eq('id', trackId)
      .eq('profile_id', profile.id)

    if (error) {
      console.error('Error deleting track:', error)
      return NextResponse.json({ error: 'Failed to delete track' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in music tracks API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
