"use client"

import { useState } from "react"
import type { Badge as BadgeType } from "@/types/badge"
import { Badge } from "./badge"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface BadgeSelectorProps {
  badges: BadgeType[]
  selectedBadges: string[]
  onSelectionChange: (badgeIds: string[]) => void
  maxSelection?: number
}

export function BadgeSelector({ badges, selectedBadges, onSelectionChange, maxSelection }: BadgeSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredBadges = badges.filter(
    (badge) =>
      badge.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      badge.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const toggleBadge = (badgeId: string) => {
    if (selectedBadges.includes(badgeId)) {
      onSelectionChange(selectedBadges.filter((id) => id !== badgeId))
    } else if (!maxSelection || selectedBadges.length < maxSelection) {
      onSelectionChange([...selectedBadges, badgeId])
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search badges..."
          className="pl-10 bg-gray-800 border-gray-700 text-white"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
        {filteredBadges.map((badge) => {
          const isSelected = selectedBadges.includes(badge.id)
          const isDisabled = !isSelected && maxSelection && selectedBadges.length >= maxSelection

          return (
            <div
              key={badge.id}
              onClick={() => !isDisabled && toggleBadge(badge.id)}
              className={`
                flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer
                ${
                  isSelected
                    ? "bg-gray-800 border-red-500 shadow-lg shadow-red-500/20"
                    : "bg-gray-900/50 border-gray-700 hover:border-gray-600"
                }
                ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              <Badge badge={badge} size="sm" variant={isSelected ? "gradient" : "outlined"} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-300 truncate">{badge.description}</p>
              </div>
              {isSelected && <div className="w-2 h-2 bg-red-500 rounded-full" />}
            </div>
          )
        })}
      </div>

      {maxSelection && (
        <p className="text-xs text-gray-400 text-center">
          {selectedBadges.length} of {maxSelection} badges selected
        </p>
      )}
    </div>
  )
}
