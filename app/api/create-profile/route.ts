import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (existingProfile) {
      return NextResponse.json({ 
        message: "Profile already exists",
        profile: existingProfile 
      })
    }

    // Create new profile
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
      .select()
      .single()

    if (createError) {
      console.error('Error creating profile:', createError)
      return NextResponse.json({ 
        error: 'Failed to create profile',
        details: createError.message
      }, { status: 500 })
    }

    return NextResponse.json({ 
      message: "Profile created successfully",
      profile: newProfile 
    })
    
  } catch (error) {
    console.error('Create profile error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
