import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: tracks, error } = await supabase
      .from("music_tracks")
      .select("*")
      .eq("user_id", user.id)
      .order("sort_order", { ascending: true })
      .limit(1)

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch music tracks" }, { status: 500 })
    }

    return NextResponse.json(tracks || [])
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, artist, audio_url, cover_image_url, sort_order, is_visible } = body

    // Ensure only one visible track per user: hide others
    await supabase.from("music_tracks").update({ is_visible: false }).eq("user_id", user.id)

    const { data: track, error } = await supabase
      .from("music_tracks")
      .insert({
        user_id: user.id,
        title,
        artist,
        audio_url,
        cover_image_url,
        sort_order: sort_order ?? 0,
        is_visible: is_visible ?? true,
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to create music track" }, { status: 500 })
    }

    return NextResponse.json(track)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
