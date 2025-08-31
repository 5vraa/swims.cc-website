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

    // Get settings for the user's profile
    const { data: settings, error } = await supabase
      .from('music_player_settings')
      .select('*')
      .eq('profile_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching settings:', error)
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
    }

    // Return default settings if none exist
    if (!settings) {
      return NextResponse.json({
        player_style: 'modern',
        auto_play: false,
        show_controls: true,
        primary_color: '#ef4444',
        secondary_color: '#1f2937'
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error in music settings API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get user from auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { player_style, auto_play, show_controls, primary_color, secondary_color } = body

    // Check if settings exist
    const { data: existingSettings } = await supabase
      .from('music_player_settings')
      .select('id')
      .eq('profile_id', user.id)
      .single()

    let result
    if (existingSettings) {
      // Update existing settings
      const { data, error } = await supabase
        .from('music_player_settings')
        .update({
          player_style,
          auto_play,
          show_controls,
          primary_color,
          secondary_color
        })
        .eq('profile_id', user.id)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // Create new settings
      const { data, error } = await supabase
        .from('music_player_settings')
        .insert({
          profile_id: user.id,
          player_style,
          auto_play,
          show_controls,
          primary_color,
          secondary_color
        })
        .select()
        .single()

      if (error) throw error
      result = data
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in music settings API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
