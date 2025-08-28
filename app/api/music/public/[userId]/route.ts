import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const supabase = await createClient()
    const { userId } = await params

    // Get music tracks
    const { data: tracks, error: tracksError } = await supabase
      .from("music_tracks")
      .select("*")
      .eq("user_id", userId)
      .eq("is_visible", true)
      .order("sort_order", { ascending: true })

    if (tracksError) {
      console.error("Database error:", tracksError)
      return NextResponse.json({ error: "Failed to fetch music tracks" }, { status: 500 })
    }

    // Get player settings
    const { data: settings, error: settingsError } = await supabase
      .from("music_settings")
      .select("*")
      .eq("user_id", userId)
      .single()

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
