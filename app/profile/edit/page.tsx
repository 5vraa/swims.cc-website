"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { FileUpload } from "@/components/file-upload"
import { SocialLinksManager } from "@/components/social-links-manager"
import { MusicManager } from "@/components/music-manager"
import { BadgeSelector } from "@/components/badge-selector"
import dynamic from "next/dynamic"

// Lazy load heavy components
const LazySocialLinksManager = dynamic(() => import("@/components/social-links-manager").then(mod => ({ default: mod.SocialLinksManager })), {
  loading: () => <div className="h-32 bg-gray-700 rounded animate-pulse"></div>
})

const LazyMusicManager = dynamic(() => import("@/components/music-manager").then(mod => ({ default: mod.MusicManager })), {
  loading: () => <div className="h-32 bg-gray-700 rounded animate-pulse"></div>
})

const LazyBadgeSelector = dynamic(() => import("@/components/badge-selector").then(mod => ({ default: mod.BadgeSelector })), {
  loading: () => <div className="h-32 bg-gray-700 rounded animate-pulse"></div>
})
import { SpotifyIntegration } from "@/components/spotify-integration"
import { User, LinkIcon, Music, Palette, Settings, Eye, Crown, Star, MessageCircle, Zap, Shield, Bell, Heart } from "lucide-react"

interface Profile {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  background_color: string
  background_image_url: string | null
  theme: string
  is_public: boolean
  is_premium: boolean
  is_verified: boolean
  discord_id: string | null
  discord_username: string | null
  discord_authorized: boolean
  spotify_connected: boolean
  spotify_username: string | null


  role: string | null
  view_count: number
  featured_badge_id: string | null
  card_outline_color: string
  card_glow_color: string
  card_glow_intensity: number
  background_blur: number
  font_family: string
  font_size: string
  font_color: string
  hover_effects: boolean
  parallax_effects: boolean
  particle_effects: boolean
  reveal_enabled: boolean
  reveal_title: string
  reveal_message: string
  reveal_button: string

  email: string | null
  
  // New appearance properties
  background_opacity?: number
  card_border_radius?: number
  card_background?: string
  font_weight?: string
  letter_spacing?: number
  text_shadows?: boolean
  gradient_text?: boolean
  smooth_transitions?: boolean
  custom_css?: string
}

export default function EditProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true) // Show loading initially
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("profile")
  const [discordStatus, setDiscordStatus] = useState<"connected" | "disconnected" | "checking">("checking")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletePassword, setDeletePassword] = useState("")
  const [deleteLoading, setDeleteLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadProfile()
  }, [])

  useEffect(() => {
    if (profile?.discord_id) {
      checkDiscordStatus()
    }
  }, [profile?.discord_id])

  const loadProfile = async () => {
    try {
      // Get user data first
      const { data: { user: userData }, error: userError } = await supabase.auth.getUser()

      if (userError || !userData) {
        console.error("User not authenticated:", userError)
        router.push("/auth/login")
        return
      }

      // Try to get existing profile with minimal fields first
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, username, display_name, email, discord_id")
        .eq("id", userData.id)
        .maybeSingle()

      if (profileError && profileError.code !== "PGRST116") {
        console.error("Profile error:", profileError)
        throw profileError
      }

      if (!profileData) {
        // Profile doesn't exist, create a new one with minimal data
        const baseUsername = String(
          (userData.user_metadata as any)?.username || (userData.email || "user").split("@")[0],
        )
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, "")

        // Quick username check (only check once, don't loop)
        const { data: existingUser } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", baseUsername)
          .maybeSingle()

        const finalUsername = existingUser ? `${baseUsername}-${Date.now()}` : baseUsername

        const { data: inserted, error: insertError } = await supabase
          .from("profiles")
          .insert({
            id: userData.id,
            username: finalUsername,
            display_name: (userData.user_metadata as any)?.display_name || finalUsername,
            email: userData.email,
            is_public: true,
            background_color: "#000000",
            card_outline_color: "#ef4444",
            card_glow_color: "#ef4444",
            card_glow_intensity: 0.5,
            background_blur: 0,
            font_family: "Inter",
            font_size: "16px",
            font_color: "#ffffff",
            hover_effects: true,
            parallax_effects: true,
            particle_effects: true,
            reveal_enabled: true,
            reveal_title: "Reveal Page",
            reveal_message: "This is a reveal page",
            reveal_button: "Reveal"
          })
          .select("*")
          .single()

        if (insertError) {
          console.error("Error creating profile:", insertError)
          if ((insertError as any).code === "23505") {
            setError("Username already taken. Please choose a different username in the editor.")
          } else {
            throw insertError
          }
        } else {
          setProfile(inserted as any)
          setLoading(false)
        }
      } else {
        // Profile exists, load full profile data in background
        setProfile(profileData as any)
        setLoading(false) // Show the page immediately with basic data
        
        // Load full profile data asynchronously
        setTimeout(async () => {
          try {
            const { data: fullProfile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", userData.id)
              .single()
            
            if (fullProfile) {
              setProfile(fullProfile as any)
            }
          } catch (error) {
            console.error("Error loading full profile:", error)
          }
        }, 100)
      }
      
      // Load Discord status in background (non-blocking)
      if (profileData?.discord_id) {
        setTimeout(() => checkDiscordStatus(), 200)
      }
      
    } catch (error) {
      console.error("Error loading profile:", error)
      setError("Failed to load profile. Please try refreshing the page.")
      setLoading(false)
    }
  }

  const checkDiscordStatus = async () => {
    if (!profile?.discord_id) {
      setDiscordStatus("disconnected")
      return
    }

    try {
      setDiscordStatus("checking")
      
      // Use a timeout to prevent hanging
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout
      
      const response = await fetch('/api/discord/check-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ discordId: profile.discord_id }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        setDiscordStatus("connected")
      } else {
        setDiscordStatus("disconnected")
      }
    } catch (error) {
      console.error('Error checking Discord status:', error)
      setDiscordStatus("disconnected")
    }
  }

  const connectDiscord = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error
    } catch (error) {
      console.error('Error connecting Discord:', error)
      setError('Failed to connect Discord')
    }
  }

  const disconnectDiscord = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          discord_id: null,
          discord_username: null,
          discord_authorized: false
        })
        .eq('id', profile?.id)

      if (error) throw error

      setProfile(prev => prev ? {
        ...prev,
        discord_id: null,
        discord_username: null,
        discord_authorized: false
      } : null)

      setDiscordStatus("disconnected")
      setSuccess('Discord disconnected successfully')
    } catch (error) {
      console.error('Error disconnecting Discord:', error)
      setError('Failed to disconnect Discord')
    }
  }

  const saveProfile = async () => {
    if (!profile) return

    // Validate username is not empty
    if (!profile.username || profile.username.trim() === '') {
      setError("Username is required and cannot be empty")
      return
    }

    // Validate username format
    const usernameRegex = /^[a-z0-9-]+$/
    if (!usernameRegex.test(profile.username.trim())) {
      setError("Username can only contain lowercase letters, numbers, and hyphens")
      return
    }

    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      const { error } = await supabase
        .from("profiles")
        .update({
          username: profile.username.trim(),
          display_name: profile.display_name?.trim() || null,
          bio: profile.bio?.trim() || null,
          background_color: profile.background_color,
          background_image_url: profile.background_image_url,
          theme: profile.theme,
          is_public: profile.is_public,
          card_outline_color: profile.card_outline_color,
          card_glow_color: profile.card_glow_color,
          card_glow_intensity: profile.card_glow_intensity,
          background_blur: profile.background_blur,
          font_family: profile.font_family,
          font_size: profile.font_size,
          font_color: profile.font_color,
          hover_effects: profile.hover_effects,
          parallax_effects: profile.parallax_effects,
          particle_effects: profile.particle_effects,
          reveal_enabled: profile.reveal_enabled,
          reveal_title: profile.reveal_title,
          reveal_message: profile.reveal_message,
          reveal_button: profile.reveal_button,
        })
        .eq("id", profile.id)

      if (error) {
        if (error.code === '23505') {
          throw new Error("Username is already taken. Please choose a different username.")
        }
        throw error
      }

      setSuccess("Profile saved successfully!")
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error("Error saving profile:", error)
      setError(error instanceof Error ? error.message : "Failed to save profile")
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (url: string) => {
    if (!profile) return

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: url })
        .eq("id", profile.id)

      if (error) throw error

      setProfile(prev => prev ? { ...prev, avatar_url: url } : null)
      setSuccess("Avatar updated successfully!")
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error("Error updating avatar:", error)
      setError("Failed to update avatar")
    }
  }

  const handleBannerUpload = async (url: string) => {
    if (!profile) return

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ background_image_url: url })
        .eq("id", profile.id)

      if (error) throw error

      setProfile(prev => prev ? { ...prev, background_image_url: url } : null)
      setSuccess("Banner updated successfully!")
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error("Error updating banner:", error)
      setError("Failed to update banner")
    }
  }

  const handleDeleteAccount = async () => {
    if (!profile || !deletePassword) return

    try {
      setDeleteLoading(true)
      setError(null)

      // Confirm deletion
      const confirmed = window.confirm(
        "Are you absolutely sure you want to delete your account? This action cannot be undone and will permanently delete:\n\n" +
        "• Your profile and all data\n" +
        "• Your social links\n" +
        "• Your music tracks\n" +
        "• Your analytics data\n" +
        "• All uploaded files\n\n" +
        "This action cannot be undone!"
      )

      if (!confirmed) {
        setDeleteLoading(false)
        return
      }

      // Call the delete account API
      const response = await fetch('/api/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: deletePassword }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete account')
      }

      // Clear local state immediately
      setProfile(null)
      
      // Force refresh the auth state to update the header
      await supabase.auth.refreshSession()
      
      // Small delay to ensure state is cleared
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Force a hard redirect to ensure clean state
      window.location.href = "/"
      
    } catch (error) {
      console.error("Error deleting account:", error)
      setError(error instanceof Error ? error.message : "Failed to delete account")
    } finally {
      setDeleteLoading(false)
      setShowDeleteDialog(false)
      setDeletePassword("")
    }
  }

  // Show skeleton while loading instead of full loading screen
  if (loading || !profile) {
    return (
      <div className="min-h-screen px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Dashboard Header Skeleton */}
          <div className="mb-8">
            <div className="h-10 bg-gray-700 rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-6 bg-gray-700 rounded w-80 animate-pulse"></div>
          </div>

          <div className="flex gap-8">
            {/* Left Sidebar Skeleton */}
            <div className="w-72 space-y-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-12 bg-gray-700 rounded-xl animate-pulse"></div>
              ))}
            </div>

            {/* Right Content Skeleton */}
            <div className="flex-1 space-y-6">
              <div className="h-32 bg-gray-700 rounded-xl animate-pulse"></div>
              <div className="h-48 bg-gray-700 rounded-xl animate-pulse"></div>
              <div className="h-64 bg-gray-700 rounded-xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md dashboard-card">
          <CardContent className="p-8 text-center">
            <p className="text-red-400 mb-6 text-lg">Profile not found</p>
            <Button onClick={loadProfile} className="bg-red-600 hover:bg-red-700">Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "links", label: "Links", icon: LinkIcon },
    { id: "music", label: "Music", icon: Music },
    { id: "badges", label: "Badges", icon: Crown },
    { id: "spotify", label: "Spotify", icon: Music },
    { id: "reveal", label: "Reveal", icon: Eye },
    { id: "settings", label: "Settings", icon: Settings }
  ]

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <div className="mb-8 animate-in slide-in-from-bottom-2 duration-500 delay-100">
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400 text-lg">Manage your profile and customize your bio page</p>
        </div>

        <div className="flex gap-8">
          {/* Left Sidebar */}
          <div className="sticky top-8 dashboard-sidebar rounded-2xl p-6 w-72 h-fit">
            <div className="space-y-3">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all font-medium ${
                      activeTab === tab.id
                        ? "bg-red-600/20 text-red-400 border border-red-500/30 shadow-lg shadow-red-500/10"
                        : "text-gray-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Premium Badge */}
            {profile.is_premium && (
              <div className="mt-6 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/30">
                <div className="flex items-center gap-2 text-yellow-400">
                  <Star className="w-4 h-4" />
                  <span className="text-sm font-semibold">Premium Member</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Content Area */}
          <div className="flex-1 space-y-6">
            {/* Error/Success Messages */}
            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 backdrop-blur-sm">
                {error}
              </div>
            )}
            
            {success && (
              <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-green-400 backdrop-blur-sm">
                {success}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                {/* Profile Information Section */}
                <Card className="dashboard-card">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <User className="w-6 h-6 text-blue-400" />
                      <CardTitle className="text-xl text-white">Profile Information</CardTitle>
                      <CardDescription className="text-gray-400">
                        Update your basic profile details
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="username" className="text-white font-medium">
                        Username <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        id="username"
                        value={profile.username}
                        onChange={(e) => {
                          const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
                          setProfile(prev => prev ? { ...prev, username: value } : null)
                        }}
                        className="mt-2 bg-black/30 border-gray-700/50 text-white rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Enter your username"
                        required
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Username is required and cannot be empty
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="display_name" className="text-white font-medium">Display Name</Label>
                      <Input
                        id="display_name"
                        value={profile.display_name || ""}
                        onChange={(e) => setProfile(prev => prev ? { ...prev, display_name: e.target.value } : null)}
                        placeholder="Enter your display name"
                        className="mt-2 bg-black/30 border-gray-700/50 text-white rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="bio" className="text-white font-medium">Bio</Label>
                      <Textarea
                        id="bio"
                        value={profile.bio || ""}
                        onChange={(e) => setProfile(prev => prev ? { ...prev, bio: e.target.value } : null)}
                        placeholder="Tell people about yourself..."
                        rows={3}
                        className="mt-2 bg-black/30 border-gray-700/50 text-white rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>

                    <div className="pt-4">
                      <Button 
                        onClick={saveProfile} 
                        disabled={saving} 
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl text-lg"
                      >
                        {saving ? "Saving..." : "Save Profile"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Your Badges Section */}
                <Card className="dashboard-card">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <Crown className="w-6 h-6 text-yellow-400" />
                      <CardTitle className="text-xl text-white">Your Badges</CardTitle>
                      <CardDescription className="text-gray-400">
                        Show off your achievements and status
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 dashboard-card rounded-xl text-center">
                        <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Shield className="w-6 h-6 text-red-400" />
                        </div>
                        <h4 className="text-white font-semibold mb-1">Verified</h4>
                        <p className="text-gray-400 text-sm">Account verified</p>
                      </div>
                      <div className="p-4 dashboard-card rounded-xl text-center">
                        <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Star className="w-6 h-6 text-yellow-400" />
                        </div>
                        <h4 className="text-white font-semibold mb-1">Premium</h4>
                        <p className="text-gray-400 text-sm">Premium member</p>
                      </div>
                      <div className="p-4 dashboard-card rounded-xl text-center">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Heart className="w-6 h-6 text-blue-400" />
                        </div>
                        <h4 className="text-white font-semibold mb-1">Popular</h4>
                        <p className="text-gray-400 text-sm">High engagement</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === "appearance" && (
              <div
                key="appearance"
                className="animate-in slide-in-from-bottom-2 duration-300"
              >
                <Card className="bg-black/40 backdrop-blur-xl border border-gray-800/50 shadow-2xl">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Palette className="w-6 h-6 text-purple-400" />
                    <CardTitle className="text-xl text-white">Appearance Settings</CardTitle>
                  </div>
                  <CardDescription className="text-gray-400">
                    Customize the look and feel of your profile with advanced styling options
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Background Settings */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Background Settings</h3>
                    
                    <div>
                      <Label className="text-white font-medium">Background Image (Auto-resized to 1920x1080)</Label>
                      <div className="mt-2">
                        <FileUpload
                          currentUrl={profile.background_image_url}
                          onUpload={handleBannerUpload}
                          accept="image/*"
                          type="image"
                          className="w-full"
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Your image will be automatically resized to 1920x1080 for optimal quality
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="background_color" className="text-white font-medium">Background Color</Label>
                      <div className="mt-2 flex items-center gap-3">
                        <Input
                          id="background_color"
                          type="color"
                          value={profile.background_color}
                          onChange={(e) => setProfile(prev => prev ? { ...prev, background_color: e.target.value } : null)}
                          className="w-16 h-10 p-1 bg-transparent border-gray-700/50 rounded-lg"
                        />
                        <Input
                          value={profile.background_color}
                          onChange={(e) => setProfile(prev => prev ? { ...prev, background_color: e.target.value } : null)}
                          className="bg-black/30 border-gray-700/50 text-white rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="background_blur" className="text-white font-medium">
                        Background Blur: {profile.background_blur}px
                      </Label>
                      <Input
                        id="background_blur"
                        type="range"
                        min="0"
                        max="20"
                        step="1"
                        value={profile.background_blur}
                        onChange={(e) => setProfile(prev => prev ? { ...prev, background_blur: parseInt(e.target.value) } : null)}
                        className="w-full mt-2"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Add blur effect to your background image
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="background_opacity" className="text-white font-medium">
                        Background Opacity: {profile.background_opacity || 100}%
                      </Label>
                      <Input
                        id="background_opacity"
                        type="range"
                        min="20"
                        max="100"
                        step="5"
                        value={profile.background_opacity || 100}
                        onChange={(e) => setProfile(prev => prev ? { ...prev, background_opacity: parseInt(e.target.value) } : null)}
                        className="w-full mt-2"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Control how visible your background image is
                      </p>
                    </div>
                  </div>

                  {/* Profile Media */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Profile Media</h3>
                    
                    <div>
                      <Label className="text-white font-medium">Profile Picture</Label>
                      <div className="mt-2">
                        <FileUpload
                          currentUrl={profile.avatar_url}
                          onUpload={handleAvatarUpload}
                          accept="image/*"
                          type="image"
                          className="w-full"
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Upload your profile picture (recommended: 400x400px)
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Card Styling */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white">Card Styling</h3>
                      
                      <div>
                        <Label htmlFor="card_outline_color" className="text-white font-medium">Card Outline Color</Label>
                        <div className="mt-2 flex items-center gap-3">
                          <Input
                            id="card_outline_color"
                            type="color"
                            value={profile.card_outline_color}
                            onChange={(e) => setProfile(prev => prev ? { ...prev, card_outline_color: e.target.value } : null)}
                            className="w-16 h-10 p-1 bg-transparent border-gray-700/50 rounded-lg"
                          />
                          <Input
                            value={profile.card_outline_color}
                            onChange={(e) => setProfile(prev => prev ? { ...prev, card_outline_color: e.target.value } : null)}
                            className="bg-black/30 border-gray-700/50 text-white rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="card_glow_color" className="text-white font-medium">Card Glow Color</Label>
                        <div className="mt-2 flex items-center gap-3">
                          <Input
                            id="card_glow_color"
                            type="color"
                            value={profile.card_glow_color}
                            onChange={(e) => setProfile(prev => prev ? { ...prev, card_glow_color: e.target.value } : null)}
                            className="w-16 h-10 p-1 bg-transparent border-gray-700/50 rounded-lg"
                          />
                          <Input
                            value={profile.card_glow_color}
                            onChange={(e) => setProfile(prev => prev ? { ...prev, card_glow_color: e.target.value } : null)}
                            className="bg-black/30 border-gray-700/50 text-white rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="card_glow_intensity" className="text-white font-medium">
                          Glow Intensity: {profile.card_glow_intensity}
                        </Label>
                        <Input
                          id="card_glow_intensity"
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={profile.card_glow_intensity}
                          onChange={(e) => setProfile(prev => prev ? { ...prev, card_glow_intensity: parseFloat(e.target.value) } : null)}
                          className="w-full mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="card_border_radius" className="text-white font-medium">
                          Card Border Radius: {profile.card_border_radius || 12}px
                        </Label>
                        <Input
                          id="card_border_radius"
                          type="range"
                          min="0"
                          max="30"
                          step="2"
                          value={profile.card_border_radius || 12}
                          onChange={(e) => setProfile(prev => prev ? { ...prev, card_border_radius: parseInt(e.target.value) } : null)}
                          className="w-full mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="card_background" className="text-white font-medium">Card Background</Label>
                        <div className="mt-2 flex items-center gap-3">
                          <Input
                            id="card_background"
                            type="color"
                            value={profile.card_background || "#000000"}
                            onChange={(e) => setProfile(prev => prev ? { ...prev, card_background: e.target.value } : null)}
                            className="w-16 h-10 p-1 bg-transparent border-gray-700/50 rounded-lg"
                          />
                          <Input
                            value={profile.card_background || "#000000"}
                            onChange={(e) => setProfile(prev => prev ? { ...prev, card_background: e.target.value } : null)}
                            className="bg-black/30 border-gray-700/50 text-white rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Typography */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white">Typography</h3>
                      
                      <div>
                        <Label htmlFor="font_family" className="text-white font-medium">Font Family</Label>
                        <select
                          id="font_family"
                          value={profile.font_family}
                          onChange={(e) => setProfile(prev => prev ? { ...prev, font_family: e.target.value } : null)}
                          className="w-full mt-2 bg-black/30 border border-gray-700/50 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          <option value="Inter">Inter</option>
                          <option value="Roboto">Roboto</option>
                          <option value="Open Sans">Open Sans</option>
                          <option value="Poppins">Poppins</option>
                          <option value="Montserrat">Montserrat</option>
                          <option value="Lato">Lato</option>
                          <option value="Source Sans Pro">Source Sans Pro</option>
                          <option value="Nunito">Nunito</option>
                          <option value="Ubuntu">Ubuntu</option>
                          <option value="Playfair Display">Playfair Display</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="font_size" className="text-white font-medium">Font Size</Label>
                        <select
                          id="font_size"
                          value={profile.font_size}
                          onChange={(e) => setProfile(prev => prev ? { ...prev, font_size: e.target.value } : null)}
                          className="w-full mt-2 bg-black/30 border border-gray-700/50 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          <option value="12px">Extra Small (12px)</option>
                          <option value="14px">Small (14px)</option>
                          <option value="16px">Medium (16px)</option>
                          <option value="18px">Large (18px)</option>
                          <option value="20px">Extra Large (20px)</option>
                          <option value="24px">Heading (24px)</option>
                          <option value="32px">Large Heading (32px)</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="font_color" className="text-white font-medium">Font Color</Label>
                        <div className="mt-2 flex items-center gap-3">
                          <Input
                            id="font_color"
                            type="color"
                            value={profile.font_color}
                            onChange={(e) => setProfile(prev => prev ? { ...prev, font_color: e.target.value } : null)}
                            className="w-16 h-10 p-1 bg-transparent border-gray-700/50 rounded-lg"
                          />
                          <Input
                            value={profile.font_color}
                            onChange={(e) => setProfile(prev => prev ? { ...prev, font_color: e.target.value } : null)}
                            className="bg-black/30 border-gray-700/50 text-white rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="font_weight" className="text-white font-medium">Font Weight</Label>
                        <select
                          id="font_weight"
                          value={profile.font_weight || "400"}
                          onChange={(e) => setProfile(prev => prev ? { ...prev, font_weight: e.target.value } : null)}
                          className="w-full mt-2 bg-black/30 border border-gray-700/50 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          <option value="300">Light (300)</option>
                          <option value="400">Regular (400)</option>
                          <option value="500">Medium (500)</option>
                          <option value="600">Semi Bold (600)</option>
                          <option value="700">Bold (700)</option>
                          <option value="800">Extra Bold (800)</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="letter_spacing" className="text-white font-medium">
                          Letter Spacing: {profile.letter_spacing || 0}px
                        </Label>
                        <Input
                          id="letter_spacing"
                          type="range"
                          min="-2"
                          max="5"
                          step="0.1"
                          value={profile.letter_spacing || 0}
                          onChange={(e) => setProfile(prev => prev ? { ...prev, letter_spacing: parseFloat(e.target.value) } : null)}
                          className="w-full mt-2"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Advanced Effects */}
                  <div className="space-y-4 pt-6">
                    <h3 className="text-lg font-semibold text-white">Advanced Effects & Animations</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-3">
                        <Switch
                          id="hover_effects"
                          checked={profile.hover_effects}
                          onCheckedChange={(checked) => setProfile(prev => prev ? { ...prev, hover_effects: checked } : null)}
                          className="data-[state=checked]:bg-red-600"
                        />
                        <Label htmlFor="hover_effects" className="text-white font-medium">Hover Effects</Label>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Switch
                          id="parallax_effects"
                          checked={profile.parallax_effects}
                          onCheckedChange={(checked) => setProfile(prev => prev ? { ...prev, parallax_effects: checked } : null)}
                          className="data-[state=checked]:bg-red-600"
                        />
                        <Label htmlFor="parallax_effects" className="text-white font-medium">Parallax Effects</Label>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Switch
                          id="particle_effects"
                          checked={profile.particle_effects}
                          onCheckedChange={(checked) => setProfile(prev => prev ? { ...prev, particle_effects: checked } : null)}
                          className="data-[state=checked]:bg-red-600"
                        />
                        <Label htmlFor="particle_effects" className="text-white font-medium">Particle Effects</Label>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Switch
                          id="text_shadows"
                          checked={profile.text_shadows || false}
                          onCheckedChange={(checked) => setProfile(prev => prev ? { ...prev, text_shadows: checked } : null)}
                          className="data-[state=checked]:bg-red-600"
                        />
                        <Label htmlFor="text_shadows" className="text-white font-medium">Text Shadows</Label>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Switch
                          id="gradient_text"
                          checked={profile.gradient_text || false}
                          onCheckedChange={(checked) => setProfile(prev => prev ? { ...prev, gradient_text: checked } : null)}
                          className="data-[state=checked]:bg-red-600"
                        />
                        <Label htmlFor="gradient_text" className="text-white font-medium">Gradient Text</Label>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Switch
                          id="smooth_transitions"
                          checked={profile.smooth_transitions !== false}
                          onCheckedChange={(checked) => setProfile(prev => prev ? { ...prev, smooth_transitions: checked } : null)}
                          className="data-[state=checked]:bg-red-600"
                        />
                        <Label htmlFor="smooth_transitions" className="text-white font-medium">Smooth Transitions</Label>
                      </div>
                    </div>

                    {/* Custom CSS */}
                    <div>
                      <Label htmlFor="custom_css" className="text-white font-medium">Custom CSS (Advanced)</Label>
                      <textarea
                        id="custom_css"
                        value={profile.custom_css || ""}
                        onChange={(e) => setProfile(prev => prev ? { ...prev, custom_css: e.target.value } : null)}
                        placeholder="Add custom CSS rules here..."
                        rows={4}
                        className="w-full mt-2 bg-black/30 border border-gray-700/50 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Add custom CSS for advanced styling (use with caution)
                      </p>
                    </div>
                  </div>

                  <div className="pt-6">
                    <Button 
                      onClick={saveProfile} 
                      disabled={saving} 
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl text-lg"
                    >
                      {saving ? "Saving..." : "Save Appearance"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            )}

            {/* Links Tab */}
            {activeTab === "links" && (
              <div
                key="links"
                className="animate-in slide-in-from-bottom-2 duration-300"
              >
                <Card className="bg-black/40 backdrop-blur-xl border border-gray-800/50 shadow-2xl">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <LinkIcon className="w-6 h-6 text-green-400" />
                    <CardTitle className="text-xl text-white">Social Links</CardTitle>
                  </div>
                  <CardDescription className="text-gray-400">
                    Manage your custom social media and website links
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LazySocialLinksManager profileId={profile.id} />
                </CardContent>
              </Card>
            </div>
            )}

            {/* Music Tab */}
            {activeTab === "music" && (
              <div
                key="music"
                className="animate-in slide-in-from-bottom-2 duration-300"
              >
                <Card className="bg-black/40 backdrop-blur-xl border border-gray-800/50 shadow-2xl">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Music className="w-6 h-6 text-pink-400" />
                    <CardTitle className="text-xl text-white">Music Settings</CardTitle>
                  </div>
                  <CardDescription className="text-gray-400">
                    Configure your music player and track settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LazyMusicManager profileId={profile.id} />
                </CardContent>
              </Card>
            </div>
            )}

            {/* Badges Tab */}
            {activeTab === "badges" && (
              <div
                key="badges"
                className="animate-in slide-in-from-bottom-2 duration-300"
              >
                <Card className="bg-black/40 backdrop-blur-xl border border-gray-800/50 shadow-2xl">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Crown className="w-6 h-6 text-yellow-400" />
                    <CardTitle className="text-xl text-white">Badges</CardTitle>
                  </div>
                  <CardDescription className="text-gray-400">
                    Select and manage your profile badges
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LazyBadgeSelector 
                    currentBadgeId={profile.featured_badge_id}
                    onBadgeSelect={(badgeId: string) => {
                      setProfile(prev => prev ? { ...prev, featured_badge_id: badgeId } : null)
                    }}
                    isPremium={profile.is_premium}
                    isVerified={profile.is_verified}
                    viewCount={profile.view_count || 0}
                  />
                </CardContent>
              </Card>
            </div>
            )}

            {/* Spotify Tab */}
            {activeTab === "spotify" && (
              <div
                key="spotify"
                className="animate-in slide-in-from-bottom-2 duration-300"
              >
                <Card className="bg-black/40 backdrop-blur-xl border border-gray-800/50 shadow-2xl">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Music className="w-6 h-6 text-green-400" />
                    <CardTitle className="text-xl text-white">Spotify Integration</CardTitle>
                  </div>
                  <CardDescription className="text-gray-400">
                    Connect your Spotify account and import your favorite tracks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SpotifyIntegration profileId={profile.id} />
                </CardContent>
              </Card>
            </div>
            )}

            {/* Reveal Tab */}
            {activeTab === "reveal" && (
              <div
                key="reveal"
                className="animate-in slide-in-from-bottom-2 duration-300"
              >
                <Card className="bg-black/40 backdrop-blur-xl border border-gray-800/50 shadow-2xl">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Eye className="w-6 h-6 text-indigo-400" />
                    <CardTitle className="text-xl text-white">Reveal Page</CardTitle>
                  </div>
                  <CardDescription className="text-gray-400">
                    Create exclusive content for your followers (Coming Next Update!)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Maintenance Screen */}
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="text-4xl">🚀</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">Coming Next Update!</h3>
                    <p className="text-gray-300 text-lg mb-6">
                      The reveal page feature is being developed and will be available soon.
                    </p>
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                      <p className="text-sm text-gray-400">
                        This will include custom content, exclusive reveals, and more interactive features for your followers.
                      </p>
                    </div>
                  </div>

                  {/* Reveal Settings (Disabled for now) */}
                  <div className="space-y-4 opacity-50">
                    <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
                      <h4 className="text-lg font-semibold text-white mb-3">Reveal Settings</h4>
                      <p className="text-gray-400 text-sm mb-4">
                        These settings will be available when the reveal feature launches.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="reveal_title" className="text-gray-400">Reveal Title</Label>
                          <Input
                            id="reveal_title"
                            value={profile.reveal_title || ""}
                            onChange={(e) => setProfile(prev => prev ? { ...prev, reveal_title: e.target.value } : null)}
                            placeholder="Enter reveal title"
                            disabled
                            className="bg-gray-700/50 border-gray-600 text-gray-400"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="reveal_button" className="text-gray-400">Reveal Button Text</Label>
                          <Input
                            id="reveal_button"
                            value={profile.reveal_button || ""}
                            onChange={(e) => setProfile(prev => prev ? { ...prev, reveal_button: e.target.value } : null)}
                            placeholder="Enter button text"
                            disabled
                            className="bg-gray-700/50 border-gray-600 text-gray-400"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <Label htmlFor="reveal_message" className="text-gray-400">Reveal Message</Label>
                        <Textarea
                          id="reveal_message"
                          value={profile.reveal_message || ""}
                          onChange={(e) => setProfile(prev => prev ? { ...prev, reveal_message: e.target.value } : null)}
                          placeholder="Enter your reveal message"
                          rows={4}
                          disabled
                          className="bg-gray-700/50 border-gray-600 text-gray-400"
                        />
                      </div>
                      
                      <div className="mt-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="reveal_enabled"
                            checked={profile.reveal_enabled || false}
                            onCheckedChange={(checked) => setProfile(prev => prev ? { ...prev, reveal_enabled: checked } : null)}
                            disabled
                          />
                          <Label htmlFor="reveal_enabled" className="text-gray-400">Enable Reveal Page</Label>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">This feature is currently under development</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div
                key="settings"
                className="animate-in slide-in-from-bottom-2 duration-300"
              >
                <Card className="bg-black/40 backdrop-blur-xl border border-gray-800/50 shadow-2xl">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Settings className="w-6 h-6 text-gray-400" />
                    <CardTitle className="text-xl text-white">Account Settings</CardTitle>
                  </div>
                  <CardDescription className="text-gray-400">
                    Manage your account preferences, integrations, and security
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Profile Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-gray-800/30 rounded-xl border border-gray-700/50">
                      <h3 className="text-lg font-semibold text-white mb-4">Profile Statistics</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Views:</span>
                          <span className="text-white font-semibold">{profile.view_count || 0}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-gray-800/30 rounded-xl border border-gray-700/50">
                      <h3 className="text-lg font-semibold text-white mb-4">Account Status</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Verification:</span>
                          <span className={profile.is_verified ? "text-green-400 font-semibold" : "text-gray-500"}>
                            {profile.is_verified ? "✓ Verified" : "Not Verified"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Premium:</span>
                          <span className={profile.is_premium ? "text-yellow-400 font-semibold" : "text-gray-500"}>
                            {profile.is_premium ? "✓ Premium" : "Free"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Role:</span>
                          <span className="text-white font-semibold">{profile.role || "User"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Integrations */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-white">Platform Integrations</h3>
                    
                    {/* Discord Integration */}
                    <div className="p-6 bg-gray-800/30 rounded-xl border border-gray-700/50">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src="https://cdn3.emoji.gg/emojis/26344-discord.png" 
                            alt="Discord" 
                            className="w-6 h-6 object-contain"
                          />
                          <div>
                            <h4 className="text-lg font-semibold text-white">Discord</h4>
                            <p className="text-gray-400 text-sm">Connect your Discord account for staff access</p>
                          </div>
                        </div>
                        {discordStatus === "connected" ? (
                          <div className="flex items-center gap-2 text-green-400">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-sm font-medium">Connected</span>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">Not Connected</span>
                        )}
                      </div>
                      
                      {discordStatus === "connected" ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-green-400">
                            <span className="font-medium">Connected as: {profile.discord_username}</span>
                          </div>
                          <Button 
                            onClick={disconnectDiscord} 
                            variant="outline" 
                            size="sm"
                            className="border-gray-700/50 text-gray-300 hover:text-white hover:bg-white/10"
                          >
                            Disconnect Discord
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          onClick={connectDiscord} 
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                        >
                          Connect Discord
                        </Button>
                      )}
                    </div>

                    {/* Spotify Integration */}
                    <div className="p-6 bg-gray-800/30 rounded-xl border border-gray-700/50">
                      <div className="flex items-center justify-between mb-4">
                                                 <div className="flex items-center gap-3">
                           <img 
                             src="https://cdn3.emoji.gg/emojis/35248-spotify.png" 
                             alt="Spotify" 
                             className="w-6 h-6 object-contain"
                           />
                           <div>
                             <h4 className="text-lg font-semibold text-white">Spotify</h4>
                             <p className="text-gray-400 text-sm">Connect your Spotify account to share music</p>
                           </div>
                         </div>
                        {profile.spotify_connected ? (
                          <div className="flex items-center gap-2 text-green-400">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-sm font-medium">Connected</span>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">Not Connected</span>
                        )}
                      </div>
                      
                      {profile.spotify_connected ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-green-400">
                            <span className="font-medium">Connected as: {profile.spotify_username}</span>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-gray-700/50 text-gray-300 hover:text-white hover:bg-white/10"
                          >
                            Disconnect Spotify
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white font-medium"
                        >
                          Connect Spotify
                        </Button>
                      )}
                    </div>

                    {/* Social Media Usernames */}
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold text-white">Account Security</h3>
                      
                      {/* Email Change */}
                      <div className="p-6 bg-gray-800/30 rounded-xl border border-gray-700/50">
                        <h4 className="text-lg font-semibold text-white mb-3">Change Email</h4>
                        <p className="text-gray-400 text-sm mb-4">
                          Update your email address. You'll need to verify the new email.
                        </p>
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="current_email" className="text-gray-300">Current Email</Label>
                            <Input
                              id="current_email"
                              value={profile.email || ""}
                              disabled
                              className="mt-2 bg-gray-700/50 border-gray-600 text-gray-400"
                            />
                          </div>
                          <div>
                            <Label htmlFor="new_email" className="text-white">New Email</Label>
                            <Input
                              id="new_email"
                              type="email"
                              placeholder="Enter new email address"
                              className="mt-2 bg-black/30 border-gray-700/50 text-white rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                          </div>
                          <Button 
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                          >
                            Update Email
                          </Button>
                        </div>
                      </div>

                      {/* Password Change */}
                      <div className="p-6 bg-gray-800/30 rounded-xl border border-gray-700/50">
                        <h4 className="text-lg font-semibold text-white mb-3">Change Password</h4>
                        <p className="text-gray-400 text-sm mb-4">
                          Update your password to keep your account secure.
                        </p>
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="current_password" className="text-white">Current Password</Label>
                            <Input
                              id="current_password"
                              type="password"
                              placeholder="Enter current password"
                              className="mt-2 bg-black/30 border-gray-700/50 text-white rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <Label htmlFor="new_password" className="text-white">New Password</Label>
                            <Input
                              id="new_password"
                              type="password"
                              placeholder="Enter new password"
                              className="mt-2 bg-black/30 border-gray-700/50 text-white rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <Label htmlFor="confirm_password" className="text-white">Confirm New Password</Label>
                            <Input
                              id="confirm_password"
                              type="password"
                              placeholder="Confirm new password"
                              className="mt-2 bg-black/30 border-gray-700/50 text-white rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                          </div>
                          <Button 
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white font-medium"
                          >
                            Update Password
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button 
                        onClick={saveProfile} 
                        disabled={saving} 
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl text-lg"
                      >
                        {saving ? "Saving..." : "Save Integrations"}
                      </Button>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="p-6 bg-red-500/20 border border-red-500/30 rounded-xl">
                    <h3 className="text-lg font-semibold text-red-400 mb-3">Danger Zone</h3>
                    <p className="text-red-300 text-sm mb-4">
                      These actions cannot be undone. Please be careful.
                    </p>
                    <Button 
                      variant="destructive" 
                      className="w-full bg-red-600 hover:bg-red-700 font-semibold py-3 rounded-xl"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-red-500/30 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-red-400 mb-4">Delete Account</h3>
            <p className="text-gray-300 mb-4">
              This action cannot be undone. Please enter your password to confirm account deletion.
            </p>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="delete-password" className="text-white font-medium">
                  Password <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="delete-password"
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Enter your password"
                  className="mt-2 bg-black/30 border-gray-700/50 text-white rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteDialog(false)
                    setDeletePassword("")
                  }}
                  className="flex-1 border-gray-700/50 text-gray-300 hover:text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={!deletePassword || deleteLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  {deleteLoading ? "Deleting..." : "Delete Account"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
