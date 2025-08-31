"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Music, Music2, ExternalLink, Import, Link, Unlink } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface SpotifyPlaylist {
  id: string
  name: string
  description: string
  images: Array<{ url: string; height: number; width: number }>
  tracks_count: number
  owner: string
  public: boolean
}

interface SpotifyIntegrationProps {
  profileId: string
}

export function SpotifyIntegration({ profileId }: SpotifyIntegrationProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [spotifyUsername, setSpotifyUsername] = useState<string | null>(null)
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([])
  const [selectedPlaylist, setSelectedPlaylist] = useState<string>("")
  const [importing, setImporting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    checkSpotifyConnection()
  }, [])

  const checkSpotifyConnection = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('spotify_connected, spotify_username')
        .eq('id', user.id)
        .single()

      if (profile) {
        setIsConnected(profile.spotify_connected || false)
        setSpotifyUsername(profile.spotify_username)
        
        if (profile.spotify_connected) {
          fetchPlaylists()
        }
      }
    } catch (error) {
      console.error('Error checking Spotify connection:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPlaylists = async () => {
    try {
      const response = await fetch('/api/spotify/playlists')
      if (response.ok) {
        const data = await response.json()
        setPlaylists(data)
      }
    } catch (error) {
      console.error('Error fetching playlists:', error)
    }
  }

  const connectSpotify = () => {
    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID
    const redirectUri = `${window.location.origin}/api/spotify/callback`
    const scope = 'user-read-private user-read-email playlist-read-private playlist-read-collaborative'
    
    // Store the current profile ID in sessionStorage for the callback
    sessionStorage.setItem('spotify_profile_id', profileId)
    
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${profileId}`
    
    window.location.href = authUrl
  }

  const disconnectSpotify = async () => {
    try {
      const response = await fetch('/api/spotify/disconnect', {
        method: 'POST'
      })

      if (response.ok) {
        setIsConnected(false)
        setSpotifyUsername(null)
        setPlaylists([])
        setSelectedPlaylist("")
      }
    } catch (error) {
      console.error('Error disconnecting Spotify:', error)
    }
  }

  const importFromPlaylist = async () => {
    if (!selectedPlaylist) return

    setImporting(true)
    try {
      const response = await fetch('/api/spotify/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          playlist_id: selectedPlaylist,
          track_limit: 1
        })
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Successfully imported ${data.imported_tracks} track(s) from Spotify!`)
        setIsDialogOpen(false)
        setSelectedPlaylist("")
        // Refresh the page or update the music tracks
        window.location.reload()
      } else {
        const error = await response.json()
        alert(`Import failed: ${error.error}`)
      }
    } catch (error) {
      console.error('Error importing tracks:', error)
      alert('Import failed. Please try again.')
    } finally {
      setImporting(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music2 className="w-5 h-5" />
            Spotify Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music2 className="w-5 h-5" />
          Spotify Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected ? (
          <div className="text-center py-8">
            <Music2 className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-semibold mb-2">Connect Your Spotify Account</h3>
            <p className="text-muted-foreground mb-4">
              Import your favorite tracks and playlists directly from Spotify
            </p>
            <Button onClick={connectSpotify} className="bg-green-600 hover:bg-green-700">
              <Music2 className="w-4 h-4 mr-2" />
              Connect Spotify
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="flex items-center gap-3">
                <Music2 className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-900 dark:text-green-100">
                    Connected to Spotify
                  </p>
                  {spotifyUsername && (
                    <p className="text-sm text-green-700 dark:text-green-300">
                      @{spotifyUsername}
                    </p>
                  )}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={disconnectSpotify}>
                <Unlink className="w-4 h-4 mr-2" />
                Disconnect
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Import from Playlist</h4>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Import className="w-4 h-4 mr-2" />
                      Import Track
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Import Track from Spotify</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Select Playlist</label>
                        <Select value={selectedPlaylist} onValueChange={setSelectedPlaylist}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a playlist" />
                          </SelectTrigger>
                          <SelectContent>
                            {playlists.map((playlist) => (
                              <SelectItem key={playlist.id} value={playlist.id}>
                                <div className="flex items-center gap-2">
                                  {playlist.images[0] && (
                                    <img
                                      src={playlist.images[0].url}
                                      alt={playlist.name}
                                      className="w-6 h-6 rounded"
                                    />
                                  )}
                                  <div>
                                    <div className="font-medium">{playlist.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {playlist.tracks_count} tracks • {playlist.owner}
                                    </div>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        <p>• You can only have 1 music track per profile</p>
                        <p>• The first track from the selected playlist will be imported</p>
                        <p>• Track will be automatically added to your profile</p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={importFromPlaylist}
                          disabled={!selectedPlaylist || importing}
                          className="flex-1"
                        >
                          {importing ? (
                            <>
                              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                              Importing...
                            </>
                          ) : (
                            <>
                              <Import className="w-4 h-4 mr-2" />
                              Import Track
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsDialogOpen(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {playlists.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Your Playlists ({playlists.length})
                  </p>
                  <div className="grid gap-2 max-h-40 overflow-y-auto">
                    {playlists.slice(0, 5).map((playlist) => (
                      <div
                        key={playlist.id}
                        className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50"
                      >
                        {playlist.images[0] && (
                          <img
                            src={playlist.images[0].url}
                            alt={playlist.name}
                            className="w-10 h-10 rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{playlist.name}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {playlist.tracks_count} tracks • {playlist.owner}
                          </p>
                        </div>
                        <Badge variant={playlist.public ? "default" : "secondary"}>
                          {playlist.public ? "Public" : "Private"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  {playlists.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center">
                      Showing first 5 playlists
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
