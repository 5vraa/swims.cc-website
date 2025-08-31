"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, AlertTriangle } from "lucide-react"

interface StaffGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function StaffGuard({ children, fallback }: StaffGuardProps) {
  const [isStaff, setIsStaff] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkStaffStatus()
  }, [])

  const checkStaffStatus = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setIsStaff(false)
        setIsLoading(false)
        return
      }

      // Check profile role first
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single()

      // Check if user has staff role (admin, moderator, or staff)
      const staffStatus = profile?.role === "admin" || 
                         profile?.role === "moderator" || 
                         profile?.role === "staff"
      
      setIsStaff(staffStatus)
      setIsLoading(false)

      if (!staffStatus) {
        setTimeout(() => router.push("/"), 2000)
      }
    } catch (error) {
      console.error("[swims.cc] Error checking staff status:", error)
      setIsStaff(false)
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0b0c] flex items-center justify-center">
        <Card className="w-full max-w-md bg-black/40 backdrop-blur-xl border-white/20">
          <CardContent className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
            <span className="ml-3 text-white">Verifying staff permissions...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isStaff) {
    return (
      fallback || (
        <div className="min-h-screen bg-[#0f0b0c] flex items-center justify-center">
          <Card className="w-full max-w-md bg-black/40 backdrop-blur-xl border-white/20">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-xl text-white">Access Denied</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-300 mb-4">
                You don't have permission to access the staff dashboard. Staff privileges required.
              </p>
              <p className="text-sm text-gray-400">Redirecting to home page...</p>
            </CardContent>
          </Card>
        </div>
      )
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0b0c]">
      <div className="border-b border-white/20 bg-black/40 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4 text-red-500" />
            <span className="text-gray-300">Staff Panel</span>
          </div>
        </div>
      </div>
      {children}
    </div>
  )
}
