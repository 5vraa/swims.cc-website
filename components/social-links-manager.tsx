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
import { Plus, Edit, Trash2, GripVertical, ExternalLink, Twitter, Instagram, Facebook, Linkedin, Youtube, Music2, Github, Twitch, Globe, Mail, Phone } from "lucide-react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"

interface SocialLink {
  id: string
  display_text: string
  url: string
  platform: string
  sort_order: number
  is_visible: boolean
}

const SOCIAL_ICONS = [
  { value: "twitter", label: "X (Twitter)", icon: "https://cdn3.emoji.gg/emojis/66219-x.png" },
  { value: "instagram", label: "Instagram", icon: "https://cdn3.emoji.gg/emojis/23860-instagram.png" },
  { value: "facebook", label: "Facebook", icon: <Facebook className="w-4 h-4" /> },
  { value: "linkedin", label: "LinkedIn", icon: "https://cdn3.emoji.gg/emojis/65623-linkedin.png" },
  { value: "youtube", label: "YouTube", icon: "https://cdn3.emoji.gg/emojis/54079-youtube.png" },
  { value: "tiktok", label: "TikTok", icon: "https://cdn3.emoji.gg/emojis/15188-tiktok.png" },
  { value: "github", label: "GitHub", icon: "https://cdn3.emoji.gg/emojis/8346-github.png" },
  { value: "discord", label: "Discord", icon: "https://cdn3.emoji.gg/emojis/26344-discord.png" },
  { value: "twitch", label: "Twitch", icon: "https://cdn3.emoji.gg/emojis/4782-twitchlogo.png" },
  { value: "spotify", label: "Spotify", icon: "https://cdn3.emoji.gg/emojis/35248-spotify.png" },
  { value: "roblox", label: "Roblox", icon: "https://cdn3.emoji.gg/emojis/4680-roblox.png" },
  { value: "steam", label: "Steam", icon: "https://cdn3.emoji.gg/emojis/13904-steam.png" },
  { value: "epicgames", label: "Epic Games", icon: "https://cdn3.emoji.gg/emojis/3716-epicgames.png" },
  { value: "reddit", label: "Reddit", icon: "https://cdn3.emoji.gg/emojis/30250-reddit-de-01.png" },
  { value: "website", label: "Website", icon: <Globe className="w-4 h-4" /> },
  { value: "email", label: "Email", icon: <Mail className="w-4 h-4" /> },
  { value: "phone", label: "Phone", icon: <Phone className="w-4 h-4" /> },
  { value: "custom", label: "Custom", icon: <ExternalLink className="w-4 h-4" /> },
]

interface SocialLinksManagerProps {
  profileId: string
}

export function SocialLinksManager({ profileId }: SocialLinksManagerProps) {
  const [links, setLinks] = useState<SocialLink[]>([])
  const [loading, setLoading] = useState(true)
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    display_text: "",
    url: "",
    platform: "website",
    is_visible: true,
  })

  useEffect(() => {
    fetchLinks()
  }, [])

  const fetchLinks = async () => {
    try {
      const response = await fetch("/api/social-links")
      if (response.ok) {
        const data = await response.json()
        setLinks(data.sort((a: SocialLink, b: SocialLink) => a.sort_order - b.sort_order))
      }
    } catch (error) {
      console.error("Error fetching social links:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingLink ? `/api/social-links/${editingLink.id}` : "/api/social-links"
      const method = editingLink ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          sort_order: editingLink ? editingLink.sort_order : links.length,
        }),
      })

      if (response.ok) {
        await fetchLinks()
        resetForm()
        setIsDialogOpen(false)
      }
    } catch (error) {
      console.error("Error saving social link:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this link?")) return

    try {
      const response = await fetch(`/api/social-links/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchLinks()
      }
    } catch (error) {
      console.error("Error deleting social link:", error)
    }
  }

  const handleToggleActive = async (id: string, is_visible: boolean) => {
    try {
      const response = await fetch(`/api/social-links/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_visible }),
      })

      if (response.ok) {
        await fetchLinks()
      }
    } catch (error) {
      console.error("Error updating social link:", error)
    }
  }

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return

    const items = Array.from(links)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update positions
    const updatedItems = items.map((item, index) => ({
      ...item,
      sort_order: index,
    }))

    setLinks(updatedItems)

    // Save new positions to database
    try {
      await fetch("/api/social-links/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          links: updatedItems.map((item) => ({ id: item.id, sort_order: item.sort_order })),
        }),
      })
    } catch (error) {
      console.error("Error reordering social links:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      display_text: "",
      url: "",
      platform: "website",
      is_visible: true,
    })
    setEditingLink(null)
  }

  const openEditDialog = (link: SocialLink) => {
    setEditingLink(link)
    setFormData({
      display_text: link.display_text,
      url: link.url,
      platform: link.platform,
      is_visible: link.is_visible,
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
          <CardTitle>Social Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-gray-600 rounded w-24"></div>
            <div className="h-8 bg-gray-600 rounded w-full"></div>
            <div className="h-32 bg-gray-600 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Social Links</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Link
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingLink ? "Edit Link" : "Add New Link"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="display_text">Display Text</Label>
                <Input
                  id="display_text"
                  value={formData.display_text}
                  onChange={(e) => setFormData({ ...formData, display_text: e.target.value })}
                  placeholder="e.g., My Twitter"
                  required
                />
              </div>

              <div>
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://twitter.com/username"
                  required
                />
              </div>

              <div>
                <Label htmlFor="platform">Platform</Label>
                <Select value={formData.platform} onValueChange={(value) => setFormData({ ...formData, platform: value })}>
                  <SelectTrigger>
                    <SelectValue>
                      {(() => {
                        const iconData = SOCIAL_ICONS.find((icon) => icon.value === formData.platform)
                        if (!iconData) return formData.platform
                        
                        return (
                          <div className="flex items-center gap-2">
                            {typeof iconData.icon === 'string' ? (
                              <img 
                                src={iconData.icon} 
                                alt={iconData.label} 
                                className="w-4 h-4 object-contain"
                              />
                            ) : (
                              iconData.icon
                            )}
                            <span>{iconData.label}</span>
                          </div>
                        )
                      })()}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {SOCIAL_ICONS.map((icon) => (
                      <SelectItem key={icon.value} value={icon.value} className="py-2">
                        <div className="flex items-center gap-3">
                          {typeof icon.icon === 'string' ? (
                            <img 
                              src={icon.icon} 
                              alt={icon.label} 
                              className="w-5 h-5 object-contain"
                            />
                          ) : (
                            <div className="w-5 h-5 flex items-center justify-center">
                              {icon.icon}
                            </div>
                          )}
                          <span className="font-medium">{icon.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Button type="submit" className="flex-1">
                  {editingLink ? "Update Link" : "Add Link"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        {links.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ExternalLink className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No social links added yet</p>
            <p className="text-sm">Add your first link to get started</p>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="social-links">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {links.map((link, index) => (
                    <Draggable key={link.id} draggableId={link.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`flex items-center gap-3 p-3 border rounded-lg transition-colors ${
                            snapshot.isDragging ? "bg-muted" : "hover:bg-muted/50"
                          } ${!link.is_visible ? "opacity-50" : ""}`}
                        >
                          <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                            <GripVertical className="w-4 h-4 text-muted-foreground" />
                          </div>

                          <div className="text-lg text-red-500">
                            {(() => {
                              const iconData = SOCIAL_ICONS.find((icon) => icon.value === link.platform)
                              if (!iconData) return <ExternalLink className="w-4 h-4" />
                              
                              if (typeof iconData.icon === 'string') {
                                return (
                                  <img 
                                    src={iconData.icon} 
                                    alt={iconData.label} 
                                    className="w-5 h-5 object-contain"
                                  />
                                )
                              }
                              return iconData.icon
                            })()}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{link.display_text}</p>
                            <p className="text-sm text-muted-foreground truncate">{link.url}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <Switch
                              checked={link.is_visible}
                              onCheckedChange={(checked) => handleToggleActive(link.id, checked)}
                            />
                            <Button variant="ghost" size="sm" onClick={() => openEditDialog(link)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(link.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </CardContent>
    </Card>
  )
}
