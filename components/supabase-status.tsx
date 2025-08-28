"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle } from "lucide-react"

export function SupabaseStatus() {
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null)

  useEffect(() => {
    const checkSupabase = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase.auth.getUser()

        // If we get a "not configured" error, Supabase isn't set up
        if (error?.message === "Supabase not configured") {
          setIsConfigured(false)
        } else {
          setIsConfigured(true)
        }
      } catch (error) {
        setIsConfigured(false)
      }
    }

    checkSupabase()
  }, [])

  if (isConfigured === null) return null

  if (!isConfigured) {
    return (
      <Card className="border-yellow-500/20 bg-yellow-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-500">
            <AlertCircle className="h-5 w-5" />
            Supabase Not Configured
          </CardTitle>
          <CardDescription>
            Add your Supabase environment variables in Project Settings to enable authentication and database features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Go to Project Settings → Environment Variables and add:</p>
          <ul className="mt-2 text-sm text-muted-foreground">
            <li>• NEXT_PUBLIC_SUPABASE_URL</li>
            <li>• NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
            <li>• SUPABASE_SERVICE_ROLE_KEY</li>
          </ul>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-green-500/20 bg-green-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-500">
          <CheckCircle className="h-5 w-5" />
          Supabase Connected
        </CardTitle>
        <CardDescription>Your database and authentication are properly configured.</CardDescription>
      </CardHeader>
    </Card>
  )
}
