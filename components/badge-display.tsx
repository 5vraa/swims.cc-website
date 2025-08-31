"use client"

import { Badge } from '@/types/badges'

interface BadgeDisplayProps {
  badges: Badge[]
  className?: string
}

export function BadgeDisplay({ badges, className = "" }: BadgeDisplayProps) {
  if (!badges || badges.length === 0) return null

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {badges.map((badge) => (
        <div
          key={badge.id}
          className="inline-flex items-center space-x-1 px-2 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs"
        >
          <span className="w-3 h-3 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white text-[8px] font-bold">
              {badge.icon || '★'}
            </span>
          </span>
          <span className="text-primary font-medium">{badge.name}</span>
        </div>
      ))}
    </div>
  )
}
