"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Progress } from "@/components/ui/progress"
import { Upload, ImageIcon, Music } from "lucide-react"

interface FileUploadProps {
  currentUrl?: string | null
  onUpload: (url: string) => void
  accept?: string
  maxSize?: number
  type?: "image" | "audio" | "any"
  className?: string
}

export function FileUpload({
  onUpload,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB default
  type = "any",
  className = "",
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = async (file: File) => {
    if (file.size > maxSize) {
      alert(`File size must be less than ${maxSize / 1024 / 1024}MB`)
      return
    }

    setUploading(true)
    setProgress(0)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        let message = "Upload failed"
        try {
          const err = await response.json()
          if (err?.error) message = String(err.error)
        } catch {}
        throw new Error(message)
      }

      const { url } = await response.json()
      setProgress(100)

      setTimeout(() => {
        onUpload(url)
        setUploading(false)
        setProgress(0)
      }, 500)
    } catch (error) {
      console.error("Upload error:", error)
      alert("Upload failed. Please try again.")
      setUploading(false)
      setProgress(0)
    }
  }

  const getIcon = () => {
    switch (type) {
      case "image":
        return <ImageIcon className="w-8 h-8 text-muted-foreground" />
      case "audio":
        return <Music className="w-8 h-8 text-muted-foreground" />
      default:
        return <Upload className="w-8 h-8 text-muted-foreground" />
    }
  }

  const getAcceptText = () => {
    switch (type) {
      case "image":
        return "PNG, JPG, GIF up to 5MB"
      case "audio":
        return "MP3, WAV, OGG up to 10MB"
      default:
        return "Any file up to 5MB"
    }
  }

  return (
    <div className={`relative ${className}`}>
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
        } ${uploading ? "pointer-events-none opacity-50" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input ref={fileInputRef} type="file" accept={accept} onChange={handleChange} className="hidden" />

        {uploading ? (
          <div className="space-y-4">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Uploading...</p>
              <Progress value={progress} className="w-full" />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {getIcon()}
            <div>
              <p className="text-sm font-medium">
                Drop your file here, or{" "}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-primary hover:underline"
                >
                  browse
                </button>
              </p>
              <p className="text-xs text-muted-foreground mt-1">{getAcceptText()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
