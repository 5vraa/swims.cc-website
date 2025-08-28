"use client"

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { MusicPlayer } from "@/components/music-player"
import { Button } from "@/components/ui/button"
import { Heart, Share2, MessageCircle, Star, Sparkles, Eye, Twitter, Instagram, Facebook, Linkedin, Youtube, Music2, Github, Twitch, Globe, Mail, Phone } from "lucide-react"

interface AnimatedProfileProps {
  profile: any
  socialLinks: any[]
  musicTracks: any[]
  musicSettings: any
}

export function AnimatedProfile({ profile, socialLinks, musicTracks, musicSettings }: AnimatedProfileProps) {
  const [showSparkles, setShowSparkles] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, -50])
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])

  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1 as any,
        delayChildren: 0.2 as any,
      },
    },
  }

  const itemVariants: any = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as any,
        stiffness: 100,
        damping: 10,
      },
    },
  }

  // Map minimal musicSettings to player props expected by MusicPlayer
  const playerSettings = {
    player_style: musicSettings?.player_style || "modern",
    show_cover_art: true,
    show_track_info: true,
    show_progress_bar: true,
    show_volume_control: Boolean(musicSettings?.show_controls ?? true),
    auto_play: Boolean(musicSettings?.auto_play ?? false),
    loop_playlist: false,
    background_color: "#0a0a0a",
    accent_color: "#dc2626",
    text_color: "#ffffff",
  }

  const backgroundStyle: React.CSSProperties = profile?.background_image_url
    ? {
        backgroundImage: `url(${profile.background_image_url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {}

  return (
    <motion.div
      ref={containerRef}
      style={{ y, opacity, ...backgroundStyle }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen relative overflow-hidden"
    >
      <div className="absolute top-4 left-4 z-20">
        <div className="w-9 h-9 rounded-full bg-red-500/40 border border-red-500/60 flex items-center justify-center backdrop-blur">
          <Heart className="w-4 h-4 text-white" />
        </div>
      </div>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-red-500/30 rounded-full"
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 2,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-3xl">
          <Card className="relative bg-black/30 backdrop-blur-2xl border-red-500/30 shadow-2xl p-8 rounded-2xl">
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-red-500/40 border border-red-500/60 flex items-center justify-center backdrop-blur">
                <Eye className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm text-white/80">{profile?.view_count ?? 0}</span>
            </div>
        {/* Profile Header */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <motion.div
            className="relative inline-block mb-6"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.img
              src={profile?.avatar_url || "/placeholder.svg?height=120&width=120"}
              alt={profile?.display_name}
              className="w-32 h-32 rounded-full border-4 border-red-500/50 shadow-2xl"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            />
            <motion.div
              className="absolute -top-2 -right-2 bg-red-500 rounded-full p-2"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              <Star className="w-4 h-4 text-white" />
            </motion.div>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent"
          >
            {profile?.display_name}
          </motion.h1>

          <motion.p variants={itemVariants} className="text-gray-300 text-lg mb-4">
            @{profile?.username}
          </motion.p>

          {profile?.bio && (
            <motion.p variants={itemVariants} className="text-gray-400 max-w-md mx-auto leading-relaxed">
              {profile.bio}
            </motion.p>
          )}
        </motion.div>

        {/* Actions removed per request */}

        {/* Social Links under bio */}
        {socialLinks?.length > 0 && (
          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex flex-wrap justify-center gap-2">
              {socialLinks.map((link) => {
                const p = String(link.platform || "").toLowerCase()
                const icon =
                  p === "twitter" ? <Twitter className="w-4 h-4" /> :
                  p === "instagram" ? <Instagram className="w-4 h-4" /> :
                  p === "facebook" ? <Facebook className="w-4 h-4" /> :
                  p === "linkedin" ? <Linkedin className="w-4 h-4" /> :
                  p === "youtube" ? <Youtube className="w-4 h-4" /> :
                  p === "tiktok" ? <Music2 className="w-4 h-4" /> :
                  p === "github" ? <Github className="w-4 h-4" /> :
                  p === "twitch" ? <Twitch className="w-4 h-4" /> :
                  p === "spotify" ? <Music2 className="w-4 h-4" /> :
                  p === "website" ? <Globe className="w-4 h-4" /> :
                  p === "email" ? <Mail className="w-4 h-4" /> :
                  p === "phone" ? <Phone className="w-4 h-4" /> : <Globe className="w-4 h-4" />
                return (
                  <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="group">
                    <div className="w-9 h-9 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 hover:bg-red-500/30 transition">
                      {icon}
                    </div>
                  </a>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Music Player */}
        {musicTracks?.length > 0 && (
          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4 text-center">My Music</h2>
            <div className="max-w-xl mx-auto">
              <MusicPlayer tracks={musicTracks} settings={playerSettings} />
            </div>
          </motion.div>
        )}

        {/* Stats removed per request */}
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
