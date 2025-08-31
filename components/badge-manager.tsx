"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/types/badges'

interface BadgeManagerProps {
  profile: any
  onUpdate: () => void
}

export function BadgeManager({ profile, onUpdate }: BadgeManagerProps) {
  const [badges, setBadges] = useState<Badge[]>([])
  const [selectedBadges, setSelectedBadges] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchBadges()
    if (profile.badges) {
      setSelectedBadges(profile.badges)
    }
  }, [profile.badges])

  const fetchBadges = async () => {
    try {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('name')
      
      if (error) throw error
      setBadges(data || [])
    } catch (error) {
      console.error('Error fetching badges:', error)
    }
  }

  const handleBadgeToggle = (badgeId: string) => {
    setSelectedBadges(prev => 
      prev.includes(badgeId) 
        ? prev.filter(id => id !== badgeId)
        : [...prev, badgeId]
    )
  }

  const saveBadges = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ badges: selectedBadges })
        .eq('id', profile.id)
      
      if (error) throw error
      onUpdate()
    } catch (error) {
      console.error('Error saving badges:', error)
    } finally {
      setLoading(false)
    }
  }

  const canUseBadge = (badge: Badge) => {
    if (badge.requires_premium && !profile.is_premium) return false
    if (badge.requires_verified && !profile.is_verified) return false
    if (badge.min_views && profile.view_count < badge.min_views) return false
    return true
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Badges</h3>
        <button
          onClick={saveBadges}
          disabled={loading}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Badges'}
        </button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {badges.map((badge) => {
          const isSelected = selectedBadges.includes(badge.id)
          const canUse = canUseBadge(badge)
          
          return (
            <div
              key={badge.id}
              className={`relative p-3 rounded-lg border-2 cursor-pointer transition-all ${
                isSelected 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border hover:border-primary/50'
              } ${!canUse ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => canUse && handleBadgeToggle(badge.id)}
            >
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {badge.icon || '★'}
                  </span>
                </div>
                <span className="text-sm font-medium">{badge.name}</span>
              </div>
              
              {badge.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {badge.description}
                </p>
              )}
              
              {!canUse && (
                <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                  <span className="text-xs text-white bg-black/70 px-2 py-1 rounded">
                    {badge.requires_premium && !profile.is_premium ? 'Premium' :
                     badge.requires_verified && !profile.is_verified ? 'Verified' :
                     badge.min_views ? `${badge.min_views}+ views` : 'Locked'}
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
