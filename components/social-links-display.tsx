"use client"

import { useState, useEffect } from "react"
import { ExternalLink, Twitter, Instagram, Facebook, Linkedin, Youtube, Music2, Github, Twitch, Globe, Mail, Phone } from "lucide-react"

interface SocialLink {
  id: string
  display_text: string
  url: string
  platform: string
  sort_order: number
  is_visible: boolean
}

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  twitter: <Twitter className="w-4 h-4" />,
  instagram: <Instagram className="w-4 h-4" />,
  facebook: <Facebook className="w-4 h-4" />,
  linkedin: <Linkedin className="w-4 h-4" />,
  youtube: <Youtube className="w-4 h-4" />,
  tiktok: <Music2 className="w-4 h-4" />,
  github: <Github className="w-4 h-4" />,
  discord: <Globe className="w-4 h-4" />,
  twitch: <Twitch className="w-4 h-4" />,
  spotify: <Music2 className="w-4 h-4" />,
  website: <Globe className="w-4 h-4" />,
  email: <Mail className="w-4 h-4" />,
  phone: <Phone className="w-4 h-4" />,
  custom: <ExternalLink className="w-4 h-4" />,
}

interface SocialLinksDisplayProps {
  userId?: string
  className?: string
}

export function SocialLinksDisplay({ userId, className = "" }: SocialLinksDisplayProps) {
  const [links, setLinks] = useState<SocialLink[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLinks()
  }, [userId])

  const fetchLinks = async () => {
    try {
      const url = userId ? `/api/social-links/public/${userId}` : "/api/social-links"
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setLinks(
          data
            .filter((link: SocialLink) => link.is_visible)
            .sort((a: SocialLink, b: SocialLink) => a.sort_order - b.sort_order),
        )
      }
    } catch (error) {
      console.error("Error fetching social links:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLinkClick = (url: string) => {
    // Add analytics tracking here if needed
    window.open(url, "_blank", "noopener,noreferrer")
  }

  if (loading) {
    return (
      <div className={`space-y-3 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-12 bg-muted/50 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (links.length === 0) {
    return (
      <div className={`text-center py-8 text-muted-foreground ${className}`}>
        <ExternalLink className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No links added yet</p>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {links.map((link) => (
        <button
          key={link.id}
          onClick={() => handleLinkClick(link.url)}
          className="w-full flex items-center gap-3 p-4 bg-card hover:bg-card/80 border border-border rounded-lg transition-colors group"
        >
          <div className="text-red-400">{SOCIAL_ICONS[link.platform] || <ExternalLink className="w-4 h-4" />}</div>
          <div className="flex-1 text-left" />
          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>
      ))}
    </div>
  )
}
