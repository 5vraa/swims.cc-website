import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { profile_id, event_type, event_data } = body

    if (!profile_id || profile_id === "undefined") {
      return NextResponse.json({ error: "Missing or invalid profile_id" }, { status: 400 })
    }

    if (!event_type) {
      return NextResponse.json({ error: "Missing event_type" }, { status: 400 })
    }

    // Get visitor info
    const ip_address = request.ip || request.headers.get("x-forwarded-for") || "unknown"
    const user_agent = request.headers.get("user-agent") || "unknown"

    const { error } = await supabase.from("analytics_events").insert({
      profile_id,
      event_type,
      event_data: event_data || {},
      ip_address,
      user_agent,
    })

    if (error) {
      console.error("Analytics error:", error)
      return NextResponse.json({ error: "Failed to record analytics" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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

    // Return a simple count of events for the current user's profile(s)
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)

    if (profilesError || !profiles?.length) {
      return NextResponse.json({ views: 0, events: 0 })
    }

    const profileIds = profiles.map((p: any) => p.id)
    const { count, error: countError } = await supabase
      .from("analytics_events")
      .select("id", { count: "exact", head: true })
      .in("profile_id", profileIds)

    if (countError) {
      console.error("Analytics count error:", countError)
      return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
    }

    return NextResponse.json({ views: count ?? 0, events: count ?? 0 })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
