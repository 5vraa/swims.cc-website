"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, AlertTriangle } from "lucide-react"

interface AdminGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AdminGuard({ children, fallback }: AdminGuardProps) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAdminStatus()
  }, [])

  const checkAdminStatus = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setIsAdmin(false)
        setIsLoading(false)
        return
      }

      const { data: profile } = await supabase.from("profiles").select("role").eq("user_id", user.id).single()

      const adminStatus = profile?.role === "admin" || profile?.role === "moderator"
      setIsAdmin(adminStatus)
      setIsLoading(false)

      if (!adminStatus) {
        setTimeout(() => router.push("/"), 2000)
      }
    } catch (error) {
      console.error("[v0] Error checking admin status:", error)
      setIsAdmin(false)
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3">Verifying permissions...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      fallback || (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-xl">Access Denied</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                You don't have permission to access this area. Admin privileges required.
              </p>
              <p className="text-sm text-muted-foreground">Redirecting to home page...</p>
            </CardContent>
          </Card>
        </div>
      )
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Admin Panel</span>
          </div>
        </div>
      </div>
      {children}
    </div>
  )
}
