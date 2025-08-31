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

    const body = await request.json()
    const { discord_user_id, role } = body

    if (!discord_user_id || !role) {
      return NextResponse.json({ error: 'Discord user ID and role required' }, { status: 400 })
    }

    // Update user's Discord role in profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        discord_user_id,
        discord_role: role
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating Discord role:', updateError)
      return NextResponse.json({ error: 'Failed to update Discord role' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error syncing Discord role:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
