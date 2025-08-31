"use client"

import React, { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/badge"
import { MusicPlayer } from "@/components/music-player"
import { SocialLinksDisplay } from "@/components/social-links-display"

import Link from "next/link"
import { notFound } from "next/navigation"
import { 
  Heart, 
  Eye, 
  Music, 
  Link as LinkIcon, 
  Star,
  Calendar,
  MapPin,
  Globe,
  Mail,
  Phone,
  MessageCircle
} from "lucide-react"

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
  role: string | null
  view_count: number

  created_at: string
  card_outline_color: string
  card_glow_color: string
  card_glow_intensity: number
  border_radius: number
  font_family: string
  font_size: string
  font_color: string
}

interface SocialLink {
  id: string
  platform: string
  url: string
  display_name: string
  icon: string
  order_index: number
  is_active: boolean
}

interface MusicTrack {
  id: string
  title: string
  artist?: string
  audio_url: string
  cover_image_url?: string
  duration?: number
}

interface Badge {
  id: string
  name: string
  display_name: string
  description: string
  color: string
  icon: string
  is_active: boolean
  created_at: string
}

interface UserBadge {
  id: string
  badge: Badge
  awarded_at: string
}

export default function PublicProfilePage({ params }: { params: { username: string } }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const [musicTracks, setMusicTracks] = useState<MusicTrack[]>([])
  const [userBadges, setUserBadges] = useState<UserBadge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [liked, setLiked] = useState(false)
  const supabase = createClient()
  const { username } = (React as any).use ? (React as any).use(params) : params
  const normalizedUsername = typeof username === "string" ? username.trim().toLowerCase() : ""

  const reservedRoutes = new Set([
    "auth",
    "admin",
    "staff",
    "privacy",
    "terms",
    "changelog",
    "status",
    "copyright",
    "redeem",
    "profile",
    "dashboard",
    "explore",
    "pricing",
    "help",

  ])

  useEffect(() => {
    if (!normalizedUsername || reservedRoutes.has(normalizedUsername)) {
      notFound()
      return
    }
    loadProfile()
  }, [normalizedUsername])

  // Prevent body scrolling when profile page is open
  useEffect(() => {
    document.body.classList.add('profile-page-open')
    
    return () => {
      document.body.classList.remove('profile-page-open')
    }
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      
      // Get profile by username
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .ilike("username", normalizedUsername)
        .eq("is_public", true)
        .maybeSingle()

      if (profileError) {
        console.error("Supabase profile error:", profileError)
        if (profileError.code === "PGRST116") {
          notFound()
        }
        throw profileError
      }

      if (!profileData) {
        notFound()
      }

      setProfile(profileData)

      // Load social links
      const { data: socialData, error: socialError } = await supabase
        .from("social_links")
        .select("*")
        .eq("user_id", profileData.user_id)
        .eq("is_active", true)
        .order("order_index")

      if (!socialError && socialData) {
        setSocialLinks(socialData)
      }

      // Load music tracks
      const { data: musicData, error: musicError } = await supabase
        .from("music_tracks")
        .select("*")
        .eq("user_id", profileData.user_id)
        .eq("is_active", true)
        .order("order_index")

      if (!musicError && musicData) {
        setMusicTracks(musicData)
      }

      // Load user badges
      const { data: badgesData, error: badgesError } = await supabase
        .from("user_badges")
        .select(`
          id,
          awarded_at,
          badge:badges(*)
        `)
        .eq("user_id", profileData.user_id)

      if (!badgesError && badgesData) {
        setUserBadges(badgesData)
      }

      // Increment view count
      await supabase
        .from("profiles")
        .update({ view_count: (profileData.view_count || 0) + 1 })
        .eq("id", profileData.id)

    } catch (err) {
      console.error("Error loading profile:", err)
      setError("Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    if (!profile) return
    
    try {
      // Like functionality removed
      setLiked(!liked)
    } catch (err) {
      console.error("Error updating like count:", err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500/20 via-purple-500/20 to-blue-500/20">
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 h-full flex items-center justify-center px-4 py-8">
          <div className="max-w-2xl w-full text-center">
            {/* Animated Profile Card Skeleton */}
            <div className="bg-black/40 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-8 animate-pulse">
              {/* Avatar Skeleton */}
              <div className="w-24 h-24 bg-gray-600 rounded-full mx-auto mb-6 animate-pulse"></div>
              
              {/* Name Skeleton */}
              <div className="h-8 bg-gray-600 rounded w-48 mx-auto mb-4 animate-pulse"></div>
              
              {/* Bio Skeleton */}
              <div className="space-y-2 mb-6">
                <div className="h-4 bg-gray-600 rounded w-full mx-auto"></div>
                <div className="h-4 bg-gray-600 rounded w-3/4 mx-auto"></div>
              </div>
              
              {/* Badges Skeleton */}
              <div className="flex justify-center gap-2 mb-6">
                <div className="w-8 h-8 bg-gray-600 rounded-full animate-pulse"></div>
                <div className="w-8 h-8 bg-gray-600 rounded-full animate-pulse"></div>
                <div className="w-8 h-8 bg-gray-600 rounded-full animate-pulse"></div>
              </div>
              
              {/* Button Skeleton */}
              <div className="h-12 bg-gray-600 rounded w-32 mx-auto animate-pulse"></div>
              
              {/* Loading Text */}
              <div className="mt-6">
                <div className="flex justify-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <p className="text-gray-300 text-sm">Loading amazing profile...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Profile Not Found</h1>
          <p className="text-muted-foreground mb-4">{error || "This profile doesn't exist or is private."}</p>
          <Link href="/" className="text-primary hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-page-fixed h-screen bg-background text-foreground overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 w-full h-full pointer-events-none -z-10">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: profile?.background_image_url ? `url(${profile.background_image_url})` : 'none',
            backgroundColor: profile?.background_color || '#0a0a0a'
          }}
        ></div>
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Profile Content - Fixed height container */}
      <div className="relative z-10 h-full flex items-center justify-center px-4 py-8">
        <div className="max-w-2xl w-full max-h-full">
          {/* Main Profile Card */}
          <Card 
            className="profile-card-custom bg-card/80 backdrop-blur-sm border-border shadow-xl"
            style={{
              borderColor: profile?.card_outline_color || '#ef4444',
              boxShadow: profile?.card_glow_color && profile?.card_glow_intensity ? 
                `0 0 ${20 * (profile.card_glow_intensity || 0.5)}px ${profile.card_glow_color}` : 
                '0 0 20px rgba(239, 68, 68, 0.5)',
              borderRadius: `${profile?.border_radius || 12}px`
            }}
          >
            <CardContent className="p-6">
              <div className="text-center">
                {/* Avatar */}
                {profile?.avatar_url ? (
                  <div className="mb-4">
                    <img
                      src={profile.avatar_url}
                      alt={`${profile.display_name || profile.username}'s avatar`}
                      className="w-24 h-24 rounded-full mx-auto border-4 border-primary shadow-lg"
                      style={{
                        borderColor: profile?.card_outline_color || '#ef4444'
                      }}
                    />
                  </div>
                ) : (
                  <div className="mb-4">
                    <div 
                      className="w-24 h-24 rounded-full mx-auto border-4 bg-muted flex items-center justify-center"
                      style={{
                        borderColor: profile?.card_outline_color || '#ef4444'
                      }}
                    >
                      <span 
                        className="text-3xl font-bold text-muted-foreground"
                        style={{
                          fontFamily: profile?.font_family || 'Inter',
                          fontSize: profile?.font_size || '16px',
                          color: profile?.font_color || '#ffffff'
                        }}
                      >
                        {profile.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Profile Info */}
                <div className="mb-4">
                  <h1 
                    className="text-2xl font-bold text-card-foreground mb-2"
                    style={{
                      fontFamily: profile?.font_family || 'Inter',
                      fontSize: profile?.font_size || '16px',
                      color: profile?.font_color || '#ffffff'
                    }}
                  >
                    {profile?.display_name || profile?.username}
                  </h1>
                  
                  {profile?.bio && (
                    <p 
                      className="text-muted-foreground text-sm max-w-lg mx-auto"
                      style={{
                        fontFamily: profile?.font_family || 'Inter',
                        fontSize: profile?.font_size || '16px',
                        color: profile?.font_color || '#ffffff'
                      }}
                    >
                      {profile.bio}
                    </p>
                  )}

                  {/* Badges */}
                  {userBadges.length > 0 && (
                    <div className="mt-3 flex flex-wrap justify-center gap-1">
                      {userBadges.map((userBadge) => (
                        <Badge
                          key={userBadge.id}
                          badge={userBadge.badge}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap justify-center gap-3 mb-4">
                  <Button
                    onClick={handleLike}
                    variant={liked ? "default" : "outline"}
                    size="sm"
                    className="flex items-center gap-2"
                    style={{
                      backgroundColor: liked ? (profile?.card_outline_color || '#ef4444') : 'transparent',
                      borderColor: profile?.card_outline_color || '#ef4444',
                      color: liked ? '#ffffff' : (profile?.card_outline_color || '#ef4444')
                    }}
                  >
                    <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                    Like
                  </Button>

                  {/* Removed reveal button */}
                </div>

                {/* Stats */}
                <div className="flex justify-center gap-6 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {profile?.view_count || 0} views
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    No likes
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Joined {new Date(profile.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Links & Music - Compact */}
          {(socialLinks.length > 0 || musicTracks.length > 0) && (
            <Card 
              className="bg-card/80 backdrop-blur-sm border-border mt-4"
              style={{
                borderColor: profile?.card_outline_color || '#ef4444',
                boxShadow: profile?.card_glow_color && profile?.card_glow_intensity ? 
                  `0 0 ${15 * (profile.card_glow_intensity || 0.5)}px ${profile.card_glow_color}` : 
                  '0 0 15px rgba(239, 68, 68, 0.3)',
                borderRadius: `${profile?.border_radius || 12}px`
              }}
            >
              <CardContent className="p-4">
                {/* Social Links */}
                {socialLinks.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-card-foreground mb-2 text-center">
                      Connect with {profile.display_name || profile.username}
                    </h3>
                    <div className="flex flex-wrap justify-center gap-2">
                      {socialLinks.map((link) => (
                        <Link
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs hover:bg-primary/90 transition-all duration-200 hover:scale-105"
                          style={{
                            backgroundColor: profile?.card_outline_color || '#ef4444',
                            color: '#ffffff'
                          }}
                        >
                          {link.icon && <span>{link.icon}</span>}
                          {link.display_name || link.platform}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Music Player */}
                {musicTracks.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-card-foreground mb-2 text-center flex items-center justify-center gap-1">
                      <Music className="w-3 h-3" />
                      Music
                    </h3>
                    <div className="text-center text-xs text-muted-foreground">
                      {musicTracks.length} track{musicTracks.length !== 1 ? 's' : ''} available
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
