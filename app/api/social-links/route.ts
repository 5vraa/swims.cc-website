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

    // Get social links for the user's profile
    const { data: socialLinks, error } = await supabase
      .from('social_links')
      .select('*')
      .eq('profile_id', profile.id)
      .order('order_index')

    if (error) {
      console.error('Error fetching social links:', error)
      return NextResponse.json({ error: 'Failed to fetch social links' }, { status: 500 })
    }

    return NextResponse.json(socialLinks || [])
  } catch (error) {
    console.error('Error in social links API:', error)
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
    const { platform, url, display_name, icon, is_visible } = body

    // Create new social link
    const { data: socialLink, error } = await supabase
      .from('social_links')
      .insert({
        profile_id: profile.id,
        platform,
        url,
        display_name,
        icon,
        is_visible: is_visible ?? true,
        order_index: 0
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating social link:', error)
      return NextResponse.json({ error: 'Failed to create social link' }, { status: 500 })
    }

    return NextResponse.json(socialLink)
  } catch (error) {
    console.error('Error in social links API:', error)
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

    const body = await request.json()
    const { id, platform, url, display_name, icon, is_visible } = body

    // Update social link
    const { data: socialLink, error } = await supabase
      .from('social_links')
      .update({
        platform,
        url,
        display_name,
        icon,
        is_visible
      })
      .eq('id', id)
      .eq('profile_id', profile.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating social link:', error)
      return NextResponse.json({ error: 'Failed to update social link' }, { status: 500 })
    }

    return NextResponse.json(socialLink)
  } catch (error) {
    console.error('Error in social links API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Social link ID is required' }, { status: 400 })
    }

    // Delete social link
    const { error } = await supabase
      .from('social_links')
      .delete()
      .eq('id', id)
      .eq('profile_id', profile.id)

    if (error) {
      console.error('Error deleting social link:', error)
      return NextResponse.json({ error: 'Failed to delete social link' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in social links API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
