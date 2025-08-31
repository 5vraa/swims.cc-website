"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/types/badges'

export function useBadges() {
  const [badges, setBadges] = useState<Badge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchBadges()
  }, [])

  const fetchBadges = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('name')
      
      if (error) throw error
      setBadges(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch badges')
    } finally {
      setLoading(false)
    }
  }

  const createBadge = async (badgeData: Omit<Badge, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('badges')
        .insert([badgeData])
        .select()
        .single()
      
      if (error) throw error
      setBadges(prev => [...prev, data])
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create badge')
      throw err
    }
  }

  const updateBadge = async (id: string, updates: Partial<Badge>) => {
    try {
      const { data, error } = await supabase
        .from('badges')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      setBadges(prev => prev.map(badge => 
        badge.id === id ? data : badge
      ))
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update badge')
      throw err
    }
  }

  const deleteBadge = async (id: string) => {
    try {
      const { error } = await supabase
        .from('badges')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      setBadges(prev => prev.filter(badge => badge.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete badge')
      throw err
    }
  }

  return {
    badges,
    loading,
    error,
    fetchBadges,
    createBadge,
    updateBadge,
    deleteBadge
  }
}
