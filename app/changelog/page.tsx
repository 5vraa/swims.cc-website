"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

interface ChangelogEntry {
  id: string
  title: string
  content: string
  version: string
  type: "feature" | "bugfix" | "improvement" | "security"
  created_at: string
}

export default function ChangelogPage() {
  const [entries, setEntries] = useState<ChangelogEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchEntries()
  }, [])

  const fetchEntries = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("changelog_entries")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false })

      if (error) throw error
      setEntries(data || [])
    } catch (error) {
      console.error("[v0] Error fetching changelog entries:", error)
    } finally {
      setIsLoading(false)
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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Changelog</h1>
          <p className="text-muted-foreground">Stay updated with the latest changes and improvements</p>
        </div>

        <div className="space-y-6">
          {isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3">Loading changelog...</span>
              </CardContent>
            </Card>
          ) : entries.length === 0 ? (
            <Card>
              <CardContent className="text-center p-8">
                <p className="text-muted-foreground">No changelog entries available yet.</p>
              </CardContent>
            </Card>
          ) : (
            entries.map((entry) => (
              <Card key={entry.id}>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-xl">{entry.title}</CardTitle>
                    {entry.version && <Badge variant="outline">{entry.version}</Badge>}
                    {getTypeBadge(entry.type)}
                  </div>
                  <CardDescription>
                    {new Date(entry.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </CardDescription>
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
    </div>
  )
}
