import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const supabase = await createClient()

    const { data: links, error } = await supabase
      .from("social_links")
      .select("*")
      .eq("user_id", params.userId)
      .eq("is_visible", true)
      .order("sort_order", { ascending: true })

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
