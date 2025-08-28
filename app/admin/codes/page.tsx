"use client"

import type React from "react"

import { AdminGuard } from "@/components/admin-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Copy, Trash2, Eye, EyeOff, Gift } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

interface RedeemCode {
  id: string
  code: string
  type: "premium" | "storage" | "custom"
  value: any
  max_uses: number
  current_uses: number
  expires_at: string | null
  is_active: boolean
  created_at: string
}

export default function AdminCodes() {
  const [codes, setCodes] = useState<RedeemCode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    code: "",
    type: "premium" as const,
    max_uses: 1,
    expires_at: "",
    custom_value: "",
    storage_amount: "1GB",
    custom_message: "",
  })

  useEffect(() => {
    fetchCodes()
  }, [])

  const fetchCodes = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("redeem_codes").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setCodes(data || [])
    } catch (error) {
      console.error("[v0] Error fetching codes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateRandomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let result = ""
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const supabase = createClient()

      let value = {}
      switch (formData.type) {
        case "storage":
          value = { amount: formData.storage_amount }
          break
        case "custom":
          value = {
            message: formData.custom_message,
            data: formData.custom_value ? JSON.parse(formData.custom_value) : {},
          }
          break
      }

      const { error } = await supabase.from("redeem_codes").insert([
        {
          code: formData.code || generateRandomCode(),
          type: formData.type,
          value,
          max_uses: formData.max_uses,
          expires_at: formData.expires_at || null,
          is_active: true,
        },
      ])

      if (error) throw error

      setFormData({
        code: "",
        type: "premium",
        max_uses: 1,
        expires_at: "",
        custom_value: "",
        storage_amount: "1GB",
        custom_message: "",
      })
      setShowForm(false)
      fetchCodes()
    } catch (error) {
      console.error("[v0] Error creating code:", error)
    }
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("redeem_codes").update({ is_active: !currentStatus }).eq("id", id)

      if (error) throw error
      fetchCodes()
    } catch (error) {
      console.error("[v0] Error updating code status:", error)
    }
  }

  const deleteCode = async (id: string) => {
    if (!confirm("Are you sure you want to delete this code?")) return

    try {
      const supabase = createClient()
      const { error } = await supabase.from("redeem_codes").delete().eq("id", id)

      if (error) throw error
      fetchCodes()
    } catch (error) {
      console.error("[v0] Error deleting code:", error)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  const getTypeBadge = (type: string) => {
    const colors = {
      premium: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      storage: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      custom: "bg-green-500/10 text-green-500 border-green-500/20",
    }
    return <Badge className={colors[type as keyof typeof colors]}>{type}</Badge>
  }

  return (
    <AdminGuard>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Redeem Codes</h1>
            <p className="text-muted-foreground">Generate and manage promotional codes</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Generate Code
          </Button>
        </div>

        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Generate New Code</CardTitle>
              <CardDescription>Create a new promotional code with specific benefits</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="code">Code (leave empty for random)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="code"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        placeholder="Enter custom code or leave empty"
                        className="font-mono"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setFormData({ ...formData, code: generateRandomCode() })}
                      >
                        Generate
                      </Button>
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
                        <SelectItem value="premium">Premium Access</SelectItem>
                        <SelectItem value="storage">Additional Storage</SelectItem>
                        <SelectItem value="custom">Custom Benefits</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="max_uses">Max Uses</Label>
                    <Input
                      id="max_uses"
                      type="number"
                      min="1"
                      value={formData.max_uses}
                      onChange={(e) => setFormData({ ...formData, max_uses: Number.parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="expires_at">Expires At (optional)</Label>
                    <Input
                      id="expires_at"
                      type="datetime-local"
                      value={formData.expires_at}
                      onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                    />
                  </div>
                </div>

                {formData.type === "storage" && (
                  <div>
                    <Label htmlFor="storage_amount">Storage Amount</Label>
                    <Input
                      id="storage_amount"
                      value={formData.storage_amount}
                      onChange={(e) => setFormData({ ...formData, storage_amount: e.target.value })}
                      placeholder="e.g., 5GB, 100MB"
                    />
                  </div>
                )}

                {formData.type === "custom" && (
                  <>
                    <div>
                      <Label htmlFor="custom_message">Custom Message</Label>
                      <Input
                        id="custom_message"
                        value={formData.custom_message}
                        onChange={(e) => setFormData({ ...formData, custom_message: e.target.value })}
                        placeholder="Message shown to user when redeemed"
                      />
                    </div>
                    <div>
                      <Label htmlFor="custom_value">Custom Value (JSON)</Label>
                      <Textarea
                        id="custom_value"
                        value={formData.custom_value}
                        onChange={(e) => setFormData({ ...formData, custom_value: e.target.value })}
                        placeholder='{"feature": "enabled", "duration": "30d"}'
                        rows={3}
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-2">
                  <Button type="submit">Generate Code</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false)
                      setFormData({
                        code: "",
                        type: "premium",
                        max_uses: 1,
                        expires_at: "",
                        custom_value: "",
                        storage_amount: "1GB",
                        custom_message: "",
                      })
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
                <span className="ml-3">Loading codes...</span>
              </CardContent>
            </Card>
          ) : codes.length === 0 ? (
            <Card>
              <CardContent className="text-center p-8">
                <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No redeem codes found. Generate your first code!</p>
              </CardContent>
            </Card>
          ) : (
            codes.map((code) => (
              <Card key={code.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <code className="text-lg font-mono bg-muted px-3 py-1 rounded">{code.code}</code>
                        <Button size="sm" variant="ghost" onClick={() => copyToClipboard(code.code)}>
                          <Copy className="w-4 h-4" />
                        </Button>
                        {getTypeBadge(code.type)}
                        {code.is_active ? (
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>
                        ) : (
                          <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/20">Inactive</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>
                          Uses: {code.current_uses}/{code.max_uses}
                        </p>
                        {code.expires_at && <p>Expires: {new Date(code.expires_at).toLocaleDateString()}</p>}
                        <p>Created: {new Date(code.created_at).toLocaleDateString()}</p>
                        {code.value && Object.keys(code.value).length > 0 && <p>Value: {JSON.stringify(code.value)}</p>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => toggleActive(code.id, code.is_active)}>
                        {code.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => deleteCode(code.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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
