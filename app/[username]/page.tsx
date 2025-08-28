"use client"

import React, { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AnimatedProfile } from "@/components/animated-profile"
import { RevealPage } from "@/components/reveal-page"
import Link from "next/link"
import { notFound } from "next/navigation"

interface Profile {
  id: string
  user_id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  background_color: string
  background_image_url: string | null
  is_public: boolean
  reveal_type: "none" | "age" | "content" | "nsfw" | "custom"
  reveal_title: string | null
  reveal_description: string | null
  reveal_min_age: number
  reveal_custom_message: string | null
  view_count: number
}

interface MusicData {
  tracks: any[]
  settings: any
}

export default function PublicProfilePage({ params }: { params: { username: string } }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [socialLinks, setSocialLinks] = useState<any[]>([])
  const [musicData, setMusicData] = useState<MusicData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRevealed, setIsRevealed] = useState(false)
  const supabase = createClient()
  const { username } = (React as any).use ? (React as any).use(params) : params
  const normalizedUsername = typeof username === "string" ? username.trim().toLowerCase() : ""

  const reservedRoutes = new Set([
    "auth",
    "admin",
    "privacy",
    "terms",
    "changelog",
    "status",
    "copyright",
    "redeem",
    "profile",
    "dashboard",
  ])

  useEffect(() => {
    if (!normalizedUsername || reservedRoutes.has(normalizedUsername)) {
      notFound()
      return
    }
    // Debug: verify which username is being resolved
    try { console.debug("PublicProfilePage username:", normalizedUsername) } catch {}
    loadProfile()
  }, [normalizedUsername])

  const loadProfile = async () => {
    try {
      // Get profile by username
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .ilike("username", normalizedUsername)
        .eq("is_public", true)
        .maybeSingle()

      if (profileError) {
        try { console.error("Supabase profile error:", profileError) } catch {}
        if (profileError.code === "PGRST116") {
          notFound()
        }
        throw profileError
      }

      if (!profileData) {
        notFound()
      }

      setProfile(profileData)

      const socialResponse = await fetch(`/api/social-links/public/${profileData.user_id}`)
      if (socialResponse.ok) {
        const socialData = await socialResponse.json()
        setSocialLinks(socialData)
      }

      // Load music data
      const musicResponse = await fetch(`/api/music/public/${profileData.user_id}`)
      if (musicResponse.ok) {
        const musicData = await musicResponse.json()
        setMusicData(musicData)
      }

      await fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile_id: profileData.id,
          event_type: "profile_view",
        }),
      })

      if (profileData.reveal_type === "none") {
        setIsRevealed(true)
      }
    } catch (error) {
      console.error("Error loading profile:", error)
      setError("Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  const handleReveal = () => {
    setIsRevealed(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <Card className="w-full max-w-md bg-black/40 backdrop-blur-xl border-red-500/20">
          <CardContent className="p-6 text-center">
            <p className="text-gray-400 mb-4">Profile not found or not public</p>
            <Button asChild className="bg-red-600 hover:bg-red-700">
              <Link href="/">Go Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isRevealed && profile.reveal_type !== "none") {
    return (
      <RevealPage
        type={profile.reveal_type}
        title={profile.reveal_title || undefined}
        description={profile.reveal_description || undefined}
        minAge={profile.reveal_min_age || 18}
        customMessage={profile.reveal_custom_message || undefined}
        onReveal={handleReveal}
      >
        <div />
      </RevealPage>
    )
  }

  return (
    <AnimatedProfile
      profile={profile}
      socialLinks={socialLinks}
      musicTracks={musicData?.tracks || []}
      musicSettings={musicData?.settings}
    />
  )
}
