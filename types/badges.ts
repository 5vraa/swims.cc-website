export interface Badge {
  id: string
  name: string
  description?: string
  icon?: string
  requires_premium?: boolean
  requires_verified?: boolean
  min_views?: number
  created_at?: string
}
