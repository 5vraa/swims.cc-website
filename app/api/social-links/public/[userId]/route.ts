import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const supabase = await createClient()
    const { userId } = params

    if (!userId || userId === "undefined") {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    // First try to find social links by user_id
    let { data: links, error } = await supabase
      .from("social_links")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("position", { ascending: true })

    // If no links found, try to find by profile_id (in case the schema uses profile_id)
    if (!links || links.length === 0) {
      const { data: profileLinks, error: profileError } = await supabase
        .from("social_links")
        .select("*")
        .eq("profile_id", userId)
        .eq("is_active", true)
        .order("position", { ascending: true })
      
      if (profileLinks && profileLinks.length > 0) {
        links = profileLinks
        error = null
      }
    }

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch social links" }, { status: 500 })
    }

    return NextResponse.json(links || [])
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
