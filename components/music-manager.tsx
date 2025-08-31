"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, Music, Settings, Palette } from "lucide-react"
import { FileUpload } from "@/components/file-upload"

interface MusicTrack {
  id: string
  title: string
  artist?: string
  audio_url: string
  cover_image_url?: string
  duration?: number
  order_index: number
  is_visible: boolean
}

interface PlayerSettings {
  player_style: string
  auto_play: boolean
  show_controls: boolean
  primary_color: string
  secondary_color: string
  show_cover_art: boolean
  show_track_info: boolean
  show_progress_bar: boolean
  show_volume_control: boolean
  loop_playlist: boolean
  background_color: string
  accent_color: string
  text_color: string
}

const PLAYER_STYLES = [
  { value: "sleek", label: "Sleek", description: "Modern horizontal player with progress bar" },
  { value: "tab", label: "Tab", description: "Compact floating player in top-right corner" },
]

interface MusicManagerProps {
  profileId: string
}

export function MusicManager({ profileId }: MusicManagerProps) {
  const [tracks, setTracks] = useState<MusicTrack[]>([])
  const [settings, setSettings] = useState<PlayerSettings>({
    player_style: "sleek",
    auto_play: false,
    show_controls: true,
    primary_color: "#ef4444",
    secondary_color: "#1f2937",
    show_cover_art: true,
    show_track_info: true,
    show_progress_bar: true,
    show_volume_control: true,
    loop_playlist: false,
    background_color: "#1a1a1a",
    accent_color: "#dc2626",
    text_color: "#ffffff",
  })
  const [loading, setLoading] = useState(true)
  const [editingTrack, setEditingTrack] = useState<MusicTrack | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    audio_url: "",
    cover_image_url: "",
    is_visible: true,
  })

  useEffect(() => {
    fetchTracks()
    fetchSettings()
  }, [])

  const fetchTracks = async () => {
    try {
      const response = await fetch("/api/music/tracks")
      if (response.ok) {
        const data = await response.json()
        setTracks(data.sort((a: MusicTrack, b: MusicTrack) => a.order_index - b.order_index))
      } else {
        console.error("Failed to fetch tracks:", response.status)
      }
    } catch (error) {
      console.error("Error fetching music tracks:", error)
    }
  }

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/music/settings")
      if (response.ok) {
        const data = await response.json()
        if (data) {
          setSettings(data)
        }
      } else {
        console.error("Failed to fetch settings:", response.status)
      }
    } catch (error) {
      console.error("Error fetching player settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitTrack = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check if we already have a track and this is a new track (not editing)
    if (!editingTrack && tracks.length >= 1) {
      alert("You can only have 1 music track per profile. Please delete the existing track first.")
      return
    }

    try {
      const url = editingTrack ? `/api/music/tracks/${editingTrack.id}` : "/api/music/tracks"
      const method = editingTrack ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          order_index: editingTrack ? editingTrack.order_index : tracks.length,
          is_visible: formData.is_visible,
        }),
      })

      if (response.ok) {
        await fetchTracks()
        resetForm()
        setIsDialogOpen(false)
      }
    } catch (error) {
      console.error("Error saving music track:", error)
    }
  }

  const handleDeleteTrack = async (id: string) => {
    if (!confirm("Are you sure you want to delete this track?")) return

    try {
      const response = await fetch(`/api/music/tracks/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchTracks()
      }
    } catch (error) {
      console.error("Error deleting music track:", error)
    }
  }

  const handleToggleActive = async (id: string, is_visible: boolean) => {
    try {
      const response = await fetch(`/api/music/tracks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_visible }),
      })

      if (response.ok) {
        await fetchTracks()
      }
    } catch (error) {
      console.error("Error updating music track:", error)
    }
  }

  

  const handleSettingsUpdate = async (newSettings: Partial<PlayerSettings>) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)

    try {
      await fetch("/api/music/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSettings),
      })
    } catch (error) {
      console.error("Error updating player settings:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      artist: "",
      audio_url: "",
      cover_image_url: "",
      is_visible: true,
    })
    setEditingTrack(null)
  }

  const openEditDialog = (track: MusicTrack) => {
    setEditingTrack(track)
    setFormData({
      title: track.title,
      artist: track.artist || "",
      audio_url: track.audio_url,
      cover_image_url: track.cover_image_url || "",
      is_visible: track.is_visible,
    })
    setIsDialogOpen(true)
  }

  const openAddDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  // Show skeleton while loading instead of full loading screen
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="w-5 h-5" />
            Music Player
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-gray-600 rounded w-32"></div>
            <div className="h-8 bg-gray-600 rounded w-full"></div>
            <div className="h-32 bg-gray-600 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="w-5 h-5" />
          Music Player
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="tracks" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tracks">Tracks</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="tracks" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Manage your music track (1 track maximum)</p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openAddDialog} size="sm" disabled={tracks.length >= 1}>
                    <Plus className="w-4 h-4 mr-2" />
                    {tracks.length >= 1 ? 'Track Added' : 'Add Track'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingTrack ? "Edit Track" : "Add New Track"}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmitTrack} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Title *</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="Song title"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="artist">Artist</Label>
                        <Input
                          id="artist"
                          value={formData.artist}
                          onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                          placeholder="Artist name"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Audio File *</Label>
                      {formData.audio_url ? (
                        <div className="flex items-center gap-2 p-2 border rounded">
                          <Music className="w-4 h-4" />
                          <span className="text-sm truncate flex-1">Audio uploaded</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setFormData({ ...formData, audio_url: "" })}
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <FileUpload
                          type="audio"
                          accept="audio/*"
                          maxSize={50 * 1024 * 1024} // 50MB
                          onUpload={(url) => setFormData({ ...formData, audio_url: url })}
                        />
                      )}
                    </div>

                    <div>
                      <Label>Cover Image</Label>
                      {formData.cover_image_url ? (
                        <div className="flex items-center gap-2 p-2 border rounded">
                          <img
                            src={formData.cover_image_url || "/placeholder.svg"}
                            alt="Cover"
                            className="w-8 h-8 rounded object-cover"
                          />
                          <span className="text-sm truncate flex-1">Cover image uploaded</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setFormData({ ...formData, cover_image_url: "" })}
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <FileUpload
                          type="image"
                          accept="image/*"
                          onUpload={(url) => setFormData({ ...formData, cover_image_url: url })}
                        />
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_visible"
                        checked={formData.is_visible}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_visible: checked })}
                      />
                      <Label htmlFor="is_visible">Active (visible on profile)</Label>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button type="submit" className="flex-1" disabled={!formData.title || !formData.audio_url}>
                        {editingTrack ? "Update Track" : "Add Track"}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

                         {tracks.length === 0 ? (
               <div className="text-center py-8 text-muted-foreground">
                 <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
                 <p>No music track added yet</p>
                 <p className="text-sm">Add your track to get started</p>
               </div>
             ) : (
               <div className="space-y-2">
                 {tracks.map((track) => (
                   <div
                     key={track.id}
                     className={`flex items-center gap-3 p-3 border rounded-lg transition-colors hover:bg-muted/50 ${
                       !track.is_visible ? "opacity-50" : ""
                     }`}
                   >
                     {track.cover_image_url && (
                       <img
                         src={track.cover_image_url || "/placeholder.svg"}
                         alt={track.title}
                         className="w-10 h-10 rounded object-cover"
                       />
                     )}

                     <div className="flex-1 min-w-0">
                       <p className="font-medium truncate">{track.title}</p>
                       {track.artist && (
                         <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                       )}
                     </div>

                     <div className="flex items-center gap-2">
                       <Switch
                         checked={track.is_visible}
                         onCheckedChange={(checked) => handleToggleActive(track.id, checked)}
                       />
                       <Button variant="ghost" size="sm" onClick={() => openEditDialog(track)}>
                         <Edit className="w-4 h-4" />
                       </Button>
                       <Button variant="ghost" size="sm" onClick={() => handleDeleteTrack(track.id)}>
                         <Trash2 className="w-4 h-4" />
                       </Button>
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Player Settings
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Player Style</Label>
                  <Select
                    value={settings.player_style}
                    onValueChange={(value) => handleSettingsUpdate({ player_style: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PLAYER_STYLES.map((style) => (
                        <SelectItem key={style.value} value={style.value}>
                          <div>
                            <div className="font-medium">{style.label}</div>
                            <div className="text-xs text-muted-foreground">{style.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.show_cover_art}
                    onCheckedChange={(checked) => handleSettingsUpdate({ show_cover_art: checked })}
                  />
                  <Label>Show Cover Art</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.show_track_info}
                    onCheckedChange={(checked) => handleSettingsUpdate({ show_track_info: checked })}
                  />
                  <Label>Show Track Info</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.show_progress_bar}
                    onCheckedChange={(checked) => handleSettingsUpdate({ show_progress_bar: checked })}
                  />
                  <Label>Show Progress Bar</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.show_volume_control}
                    onCheckedChange={(checked) => handleSettingsUpdate({ show_volume_control: checked })}
                  />
                  <Label>Show Volume Control</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.auto_play}
                    onCheckedChange={(checked) => handleSettingsUpdate({ auto_play: checked })}
                  />
                  <Label>Auto Play</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.loop_playlist}
                    onCheckedChange={(checked) => handleSettingsUpdate({ loop_playlist: checked })}
                  />
                  <Label>Loop Playlist</Label>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Color Customization
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={settings.background_color}
                      onChange={(e) => handleSettingsUpdate({ background_color: e.target.value })}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      value={settings.background_color}
                      onChange={(e) => handleSettingsUpdate({ background_color: e.target.value })}
                      placeholder="#1a1a1a"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Accent Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={settings.accent_color}
                      onChange={(e) => handleSettingsUpdate({ accent_color: e.target.value })}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      value={settings.accent_color}
                      onChange={(e) => handleSettingsUpdate({ accent_color: e.target.value })}
                      placeholder="#dc2626"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Text Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={settings.text_color}
                      onChange={(e) => handleSettingsUpdate({ text_color: e.target.value })}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      value={settings.text_color}
                      onChange={(e) => handleSettingsUpdate({ text_color: e.target.value })}
                      placeholder="#ffffff"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
