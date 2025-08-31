"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    handleAuthCallback()
  }, [])

  const handleAuthCallback = async () => {
    try {
      setStatus("loading")
      setMessage("Processing authentication...")

      // Get the session from the URL hash/fragment
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error || !session) {
        throw new Error("Failed to get session")
      }

      const user = session.user
      console.log("Auth callback - User:", user)

      // Check if user already has a profile
      const { data: existingProfile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle()

      if (profileError && profileError.code !== "PGRST116") {
        console.error("Profile error:", profileError)
        throw profileError
      }

      if (existingProfile) {
        // Update existing profile with Discord info if available
        const updates: any = {}
        
        if (user.user_metadata?.discord_id) {
          updates.discord_id = user.user_metadata.discord_id
          updates.discord_username = user.user_metadata.discord_username
          updates.discord_authorized = true
        }

        if (Object.keys(updates).length > 0) {
          const { error: updateError } = await supabase
            .from("profiles")
            .update(updates)
            .eq("id", user.id)

          if (updateError) {
            console.error("Update error:", updateError)
          }
        }

        // Check Discord role if Discord auth
        if (user.user_metadata?.discord_id) {
          try {
            const roleCheckResponse = await fetch('/api/discord/check-role', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ discordId: user.user_metadata.discord_id })
            })

            if (roleCheckResponse.ok) {
              const roleData = await roleCheckResponse.json()
              console.log("Discord role check result:", roleData)
              
              if (roleData.hasStaffRole) {
                // Update user role to admin
                const { error: roleUpdateError } = await supabase
                  .from("profiles")
                  .update({ role: "admin" })
                  .eq("id", user.id)

                if (roleUpdateError) {
                  console.error("Role update error:", roleUpdateError)
                } else {
                  console.log("✅ Admin role assigned successfully")
                }
              }
            }
          } catch (roleError) {
            console.error("Role check error:", roleError)
          }
        }

        setStatus("success")
        setMessage("Profile updated successfully!")
        
        // Redirect to profile edit after a short delay
        setTimeout(() => {
          router.push("/profile/edit")
        }, 2000)
      } else {
        // Create new profile
        const baseUsername = String(
          user.user_metadata?.username || user.email?.split("@")[0] || "user"
        )
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, "")

        const profileData: any = {
          id: user.id,
          username: baseUsername,
          display_name: user.user_metadata?.display_name || baseUsername,
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
          hover_effects: false,
          parallax_effects: false,
          particle_effects: false
        }

        // Add Discord info if available
        if (user.user_metadata?.discord_id) {
          profileData.discord_id = user.user_metadata.discord_id
          profileData.discord_username = user.user_metadata.discord_username
          profileData.discord_authorized = true
        }

        const { error: insertError } = await supabase
          .from("profiles")
          .insert(profileData)

        if (insertError) {
          if (insertError.code === "23505") {
            // Username conflict, try with random suffix
            const randomSuffix = Math.random().toString(36).substring(2, 6)
            const newUsername = `${baseUsername}-${randomSuffix}`
            
            const { error: retryError } = await supabase
              .from("profiles")
              .insert({
                ...profileData,
                username: newUsername,
                display_name: newUsername
              })

            if (retryError) {
              throw retryError
            }
          } else {
            throw insertError
          }
        }

        // Check Discord role for new users
        if (user.user_metadata?.discord_id) {
          try {
            const roleCheckResponse = await fetch('/api/discord/check-role', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ discordId: user.user_metadata.discord_id })
            })

            if (roleCheckResponse.ok) {
              const roleData = await roleCheckResponse.json()
              console.log("Discord role check result:", roleData)
              
              if (roleData.hasStaffRole) {
                // Update user role to admin
                const { error: roleUpdateError } = await supabase
                  .from("profiles")
                  .update({ role: "admin" })
                  .eq("id", user.id)

                if (roleUpdateError) {
                  console.error("Role update error:", roleUpdateError)
                } else {
                  console.log("✅ Admin role assigned successfully")
                }
              }
            }
          } catch (roleError) {
            console.error("Role check error:", roleError)
          }
        }

        setStatus("success")
        setMessage("Profile created successfully!")
        
        // Redirect to profile edit after a short delay
        setTimeout(() => {
          router.push("/profile/edit")
        }, 2000)
      }
    } catch (error) {
      console.error("Auth callback error:", error)
      setStatus("error")
      setMessage(error instanceof Error ? error.message : "Authentication failed")
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
            <h2 className="text-xl font-semibold mb-2">Processing Authentication</h2>
            <p className="text-muted-foreground">{message}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-8 h-8 mx-auto mb-4 text-green-500" />
            <h2 className="text-xl font-semibold mb-2">Authentication Successful!</h2>
            <p className="text-muted-foreground mb-4">{message}</p>
            <p className="text-sm text-muted-foreground">Redirecting to your profile...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-semibold mb-2">Authentication Failed</h2>
            <p className="text-muted-foreground mb-4">{message}</p>
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/auth/login">Try Again</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
