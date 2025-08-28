export interface Badge {
  id: string
  name: string
  display_name: string
  description: string
  color: string
  icon: string
  is_active: boolean
  created_at: string
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  assigned_by: string | null
  assigned_at: string
  badge: Badge
}
