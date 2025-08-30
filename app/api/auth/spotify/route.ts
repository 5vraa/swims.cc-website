import { NextRequest, NextResponse } from 'next/server'

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI

export async function GET(request: NextRequest) {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_REDIRECT_URI) {
    return NextResponse.json({ error: 'Spotify credentials not configured' }, { status: 500 })
  }

  // Generate random state for security
  const state = Math.random().toString(36).substring(7)
  
  // Store state in session/cookie for verification
  const response = NextResponse.redirect(
    `https://accounts.spotify.com/authorize?` +
    `client_id=${SPOTIFY_CLIENT_ID}` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(SPOTIFY_REDIRECT_URI)}` +
    `&state=${state}` +
    `&scope=${encodeURIComponent('user-read-private user-read-email playlist-read-private')}`
  )

  // Set state in cookie for verification
  response.cookies.set('spotify_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10 // 10 minutes
  })

  return response
}
