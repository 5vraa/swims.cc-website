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
import { MessageSquare, Loader2, UserPlus } from "lucide-react"

export default function SignUpPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleDiscord = async () => {
    if (!username || username.trim() === '') {
      setError("Username is required and cannot be empty")
      return
    }

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters")
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
              <UserPlus className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <CardDescription>Join swims.cc and create your bio page</CardDescription>
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
                  This will be your profile URL: swims.cc/{username || 'your-username'}
                </p>
                <p className="text-xs text-red-400 mt-1">
                  Username is required and cannot be empty
                </p>
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background border-border"
                  minLength={6}
                />
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
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary hover:underline">
                Sign in
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
