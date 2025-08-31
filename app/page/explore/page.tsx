"use client"

import React, { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/badge"
import Link from "next/link"
import { Search, Users, Eye, Calendar } from "lucide-react"

interface Profile {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  is_premium: boolean
  is_verified: boolean
  view_count: number
  created_at: string
  role: string | null
}

export default function ExplorePage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"views" | "newest">("views")
  const [filter, setFilter] = useState<"all" | "premium" | "verified">("all")
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadProfiles()
  }, [sortBy, filter])

  const loadProfiles = async () => {
    try {
      setLoading(true)
      
      // Build optimized query
      let query = supabase
        .from("profiles")
        .select("id, username, display_name, bio, avatar_url, is_premium, is_verified, view_count, created_at, role")
        .eq("is_public", true)
        .limit(20)

      // Apply filters
      if (filter === "premium") {
        query = query.eq("is_premium", true)
      } else if (filter === "verified") {
        query = query.eq("is_verified", true)
      }

      // Apply sorting
      if (sortBy === "views") {
        query = query.order("view_count", { ascending: false })
      } else if (sortBy === "newest") {
        query = query.order("created_at", { ascending: false })
      }

      const { data, error } = await query

      if (error) {
        console.error("Error loading profiles:", error)
        setError("Failed to load profiles")
        return
      }

      setProfiles(data || [])
    } catch (err) {
      console.error("Error loading profiles:", err)
      setError("Failed to load profiles")
    } finally {
      setLoading(false)
    }
  }

  const filteredProfiles = profiles.filter(profile =>
    profile.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (profile.display_name && profile.display_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (profile.bio && profile.bio.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground p-4">
        <div className="max-w-7xl mx-auto">
          {/* Fast Loading Header */}
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h1 className="text-3xl font-bold mb-2">Loading Profiles</h1>
            <p className="text-muted-foreground">Checking your connection!</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Error Loading Profiles</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={loadProfiles}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center py-12">
          <h1 className="text-4xl font-bold mb-4">Explore Profiles</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Discover amazing profiles from our community
          </p>
          
          {/* Stats */}
          <div className="flex justify-center gap-8 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              {profiles.length} Profiles
            </span>
            <span className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              {profiles.reduce((sum, p) => sum + (p.view_count || 0), 0)} Total Views
            </span>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search profiles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={sortBy} onValueChange={(value: "views" | "newest") => setSortBy(value)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="views">Most Views</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filter} onValueChange={(value: "all" | "premium" | "verified") => setFilter(value)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Profiles</SelectItem>
                <SelectItem value="premium">Premium Only</SelectItem>
                <SelectItem value="verified">Verified Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Profiles Grid */}
        {filteredProfiles.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-2">No Profiles Found</h2>
            <p className="text-muted-foreground">
              {searchTerm ? `No profiles match "${searchTerm}"` : "No profiles available"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProfiles.map((profile) => (
              <Link key={profile.id} href={`/${profile.username}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent className="p-6">
                    {/* Avatar */}
                    <div className="text-center mb-4">
                      {profile.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={`${profile.display_name || profile.username}'s avatar`}
                          className="w-20 h-20 rounded-full mx-auto border-2 border-border group-hover:border-primary transition-colors"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full mx-auto border-2 border-border bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground">
                          {profile.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Profile Info */}
                    <div className="text-center">
                      <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                        {profile.display_name || profile.username}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">@{profile.username}</p>
                      
                      {profile.bio && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {profile.bio}
                        </p>
                      )}

                      {/* Badges */}
                      <div className="flex justify-center gap-1 mb-3">
                        {profile.is_premium && (
                          <Badge badge={{
                            id: "premium",
                            name: "premium",
                            display_name: "Premium",
                            description: "Premium user",
                            color: "#FFD700",
                            icon: "⭐",
                            is_active: true,
                            created_at: ""
                          }} />
                        )}
                        {profile.is_verified && (
                          <Badge badge={{
                            id: "verified",
                            name: "verified",
                            display_name: "Verified",
                            description: "Verified user",
                            color: "#00BFFF",
                            icon: "✓",
                            is_active: true,
                            created_at: ""
                          }} />
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex justify-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {profile.view_count || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(profile.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
