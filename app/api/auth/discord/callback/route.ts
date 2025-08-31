import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.redirect(`https://swims.cc/auth/callback?error=discord_auth_failed`)
    }

    if (!code) {
      return NextResponse.redirect(`https://swims.cc/auth/callback?error=discord_code_missing`)
    }

    // Redirect to the main auth callback page with Discord parameters
    return NextResponse.redirect(`https://swims.cc/auth/callback?provider=discord&code=${code}&state=${state}`)

  } catch (error) {
    console.error('Error in Discord callback:', error)
    return NextResponse.redirect(`https://swims.cc/auth/callback?error=discord_callback_failed`)
  }
}
