export async function hasDiscordRole(discordUserId: string, requiredRoleId: string): Promise<boolean> {
  const guildId = process.env.DISCORD_GUILD_ID
  const botToken = process.env.DISCORD_BOT_TOKEN
  
  console.log('hasDiscordRole called with:', { discordUserId, requiredRoleId, guildId, botToken: botToken ? 'present' : 'missing' })
  
  if (!guildId || !botToken || !discordUserId || !requiredRoleId) {
    console.log('Missing required parameters for Discord role check')
    return false
  }
  
  try {
    const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${discordUserId}`, {
      headers: { Authorization: `Bot ${botToken}` },
      cache: 'no-store',
    })
    
    console.log('Discord API response status:', res.status)
    
    if (!res.ok) return false
    const data: any = await res.json()
    const roles: string[] = Array.isArray(data.roles) ? data.roles : []
    
    console.log('User roles from Discord:', roles)
    console.log('Checking if user has role:', requiredRoleId)
    
    const hasRole = roles.includes(requiredRoleId)
    console.log('Role check result:', hasRole)
    
    return hasRole
  } catch (error) {
    console.error('Error in hasDiscordRole:', error)
    return false
  }
}


