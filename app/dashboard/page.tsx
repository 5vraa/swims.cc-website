import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdvancedDashboard } from "@/components/advanced-dashboard"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  redirect("/profile/edit")
}


