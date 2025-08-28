export async function hasDiscordRole(discordUserId: string, requiredRoleId: string): Promise<boolean> {
  const guildId = process.env.DISCORD_GUILD_ID
  const botToken = process.env.DISCORD_BOT_TOKEN
  if (!guildId || !botToken || !discordUserId || !requiredRoleId) return false
  try {
    const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${discordUserId}`, {
      headers: { Authorization: `Bot ${botToken}` },
      cache: 'no-store',
    })
    if (!res.ok) return false
    const data: any = await res.json()
    const roles: string[] = Array.isArray(data.roles) ? data.roles : []
    return roles.includes(requiredRoleId)
  } catch {
    return false
  }
}


