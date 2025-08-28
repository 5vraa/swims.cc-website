"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { FileUpload } from "@/components/file-upload"
import { SocialLinksManager } from "@/components/social-links-manager"
import { MusicManager } from "@/components/music-manager"
import { User, LinkIcon, Music, Palette, Settings, Eye } from "lucide-react"

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
}

export default function EditProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle()

      if (error && (error as any).code !== "PGRST116") throw error

      if (!profileData) {
        const baseUsername = String(
          (user.user_metadata as any)?.username || (user.email || "user").split("@")[0],
        )
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, "")

        const { data: inserted, error: insertError } = await supabase
          .from("profiles")
          .insert({
            user_id: user.id,
            username: baseUsername,
            display_name: (user.user_metadata as any)?.display_name || baseUsername,
            is_public: true,
          })
          .select("*")
          .single()

        if (insertError) {
          if ((insertError as any).code === "23505") {
            setError("Username already taken. Please choose a different username in the editor.")
          } else {
            throw insertError
          }
        } else {
          setProfile(inserted as any)
        }
      } else {
        setProfile(profileData as any)
      }
    } catch (error) {
      console.error("Error loading profile:", error)
      setError("Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // Update profile in database
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: profile.display_name,
          bio: profile.bio,
          avatar_url: profile.avatar_url,
          background_color: profile.background_color,
          background_image_url: profile.background_image_url,
          is_public: profile.is_public,
          username: profile.username,
        })
        .eq("id", profile.id)

      if (error) throw error

      setSuccess("Profile updated successfully!")

      // Refresh profile data
      await loadProfile()
    } catch (error) {
      console.error("Error saving profile:", error)
      setError("Failed to save profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = (url: string) => {
    if (profile) {
      setProfile({ ...profile, avatar_url: url })
      setSuccess("Avatar uploaded successfully!")
    }
  }

  const handleBannerUpload = (url: string) => {
    if (profile) {
      setProfile({ ...profile, background_image_url: url })
      setSuccess("Banner uploaded successfully!")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">Profile not found</p>
            <Button asChild>
              <Link href="/profile/edit">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Profile</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="links" className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              Links
            </TabsTrigger>
            <TabsTrigger value="music" className="flex items-center gap-2">
              <Music className="w-4 h-4" />
              Music
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <form onSubmit={handleSave} className="space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Update your display name and bio</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={profile.username}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          username: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                        })
                      }
                    />
                    <p className="text-xs text-muted-foreground mt-1">Only letters, numbers, and dashes</p>
                  </div>

                  <div>
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={profile.display_name || ""}
                      onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                      placeholder="Your display name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profile.bio || ""}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      placeholder="Tell people about yourself..."
                      className="min-h-[100px]"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Messages */}
              {error && <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
              {success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded text-green-700 text-sm">{success}</div>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/profile/edit">Cancel</Link>
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <form onSubmit={handleSave} className="space-y-6">
              {/* Avatar */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Picture</CardTitle>
                  <CardDescription>Upload a profile picture</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url || "/placeholder.svg"}
                        alt="Current avatar"
                        className="w-16 h-16 rounded-full object-cover border-2 border-border"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                        <span className="text-xl">
                          {(profile.display_name || profile.username).charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <FileUpload
                        type="image"
                        accept="image/*"
                        maxSize={5 * 1024 * 1024}
                        onUpload={handleAvatarUpload}
                        className="w-full"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Background */}
              <Card>
                <CardHeader>
                  <CardTitle>Background</CardTitle>
                  <CardDescription>Customize your profile background</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="backgroundColor">Background Color</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        id="backgroundColor"
                        type="color"
                        value={profile.background_color}
                        onChange={(e) => setProfile({ ...profile, background_color: e.target.value })}
                        className="w-16 h-10 cursor-pointer"
                      />
                      <Input
                        value={profile.background_color}
                        onChange={(e) => setProfile({ ...profile, background_color: e.target.value })}
                        placeholder="#1a1a1a"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="backgroundImage">Background Image</Label>
                    <FileUpload
                      type="image"
                      accept="image/*"
                      maxSize={10 * 1024 * 1024}
                      onUpload={handleBannerUpload}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Optional. Will overlay on top of background color. Max 10MB.
                    </p>
                    {profile.background_image_url && (
                      <div className="mt-2">
                        <img
                          src={profile.background_image_url || "/placeholder.svg"}
                          alt="Current background"
                          className="w-full h-24 object-cover rounded border"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Messages */}
              {error && <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
              {success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded text-green-700 text-sm">{success}</div>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/profile/edit">Cancel</Link>
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="links" className="space-y-6">
            <SocialLinksManager />
          </TabsContent>

          <TabsContent value="music" className="space-y-6">
            <MusicManager />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <form onSubmit={handleSave} className="space-y-6">
              {/* Privacy */}
              <Card>
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                  <CardDescription>Control who can see your profile</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="isPublic">Public Profile</Label>
                      <p className="text-sm text-muted-foreground">Allow others to view your bio page</p>
                    </div>
                    <Switch
                      id="isPublic"
                      checked={profile.is_public}
                      onCheckedChange={(checked) => setProfile({ ...profile, is_public: checked })}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Messages */}
              {error && <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
              {success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded text-green-700 text-sm">{success}</div>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/profile/edit">Cancel</Link>
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
