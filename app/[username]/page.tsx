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
  show_social_links: boolean
  show_badges: boolean
  show_stats: boolean
  show_music_player: boolean
  enable_tilt_effects: boolean
  enable_glow_effects: boolean
  music_player_style: 'sleek' | 'tab'
}

interface SocialLink {
  id: string
  platform: string
  url: string
  display_name: string
  icon: string
  order_index: number
  is_visible: boolean
}

interface MusicTrack {
  id: string
  title: string
  artist?: string
  audio_url: string
  cover_image_url?: string
  duration?: number
  order_index: number
  is_visible: boolean
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
  assigned_at: string
}

export default function PublicProfilePage({ params }: { params: { username: string } }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const [musicTracks, setMusicTracks] = useState<MusicTrack[]>([])
  const [userBadges, setUserBadges] = useState<UserBadge[]>([])
  const [loading, setLoading] = useState(false) // Changed to false - no initial loading
  const [error, setError] = useState<string | null>(null)
  const [musicPlayerOpen, setMusicPlayerOpen] = useState(false)
  const supabase = createClient()
  const { username } = (React as any).use ? (React as any).use(params) : params
  const normalizedUsername = typeof username === "string" ? username.trim().toLowerCase() : ""

  // Helper function to format time
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

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
      // Don't show loading state - just load in background
      
      // First load the profile to get the user ID
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, user_id, username, display_name, bio, avatar_url, background_color, background_image_url, theme, is_public, is_premium, is_verified, role, view_count, created_at")
        .ilike("username", normalizedUsername)
        .eq("is_public", true)
        .single()

      if (profileError || !profileData) {
        notFound()
        return
      }

      // Add default values for new settings if they don't exist
      const profileWithDefaults = {
        ...profileData,
        card_outline_color: '#ef4444',
        card_glow_color: '#ef4444',
        card_glow_intensity: 0.5,
        border_radius: 12,
        font_family: 'Inter',
        font_size: 'base',
        font_color: '#ffffff',
        show_social_links: true,
        show_badges: true,
        show_stats: true,
        show_music_player: true,
        enable_tilt_effects: true,
        enable_glow_effects: true,
        music_player_style: 'sleek' as const,
      }

      setProfile(profileWithDefaults)
      
      // Increment view count in background (non-blocking)
      supabase
        .from("profiles")
        .update({ view_count: (profileWithDefaults.view_count || 0) + 1 })
        .eq("id", profileWithDefaults.id)
        .then(() => {})
      
      // Now load related data with the profile ID
      const [socialResult, musicResult, badgesResult] = await Promise.allSettled([
        // Social links - use profile_id
        supabase
          .from("social_links")
          .select("*")
          .eq("profile_id", profileWithDefaults.id)
          .eq("is_active", true)
          .order("order_index", { ascending: true }),
        
        // Music tracks - use profile_id
        supabase
          .from("music_tracks")
          .select("*")
          .eq("profile_id", profileWithDefaults.id)
          .eq("is_visible", true)
          .order("order_index", { ascending: true }),
        
        // User badges - use profile_id
        supabase
          .from("user_badges")
          .select(`
            id,
            badge:badges(
              id,
              name,
              display_name,
              description,
              icon,
              color
            )
          `)
          .eq("profile_id", profileWithDefaults.id)
      ])

      // Handle social links
      if (socialResult.status === "fulfilled" && socialResult.value.data) {
        setSocialLinks(socialResult.value.data)
      } else if (socialResult.status === "rejected") {
        console.error('Social links loading failed:', socialResult.reason)
      }

      // Handle music tracks
      if (musicResult.status === "fulfilled" && musicResult.value.data) {
        setMusicTracks(musicResult.value.data)
      } else if (musicResult.status === "rejected") {
        console.error('Music tracks loading failed:', musicResult.reason)
      }

      // Handle badges
      if (badgesResult.status === "fulfilled" && badgesResult.value.data) {
        setUserBadges(badgesResult.value.data)
      } else if (badgesResult.status === "rejected") {
        console.error('Badge loading failed:', badgesResult.reason)
      }

    } catch (err) {
      console.error("Error loading profile:", err)
      setError("Failed to load profile")
    }
  }

  // Show skeleton while loading instead of full loading screen
  if (!profile) {
    return (
      <div className="profile-page-fixed h-screen bg-background text-foreground overflow-hidden">
        {/* Background Skeleton */}
        <div className="fixed inset-0 w-full h-full pointer-events-none -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900"></div>
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        {/* Profile Content Skeleton */}
        <div className="relative z-10 h-full flex items-center justify-center px-2 sm:px-4 py-4 sm:py-8">
          <div className="w-full max-w-sm sm:max-w-lg lg:max-w-2xl max-h-full">
            <div className="bg-card/80 backdrop-blur-sm border border-border shadow-xl rounded-2xl p-4 sm:p-6 animate-pulse">
              <div className="text-center">
                {/* Avatar Skeleton */}
                <div className="mb-3 sm:mb-4">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-600 mx-auto"></div>
                </div>
                
                {/* Name Skeleton */}
                <div className="mb-2">
                  <div className="h-6 sm:h-8 bg-gray-600 rounded w-32 mx-auto"></div>
                </div>
                
                {/* Username Skeleton */}
                <div className="mb-2 sm:mb-3">
                  <div className="h-4 bg-gray-600 rounded w-24 mx-auto"></div>
                </div>
                
                {/* Bio Skeleton */}
                <div className="mb-3 sm:mb-4">
                  <div className="h-4 bg-gray-600 rounded w-48 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-600 rounded w-40 mx-auto"></div>
                </div>
                
                {/* Social Links Skeleton */}
                <div className="mb-3 sm:mb-4">
                  <div className="flex justify-center gap-2 sm:gap-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-600 rounded-lg"></div>
                    ))}
                  </div>
                </div>
                
                {/* Badges Skeleton */}
                <div className="mt-3 sm:mt-4">
                  <div className="h-4 bg-gray-600 rounded w-16 mx-auto mb-2 sm:mb-3"></div>
                  <div className="flex justify-center gap-2 sm:gap-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-600 rounded-full"></div>
                    ))}
                  </div>
                </div>
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
            backgroundColor: profile?.background_color || '#0a0a0a',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        ></div>
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Profile Content - Fixed height container */}
      <div className="relative z-10 h-full flex items-center justify-center px-2 sm:px-4 py-4 sm:py-8">
        <div className="w-full max-w-sm sm:max-w-lg lg:max-w-2xl max-h-full">
                     {/* Main Profile Card */}
           <Card 
              className="profile-card-custom bg-card/80 backdrop-blur-sm border-border shadow-xl transition-all duration-300"
              style={{
                borderColor: profile?.card_outline_color || '#ef4444',
                boxShadow: profile?.card_glow_color && profile?.card_glow_intensity && profile?.enable_glow_effects !== false ? 
                  `0 0 ${20 * (profile.card_glow_intensity || 0.5)}px ${profile.card_glow_color}` : 
                  '0 0 20px rgba(239, 68, 68, 0.5)',
                borderRadius: `${profile?.border_radius || 12}px`
              }}
            >
            <CardContent className="p-4 sm:p-6">
              <div className="text-center">
                                 {/* Avatar */}
                 {profile?.avatar_url ? (
                   <div className="mb-3 sm:mb-4 group/avatar avatar">
                     <div className="relative">
                       <img
                         src={profile.avatar_url}
                         alt={`${profile.display_name || profile.username}'s avatar`}
                         className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto border-4 border-primary shadow-lg transition-all duration-500 group-hover/avatar:scale-110 group-hover/avatar:shadow-2xl group-hover/avatar:shadow-primary/30"
                         style={{
                           borderColor: profile?.card_outline_color || '#ef4444'
                         }}
                       />
                       <div className="absolute inset-0 rounded-full bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-500" />
                     </div>
                   </div>
                 ) : (
                   <div className="mb-3 sm:mb-4 group/avatar avatar">
                     <div className="relative">
                       <div 
                         className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto border-4 bg-muted flex items-center justify-center transition-all duration-500 group-hover/avatar:scale-110 group-hover/avatar:shadow-2xl group-hover/avatar:shadow-primary/30"
                         style={{
                           borderColor: profile?.card_outline_color || '#ef4444'
                         }}
                       >
                         <span 
                           className="text-2xl sm:text-3xl font-bold text-muted-foreground transition-all duration-300 group-hover/avatar:text-primary"
                           style={{
                             fontFamily: profile?.font_family || 'Inter',
                             fontSize: profile?.font_size || '16px',
                             color: profile?.font_color || '#ffffff'
                           }}
                         >
                           {profile.username.charAt(0).toUpperCase()}
                         </span>
                       </div>
                       <div className="absolute inset-0 rounded-full bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-500" />
                     </div>
                   </div>
                 )}

                                 {/* Profile Info */}
                 <div className="mb-3 sm:mb-4 profile-info">
                  <h1 
                    className="text-xl sm:text-2xl font-bold text-card-foreground mb-2"
                    style={{
                      fontFamily: profile?.font_family || 'Inter',
                      fontSize: profile?.font_size || '16px',
                      color: profile?.font_color || '#ffffff'
                    }}
                  >
                    {profile?.display_name || profile?.username}
                  </h1>
                  
                  {/* Username - Above Bio, Below Display Name */}
                  <div className="text-center mb-2 sm:mb-3">
                    <p className="text-xs sm:text-sm text-muted-foreground/70 font-mono">
                      @{profile.username}
                    </p>
                  </div>
                  
                  {/* Bio */}
                  {profile?.bio && (
                    <p 
                      className="text-muted-foreground text-xs sm:text-sm max-w-lg mx-auto mb-3 sm:mb-4 px-2 sm:px-0"
                      style={{
                        fontFamily: profile?.font_family || 'Inter',
                        fontSize: profile?.font_size || '16px',
                        color: profile?.font_color || '#ffffff'
                      }}
                    >
                      {profile.bio}
                    </p>
                  )}

                  {/* Social Links - Below Bio */}
                  {socialLinks.length > 0 && (
                    <div className="mb-3 sm:mb-4">
                      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                        {socialLinks.map((link) => {
                          // Get platform icon based on platform name
                          const getPlatformIcon = (platform: string) => {
                            const platformLower = platform.toLowerCase()
                            if (platformLower.includes('instagram')) {
                              return (
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                </svg>
                              )
                            }
                            if (platformLower.includes('twitter') || platformLower.includes('x')) return '𝕏'
                            if (platformLower.includes('facebook')) return '📘'
                            if (platformLower.includes('youtube')) return '📺'
                            if (platformLower.includes('tiktok')) return '🎵'
                            if (platformLower.includes('linkedin')) return '💼'
                            if (platformLower.includes('github')) return '🐙'
                            if (platformLower.includes('discord')) return '💬'
                            if (platformLower.includes('twitch')) return '🎮'
                            if (platformLower.includes('spotify')) return '🎵'
                            if (platformLower.includes('snapchat')) return '👻'
                            if (platformLower.includes('roblox')) return '🎮'
                            if (platformLower.includes('steam')) return '🎮'
                            if (platformLower.includes('epicgames')) return '🎮'
                            if (platformLower.includes('reddit')) return '🤖'
                            if (platformLower.includes('website')) return '🌐'
                            if (platformLower.includes('email')) return '📧'
                            if (platformLower.includes('phone')) return '📱'
                            if (platformLower.includes('custom')) return '🔗'
                            return '🔗'
                          }
                          
                          return (
                            <Link
                              key={link.id}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group relative inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 text-card-foreground rounded-lg transition-all duration-300 hover:scale-110"
                            >
                              {/* Show only the platform icon */}
                              <span className="text-lg sm:text-xl group-hover:scale-110 transition-transform duration-200">
                                {getPlatformIcon(link.platform)}
                              </span>
                              
                              {/* Hover tooltip with platform name */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-black/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                {link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
                              </div>
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Badges - Icon Only with Hover Tooltips */}
                  {userBadges.length > 0 && profile?.show_badges !== false && (
                    <div className="mt-3 sm:mt-4 badges">
                      <p className="text-xs text-muted-foreground/70 text-center mb-2 sm:mb-3">Badges</p>
                      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                      {userBadges.map((userBadge, index) => (
                        <div
                          key={userBadge.id}
                          className="group relative transform transition-all duration-300 hover:scale-110 hover:rotate-3"
                          style={{
                            animationDelay: `${index * 100}ms`
                          }}
                          onMouseMove={(e) => {
                            if (profile?.enable_tilt_effects !== false) {
                              const badge = e.currentTarget
                              const rect = badge.getBoundingClientRect()
                              const x = e.clientX - rect.left
                              const y = e.clientY - rect.top
                              const centerX = rect.width / 2
                              const centerY = rect.height / 2
                              
                              const rotateX = (y - centerY) / 6
                              const rotateY = (centerX - x) / 6
                              
                              badge.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.1)`
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (profile?.enable_tilt_effects !== false) {
                              const badge = e.currentTarget
                              badge.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)'
                            }
                          }}
                        >
                          {/* Badge Icon */}
                          <div 
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xl sm:text-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl cursor-default badge-icon"
                            style={{
                              backgroundColor: userBadge.badge.color + '20',
                              borderColor: userBadge.badge.color,
                              color: userBadge.badge.color
                            }}
                          >
                            {userBadge.badge.icon}
                          </div>
                          
                          {/* Hover Tooltip */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-black/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 tooltip-animate">
                            {userBadge.badge.display_name}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
                          </div>
                        </div>
                      ))}
                      </div>
                    </div>
                  )}
                  
                  
                </div>

                                  {/* Stats */}
                  {profile?.show_stats !== false && (
                    <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-6 text-xs text-muted-foreground stats">
                      <span className="flex items-center justify-center gap-1 group/stat hover:text-primary transition-colors duration-300 cursor-default">
                        <Eye className="w-3 h-3 group-hover/stat:scale-110 transition-transform duration-200" />
                        <span className="group-hover/stat:font-medium transition-all duration-200">
                          {profile?.view_count || 0} views
                        </span>
                      </span>
                      <span className="flex items-center justify-center gap-1 group/stat hover:text-primary transition-colors duration-300 cursor-default">
                        <Calendar className="w-3 h-3 group-hover/stat:scale-110 transition-transform duration-200" />
                        <span className="group-hover/stat:font-medium transition-all duration-200">
                          Joined {new Date(profile.created_at).toLocaleDateString()}
                        </span>
                      </span>
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>

                                       {/* Advanced Music Player with 2 Styles */}
                                        {musicTracks.length > 0 && profile?.show_music_player !== false && (
                                          <Card 
                                            className="bg-card/80 backdrop-blur-sm border-border mt-3 sm:mt-4 hover:shadow-xl hover:shadow-primary/10 transition-all duration-500 transform-gpu hover:scale-[1.01]"
                                           style={{
                                             borderColor: profile?.card_outline_color || '#ef4444',
                                             boxShadow: profile?.card_glow_color && profile?.card_glow_intensity ? 
                                               `0 0 ${15 * (profile.card_glow_intensity || 0.5)}px ${profile.card_glow_color}` : 
                                               '0 0 15px rgba(239, 68, 68, 0.3)',
                                             borderRadius: `${profile?.border_radius || 12}px`
                                           }}
                                         >
                                           <CardContent className="p-3 sm:p-4">
                                             


                                              {/* Sleek Horizontal Style */}
                                              {profile?.music_player_style === 'sleek' && (
                                                <div className="bg-gradient-to-r from-card/60 via-card/40 to-card/60 backdrop-blur-md rounded-xl p-2 sm:p-3 border border-border/30 hover:border-primary/20 transition-all duration-300">
                                                  <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                                                    {/* Track Info - Top on Mobile, Left on Desktop */}
                                                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 order-1 sm:order-1">
                                                      <div className="relative">
                                                        {musicTracks[0].cover_image_url ? (
                                                          <img
                                                            src={musicTracks[0].cover_image_url}
                                                            alt={musicTracks[0].title}
                                                            className="w-10 h-10 sm:w-8 sm:h-8 rounded-lg object-cover shadow-md ring-1 ring-border/30"
                                                          />
                                                        ) : (
                                                          <div className="w-10 h-10 sm:w-8 sm:h-8 rounded-lg bg-muted flex items-center justify-center ring-1 ring-border/30">
                                                            <Music className="w-5 h-5 sm:w-4 sm:h-4 text-muted-foreground" />
                                                          </div>
                                                        )}
                                                      </div>
                                                      <div className="min-w-0 flex-1">
                                                        <p className="font-medium text-sm sm:text-xs text-card-foreground truncate">
                                                          {musicTracks[0].title}
                                                        </p>
                                                        {musicTracks[0].artist && (
                                                          <p className="text-xs sm:text-xs text-muted-foreground truncate">
                                                            {musicTracks[0].artist}
                                                          </p>
                                                        )}
                                                      </div>
                                                    </div>
                                                    
                                                    {/* Progress Bar - Center on Mobile, Right on Desktop */}
                                                    <div className="flex items-center gap-2 flex-1 max-w-full sm:max-w-32 order-3 sm:order-2 w-full">
                                                      <span className="text-xs text-muted-foreground font-mono min-w-[2rem]">0:00</span>
                                                      <div className="flex-1 relative group">
                                                        <div 
                                                          className="w-full bg-muted/50 rounded-full h-2 sm:h-1.5 cursor-pointer hover:h-2.5 sm:hover:h-2 transition-all duration-200"
                                                          onClick={(e) => {
                                                            const audio = document.getElementById('music-player-audio') as HTMLAudioElement
                                                            if (audio && audio.duration && isFinite(audio.duration)) {
                                                              const rect = e.currentTarget.getBoundingClientRect()
                                                              const clickX = e.clientX - rect.left
                                                              const percentage = (clickX / rect.width) * 100
                                                              const newTime = (percentage / 100) * audio.duration
                                                              if (isFinite(newTime) && newTime >= 0) {
                                                                audio.currentTime = newTime
                                                              }
                                                            }
                                                          }}
                                                        >
                                                          <div 
                                                            className="bg-primary h-full rounded-full transition-all duration-300 shadow-sm relative"
                                                            style={{ 
                                                              width: '0%',
                                                              boxShadow: `0 0 4px ${profile?.card_outline_color || '#ef4444'}40`
                                                            }}
                                                          >
                                                            {/* Scrubber Handle */}
                                                            <div 
                                                              className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 sm:w-2 sm:h-2 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer hover:scale-125"
                                                              style={{ 
                                                                boxShadow: `0 0 6px ${profile?.card_outline_color || '#ef4444'}60`
                                                              }}
                                                            ></div>
                                                          </div>
                                                        </div>
                                                      </div>
                                                      <span className="text-xs text-muted-foreground font-mono min-w-[2rem]">0:00</span>
                                                    </div>
                                                    
                                                    {/* Controls Row - Bottom on Mobile, Right on Desktop */}
                                                    <div className="flex items-center gap-3 order-2 sm:order-3">
                                                      {/* Small Play Button */}
                                                      <button 
                                                        onClick={() => {
                                                          const audio = document.getElementById('music-player-audio') as HTMLAudioElement
                                                          if (audio) {
                                                            if (audio.paused) {
                                                              audio.play()
                                                            } else {
                                                              audio.pause()
                                                            }
                                                          }
                                                        }}
                                                        className="w-8 h-8 sm:w-6 sm:h-6 flex items-center justify-center rounded-full bg-primary/80 hover:bg-primary transition-all duration-200 group hover:scale-110 shadow-md"
                                                      >
                                                        <div className="w-3 h-3 sm:w-2 sm:h-2 flex items-center justify-center text-white">
                                                          <div className="w-0 h-0 border-l-[5px] sm:border-l-[4px] border-l-white border-t-[4px] sm:border-t-[3px] border-b-[4px] sm:border-b-[3px] border-t-transparent border-b-transparent ml-0.5"></div>
                                                        </div>
                                                      </button>
                                                      
                                                      {/* Volume Control - Compact */}
                                                      <div className="flex items-center gap-2">
                                                        <div className="w-4 h-4 sm:w-3 sm:h-3 text-muted-foreground">
                                                          <svg viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                                                          </svg>
                                                        </div>
                                                        <div className="w-20 sm:w-16 relative group">
                                                          <div 
                                                            className="w-full bg-muted/50 rounded-full h-1.5 sm:h-1 cursor-pointer hover:h-2 sm:hover:h-1.5 transition-all duration-200"
                                                            onClick={(e) => {
                                                              const audio = document.getElementById('music-player-audio') as HTMLAudioElement
                                                              if (audio) {
                                                                const rect = e.currentTarget.getBoundingClientRect()
                                                                const clickX = e.clientX - rect.left
                                                                const percentage = (clickX / rect.width) * 100
                                                                const newVolume = percentage / 100
                                                                audio.volume = newVolume
                                                                
                                                                // Update volume bar width
                                                                const volumeBar = e.currentTarget.querySelector('.bg-primary') as HTMLElement
                                                                if (volumeBar) {
                                                                  volumeBar.style.width = `${percentage}%`
                                                                }
                                                                
                                                                // Update volume handle position
                                                                const volumeHandle = e.currentTarget.parentElement?.querySelector('.w-3.h-3.bg-primary.rounded-full, .w-2.h-2.bg-primary.rounded-full') as HTMLElement
                                                                if (volumeHandle) {
                                                                  volumeHandle.style.left = `${percentage}%`
                                                                  volumeHandle.style.marginLeft = volumeHandle.classList.contains('w-3') ? '-6px' : '-4px'
                                                                }
                                                              }
                                                            }}
                                                          >
                                                            <div 
                                                              className="bg-primary h-full rounded-full transition-all duration-300"
                                                              style={{ 
                                                                width: '70%',
                                                                boxShadow: `0 0 3px ${profile?.card_outline_color || '#ef4444'}40`
                                                              }}
                                                            ></div>
                                                          </div>
                                                          {/* Volume Handle */}
                                                          <div 
                                                            className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 sm:w-2 sm:h-2 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer hover:scale-125"
                                                            style={{ 
                                                              left: '70%',
                                                              marginLeft: '-6px',
                                                              boxShadow: `0 0 4px ${profile?.card_outline_color || '#ef4444'}60`
                                                            }}
                                                          ></div>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>
                                                  
                                                  {/* Hidden Audio Element for Functionality */}
                                                  <audio
                                                    id="music-player-audio"
                                                    className="hidden"
                                                    src={musicTracks[0].audio_url}
                                                    preload="metadata"
                                                    onTimeUpdate={(e) => {
                                                      const audio = e.currentTarget
                                                      const progressBar = e.currentTarget.parentElement?.querySelector('.bg-primary') as HTMLElement
                                                      const currentTime = e.currentTarget.parentElement?.querySelector('.text-muted-foreground:first-of-type') as HTMLElement
                                                      const duration = e.currentTarget.parentElement?.querySelector('.text-muted-foreground:last-of-type') as HTMLElement
                                                      
                                                      if (progressBar && currentTime && duration) {
                                                        const progress = (audio.currentTime / audio.duration) * 100
                                                        progressBar.style.width = `${progress}%`
                                                        
                                                        currentTime.textContent = formatTime(audio.currentTime)
                                                        duration.textContent = formatTime(audio.duration)
                                                      }
                                                    }}
                                                    onPlay={(e) => {
                                                      const playButton = e.currentTarget.parentElement?.querySelector('.w-8.h-8.rounded-full.bg-primary\\/80, .w-6.h-6.rounded-full.bg-primary\\/80') as HTMLElement
                                                      if (playButton) {
                                                        playButton.innerHTML = '<div class="w-3 h-3 sm:w-2 sm:h-2 flex items-center justify-center text-white"><div class="w-1 h-2 sm:w-1 sm:h-2 bg-white rounded-full mr-0.5"></div><div class="w-1 h-2 sm:w-1 sm:h-2 bg-white rounded-full"></div></div>'
                                                      }
                                                    }}
                                                    onPause={(e) => {
                                                      const playButton = e.currentTarget.parentElement?.querySelector('.w-8.h-8.rounded-full.bg-primary\\/80, .w-6.h-6.rounded-full.bg-primary\\/80') as HTMLElement
                                                      if (playButton) {
                                                        playButton.innerHTML = '<div class="w-3 h-3 sm:w-2 sm:h-2 flex items-center justify-center text-white"><div class="w-0 h-0 border-l-[5px] sm:border-l-[4px] border-l-white border-t-[4px] sm:border-t-[3px] border-b-[4px] sm:border-b-[3px] border-t-transparent border-b-transparent ml-0.5"></div></div>'
                                                      }
                                                    }}
                                                  />
                                                </div>
                                              )}
                                           </CardContent>
                                         </Card>
                                       )}

                                       {/* Tab Style - Top Right Corner */}
                                       {musicTracks.length > 0 && profile?.show_music_player !== false && profile?.music_player_style === 'tab' && (
                                         <div className="fixed top-4 right-4 z-50">
                                           <div className="bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-lg rounded-2xl p-3 border border-border/50 shadow-2xl shadow-primary/20 max-w-xs">
                                             {/* Compact Track Info */}
                                             <div className="flex items-center gap-2 mb-3">
                                               <div className="relative">
                                                 {musicTracks[0].cover_image_url ? (
                                                   <img
                                                     src={musicTracks[0].cover_image_url}
                                                     alt={musicTracks[0].title}
                                                     className="w-10 h-10 rounded-lg object-cover shadow-md"
                                                   />
                                                 ) : (
                                                   <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                                     <Music className="w-5 h-5 text-muted-foreground" />
                                                   </div>
                                                 )}
                                               </div>
                                               <div className="flex-1 min-w-0">
                                                 <p className="font-medium text-sm text-card-foreground truncate">
                                                   {musicTracks[0].title}
                                                 </p>
                                                 {musicTracks[0].artist && (
                                                   <p className="text-xs text-muted-foreground truncate">
                                                     {musicTracks[0].artist}
                                                   </p>
                                                 )}
                                               </div>
                                               
                                               {/* Close Button */}
                                               <button
                                                 onClick={() => setMusicPlayerOpen(false)}
                                                 className="text-muted-foreground hover:text-card-foreground transition-colors p-1 rounded hover:bg-card/30"
                                               >
                                                 ✕
                                               </button>
                                             </div>
                                             
                                             {/* Play/Pause Button */}
                                             <div className="flex justify-center mb-3">
                                               <button 
                                                 onClick={() => {
                                                   const audio = document.getElementById('music-player-audio-tab') as HTMLAudioElement
                                                   if (audio) {
                                                     if (audio.paused) {
                                                       audio.play()
                                                     } else {
                                                       audio.pause()
                                                     }
                                                   }
                                                 }}
                                                 className="w-10 h-10 flex items-center justify-center rounded-full bg-primary hover:bg-primary/80 transition-all duration-200 group hover:scale-110 shadow-lg"
                                               >
                                                 <div className="w-3 h-3 flex items-center justify-center text-white">
                                                   <div className="w-0 h-0 border-l-[6px] border-l-white border-t-[5px] border-b-[5px] border-t-transparent border-b-transparent ml-0.5"></div>
                                                 </div>
                                               </button>
                                             </div>
                                             
                                             {/* Compact Progress Bar */}
                                             <div className="flex items-center gap-2 mb-2">
                                               <span className="text-xs text-muted-foreground font-mono min-w-[2rem]">0:00</span>
                                               <div className="flex-1 relative group">
                                                 <div 
                                                   className="w-full bg-muted/50 rounded-full h-1 cursor-pointer hover:h-1.5 transition-all duration-200"
                                                   onClick={(e) => {
                                                     const audio = document.getElementById('music-player-audio-tab') as HTMLAudioElement
                                                     if (audio && audio.duration && isFinite(audio.duration)) {
                                                       const rect = e.currentTarget.getBoundingClientRect()
                                                       const clickX = e.clientX - rect.left
                                                       const percentage = (clickX / rect.width) * 100
                                                       const newTime = (percentage / 100) * audio.duration
                                                       if (isFinite(newTime) && newTime >= 0) {
                                                         audio.currentTime = newTime
                                                       }
                                                     }
                                                   }}
                                                 >
                                                   <div 
                                                     className="bg-primary h-full rounded-full transition-all duration-300 shadow-sm relative"
                                                     style={{ 
                                                       width: '0%',
                                                       boxShadow: `0 0 4px ${profile?.card_outline_color || '#ef4444'}40`
                                                     }}
                                                   >
                                                     {/* Scrubber Handle */}
                                                     <div 
                                                       className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer hover:scale-125"
                                                       style={{ 
                                                         boxShadow: `0 0 6px ${profile?.card_outline_color || '#ef4444'}60`
                                                       }}
                                                     ></div>
                                                   </div>
                                                 </div>
                                               </div>
                                               <span className="text-xs text-muted-foreground font-mono min-w-[2rem]">0:00</span>
                                             </div>
                                             
                                             {/* Small Play Button */}
                                             <button 
                                               onClick={() => {
                                                 const audio = document.getElementById('music-player-audio-tab') as HTMLAudioElement
                                                 if (audio) {
                                                   if (audio.paused) {
                                                     audio.play()
                                                   } else {
                                                     audio.pause()
                                                   }
                                                 }
                                               }}
                                               className="w-6 h-6 flex items-center justify-center rounded-full bg-primary/80 hover:bg-primary transition-all duration-200 group hover:scale-110 shadow-md mx-auto"
                                             >
                                               <div className="w-2 h-2 flex items-center justify-center text-white">
                                                 <div className="w-0 h-0 border-l-[4px] border-l-white border-t-[3px] border-b-[3px] border-t-transparent border-b-transparent ml-0.5"></div>
                                               </div>
                                             </button>
                                             
                                             {/* Compact Volume Control */}
                                             <div className="flex items-center gap-2">
                                               <div className="w-3 h-3 text-muted-foreground">
                                                 <svg viewBox="0 0 24 24" fill="currentColor">
                                                   <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                                                 </svg>
                                               </div>
                                               <div className="flex-1 relative group">
                                                 <div className="w-full bg-muted/50 rounded-full h-1 cursor-pointer hover:h-1.5 transition-all duration-200">
                                                   <div 
                                                     className="bg-primary h-full rounded-full transition-all duration-300"
                                                     style={{ 
                                                       width: '70%',
                                                       boxShadow: `0 0 3px ${profile?.card_outline_color || '#ef4444'}40`
                                                     }}
                                                   ></div>
                                                 </div>
                                                 {/* Volume Handle */}
                                                 <div 
                                                   className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer hover:scale-125"
                                                   style={{ 
                                                     left: '70%',
                                                     marginLeft: '-4px',
                                                     boxShadow: `0 0 6px ${profile?.card_outline_color || '#ef4444'}60`
                                                   }}
                                                 ></div>
                                               </div>
                                             </div>
                                             
                                             {/* Hidden Audio Element for Functionality */}
                                             <audio
                                               id="music-player-audio-tab"
                                               className="hidden"
                                               src={musicTracks[0].audio_url}
                                               preload="metadata"
                                               onTimeUpdate={(e) => {
                                                 const audio = e.currentTarget
                                                 const progressBar = e.currentTarget.parentElement?.querySelector('.bg-primary') as HTMLElement
                                                 const currentTime = e.currentTarget.parentElement?.querySelector('.text-muted-foreground:first-of-type') as HTMLElement
                                                 const duration = e.currentTarget.parentElement?.querySelector('.text-muted-foreground:last-of-type') as HTMLElement
                                                 
                                                 if (progressBar && currentTime && duration) {
                                                   const progress = (audio.currentTime / audio.duration) * 100
                                                   progressBar.style.width = `${progress}%`
                                                   
                                                   currentTime.textContent = formatTime(audio.currentTime)
                                                   duration.textContent = formatTime(audio.duration)
                                                 }
                                               }}
                                               onPlay={(e) => {
                                                 const playButton = e.currentTarget.parentElement?.querySelector('.w-10.h-10.rounded-full.bg-primary') as HTMLElement
                                                 if (playButton) {
                                                   playButton.innerHTML = '<div class="w-3 h-3 flex items-center justify-center text-white"><div class="w-1 h-3 bg-white rounded-full mr-0.5"></div><div class="w-1 h-3 bg-white rounded-full"></div></div>'
                                                 }
                                               }}
                                               onPause={(e) => {
                                                 const playButton = e.currentTarget.parentElement?.querySelector('.w-10.h-10.rounded-full.bg-primary') as HTMLElement
                                                 if (playButton) {
                                                   playButton.innerHTML = '<div class="w-3 h-3 flex items-center justify-center text-white"><div class="w-0 h-0 border-l-[6px] border-l-white border-t-[5px] border-b-[5px] border-t-transparent border-b-transparent ml-0.5"></div></div>'
                                                 }
                                               }}
                                             />
                                           </div>
                                         </div>
                                       )}
        </div>
      </div>
    </div>
  )
}
