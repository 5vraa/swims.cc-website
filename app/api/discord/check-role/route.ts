import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { discordId } = await request.json()

    if (!discordId) {
      return NextResponse.json(
        { error: 'Discord ID is required' },
        { status: 400 }
      )
    }

    console.log('Checking Discord role for:', discordId)

    // Check if we have the required environment variables
    const botToken = process.env.DISCORD_BOT_TOKEN
    const guildId = process.env.DISCORD_GUILD_ID
    const staffRoleId = process.env.DISCORD_STAFF_ROLE_ID || '1404371407961460757'

    console.log('Environment variables:', {
      botToken: botToken ? 'present' : 'missing',
      guildId: guildId ? 'present' : 'missing',
      staffRoleId
    })

    if (!botToken || !guildId) {
      console.log('Missing Discord environment variables, using fallback check')
      
      // Fallback: Check if this is a known admin Discord ID
      const knownAdminIds: string[] = []
      const hasStaffRole = knownAdminIds.includes(discordId)
      
      return NextResponse.json({
        hasStaffRole,
        roles: [],
        staffRoleId,
        message: 'Using fallback admin check'
      })
    }

    try {
      // Fetch member from Discord API
      const response = await fetch(
        `https://discord.com/api/v10/guilds/${guildId}/members/${discordId}`,
        {
          headers: {
            Authorization: `Bot ${botToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      console.log('Discord API response status:', response.status)

      if (!response.ok) {
        if (response.status === 404) {
          // User not in guild
          console.log('User not found in Discord server')
          return NextResponse.json({
            hasStaffRole: false,
            roles: [],
            staffRoleId,
            message: 'User not found in Discord server'
          })
        }
        throw new Error(`Discord API error: ${response.status}`)
      }

      const member = await response.json()
      const roles = member.roles || []
      
      console.log('User roles from Discord:', roles)
      console.log('Checking if user has role:', staffRoleId)
      
      // Check if user has the staff role
      const hasStaffRole = roles.includes(staffRoleId)

      console.log('Role check result:', hasStaffRole)

      return NextResponse.json({
        hasStaffRole,
        roles,
        staffRoleId,
        message: 'Role check completed successfully'
      })

    } catch (discordError) {
      console.error('Error checking Discord role:', discordError)
      
      // Fallback to known admin IDs if Discord API fails
      const knownAdminIds: string[] = []
      const hasStaffRole = knownAdminIds.includes(discordId)
      
      return NextResponse.json({
        hasStaffRole,
        roles: [],
        staffRoleId,
        message: 'Discord API failed, using fallback check'
      })
    }

  } catch (error) {
    console.error('Error in Discord role check:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
