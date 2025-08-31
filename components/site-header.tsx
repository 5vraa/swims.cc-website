"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"

const RESERVED = new Set([
  "",
  "auth",
  "admin",
  "staff",
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

export function SiteHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [showStaff, setShowStaff] = useState(false)
  const [loading, setLoading] = useState(true)
  const [logoutLoading, setLogoutLoading] = useState(false)

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        await loadUserProfile(session.user)
      }
      setLoading(false)
    }

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        if (session?.user) {
          setUser(session.user)
          await loadUserProfile(session.user)
        } else {
          setUser(null)
          setUsername(null)
          setShowStaff(false)
        }
      }
    )

    getSession()

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (user: any) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, username')
        .eq('user_id', user.id)
        .single()

      if (profile) {
        setUsername(profile.username)
        
        // Check if user has admin/moderator role
        const hasStaffRole = profile.role === 'admin' || profile.role === 'moderator'
        setShowStaff(hasStaffRole)
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  if (shouldHideOnPath(pathname || "/")) return null

  const handleLogout = async () => {
    try {
      setLogoutLoading(true)
      console.log('Logout button clicked')
      
      // Try Supabase logout first
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Supabase logout error:', error)
        
        // Fallback: try to clear session manually
        try {
          await supabase.auth.setSession(null)
          console.log('Fallback logout successful')
        } catch (fallbackError) {
          console.error('Fallback logout also failed:', fallbackError)
          alert('Logout failed: ' + error.message)
          return
        }
      }
      
      // Clear local state
      setUser(null)
      setUsername(null)
      setShowStaff(false)
      
      console.log('Logout successful, redirecting to home')
      router.push("/")
    } catch (error) {
      console.error('Logout exception:', error)
      alert('Logout failed: ' + (error as Error).message)
    } finally {
      setLogoutLoading(false)
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-4 px-4">
      <div className="max-w-7xl mx-auto">
        <nav className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-4 shadow-2xl">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <img
                src="/images/sitelogo.png"
                alt="swims.cc logo"
                className="w-8 h-8 object-contain"
              />
              <h1 className="text-xl font-bold text-white">swims.cc</h1>
            </Link>
            
            <div className="hidden md:flex items-center space-x-4">
              {!user ? (
                <>
                  <Link href="/explore" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">Explore</Link>
                  <Link href="/help" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">Help Center</Link>
                  <Link href="/pricing" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">Pricing</Link>
                  <Link href="/auth/login" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">Login</Link>
                  <Link href="/auth/signup" className="text-white px-4 py-2 rounded-full text-sm font-medium bg-red-600 hover:bg-red-700 transition-colors">Sign Up Free</Link>
                </>
              ) : (
                <>
                  <Link href="/explore" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">Explore</Link>
                  {username && (
                    <Link href={`/${username}`} className="text-white px-4 py-2 rounded-full text-sm font-medium bg-red-600 hover:bg-red-700 transition-colors">Preview Profile</Link>
                  )}
                  {showStaff && (
                    <Link href="/admin" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">Admin</Link>
                  )}
                  <Link href="/profile/edit" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">Dashboard</Link>
                  <button 
                    onClick={handleLogout} 
                    disabled={logoutLoading}
                    className="text-white px-4 py-2 rounded-full text-sm font-medium bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {logoutLoading ? 'Logging out...' : 'Logout'}
                  </button>
                </>
              )}
            </div>
          </div>
        </nav>
      </div>
    </header>
  )
}


