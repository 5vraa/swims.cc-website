import { SiteHeader } from '@/components/site-header'
import { createClient } from '@/lib/supabase/server'
import { hasDiscordRole } from '@/lib/discord/server'

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let showStaff = false
  let username: string | null = null
  if (user) {
    const identities = Array.isArray((user as any).identities) ? ((user as any).identities as any[]) : []
    const discordLinked = identities.some((i) => i.provider === 'discord')
    
    // Get profile data
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, username')
      .eq('user_id', user.id)
      .single()
    
    username = profile?.username || null
    
    // Check multiple sources for admin role
    let roleOK = false
    
    // Check profile role first
    if (profile?.role === 'admin' || profile?.role === 'moderator') {
      roleOK = true
    }
    
    // Check user metadata if profile role doesn't work
    if (!roleOK && user.user_metadata?.role === 'admin') {
      roleOK = true
    }
    
    // Check Discord role as fallback
    if (!roleOK && discordLinked) {
      const discordId = identities.find((i) => i.provider === 'discord')?.identity_data?.user_id
      if (discordId) {
        roleOK = await hasDiscordRole(discordId, process.env.DISCORD_STAFF_ROLE_ID || '')
      }
    }
    
    showStaff = roleOK
  }

  return (
    <div className="min-h-screen bg-[#0f0b0c]">
      <SiteHeader />
      <main className="flex-1 relative z-10 bg-[#0f0b0c]">
        {children}
      </main>
    </div>
  )
}
