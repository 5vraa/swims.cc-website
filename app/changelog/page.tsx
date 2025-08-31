"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"

import { Calendar, GitBranch, Zap, Shield, Bug, Star, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface ChangelogEntry {
  id: string
  title: string
  content: string
  version: string
  type: "feature" | "bugfix" | "improvement" | "security"
  created_at: string
}

export default function ChangelogPage() {
  const [entries, setEntries] = useState<ChangelogEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterType, setFilterType] = useState<string>("all")

  useEffect(() => {
    fetchEntries()
  }, [])

  const fetchEntries = () => {
    // For now, we'll use mock data since the database table might not exist
    const mockEntries: ChangelogEntry[] = [
      {
        id: "1",
        title: "Discord Integration & Role Management",
        content: "Added comprehensive Discord OAuth integration with automatic role assignment. Staff members with the appropriate Discord role now get automatic admin access. Includes role checking API endpoints and seamless authentication flow.",
        version: "v2.1.0",
        type: "feature",
        created_at: "2024-01-15T10:00:00Z"
      },
      {
        id: "2",
        title: "Premium Features & Advanced Styling",
        content: "Introduced premium subscription system with advanced customization options. New features include custom card effects, glow settings, typography controls, background blur, and reveal page functionality. Premium users get access to exclusive styling options.",
        version: "v2.0.0",
        type: "feature",
        created_at: "2024-01-10T10:00:00Z"
      },
      {
        id: "3",
        title: "Admin Dashboard Redesign",
        content: "Completely redesigned admin dashboard with glass-panel styling matching the profile dashboard. Added sidebar navigation, overview statistics, and placeholder sections for future admin features including user management, analytics, and system monitoring.",
        version: "v1.9.0",
        type: "improvement",
        created_at: "2024-01-05T10:00:00Z"
      },
      {
        id: "4",
        title: "Profile Editor with Sidebar Navigation",
        content: "Refactored profile edit page to use left sidebar navigation instead of tabs. Added comprehensive sections for Profile, Appearance, Links, Music, Badges, Reveal, and Settings. Improved user experience with better organization and visual hierarchy.",
        version: "v1.8.0",
        type: "improvement",
        created_at: "2024-01-01T10:00:00Z"
      },
      {
        id: "5",
        title: "Music Player & Social Links Management",
        content: "Added comprehensive music player with track management, drag-and-drop reordering, and player customization. Enhanced social links manager with platform-specific icons and better organization. Both components now properly integrate with profile system.",
        version: "v1.7.0",
        type: "feature",
        created_at: "2023-12-25T10:00:00Z"
      },
      {
        id: "6",
        title: "Badge System & Reveal Pages",
        content: "Implemented badge system for user achievements and status display. Added reveal page functionality for premium users to create exclusive content. Both systems integrate seamlessly with the profile customization workflow.",
        version: "v1.6.0",
        type: "feature",
        created_at: "2023-12-20T10:00:00Z"
      },
      {
        id: "7",
        title: "Database Schema & RLS Policies",
        content: "Completely restructured database schema with proper RLS policies, updated column names from user_id to id, and added all necessary fields for premium features. Fixed authentication callback and profile creation flow.",
        version: "v1.5.0",
        type: "improvement",
        created_at: "2023-12-15T10:00:00Z"
      },
      {
        id: "8",
        title: "Site Header & Navigation Updates",
        content: "Updated site header to include Explore link and improved navigation structure. Fixed layout issues and ensured consistent styling across all pages. Added proper footer with comprehensive site information and links.",
        version: "v1.4.0",
        type: "improvement",
        created_at: "2023-12-10T10:00:00Z"
      }
    ]
    
    setEntries(mockEntries)
    setIsLoading(false)
  }

  const getTypeBadge = (type: string) => {
    const colors = {
      feature: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      bugfix: "bg-red-500/10 text-red-400 border-red-500/20",
      improvement: "bg-green-500/10 text-green-400 border-green-500/20",
      security: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    }
    return <Badge className={colors[type as keyof typeof colors]}>{type}</Badge>
  }

  const getTypeIcon = (type: string) => {
    const icons = {
      feature: Star,
      bugfix: Bug,
      improvement: Zap,
      security: Shield,
    }
    const Icon = icons[type as keyof typeof icons] || GitBranch
    return <Icon className="w-4 h-4" />
  }

  const filteredEntries = filterType === "all" 
    ? entries 
    : entries.filter(entry => entry.type === filterType)

  return (
    <div className="min-h-screen bg-[#0f0b0c] text-foreground">
      {/* Header Section */}
      <div className="relative z-10 px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Changelog</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Stay updated with the latest features, improvements, and bug fixes
          </p>
          
          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button
              onClick={() => setFilterType("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === "all"
                  ? "bg-black/80 text-white"
                  : "bg-black/20 text-gray-300 hover:text-white hover:bg-black/40"
              }`}
            >
              All Updates
            </button>
            <button
              onClick={() => setFilterType("feature")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === "feature"
                  ? "bg-black/80 text-white"
                  : "bg-black/20 text-gray-300 hover:text-white hover:bg-black/40"
              }`}
            >
              Features
            </button>
            <button
              onClick={() => setFilterType("improvement")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === "improvement"
                  ? "bg-black/80 text-white"
                  : "bg-black/20 text-gray-300 hover:text-white hover:bg-black/40"
              }`}
            >
              Improvements
            </button>
            <button
              onClick={() => setFilterType("bugfix")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === "bugfix"
                  ? "bg-black/80 text-white"
                  : "bg-black/20 text-gray-300 hover:text-white hover:bg-black/40"
              }`}
            >
              Bug Fixes
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative z-10 px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            {isLoading ? (
              <Card className="bg-black/20 backdrop-blur-md border-gray-700/50">
                <CardContent className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                  <span className="ml-3 text-white">Loading changelog...</span>
                </CardContent>
              </Card>
            ) : filteredEntries.length === 0 ? (
              <Card className="bg-black/20 backdrop-blur-md border-gray-700/50">
                <CardContent className="text-center p-8">
                  <p className="text-gray-400">No changelog entries found for the selected filter.</p>
                </CardContent>
              </Card>
            ) : (
              filteredEntries.map((entry) => (
                <Card key={entry.id} className="bg-black/20 backdrop-blur-md border-gray-700/50 hover:border-gray-600/50 transition-all duration-200">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(entry.type)}
                        <CardTitle className="text-white text-xl">{entry.title}</CardTitle>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      {entry.version && (
                        <Badge variant="outline" className="text-gray-300 border-gray-600">
                          {entry.version}
                        </Badge>
                      )}
                      {getTypeBadge(entry.type)}
                    </div>
                    <CardDescription className="text-gray-400 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(entry.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-gray-300 leading-relaxed">{entry.content}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <Card className="bg-black/40 backdrop-blur-md border-black/50 max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-white text-2xl">Stay Updated</CardTitle>
                <CardDescription className="text-gray-300">
                  Get notified about new features and updates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap justify-center gap-4">
                  <Button asChild variant="outline" className="border-black/60 text-white hover:bg-black/20">
                    <Link href="/discord">
                      Join Discord
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                  <Button asChild className="bg-black/80 hover:bg-black text-white">
                    <Link href="/auth/signup">
                      Get Started
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
                <p className="text-sm text-gray-400">
                  Follow us for real-time updates and community discussions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
