import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { createClient } from '@/lib/supabase/server'
import { hasDiscordRole } from '@/lib/discord/server'

export const metadata: Metadata = {
  title: 'swims.cc',
  description: 'Created with love',
  generator: 'swims.cc',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let showStaff = false
  let username: string | null = null
  if (user) {
    const identities = Array.isArray((user as any).identities) ? ((user as any).identities as any[]) : []
    const discordLinked = identities.some((i) => i.provider === 'discord')
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, username')
      .eq('user_id', user.id)
      .single()
    username = profile?.username || null
    let roleOK = profile?.role === 'admin' || profile?.role === 'moderator'
    if (!roleOK && discordLinked) {
      const discordId = identities.find((i) => i.provider === 'discord')?.identity_data?.user_id
      if (discordId) {
        roleOK = await hasDiscordRole(discordId, process.env.DISCORD_STAFF_ROLE_ID || '')
      }
    }
    showStaff = discordLinked && roleOK
  }

  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen bg-background text-foreground">
        <SiteHeader user={user} username={username} showStaff={showStaff} />
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  )
}