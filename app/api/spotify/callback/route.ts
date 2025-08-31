import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.redirect(`https://swims.cc/profile/edit?error=spotify_auth_failed`)
    }

    if (!code) {
      return NextResponse.redirect(`https://swims.cc/profile/edit?error=spotify_code_missing`)
    }

    // Create a simple HTML page that will handle the OAuth flow
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Connecting Spotify...</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              background: #000; 
              color: #fff; 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              height: 100vh; 
              margin: 0; 
            }
            .container { 
              text-align: center; 
              padding: 2rem; 
            }
            .spinner { 
              border: 3px solid #333; 
              border-top: 3px solid #1DB954; 
              border-radius: 50%; 
              width: 40px; 
              height: 40px; 
              animation: spin 1s linear infinite; 
              margin: 0 auto 1rem; 
            }
            @keyframes spin { 
              0% { transform: rotate(0deg); } 
              100% { transform: rotate(360deg); } 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="spinner"></div>
            <h2>Connecting Spotify...</h2>
            <p>Please wait while we connect your account.</p>
          </div>
          <script>
            // Send the authorization code to our API
            fetch('/api/spotify/connect', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                code: '${code}',
                state: '${state}'
              })
            })
            .then(response => response.json())
                         .then(data => {
               if (data.success) {
                 // Redirect to profile edit page with success
                 window.location.href = 'https://swims.cc/profile/edit?spotify_connected=true&username=' + encodeURIComponent(data.spotify_username || '')
               } else {
                 // Redirect with error
                 window.location.href = 'https://swims.cc/profile/edit?error=spotify_connect_failed'
               }
             })
             .catch(error => {
               console.error('Error:', error)
               window.location.href = 'https://swims.cc/profile/edit?error=spotify_connect_failed'
             })
          </script>
        </body>
      </html>
    `

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    })

  } catch (error) {
    console.error('Error in Spotify callback:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/profile/edit?error=spotify_callback_failed`)
  }
}
