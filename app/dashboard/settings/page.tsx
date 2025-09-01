"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function DashboardSettings() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      // Add default values for new settings if they don't exist
      const profileWithDefaults = {
        ...profile,
        show_social_links: profile?.show_social_links ?? true,
        show_badges: profile?.show_badges ?? true,
        show_music_player: profile?.show_music_player ?? true,
        show_stats: profile?.show_stats ?? true,
        enable_animations: profile?.enable_animations ?? true,
        enable_tilt_effects: profile?.enable_tilt_effects ?? true,
        enable_glow_effects: profile?.enable_glow_effects ?? true,
        card_outline_color: profile?.card_outline_color ?? '#ef4444',
        card_glow_color: profile?.card_glow_color ?? '#ef4444',
        card_glow_intensity: profile?.card_glow_intensity ?? 0.5,
        border_radius: profile?.border_radius ?? 12,
        music_player_style: profile?.music_player_style ?? 'sleek',
        music_auto_play: profile?.music_auto_play ?? false,
        music_show_controls: profile?.music_show_controls ?? true,
        music_show_progress: profile?.music_show_progress ?? true,
        music_default_volume: profile?.music_default_volume ?? 50,
      }

      setProfile(profileWithDefaults)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!profile) return
    
    // Validate username is not empty
    if (!profile.username || profile.username.trim() === '') {
      alert('Username is required and cannot be empty')
      return
    }
    
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...profile,
          username: profile.username.trim()
        })
        .eq('id', profile.id)
      
      if (error) throw error
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="space-y-6">
              <div className="h-20 bg-gray-700 rounded"></div>
              <div className="h-20 bg-gray-700 rounded"></div>
              <div className="h-20 bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Profile not found</h1>
          <p className="text-muted-foreground">Unable to load your profile settings.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account and profile settings</p>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Username <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={profile.username || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-3 py-2 bg-background border border-border rounded"
                  placeholder="Enter your username"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Username is required and cannot be empty
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Display Name</label>
                <input
                  type="text"
                  value={profile.display_name || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, display_name: e.target.value }))}
                  className="w-full px-3 py-2 bg-background border border-border rounded"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Privacy Settings</h2>
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={profile.is_public || false}
                  onChange={(e) => setProfile(prev => ({ ...prev, is_public: e.target.checked }))}
                  className="rounded"
                />
                <span>Make profile public</span>
              </label>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Display Features</h2>
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={profile.show_badges !== false}
                  onChange={(e) => setProfile(prev => ({ ...prev, show_badges: e.target.checked }))}
                  className="rounded"
                />
                <span>Show badges on profile</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={profile.show_social_links !== false}
                  onChange={(e) => setProfile(prev => ({ ...prev, show_social_links: e.target.checked }))}
                  className="rounded"
                />
                <span>Show social links on profile</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={profile.show_music_player !== false}
                  onChange={(e) => setProfile(prev => ({ ...prev, show_music_player: e.target.checked }))}
                  className="rounded"
                />
                <span>Show music player on profile</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={profile.show_stats !== false}
                  onChange={(e) => setProfile(prev => ({ ...prev, show_stats: e.target.checked }))}
                  className="rounded"
                />
                <span>Show profile stats (views, join date)</span>
              </label>
            </div>
          </div>

          {/* Dedicated Music Settings Section */}
          {profile.show_music_player !== false && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Music Settings</h2>
              <div className="space-y-4">
                {/* Music Player Style Selection */}
                <div>
                  <label className="block text-sm font-medium mb-3">Music Player Style</label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="music_player_style"
                        value="sleek"
                        checked={profile.music_player_style === 'sleek'}
                        onChange={(e) => setProfile(prev => ({ ...prev, music_player_style: e.target.value }))}
                        className="rounded"
                      />
                      <span className="text-sm">🎵 Sleek - Modern horizontal player with progress bar</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="music_player_style"
                        value="tab"
                        checked={profile.music_player_style === 'tab'}
                        onChange={(e) => setProfile(prev => ({ ...prev, music_player_style: e.target.value }))}
                        className="rounded"
                      />
                      <span className="text-sm">🎧 Tab - Compact floating player in top-right corner</span>
                    </label>
                  </div>
                </div>
                
                {/* Additional Music Settings */}
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={profile.music_auto_play !== false}
                      onChange={(e) => setProfile(prev => ({ ...prev, music_auto_play: e.target.checked }))}
                      className="rounded"
                    />
                    <span>Auto-play music when page loads</span>
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={profile.music_show_controls !== false}
                      onChange={(e) => setProfile(prev => ({ ...prev, music_show_controls: e.target.checked }))}
                      className="rounded"
                    />
                    <span>Show music player controls</span>
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={profile.music_show_progress !== false}
                      onChange={(e) => setProfile(prev => ({ ...prev, music_show_progress: e.target.checked }))}
                      className="rounded"
                    />
                    <span>Show progress bar and time</span>
                  </label>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Default Music Volume (0-100)</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={profile.music_default_volume || 50}
                      onChange={(e) => setProfile(prev => ({ ...prev, music_default_volume: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                    <span className="text-sm text-muted-foreground">{profile.music_default_volume || 50}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <h2 className="text-xl font-semibold mb-4">Animation & Effects</h2>
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={profile.enable_animations !== false}
                  onChange={(e) => setProfile(prev => ({ ...prev, enable_animations: e.target.checked }))}
                  className="rounded"
                />
                <span>Enable hover animations and effects</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={profile.enable_tilt_effects !== false}
                  onChange={(e) => setProfile(prev => ({ ...prev, enable_tilt_effects: e.target.checked }))}
                  className="rounded"
                />
                <span>Enable 4-way tilt hover effects</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={profile.enable_glow_effects !== false}
                  onChange={(e) => setProfile(prev => ({ ...prev, enable_glow_effects: e.target.checked }))}
                  className="rounded"
                />
                <span>Enable glow effects and shadows</span>
              </label>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Profile Customization</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Card Outline Color</label>
                <input
                  type="color"
                  value={profile.card_outline_color || '#ef4444'}
                  onChange={(e) => setProfile(prev => ({ ...prev, card_outline_color: e.target.value }))}
                  className="w-full h-12 rounded border border-border"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Card Glow Color</label>
                <input
                  type="color"
                  value={profile.card_glow_color || '#ef4444'}
                  onChange={(e) => setProfile(prev => ({ ...prev, card_glow_color: e.target.value }))}
                  className="w-full h-12 rounded border border-border"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Glow Intensity (0.1 - 2.0)</label>
                <input
                  type="range"
                  min="0.1"
                  max="2.0"
                  step="0.1"
                  value={profile.card_glow_intensity || 0.5}
                  onChange={(e) => setProfile(prev => ({ ...prev, card_glow_intensity: parseFloat(e.target.value) }))}
                  className="w-full"
                />
                <span className="text-sm text-muted-foreground">{profile.card_glow_intensity || 0.5}</span>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Border Radius (px)</label>
                <input
                  type="range"
                  min="0"
                  max="24"
                  step="2"
                  value={profile.border_radius || 12}
                  onChange={(e) => setProfile(prev => ({ ...prev, border_radius: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <span className="text-sm text-muted-foreground">{profile.border_radius || 12}px</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
