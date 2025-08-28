import { createClient } from "@/lib/supabase/server"

export async function isAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return false

    const { data: profile } = await supabase.from("profiles").select("role").eq("user_id", user.id).single()

    return profile?.role === "admin" || profile?.role === "moderator"
  } catch (error) {
    console.error("[v0] Error checking admin status:", error)
    return false
  }
}

export async function logAdminAction(
  action: string,
  targetType?: string,
  targetId?: string,
  details?: Record<string, any>,
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    await supabase.from("admin_logs").insert({
      admin_id: user.id,
      action,
      target_type: targetType,
      target_id: targetId,
      details: details || {},
    })
  } catch (error) {
    console.error("[v0] Error logging admin action:", error)
  }
}
