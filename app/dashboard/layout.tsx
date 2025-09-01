import { SiteHeader } from '@/components/site-header'
import { createClient } from '@/lib/supabase/server'
import { hasDiscordRole } from '@/lib/discord/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If no user, redirect to login
  if (!user) {
    redirect('/auth/login')
  }

  let showStaff = false
  let username: string | null = null
  
  try {
    const identities = Array.isArray((user as any).identities) ? ((user as any).identities as any[]) : []
    const discordLinked = identities.some((i) => i.provider === 'discord')
    
    // Get profile data with better error handling
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, username')
      .eq('user_id', user.id)
      .maybeSingle() // Use maybeSingle instead of single to handle missing profiles
    
    // If profile doesn't exist, create a basic one
    if (profileError && profileError.code === 'PGRST116') {
      console.log('Profile not found, creating basic profile for user:', user.id)
      
      const baseUsername = String(
        (user.user_metadata as any)?.username || (user.email || "user").split("@")[0],
      )
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "")

      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          user_id: user.id,
          username: `${baseUsername}-${Date.now()}`,
          display_name: (user.user_metadata as any)?.display_name || baseUsername,
          email: user.email,
          is_public: true,
          background_color: "#000000",
          card_outline_color: "#ef4444",
          card_glow_color: "#ef4444",
          card_glow_intensity: 0.5,
          background_blur: 0,
          font_family: "Inter",
          font_size: "16px",
          font_color: "#ffffff",
          hover_effects: true,
          parallax_effects: true,
          particle_effects: true,
          reveal_enabled: true,
          reveal_title: "Reveal Page",
          reveal_message: "This is a reveal page",
          reveal_button: "Reveal"
        })
        .select('role, username')
        .single()

      if (createError) {
        console.error('Error creating profile:', createError)
        // Continue with null profile rather than redirecting
        username = null
        showStaff = false
      } else {
        username = newProfile?.username || null
        showStaff = newProfile?.role === 'admin' || newProfile?.role === 'moderator'
      }
    } else if (profileError) {
      console.error('Profile error:', profileError)
      // Continue with null profile rather than redirecting
      username = null
      showStaff = false
    } else {
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
      
      // Check Discord role as fallback (with timeout)
      if (!roleOK && discordLinked) {
        try {
          const discordId = identities.find((i) => i.provider === 'discord')?.identity_data?.user_id
          if (discordId) {
            // Add timeout to prevent hanging
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout')), 2000)
            )
            const rolePromise = hasDiscordRole(discordId, process.env.DISCORD_STAFF_ROLE_ID || '')
            roleOK = await Promise.race([rolePromise, timeoutPromise]) as boolean
          }
        } catch (error) {
          console.error('Discord role check failed:', error)
          roleOK = false
        }
      }
      
      showStaff = roleOK
    }
  } catch (error) {
    console.error('Error loading user profile in dashboard layout:', error)
    // Continue with default values rather than redirecting
    username = null
    showStaff = false
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="flex-1 relative z-10 bg-background">
        {children}
      </main>
    </div>
  )
}
