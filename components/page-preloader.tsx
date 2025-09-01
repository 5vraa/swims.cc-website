"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

// Critical pages to preload
const CRITICAL_PAGES = [
  "/page/explore",
  "/page/help", 
  "/page/pricing",
  "/auth/login",
  "/auth/signup",
  "/profile/edit"
]

export function PagePreloader() {
  const router = useRouter()

  useEffect(() => {
    // Preload critical pages after initial load
    const preloadPages = () => {
      CRITICAL_PAGES.forEach((page) => {
        // Use router.prefetch for Next.js 13+ App Router
        router.prefetch(page)
      })
    }

    // Preload after a short delay to not interfere with initial page load
    const timer = setTimeout(preloadPages, 2000)

    return () => clearTimeout(timer)
  }, [router])

  return null // This component doesn't render anything
}

// Alternative: Preload on hover
export function HoverPreloader({ href, children }: { href: string; children: React.ReactNode }) {
  const router = useRouter()

  const handleMouseEnter = () => {
    router.prefetch(href)
  }

  return (
    <div onMouseEnter={handleMouseEnter}>
      {children}
    </div>
  )
}
