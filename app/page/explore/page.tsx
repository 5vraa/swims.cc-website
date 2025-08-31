"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/badge"
import { Eye, TrendingUp, Crown, Star, Users, Filter } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Profile {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  background_color: string
  background_image_url: string | null
  view_count: number

  is_verified: boolean
  is_premium: boolean
  created_at: string
}

export default function ExplorePage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"views" | "newest">("views")
  const [filter, setFilter] = useState<"all" | "verified" | "premium">("all")

  useEffect(() => {
    loadProfiles()
  }, [sortBy, filter])

  const loadProfiles = async () => {
    try {
      setLoading(true)
      setError(null)
      const supabase = createClient()

      // Single optimized query with all conditions
      let query = supabase
        .from("profiles")
        .select(`
          id,
          username,
          display_name,
          bio,
          avatar_url,
          background_color,
          background_image_url,
          view_count,
          is_verified,
          is_premium,
          created_at
        `)
        .limit(20) // Reduced limit for faster loading

      // Apply filters efficiently
      if (filter === "verified") {
        query = query.eq("is_verified", true)
      } else if (filter === "premium") {
        query = query.eq("is_premium", true)
      } else {
        // For "all" filter, don't add extra conditions - just get profiles
        query = query.eq("is_public", true)
      }

      // Apply sorting
      if (sortBy === "views") {
        query = query.order("view_count", { ascending: false })
      } else if (sortBy === "newest") {
        query = query.order("created_at", { ascending: false })
      }

      const { data, error } = await query

      if (error) {
        console.error("Supabase query error:", error)
        throw error
      }

      // Set profiles immediately - no fallback queries
      setProfiles(data || [])
    } catch (error) {
      console.error("Error loading profiles:", error)
      setError("Failed to load profiles")
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M"
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K"
    }
    return num.toString()
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return Math.floor(diffInSeconds / 60) + "m ago"
    if (diffInSeconds < 86400) return Math.floor(diffInSeconds / 3600) + "h ago"
    if (diffInSeconds < 2592000) return Math.floor(diffInSeconds / 86400) + "d ago"
    return Math.floor(diffInSeconds / 2592000) + "mo ago"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500/20 via-purple-500/20 to-blue-500/20">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
        <div className="relative z-10 px-6 py-16 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Explore Amazing Profiles
            </h1>
            <p className="text-xl text-gray-300 mb-8">Loading profiles...</p>
            
            {/* Simple Loading Spinner */}
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={loadProfiles}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-red-500/20 via-purple-500/20 to-blue-500/20">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
        <div className="relative z-10 px-6 py-16 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Explore Amazing Profiles
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Discover the most popular and trending bio profiles on the platform
            </p>
            
                         {/* Stats */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
               <div className="bg-black/20 backdrop-blur-md rounded-xl p-6 border border-gray-700/50">
                 <div className="text-3xl font-bold text-white mb-2">{profiles.length}</div>
                 <div className="text-gray-400">Active Profiles</div>
               </div>
               <div className="bg-black/20 backdrop-blur-md rounded-xl p-6 border border-gray-700/50">
                 <div className="text-3xl font-bold text-white mb-2">
                   {formatNumber(profiles.reduce((sum, p) => sum + (p.view_count || 0), 0))}
                 </div>
                 <div className="text-gray-400">Total Views</div>
               </div>
               <div className="bg-black/20 backdrop-blur-md rounded-xl p-6 border border-gray-700/50">
                 <div className="text-3xl font-bold text-white mb-2">
                   {profiles.filter(p => p.is_verified).length}
                 </div>
                 <div className="text-gray-400">Verified Profiles</div>
               </div>
             </div>
             
             
          </div>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-white">Top Profiles</h2>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Users className="w-4 h-4" />
                {profiles.length} profiles
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="bg-black/20 border border-gray-700/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">All Profiles</option>
                  <option value="verified">Verified Only</option>
                  <option value="premium">Premium Only</option>
                </select>
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-black/20 border border-gray-700/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="views">Most Views</option>

                <option value="newest">Newest</option>
              </select>
            </div>
          </div>

          {/* Profiles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile, index) => (
              <Card 
                key={profile.id} 
                className="bg-black/20 backdrop-blur-md border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:scale-105 group"
              >
                <CardContent className="p-6">
                  {/* Profile Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-red-500 to-purple-600">
                        {profile.avatar_url ? (
                          <Image
                            src={profile.avatar_url}
                            alt={profile.display_name || profile.username}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                            {profile.display_name?.charAt(0) || profile.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      
                      {/* Rank Badge */}
                      {index < 3 && (
                        <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-yellow-500 text-black' :
                          index === 1 ? 'bg-gray-400 text-black' :
                          'bg-orange-500 text-white'
                        }`}>
                          {index === 0 ? <Crown className="w-3 h-3" /> : index + 1}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white truncate">
                          {profile.display_name || profile.username}
                        </h3>
                        {profile.is_verified && (
                          <Badge variant="outline" className="text-blue-400 border-blue-400 text-xs">
                            ✓ Verified
                          </Badge>
                        )}
                        {profile.is_premium && (
                          <Badge variant="outline" className="text-yellow-400 border-yellow-400 text-xs">
                            <Star className="w-3 h-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-400 truncate">
                        @{profile.username}
                      </p>
                    </div>
                  </div>

                  {/* Bio */}
                  {profile.bio && (
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                      {profile.bio}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {formatNumber(profile.view_count || 0)} views
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      No likes
                    </div>
                    <div className="text-xs">
                      {getTimeAgo(profile.created_at)}
                    </div>
                  </div>

                  {/* View Profile Button */}
                  <Button 
                    asChild 
                    className="w-full bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-600 hover:to-purple-700 text-white"
                  >
                    <Link href={`/${profile.username}`}>
                      View Profile
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

                     {/* Empty State */}
           {profiles.length === 0 && (
             <div className="text-center py-16">
               <div className="w-24 h-24 mx-auto mb-6 bg-gray-800/50 rounded-full flex items-center justify-center">
                 <Users className="w-12 h-12 text-gray-400" />
               </div>
               <h3 className="text-xl font-semibold text-white mb-2">No profiles found</h3>
               <p className="text-gray-400 mb-6">
                 {filter !== "all" 
                   ? `No ${filter} profiles available. Try "All Profiles" instead.`
                   : "No profiles have been created yet. Be the first to create one!"
                 }
               </p>
               <div className="flex gap-3 justify-center">
                 <Button onClick={loadProfiles} variant="outline">
                   Refresh
                 </Button>
                 {filter !== "all" && (
                   <Button 
                     onClick={() => setFilter("all")} 
                     variant="default"
                     className="bg-red-600 hover:bg-red-700"
                   >
                     Show All Profiles
                   </Button>
                 )}
               </div>
             </div>
           )}
        </div>
      </div>
      
    </div>
  )
}
