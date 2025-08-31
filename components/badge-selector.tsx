"use client"

import { useState } from "react"
import { Search, Crown, Star, Shield, Heart, Zap, Lock, Palette, Video, TrendingUp, Gamepad2, Music, Camera, PenTool, Briefcase, GraduationCap, Plane, Dumbbell, Utensils, Smartphone, BookOpen } from "lucide-react"
import { Input } from "@/components/ui/input"

interface BadgeSelectorProps {
  currentBadgeId: string | null
  onBadgeSelect: (badgeId: string) => void
  isPremium?: boolean
  isVerified?: boolean
  viewCount?: number
}

// Badge data with proper restrictions
const getAvailableBadges = (isPremium: boolean, isVerified: boolean, viewCount: number = 0) => [
  {
    id: "verified",
    display_name: "Verified",
    description: "Account verified and trusted",
    icon: Shield,
    color: "text-red-400",
    bgColor: "bg-red-500/20",
    requirement: "Account verification",
    isAvailable: isVerified,
    isLocked: !isVerified
  },
  {
    id: "premium",
    display_name: "Premium",
    description: "Premium member badge",
    icon: Star,
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/20",
    requirement: "Premium subscription",
    isAvailable: isPremium,
    isLocked: !isPremium
  },
  {
    id: "popular",
    display_name: "Popular",
    description: "High engagement user",
    icon: Heart,
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
    requirement: "100+ profile views",
    isAvailable: viewCount >= 100,
    isLocked: !(viewCount >= 100)
  },
  {
    id: "early-adopter",
    display_name: "Early Adopter",
    description: "Joined during early access",
    icon: Zap,
    color: "text-green-400",
    bgColor: "bg-green-500/20",
    requirement: "Joined before 2024",
    isAvailable: true, // Always available for early users
    isLocked: false
  },
  {
    id: "vip",
    display_name: "VIP",
    description: "Very important person",
    icon: Crown,
    color: "text-purple-400",
    bgColor: "bg-purple-500/20",
    requirement: "Premium + 500+ views",
    isAvailable: isPremium && viewCount >= 500,
    isLocked: !(isPremium && viewCount >= 500)
  },
  {
    id: "developer",
    display_name: "Developer",
    description: "Software developer & coder",
    icon: Zap,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/20",
    requirement: "Premium subscription",
    isAvailable: isPremium,
    isLocked: !isPremium
  },
  {
    id: "designer",
    display_name: "Designer",
    description: "Creative designer & artist",
    icon: Palette,
    color: "text-pink-400",
    bgColor: "bg-pink-500/20",
    requirement: "Premium subscription",
    isAvailable: isPremium,
    isLocked: !isPremium
  },
  {
    id: "content-creator",
    display_name: "Content Creator",
    description: "Creates engaging content",
    icon: Video,
    color: "text-orange-400",
    bgColor: "bg-orange-500/20",
    requirement: "Premium subscription",
    isAvailable: isPremium,
    isLocked: !isPremium
  },
  {
    id: "influencer",
    display_name: "Influencer",
    description: "Social media influencer",
    icon: TrendingUp,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/20",
    requirement: "1000+ profile views",
    isAvailable: viewCount >= 1000,
    isLocked: !(viewCount >= 1000)
  },
  {
    id: "gamer",
    display_name: "Gamer",
    description: "Gaming enthusiast",
    icon: Gamepad2,
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/20",
    requirement: "Premium subscription",
    isAvailable: isPremium,
    isLocked: !isPremium
  },
  {
    id: "musician",
    display_name: "Musician",
    description: "Music creator & artist",
    icon: Music,
    color: "text-rose-400",
    bgColor: "bg-rose-500/20",
    requirement: "Premium subscription",
    isAvailable: isPremium,
    isLocked: !isPremium
  },
  {
    id: "photographer",
    display_name: "Photographer",
    description: "Visual storyteller",
    icon: Camera,
    color: "text-amber-400",
    bgColor: "bg-amber-500/20",
    requirement: "Premium subscription",
    isAvailable: isPremium,
    isLocked: !isPremium
  },
  {
    id: "writer",
    display_name: "Writer",
    description: "Wordsmith & storyteller",
    icon: PenTool,
    color: "text-slate-400",
    bgColor: "bg-slate-500/20",
    requirement: "Premium subscription",
    isAvailable: isPremium,
    isLocked: !isPremium
  },
  {
    id: "entrepreneur",
    display_name: "Entrepreneur",
    description: "Business builder",
    icon: Briefcase,
    color: "text-lime-400",
    bgColor: "bg-lime-500/20",
    requirement: "Premium subscription",
    isAvailable: isPremium,
    isLocked: !isPremium
  },
  {
    id: "student",
    display_name: "Student",
    description: "Learning & growing",
    icon: GraduationCap,
    color: "text-teal-400",
    bgColor: "bg-teal-500/20",
    requirement: "Free for all students",
    isAvailable: true,
    isLocked: false
  },
  {
    id: "traveler",
    display_name: "Traveler",
    description: "Explorer & adventurer",
    icon: Plane,
    color: "text-sky-400",
    bgColor: "bg-sky-500/20",
    requirement: "Premium subscription",
    isAvailable: isPremium,
    isLocked: !isPremium
  },
  {
    id: "fitness",
    display_name: "Fitness",
    description: "Health & wellness",
    icon: Dumbbell,
    color: "text-red-500",
    bgColor: "bg-red-500/20",
    requirement: "Premium subscription",
    isAvailable: isPremium,
    isLocked: !isPremium
  },
  {
    id: "foodie",
    display_name: "Foodie",
    description: "Culinary enthusiast",
    icon: Utensils,
    color: "text-orange-500",
    bgColor: "bg-orange-500/20",
    requirement: "Premium subscription",
    isAvailable: isPremium,
    isLocked: !isPremium
  },
  {
    id: "tech-enthusiast",
    display_name: "Tech Enthusiast",
    description: "Technology lover",
    icon: Smartphone,
    color: "text-blue-500",
    bgColor: "bg-blue-500/20",
    requirement: "Premium subscription",
    isAvailable: isPremium,
    isLocked: !isPremium
  },
  {
    id: "bookworm",
    display_name: "Bookworm",
    description: "Avid reader",
    icon: BookOpen,
    color: "text-violet-500",
    bgColor: "bg-violet-500/20",
    requirement: "Premium subscription",
    isAvailable: isPremium,
    isLocked: !isPremium
  }
]

export function BadgeSelector({ 
  currentBadgeId, 
  onBadgeSelect, 
  isPremium = false, 
  isVerified = false,
  viewCount = 0
}: BadgeSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const availableBadges = getAvailableBadges(isPremium, isVerified, viewCount)

  const filteredBadges = availableBadges.filter(
    (badge) =>
      badge.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      badge.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search badges..."
          className="pl-10 bg-black/30 border-gray-700/50 text-white rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
        {filteredBadges.map((badge) => {
          const isSelected = currentBadgeId === badge.id
          const Icon = badge.icon

          return (
            <div
              key={badge.id}
              onClick={() => badge.isAvailable ? onBadgeSelect(badge.id) : null}
              className={`
                flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200
                ${
                  badge.isAvailable
                    ? "cursor-pointer hover:border-gray-600 hover:bg-gray-800/50"
                    : "cursor-not-allowed opacity-60"
                }
                ${
                  isSelected
                    ? "bg-red-500/20 border-red-500 shadow-lg shadow-red-500/10"
                    : "bg-gray-800/30 border-gray-700/50"
                }
              `}
            >
              <div className={`w-10 h-10 rounded-full ${badge.bgColor} flex items-center justify-center relative`}>
                <Icon className={`w-5 h-5 ${badge.color}`} />
                {badge.isLocked && (
                  <Lock className="w-3 h-3 text-gray-400 absolute -top-1 -right-1" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-white">{badge.display_name}</p>
                  {badge.isLocked && (
                    <span className="text-xs text-gray-500 bg-gray-800/50 px-2 py-1 rounded-full">
                      Locked
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 truncate mb-1">{badge.description}</p>
                <p className="text-xs text-gray-500">Requires: {badge.requirement}</p>
              </div>
              {isSelected && <div className="w-2 h-2 bg-red-500 rounded-full" />}
            </div>
          )
        })}
      </div>

                   <div className="text-xs text-gray-400 text-center space-y-1">
               <p>Select a badge to display on your profile</p>
               <p>Some badges require specific achievements, profile views, or premium status</p>
             </div>
    </div>
  )
}
