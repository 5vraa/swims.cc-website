"use client"

import { useState, useEffect } from "react"
import { AdminGuard } from "@/components/admin-guard"
import { Badge } from "@/components/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Badge as BadgeType, UserBadge } from "@/types/badge"
import { createClient } from "@/lib/supabase/client"
import { Search, Plus, Trash2, Users } from "lucide-react"

export default function AdminBadgesPage() {
  const [badges, setBadges] = useState<BadgeType[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState("")
  const [selectedBadge, setSelectedBadge] = useState("")
  const [userBadges, setUserBadges] = useState<UserBadge[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchBadges()
    fetchUserBadges()
  }, [])

  const fetchBadges = async () => {
    const { data } = await supabase.from("badges").select("*").eq("is_active", true).order("name")

    if (data) setBadges(data)
  }

  const fetchUserBadges = async () => {
    const { data } = await supabase
      .from("user_badges")
      .select(`
        *,
        badge:badges(*),
        profile:profiles!user_badges_user_id_fkey(username, display_name)
      `)
      .order("assigned_at", { ascending: false })

    if (data) setUserBadges(data as any)
    setLoading(false)
  }

  const assignBadge = async () => {
    if (!selectedUser || !selectedBadge) return

    // First, get the user ID from username
    const { data: profile } = await supabase.from("profiles").select("user_id").eq("username", selectedUser).single()

    if (!profile) {
      alert("User not found")
      return
    }

    const { error } = await supabase.from("user_badges").insert({
      user_id: profile.user_id,
      badge_id: selectedBadge,
    })

    if (error) {
      alert("Error assigning badge: " + error.message)
    } else {
      alert("Badge assigned successfully!")
      setSelectedUser("")
      setSelectedBadge("")
      fetchUserBadges()
    }
  }

  const removeBadge = async (userBadgeId: string) => {
    const { error } = await supabase.from("user_badges").delete().eq("id", userBadgeId)

    if (error) {
      alert("Error removing badge: " + error.message)
    } else {
      fetchUserBadges()
    }
  }

  const filteredUserBadges = userBadges.filter(
    (ub) =>
      ub.profile?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ub.badge.display_name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <AdminGuard>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Badge Management</h1>
          <p className="text-gray-400">Manage user badges and recognition</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Assign Badge Section */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Assign Badge
              </CardTitle>
              <CardDescription>Give badges to users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                <Input
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  placeholder="Enter username"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Badge</label>
                <select
                  value={selectedBadge}
                  onChange={(e) => setSelectedBadge(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                >
                  <option value="">Select a badge</option>
                  {badges.map((badge) => (
                    <option key={badge.id} value={badge.id}>
                      {badge.display_name}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                onClick={assignBadge}
                disabled={!selectedUser || !selectedBadge}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                Assign Badge
              </Button>
            </CardContent>
          </Card>

          {/* Available Badges */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Available Badges</CardTitle>
              <CardDescription>All badges that can be assigned</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {badges.map((badge) => (
                  <div key={badge.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <Badge badge={badge} />
                    <span className="text-xs text-gray-400">{badge.description}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Badges List */}
        <Card className="bg-gray-900/50 border-gray-800 mt-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Badges ({userBadges.length})
            </CardTitle>
            <CardDescription>All assigned badges</CardDescription>

            <div className="flex items-center gap-2 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users or badges..."
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-400">Loading...</div>
            ) : (
              <div className="space-y-3">
                {filteredUserBadges.map((userBadge) => (
                  <div key={userBadge.id} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium text-white">@{userBadge.profile?.username || "Unknown User"}</p>
                        <p className="text-sm text-gray-400">
                          Assigned {new Date(userBadge.assigned_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge badge={userBadge.badge} />
                    </div>
                    <Button
                      onClick={() => removeBadge(userBadge.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}

                {filteredUserBadges.length === 0 && (
                  <div className="text-center py-8 text-gray-400">No badges found</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminGuard>
  )
}
