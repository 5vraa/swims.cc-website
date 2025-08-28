"use client"

import type React from "react"

import { AdminGuard } from "@/components/admin-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

interface ChangelogEntry {
  id: string
  title: string
  content: string
  version: string
  type: "feature" | "bugfix" | "improvement" | "security"
  is_published: boolean
  created_at: string
  updated_at: string
}

export default function AdminChangelog() {
  const [entries, setEntries] = useState<ChangelogEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState<ChangelogEntry | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    version: "",
    type: "feature" as const,
    is_published: false,
  })

  useEffect(() => {
    fetchEntries()
  }, [])

  const fetchEntries = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("changelog_entries")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setEntries(data || [])
    } catch (error) {
      console.error("[v0] Error fetching changelog entries:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const supabase = createClient()

      if (editingEntry) {
        const { error } = await supabase
          .from("changelog_entries")
          .update({ ...formData, updated_at: new Date().toISOString() })
          .eq("id", editingEntry.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("changelog_entries").insert([formData])

        if (error) throw error
      }

      setFormData({ title: "", content: "", version: "", type: "feature", is_published: false })
      setEditingEntry(null)
      setShowForm(false)
      fetchEntries()
    } catch (error) {
      console.error("[v0] Error saving changelog entry:", error)
    }
  }

  const handleEdit = (entry: ChangelogEntry) => {
    setEditingEntry(entry)
    setFormData({
      title: entry.title,
      content: entry.content,
      version: entry.version,
      type: entry.type,
      is_published: entry.is_published,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this changelog entry?")) return

    try {
      const supabase = createClient()
      const { error } = await supabase.from("changelog_entries").delete().eq("id", id)

      if (error) throw error
      fetchEntries()
    } catch (error) {
      console.error("[v0] Error deleting changelog entry:", error)
    }
  }

  const togglePublished = async (id: string, currentStatus: boolean) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("changelog_entries").update({ is_published: !currentStatus }).eq("id", id)

      if (error) throw error
      fetchEntries()
    } catch (error) {
      console.error("[v0] Error updating publish status:", error)
    }
  }

  const getTypeBadge = (type: string) => {
    const colors = {
      feature: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      bugfix: "bg-red-500/10 text-red-500 border-red-500/20",
      improvement: "bg-green-500/10 text-green-500 border-green-500/20",
      security: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    }
    return <Badge className={colors[type as keyof typeof colors]}>{type}</Badge>
  }

  return (
    <AdminGuard>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Changelog Management</h1>
            <p className="text-muted-foreground">Create and manage platform updates</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Entry
          </Button>
        </div>

        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{editingEntry ? "Edit Entry" : "Create New Entry"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="version">Version</Label>
                    <Input
                      id="version"
                      value={formData.version}
                      onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                      placeholder="v1.0.0"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="feature">Feature</SelectItem>
                      <SelectItem value="bugfix">Bug Fix</SelectItem>
                      <SelectItem value="improvement">Improvement</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={6}
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="published"
                    checked={formData.is_published}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                  />
                  <Label htmlFor="published">Publish immediately</Label>
                </div>

                <div className="flex gap-2">
                  <Button type="submit">{editingEntry ? "Update Entry" : "Create Entry"}</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false)
                      setEditingEntry(null)
                      setFormData({ title: "", content: "", version: "", type: "feature", is_published: false })
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3">Loading changelog entries...</span>
              </CardContent>
            </Card>
          ) : entries.length === 0 ? (
            <Card>
              <CardContent className="text-center p-8">
                <p className="text-muted-foreground">No changelog entries found.</p>
              </CardContent>
            </Card>
          ) : (
            entries.map((entry) => (
              <Card key={entry.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{entry.title}</CardTitle>
                        {entry.version && <Badge variant="outline">{entry.version}</Badge>}
                        {getTypeBadge(entry.type)}
                        {entry.is_published ? (
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                            <Eye className="w-3 h-3 mr-1" />
                            Published
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/20">
                            <EyeOff className="w-3 h-3 mr-1" />
                            Draft
                          </Badge>
                        )}
                      </div>
                      <CardDescription>
                        Created: {new Date(entry.created_at).toLocaleDateString()}
                        {entry.updated_at !== entry.created_at && (
                          <> • Updated: {new Date(entry.updated_at).toLocaleDateString()}</>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => togglePublished(entry.id, entry.is_published)}>
                        {entry.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(entry)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(entry.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-invert max-w-none">
                    <p className="whitespace-pre-wrap">{entry.content}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminGuard>
  )
}
