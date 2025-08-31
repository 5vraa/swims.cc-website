import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const supabase = await createClient()
    const { userId } = await params

    if (!userId || userId === "undefined") {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    // Get music tracks - try user_id first, then profile_id
    let { data: tracks, error: tracksError } = await supabase
      .from("music_tracks")
      .select("*")
      .eq("user_id", userId)
      .eq("is_visible", true)
      .order("sort_order", { ascending: true })

    // If no tracks found, try profile_id
    if (!tracks || tracks.length === 0) {
      const { data: profileTracks, error: profileTracksError } = await supabase
        .from("music_tracks")
        .select("*")
        .eq("profile_id", userId)
        .eq("is_visible", true)
        .order("sort_order", { ascending: true })
      
      if (profileTracks && profileTracks.length > 0) {
        tracks = profileTracks
        tracksError = null
      }
    }

    if (tracksError) {
      console.error("Database error:", tracksError)
      return NextResponse.json({ error: "Failed to fetch music tracks" }, { status: 500 })
    }

    // Get player settings - try user_id first, then profile_id
    let { data: settings, error: settingsError } = await supabase
      .from("music_settings")
      .select("*")
      .eq("user_id", userId)
      .single()

    // If no settings found, try profile_id
    if (settingsError && settingsError.code !== "PGRST116") {
      const { data: profileSettings, error: profileSettingsError } = await supabase
        .from("music_settings")
        .select("*")
        .eq("profile_id", userId)
        .single()
      
      if (profileSettings) {
        settings = profileSettings
        settingsError = null
      }
    }

    if (settingsError && settingsError.code !== "PGRST116") {
      console.error("Database error:", settingsError)
      return NextResponse.json({ error: "Failed to fetch player settings" }, { status: 500 })
    }

    return NextResponse.json({
      tracks: tracks || [],
      settings: settings || {
        player_style: "modern",
        auto_play: false,
        show_controls: true,
        primary_color: "#ef4444",
        secondary_color: "#1f2937",
      },
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
