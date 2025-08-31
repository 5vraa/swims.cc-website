"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"

import { Calendar, GitBranch, Zap, Shield, Bug, Star, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-[#0f0b0c] text-foreground">
      {/* Header Section */}
      <div className="relative z-10 px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Changelog</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Stay updated with the latest features, improvements, and bug fixes
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative z-10 px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            <Card className="bg-black/20 backdrop-blur-md border-gray-700/50">
              <CardContent className="text-center p-16">
                <div className="max-w-md mx-auto">
                  <GitBranch className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-white mb-4">No Changelog Entries Yet</h3>
                  <p className="text-gray-400 mb-6">
                    We're working hard on new features and improvements. Check back soon for updates!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button asChild variant="outline" className="border-gray-600 text-white hover:bg-white/10">
                      <Link href="/discord">Join Discord</Link>
                    </Button>
                    <Button asChild className="bg-red-600 hover:bg-red-700 text-white">
                      <Link href="/auth/signup">Get Started</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
