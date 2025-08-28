"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertTriangle, EyeOff, Calendar, Shield } from "lucide-react"

interface RevealPageProps {
  type: "age" | "content" | "nsfw" | "custom"
  title?: string
  description?: string
  minAge?: number
  customMessage?: string
  onReveal: () => void
  children: React.ReactNode
}

export function RevealPage({
  type,
  title,
  description,
  minAge = 18,
  customMessage,
  onReveal,
  children,
}: RevealPageProps) {
  const [isRevealed, setIsRevealed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleReveal = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 800)) // Smooth transition
    setIsRevealed(true)
    onReveal()
    setIsLoading(false)
  }

  const getRevealContent = () => {
    switch (type) {
      case "age":
        return {
          icon: <Calendar className="w-12 h-12 text-red-500" />,
          title: title || "Age Verification Required",
          description: description || `You must be ${minAge} or older to view this content.`,
          buttonText: `I'm ${minAge}+`,
        }
      case "content":
        return {
          icon: <AlertTriangle className="w-12 h-12 text-yellow-500" />,
          title: title || "Content Warning",
          description: description || "This profile contains mature or sensitive content.",
          buttonText: "I Understand",
        }
      case "nsfw":
        return {
          icon: <EyeOff className="w-12 h-12 text-red-500" />,
          title: title || "Adult Content",
          description: description || "This profile contains adult content. Viewer discretion advised.",
          buttonText: "Continue",
        }
      case "custom":
        return {
          icon: <Shield className="w-12 h-12 text-blue-500" />,
          title: title || "Access Required",
          description: customMessage || "Special access is required to view this content.",
          buttonText: "Continue",
        }
    }
  }

  const content = getRevealContent()

  if (isRevealed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="bg-black/40 backdrop-blur-xl border-red-500/20 p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex justify-center mb-6"
          >
            {content.icon}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-white mb-4"
          >
            {content.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-300 mb-8 leading-relaxed"
          >
            {content.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            <Button
              onClick={handleReveal}
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                content.buttonText
              )}
            </Button>

            <p className="text-xs text-gray-500">
              By continuing, you acknowledge that you meet the requirements to view this content.
            </p>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  )
}
