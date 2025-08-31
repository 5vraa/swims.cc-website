"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Discord } from "lucide-react"

interface DiscordConnectProps {
  isConnected: boolean
  onConnect?: () => void
  onDisconnect?: () => void
}

export function DiscordConnect({ isConnected, onConnect, onDisconnect }: DiscordConnectProps) {
  const [loading, setLoading] = useState(false)

  const handleConnect = async () => {
    try {
      setLoading(true)
      
      // Use the Discord OAuth API route
      const response = await fetch('/api/auth/discord')
      
      if (response.ok) {
        // The API will redirect to Discord OAuth
        // The user will be redirected back to /auth/callback
        onConnect?.()
      } else {
        const error = await response.json()
        console.error('Discord connect error:', error)
        alert('Failed to connect Discord: ' + (error.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Discord connect error:', error)
      alert('Failed to connect Discord')
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      setLoading(true)
      // Handle Discord disconnect logic here
      onDisconnect?.()
    } catch (error) {
      console.error('Discord disconnect error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Discord className="w-5 h-5 text-[#5865F2]" />
          <div>
            <h3 className="font-medium">Discord</h3>
            <p className="text-sm text-muted-foreground">
              {isConnected ? 'Connected to Discord' : 'Connect your Discord account'}
            </p>
          </div>
        </div>
        
        <Button
          onClick={isConnected ? handleDisconnect : handleConnect}
          disabled={loading}
          variant={isConnected ? "outline" : "default"}
          className={isConnected ? "text-red-600 border-red-600 hover:bg-red-50" : ""}
        >
          {loading ? (
            "Loading..."
          ) : isConnected ? (
            "Disconnect"
          ) : (
            "Connect"
          )}
        </Button>
      </div>
      
      {isConnected && (
        <div className="text-sm text-muted-foreground">
          Your Discord account is connected and you can receive staff role benefits.
        </div>
      )}
    </div>
  )
}
