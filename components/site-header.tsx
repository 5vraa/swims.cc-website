"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

const RESERVED = new Set([
  "",
  "auth",
  "admin",
  "privacy",
  "terms",
  "changelog",
  "status",
  "copyright",
  "redeem",
  "profile",
  "dashboard",
  "api",
])

function shouldHideOnPath(pathname: string): boolean {
  // Hide header on public profile pages like /username (single segment not reserved)
  if (!pathname || pathname === "/") return false
  const parts = pathname.split("/").filter(Boolean)
  if (parts.length === 1 && !RESERVED.has(parts[0].toLowerCase())) return true
  return false
}

type Props = {
  isAuthed?: boolean
  username?: string | null
  showStaff?: boolean
}

export function SiteHeader({ isAuthed = false, username = null, showStaff = false }: Props) {
  const pathname = usePathname()
  if (shouldHideOnPath(pathname || "/")) return null
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 py-4 px-4">
      <div className="max-w-6xl mx-auto">
        <nav className="bg-gradient-to-r from-black/90 via-red-900/90 to-black/90 backdrop-blur-md border border-red-500/20 rounded-2xl px-6 py-3 shadow-lg shadow-red-500/10">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <img
                src="/images/sitelogo.png"
                alt="logo"
                className="w-8 h-8 object-contain"
              />
              <h1 className="text-xl font-bold text-white">swims.cc</h1>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              {!isAuthed ? (
                <>
                  <Link href="/help" className="text-gray-300 hover:text-white text-sm">Help Center</Link>
                  <Link href="/pricing" className="text-gray-300 hover:text-white text-sm">Pricing</Link>
                  <Link href="/auth/login" className="text-gray-300 hover:text-white text-sm">Login</Link>
                  <Link href="/auth/signup" className="text-white px-4 py-2 rounded-full text-sm btn-animated">Sign Up Free</Link>
                </>
              ) : (
                <>
                  {username && (
                    <Link href={`/${username}`} className="text-gray-300 hover:text-white text-sm">Preview Profile</Link>
                  )}
                  {showStaff && (
                    <Link href="/admin" className="text-gray-300 hover:text-white text-sm">Staff</Link>
                  )}
                  <button onClick={handleLogout} className="text-gray-300 hover:text-white text-sm">Logout</button>
                </>
              )}
            </div>
          </div>
        </nav>
      </div>
    </header>
  )
}


