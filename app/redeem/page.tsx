"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Gift, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { useState } from "react"

export default function RedeemPage() {
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    details?: any
  } | null>(null)

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return

    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/redeem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          details: data.details,
        })
        setCode("")
      } else {
        setResult({
          success: false,
          message: data.error || "Failed to redeem code",
        })
      }
    } catch (error) {
      console.error("[v0] Error redeeming code:", error)
      setResult({
        success: false,
        message: "An error occurred while redeeming the code",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Gift className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Redeem Code</h1>
          <p className="text-muted-foreground">Enter your promotional code to unlock premium features</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Enter Your Code</CardTitle>
            <CardDescription>
              Have a promotional code? Enter it below to redeem your benefits. Codes are case-insensitive and can
              include letters and numbers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRedeem} className="space-y-4">
              <div>
                <Label htmlFor="code">Promotional Code</Label>
                <Input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Enter your code here"
                  className="font-mono text-center text-lg tracking-wider"
                  maxLength={50}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading || !code.trim()}>
                {isLoading ? "Redeeming..." : "Redeem Code"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {result && (
          <Card className={result.success ? "border-green-500/50" : "border-red-500/50"}>
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                {result.success ? (
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-500 mt-0.5" />
                )}
                <div className="flex-1">
                  <h3 className={`font-semibold mb-2 ${result.success ? "text-green-500" : "text-red-500"}`}>
                    {result.success ? "Code Redeemed Successfully!" : "Redemption Failed"}
                  </h3>
                  <p className="text-muted-foreground mb-3">{result.message}</p>
                  {result.success && result.details && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary/10 text-primary border-primary/20">
                          {result.details.type || "Premium"}
                        </Badge>
                        {result.details.value && (
                          <span className="text-sm text-muted-foreground">{JSON.stringify(result.details.value)}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" />
              How to Get Codes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>Promotional codes are distributed through various channels:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Join our Discord server for exclusive codes and giveaways</li>
                <li>Follow our social media accounts for special promotions</li>
                <li>Participate in community events and contests</li>
              </ul>
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-xs">
                  <strong>Note:</strong> Each code can only be used once per account. Codes may have expiration dates
                  and usage limits.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
