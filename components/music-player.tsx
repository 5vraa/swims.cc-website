"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card } from "@/components/ui/card"

interface MusicTrack {
  id: string
  title: string
  artist?: string
  audio_url: string
  cover_image_url?: string
  duration?: number
}

interface PlayerSettings {
  player_style: string
  show_cover_art: boolean
  show_track_info: boolean
  show_progress_bar: boolean
  show_volume_control: boolean
  auto_play: boolean
  loop_playlist: boolean
  background_color: string
  accent_color: string
  text_color: string
}

interface MusicPlayerProps {
  tracks: MusicTrack[]
  settings: PlayerSettings
  userId?: string
  className?: string
}

export function MusicPlayer({ tracks, settings, userId, className = "" }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [isMuted, setIsMuted] = useState(false)
  const [isLooping] = useState(false)

  const currentTrack = tracks[currentTrackIndex]

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => {
      if (isLooping) {
        audio.currentTime = 0
        audio.play()
      } else {
        nextTrack()
      }
    }

    audio.addEventListener("timeupdate", updateTime)
    audio.addEventListener("loadedmetadata", updateDuration)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("timeupdate", updateTime)
      audio.removeEventListener("loadedmetadata", updateDuration)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [currentTrackIndex, isLooping])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  useEffect(() => {
    const tryAutoplay = async () => {
      if (!audioRef.current) return
      if (settings.auto_play && tracks.length > 0) {
        try {
          await audioRef.current.play()
          setIsPlaying(true)
        } catch {}
      }
    }
    tryAutoplay()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrackIndex, settings.auto_play])

  const togglePlay = async () => {
    if (!audioRef.current) return

    try {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        await audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    } catch (error) {
      console.error("Error playing audio:", error)
    }
  }

  const nextTrack = () => {
    if (tracks.length === 0) return
    const nextIndex = (currentTrackIndex + 1) % tracks.length

    setCurrentTrackIndex(nextIndex)
    setIsPlaying(false)
  }

  const previousTrack = () => {
    if (tracks.length === 0) return
    const prevIndex = currentTrackIndex === 0 ? tracks.length - 1 : currentTrackIndex - 1

    setCurrentTrackIndex(prevIndex)
    setIsPlaying(false)
  }

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const getPlayerStyle = () => ({
    background: "rgba(0,0,0,0.45)",
    border: `1px solid ${settings.primary_color}33`,
    borderRadius: 16,
    backdropFilter: "blur(18px)",
    color: "#fff",
  })

  if (!currentTrack) {
    return (
      <Card className={`p-6 text-center ${className}`}>
        <p className="text-muted-foreground">No music tracks available</p>
      </Card>
    )
  }

  return (
    <div className={className}>
      <audio ref={audioRef} src={currentTrack.audio_url} preload="metadata" />

      <Card className="p-4" style={getPlayerStyle()}>
        <div className="space-y-3">
          {/* Track Info */}
          {settings.show_track_info && (
            <div className="flex items-center gap-4">
              {settings.show_cover_art && currentTrack.cover_image_url && (
                <img
                  src={currentTrack.cover_image_url || "/placeholder.svg"}
                  alt={currentTrack.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate" style={{ color: settings.text_color }}>
                  {currentTrack.title}
                </h3>
                {currentTrack.artist && (
                  <p className="text-sm opacity-70 truncate" style={{ color: settings.text_color }}>
                    {currentTrack.artist}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {settings.show_progress_bar && (
            <div className="space-y-2">
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                onValueChange={([value]) => seekTo(value)}
                className="w-full"
                style={
                  {
                    "--slider-track": settings.primary_color,
                    "--slider-range": settings.primary_color,
                  } as React.CSSProperties
                }
              />
              <div className="flex justify-between text-xs opacity-70" style={{ color: settings.text_color }}>
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={previousTrack}
              disabled={tracks.length <= 1}
              style={{ color: settings.text_color }}
            >
              <SkipBack className="w-5 h-5" />
            </Button>

            <Button
              onClick={togglePlay}
              size="lg"
              className="rounded-full"
              style={{ backgroundColor: settings.primary_color, color: "#0a0a0a" }}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={nextTrack}
              disabled={tracks.length <= 1}
              style={{ color: settings.text_color }}
            >
              <SkipForward className="w-5 h-5" />
            </Button>

            <div className="w-5" />
          </div>

          {/* Volume Control */}
          {settings.show_volume_control && (
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={toggleMute} style={{ color: settings.text_color }}>
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume * 100]}
                max={100}
                step={1}
                onValueChange={([value]) => {
                  setVolume(value / 100)
                  setIsMuted(false)
                }}
                className="flex-1"
                style={
                  {
                    "--slider-track": settings.primary_color,
                    "--slider-range": settings.primary_color,
                  } as React.CSSProperties
                }
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
