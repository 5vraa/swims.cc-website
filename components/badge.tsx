import type { Badge as BadgeType } from "@/types/badge"
import { Crown, Code, Star, CheckCircle, Heart, Video, Flag as Flask, Shield } from "lucide-react"

interface BadgeProps {
  badge: BadgeType
  size?: "sm" | "md" | "lg"
  variant?: "filled" | "outlined" | "gradient"
  showTooltip?: boolean
  animated?: boolean
}

const iconMap = {
  crown: Crown,
  code: Code,
  star: Star,
  "check-circle": CheckCircle,
  heart: Heart,
  video: Video,
  flask: Flask,
  shield: Shield,
}

export function Badge({ badge, size = "md", variant = "filled", showTooltip = true, animated = false }: BadgeProps) {
  const IconComponent = iconMap[badge.icon as keyof typeof iconMap] || Star

  const sizeClasses = {
    sm: "px-2 py-1 text-xs gap-1",
    md: "px-3 py-1.5 text-sm gap-1.5",
    lg: "px-4 py-2 text-base gap-2",
  }

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  }

  const getVariantClasses = () => {
    switch (variant) {
      case "outlined":
        return `bg-transparent border-2 text-white`
      case "gradient":
        return `bg-gradient-to-r border-2 text-white`
      default:
        return `border-2 text-white`
    }
  }

  const getVariantStyles = () => {
    switch (variant) {
      case "outlined":
        return {
          borderColor: badge.color,
          color: badge.color,
        }
      case "gradient":
        return {
          backgroundImage: `linear-gradient(135deg, ${badge.color}40, ${badge.color}80)`,
          borderColor: badge.color,
          boxShadow: `0 0 20px ${badge.color}30`,
        }
      default:
        return {
          backgroundColor: `${badge.color}20`,
          borderColor: badge.color,
          color: badge.color,
          boxShadow: `0 0 10px ${badge.color}20`,
        }
    }
  }

  return (
    <div
      className={`
        inline-flex items-center rounded-full font-medium transition-all duration-300
        ${sizeClasses[size]} ${getVariantClasses()}
        ${animated ? "hover:scale-105 hover:shadow-lg cursor-pointer" : ""}
        ${variant === "gradient" ? "backdrop-blur-sm" : ""}
      `}
      style={getVariantStyles()}
      title={showTooltip ? badge.description : undefined}
    >
      <IconComponent className={`${iconSizes[size]} flex-shrink-0`} />
      <span className="font-semibold tracking-wide">{badge.display_name}</span>
    </div>
  )
}

export function BadgeList({
  badges,
  maxDisplay = 3,
  variant = "filled",
  animated = true,
}: {
  badges: BadgeType[]
  maxDisplay?: number
  variant?: "filled" | "outlined" | "gradient"
  animated?: boolean
}) {
  const displayBadges = badges.slice(0, maxDisplay)
  const remainingCount = badges.length - maxDisplay

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {displayBadges.map((badge) => (
        <Badge key={badge.id} badge={badge} size="sm" variant={variant} animated={animated} />
      ))}
      {remainingCount > 0 && (
        <div className="inline-flex items-center px-2 py-1 text-xs text-gray-400 bg-gray-800/50 border border-gray-700 rounded-full backdrop-blur-sm">
          +{remainingCount} more
        </div>
      )}
    </div>
  )
}

export function BadgeShowcase({ badges }: { badges: BadgeType[] }) {
  if (badges.length === 0) return null

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Achievements</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className="flex items-center gap-3 p-3 bg-gray-900/30 border border-gray-800 rounded-lg backdrop-blur-sm hover:bg-gray-900/50 transition-all duration-300"
          >
            <Badge badge={badge} size="md" variant="gradient" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-300 truncate">{badge.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function FeaturedBadge({ badge }: { badge: BadgeType }) {
  const IconComponent = iconMap[badge.icon as keyof typeof iconMap] || Star

  return (
    <div className="relative group">
      <div
        className="absolute inset-0 rounded-xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300"
        style={{ backgroundColor: badge.color }}
      />
      <div
        className="relative flex items-center gap-4 p-6 bg-gray-900/80 border-2 rounded-xl backdrop-blur-sm transition-all duration-300 group-hover:scale-105"
        style={{ borderColor: badge.color }}
      >
        <div className="p-3 rounded-full" style={{ backgroundColor: `${badge.color}20` }}>
          <IconComponent className="w-8 h-8" style={{ color: badge.color }} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">{badge.display_name}</h3>
          <p className="text-gray-400">{badge.description}</p>
        </div>
      </div>
    </div>
  )
}
