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
import { SocialLinksManager } from "@/components/social-links-manager"
import { MusicManager } from "@/components/music-manager"
import { FileUpload } from "@/components/file-upload"
import dynamic from "next/dynamic"

// Lazy load heavy components
const LazySocialLinksManager = dynamic(() => import("@/components/social-links-manager").then(mod => ({ default: mod.SocialLinksManager })), {
  loading: () => <div className="h-32 bg-gray-700 rounded animate-pulse"></div>
})

const LazyMusicManager = dynamic(() => import("@/components/music-manager").then(mod => ({ default: mod.MusicManager })), {
  loading: () => <div className="h-32 bg-gray-700 rounded animate-pulse"></div>
})

// Only import icons you actually use
import { User, Music, Settings, Eye, Crown, Star } from "lucide-react"

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
  custom_css: string
  custom_js: string
  advanced_animations: boolean
  custom_fonts: boolean
  background_opacity: number
  card_border_radius: number
  card_background: string
  font_weight: string
  letter_spacing: number
  text_shadows: boolean
  gradient_text: boolean
  smooth_transitions: boolean
  email: string | null
}

export default function EditProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
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
      console.error("Error checking Discord status:", error)
      setDiscordStatus("disconnected")
    }
  }

  const saveProfile = async () => {
    if (!profile) return

    try {
      setSaving(true)
      setError(null)

      const { error } = await supabase
        .from("profiles")
        .update({
          username: profile.username,
          display_name: profile.display_name,
          bio: profile.bio,
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
          background_opacity: profile.background_opacity,
          card_border_radius: profile.card_border_radius,
          card_background: profile.card_background,
          font_weight: profile.font_weight,
          letter_spacing: profile.letter_spacing,
          text_shadows: profile.text_shadows,
          gradient_text: profile.gradient_text,
          smooth_transitions: profile.smooth_transitions,
          custom_css: profile.custom_css,
          custom_js: profile.custom_js,
          advanced_animations: profile.advanced_animations,
          custom_fonts: profile.custom_fonts
        })
        .eq("id", profile.id)

      if (error) {
        throw error
      }

      setSuccess("Profile saved successfully!")
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error("Error saving profile:", error)
      setError("Failed to save profile. Please try again.")
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

  const deleteAccount = async () => {
    if (!deletePassword) {
      setError("Please enter your password to confirm deletion.")
      return
    }

    try {
      setDeleteLoading(true)
      setError(null)

      // Re-authenticate user before deletion
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: profile?.email || "",
        password: deletePassword
      })

      if (reauthError) {
        setError("Invalid password. Please try again.")
        return
      }

      // Delete profile data first
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", profile?.id)

      if (profileError) {
        console.error("Error deleting profile:", profileError)
      }

      // Delete user account
      const { error: deleteError } = await supabase.auth.admin.deleteUser(profile?.id || "")

      if (deleteError) {
        // If admin deletion fails, try user deletion
        const { error: userDeleteError } = await supabase.auth.admin.deleteUser(profile?.id || "")
        if (userDeleteError) {
          throw userDeleteError
        }
      }

      router.push("/auth/login")
    } catch (error) {
      console.error("Error deleting account:", error)
      setError("Failed to delete account. Please try again.")
    } finally {
      setDeleteLoading(false)
      setShowDeleteDialog(false)
      setDeletePassword("")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-gray-700 rounded mb-4"></div>
            <div className="h-32 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
          <p className="text-gray-400 mb-6">Unable to load your profile.</p>
          <Button onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Edit Profile</h1>
            <p className="text-gray-400">Customize your profile appearance and settings</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button 
              onClick={saveProfile} 
              disabled={saving}
              className="w-full sm:w-auto"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push(`/${profile.username}`)}
              className="w-full sm:w-auto"
            >
              View Profile
            </Button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 p-4 bg-green-900 border border-green-700 rounded-lg">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-red-900 border border-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: "profile", label: "Profile", icon: User },
            { id: "appearance", label: "Appearance", icon: Settings },
            { id: "social", label: "Social Links", icon: Music },
            { id: "music", label: "Music", icon: Music },
            { id: "badges", label: "Badges", icon: Crown },
            { id: "advanced", label: "Advanced", icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Update your profile details and settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={profile.username || ""}
                      onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="display_name">Display Name</Label>
                    <Input
                      id="display_name"
                      value={profile.display_name || ""}
                      onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio || ""}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Tell people about yourself..."
                    className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
                  />
                </div>
                
                {/* Profile Picture Upload */}
                <div>
                  <Label>Profile Picture</Label>
                  <FileUpload
                    currentUrl={profile.avatar_url}
                    onUpload={handleAvatarUpload}
                    accept="image/*"
                    type="image"
                    className="w-full"
                  />
                </div>

                {/* Banner Upload */}
                <div>
                  <Label>Banner Image</Label>
                  <FileUpload
                    currentUrl={profile.background_image_url}
                    onUpload={handleBannerUpload}
                    accept="image/*"
                    type="image"
                    className="w-full"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="is_public">Public Profile</Label>
                    <p className="text-sm text-gray-400">Allow others to view your profile</p>
                  </div>
                  <Switch
                    id="is_public"
                    checked={profile.is_public || false}
                    onCheckedChange={(checked) => setProfile({ ...profile, is_public: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="is_premium">Premium Features</Label>
                    <p className="text-sm text-gray-400">Enable premium profile features</p>
                  </div>
                  <Switch
                    id="is_premium"
                    checked={profile.is_premium || false}
                    onCheckedChange={(checked) => setProfile({ ...profile, is_premium: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Appearance Tab */}
          {activeTab === "appearance" && (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Appearance Settings
                </CardTitle>
                <CardDescription>
                  Customize your profile's look and feel
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="background_color">Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="background_color"
                        value={profile.background_color || "#000000"}
                        onChange={(e) => setProfile({ ...profile, background_color: e.target.value })}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                      <input
                        type="color"
                        value={profile.background_color || "#000000"}
                        onChange={(e) => setProfile({ ...profile, background_color: e.target.value })}
                        className="w-12 h-10 rounded border border-gray-600"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="theme">Theme</Label>
                    <select
                      id="theme"
                      value={profile.theme || "dark"}
                      onChange={(e) => setProfile({ ...profile, theme: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    >
                      <option value="dark">Dark</option>
                      <option value="light">Light</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="card_outline_color">Card Outline Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="card_outline_color"
                        value={profile.card_outline_color || "#ef4444"}
                        onChange={(e) => setProfile({ ...profile, card_outline_color: e.target.value })}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                      <input
                        type="color"
                        value={profile.card_outline_color || "#ef4444"}
                        onChange={(e) => setProfile({ ...profile, card_outline_color: e.target.value })}
                        className="w-12 h-10 rounded border border-gray-600"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="card_glow_color">Card Glow Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="card_glow_color"
                        value={profile.card_glow_color || "#ef4444"}
                        onChange={(e) => setProfile({ ...profile, card_glow_color: e.target.value })}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                      <input
                        type="color"
                        value={profile.card_glow_color || "#ef4444"}
                        onChange={(e) => setProfile({ ...profile, card_glow_color: e.target.value })}
                        className="w-12 h-10 rounded border border-gray-600"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="font_family">Font Family</Label>
                    <select
                      id="font_family"
                      value={profile.font_family || "Inter"}
                      onChange={(e) => setProfile({ ...profile, font_family: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    >
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Lato">Lato</option>
                      <option value="Poppins">Poppins</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="font_size">Font Size</Label>
                    <select
                      id="font_size"
                      value={profile.font_size || "16px"}
                      onChange={(e) => setProfile({ ...profile, font_size: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    >
                      <option value="14px">Small</option>
                      <option value="16px">Medium</option>
                      <option value="18px">Large</option>
                      <option value="20px">Extra Large</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="hover_effects">Hover Effects</Label>
                    <p className="text-sm text-gray-400">Enable hover animations</p>
                  </div>
                  <Switch
                    id="hover_effects"
                    checked={profile.hover_effects || false}
                    onCheckedChange={(checked) => setProfile({ ...profile, hover_effects: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Social Links Tab */}
          {activeTab === "social" && (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="w-5 h-5" />
                  Social Links
                </CardTitle>
                <CardDescription>
                  Manage your social media links
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LazySocialLinksManager profileId={profile.id} />
              </CardContent>
            </Card>
          )}

          {/* Music Tab */}
          {activeTab === "music" && (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="w-5 h-5" />
                  Music Player
                </CardTitle>
                <CardDescription>
                  Manage your music tracks and player settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LazyMusicManager profileId={profile.id} />
              </CardContent>
            </Card>
          )}

          {/* Badges Tab */}
          {activeTab === "badges" && (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  Badges
                </CardTitle>
                <CardDescription>
                  Badge system coming soon!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Badge System</h3>
                  <p className="text-gray-400">The badge system will be available in a future update.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Advanced Tab */}
          {activeTab === "advanced" && (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Advanced Settings
                </CardTitle>
                <CardDescription>
                  Advanced profile customization options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="custom_css">Custom CSS</Label>
                  <Textarea
                    id="custom_css"
                    value={profile.custom_css || ""}
                    onChange={(e) => setProfile({ ...profile, custom_css: e.target.value })}
                    placeholder="Add custom CSS styles..."
                    className="bg-gray-700 border-gray-600 text-white font-mono text-sm min-h-[100px]"
                  />
                </div>
                <div>
                  <Label htmlFor="custom_js">Custom JavaScript</Label>
                  <Textarea
                    id="custom_js"
                    value={profile.custom_js || ""}
                    onChange={(e) => setProfile({ ...profile, custom_js: e.target.value })}
                    placeholder="Add custom JavaScript..."
                    className="bg-gray-700 border-gray-600 text-white font-mono text-sm min-h-[100px]"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="advanced_animations">Advanced Animations</Label>
                    <p className="text-sm text-gray-400">Enable complex animations</p>
                  </div>
                  <Switch
                    id="advanced_animations"
                    checked={profile.advanced_animations || false}
                    onCheckedChange={(checked) => setProfile({ ...profile, advanced_animations: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Danger Zone */}
        <Card className="bg-red-900/20 border-red-700 mt-8">
          <CardHeader>
            <CardTitle className="text-red-400">Danger Zone</CardTitle>
            <CardDescription className="text-red-300">
              Irreversible and destructive actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              className="w-full sm:w-auto"
            >
              Delete Account
            </Button>
          </CardContent>
        </Card>

        {/* Delete Account Dialog */}
        {showDeleteDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4 text-red-400">Delete Account</h3>
              <p className="text-gray-300 mb-4">
                This action cannot be undone. This will permanently delete your account and all associated data.
              </p>
              <div className="space-y-4">
                <Input
                  type="password"
                  placeholder="Enter your password to confirm"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    onClick={deleteAccount}
                    disabled={deleteLoading}
                    className="flex-1"
                  >
                    {deleteLoading ? "Deleting..." : "Delete Account"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteDialog(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
