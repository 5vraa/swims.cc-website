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
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
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
      console.log('Role OK from profile:', profile.role)
    }
    
    // Check user metadata if profile role doesn't work
    if (!roleOK && user.user_metadata?.role === 'admin') {
      roleOK = true
    }
    
    // Check Discord role as fallback
    if (!roleOK && discordLinked) {
      const discordId = identities.find((i) => i.provider === 'discord')?.identity_data?.user_id
      if (discordId) {
        console.log('Attempting Discord role check for:', discordId)
        console.log('Using staff role ID:', process.env.DISCORD_STAFF_ROLE_ID)
        roleOK = await hasDiscordRole(discordId, process.env.DISCORD_STAFF_ROLE_ID || '')
        console.log('Discord role check result:', roleOK)
      }
    }
    
    showStaff = roleOK
    
    // Debug logging
    console.log('Staff check debug:', {
      userId: user.id,
      profileRole: profile?.role,
      userMetadataRole: user.user_metadata?.role,
      discordLinked,
      roleOK,
      showStaff,
      envVars: {
        DISCORD_STAFF_ROLE_ID: process.env.DISCORD_STAFF_ROLE_ID,
        DISCORD_GUILD_ID: process.env.DISCORD_GUILD_ID,
        DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN ? 'present' : 'missing'
      }
    })
  }

  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen bg-[#0f0b0c] text-foreground">
        <SiteHeader />
        <main className="flex-1 relative z-10 bg-[#0f0b0c]">
          {children}
        </main>
        
        {/* Global Footer */}
        <footer className="border-t border-border/30 py-16 px-4 bg-black/50 backdrop-blur-sm">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
              <div className="md:col-span-1">
                <div className="flex items-center space-x-3 mb-4">
                  <img
                    src="/images/sitelogo.png"
                    alt="swims.cc logo"
                    className="w-6 h-6 object-contain"
                  />
                  <h3 className="text-xl font-bold text-white">swims.cc</h3>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  Create feature-rich, customizable and modern link-in-bio pages with swims.cc.
                </p>
                <div className="flex space-x-3">
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </a>
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4">General</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="/auth/login" className="text-gray-400 hover:text-red-400 transition-colors">
                      Login
                    </a>
                  </li>
                  <li>
                    <a href="/auth/signup" className="text-gray-400 hover:text-red-400 transition-colors">
                      Sign Up
                    </a>
                  </li>
                  <li>
                    <a href="#pricing" className="text-gray-400 hover:text-red-400 transition-colors">
                      Pricing
                    </a>
                  </li>
                  <li>
                    <a href="/status" className="text-gray-400 hover:text-red-400 transition-colors">
                      Website Status
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4">Resources</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="/page/help" className="text-gray-400 hover:text-red-400 transition-colors">
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a href="/page/changelog" className="text-gray-400 hover:text-red-400 transition-colors">
                      Changelog
                    </a>
                  </li>
                  <li>
                    <a href="/page/redeem" className="text-gray-400 hover:text-red-400 transition-colors">
                      Redeem Code
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4">Contact</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#" className="text-gray-400 hover:text-red-400 transition-colors">
                      Discord Server
                    </a>
                  </li>
                  <li>
                    <a href="mailto:support@swims.cc" className="text-gray-400 hover:text-red-400 transition-colors">
                      Support Email
                    </a>
                  </li>
                  <li>
                    <a href="mailto:business@swims.cc" className="text-gray-400 hover:text-red-400 transition-colors">
                      Business Email
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="/page/terms" className="text-gray-400 hover:text-red-400 transition-colors">
                      Terms of Service
                    </a>
                  </li>
                  <li>
                    <a href="/page/copyright" className="text-gray-400 hover:text-red-400 transition-colors">
                      Copyright Policy
                    </a>
                  </li>
                  <li>
                    <a href="/page/privacy" className="text-gray-400 hover:text-red-400 transition-colors">
                      Privacy Policy
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-800 text-center">
              <p className="text-gray-400 text-sm">Copyright © 2025 swims.cc - All Rights Reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}