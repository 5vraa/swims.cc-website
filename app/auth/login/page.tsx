"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { MessageSquare, Loader2, LogIn } from "lucide-react"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleDiscord = async () => {
    if (!username || username.trim() === '') {
      setError("Username is required and cannot be empty")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log("Starting Discord OAuth...")
      console.log("Username:", username.trim())
      
      // Hardcoded Discord OAuth URL
      const discordAuthUrl = `https://discord.com/oauth2/authorize?client_id=1410097014456324106&response_type=code&redirect_uri=${encodeURIComponent('https://lzgwyvowwanirtolefpj.supabase.co/auth/v1/callback')}&scope=identify+guilds+email+guilds.members.read&state=${encodeURIComponent(username.trim())}`
      
      console.log("Redirecting to Discord OAuth:", discordAuthUrl)
      
      // Redirect to Discord OAuth
      window.location.href = discordAuthUrl
      
    } catch (error: unknown) {
      console.error("Discord OAuth failed:", error)
      setError(error instanceof Error ? error.message : "An error occurred")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Card className="bg-card border-border">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <LogIn className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>Sign in to your swims.cc account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="username">
                  Username <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="your-username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  className="bg-background border-border"
                  maxLength={50}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter your profile username
                </p>
                <p className="text-xs text-red-400 mt-1">
                  Username is required and cannot be empty
                </p>
              </div>
              
              {error && <p className="text-sm text-red-500">{error}</p>}
              
              <Button
                onClick={handleDiscord}
                className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Continue with Discord
                  </>
                )}
              </Button>
            </div>
            
            <div className="mt-4 text-center text-sm">
              Don't have an account?{" "}
              <Link href="/auth/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
            
            <div className="mt-2 text-center">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
                ← Back to home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
