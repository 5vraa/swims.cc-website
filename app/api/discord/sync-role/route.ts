import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Get user's Discord ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('discord_id')
      .eq('id', userId)
      .single()

    if (profileError || !profile?.discord_id) {
      return NextResponse.json(
        { error: 'User not found or no Discord ID' },
        { status: 404 }
      )
    }

    // Check Discord role
    const roleCheckResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/discord/check-role`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ discordId: profile.discord_id })
    })

    if (!roleCheckResponse.ok) {
      throw new Error('Failed to check Discord role')
    }

    const roleData = await roleCheckResponse.json()
    
    if (roleData.hasStaffRole) {
      // Update user role to admin
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', userId)

      if (updateError) {
        throw updateError
      }

      return NextResponse.json({
        success: true,
        message: 'Role synced successfully',
        newRole: 'admin'
      })
    } else {
      return NextResponse.json({
        success: true,
        message: 'No staff role found',
        newRole: null
      })
    }

  } catch (error) {
    console.error('Error syncing Discord role:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
