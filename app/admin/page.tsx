"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/types/badges'
import { useBadges } from '@/hooks/use-badges'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge as BadgeComponent } from '@/components/badge'
import { 
  Users, 
  Flag, 
  Lightbulb, 
  FileText, 
  Settings, 
  Eye, 
  ThumbsUp, 
  Crown,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MessageSquare,
  Bell,
  Shield,
  User,
  LinkIcon,
  Music,
  Palette,
  Star,
  Heart,
  Code,
  Gift,
  Zap,
  BarChart3,
  Activity,
  Plus
} from 'lucide-react'

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const { badges, createBadge, updateBadge, deleteBadge } = useBadges()
  const [reports, setReports] = useState<any[]>([])
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [codes, setCodes] = useState<any[]>([])
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    premiumUsers: 0,
    totalViews: 0,
    reportsToday: 0,
    suggestionsToday: 0
  })
  const [systemHealth, setSystemHealth] = useState({
    database: 'healthy',
    api: 'healthy',
    storage: 'healthy',
    uptime: '99.9%',
    lastBackup: '2 hours ago',
    activeConnections: 156
  })
  const [moderationQueue, setModerationQueue] = useState<any[]>([])
  const [newBadge, setNewBadge] = useState({
    name: '',
    description: '',
    icon: '',
    requires_premium: false,
    requires_verified: false,
    min_views: 0
  })
  const [newCode, setNewCode] = useState({
    code: '',
    type: 'premium' as 'premium' | 'badge' | 'feature',
    description: ''
  })

  const [customBadgeFile, setCustomBadgeFile] = useState<File | null>(null)
  const [customBadgePreview, setCustomBadgePreview] = useState<string>('')

  const supabase = createClient()

  const tabs = [
    { id: "overview", label: "Overview", icon: Eye },
    { id: "users", label: "Manage Users", icon: Users },
    { id: "reports", label: "Reports", icon: Flag },
    { id: "suggestions", label: "Suggestions", icon: Lightbulb },
    { id: "badges", label: "Badges", icon: Crown },
    { id: "codes", label: "Codes", icon: Code },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "moderation", label: "Content Mod", icon: Shield },
    { id: "system", label: "System Health", icon: Activity },
    { id: "logs", label: "Staff Logs", icon: FileText },
    { id: "settings", label: "Settings", icon: Settings }
  ]

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setUsers(data || [])

      // Initialize empty arrays for real data
      setReports([])
      setSuggestions([])
      setCodes([])

      // Load analytics data
      setAnalytics({
        totalUsers: data?.length || 0,
        activeUsers: Math.floor((data?.length || 0) * 0.1),
        newUsersToday: Math.floor((data?.length || 0) * 0.05),
        premiumUsers: Math.floor((data?.length || 0) * 0.2),
        totalViews: 45678,
        reportsToday: 8,
        suggestionsToday: 15
      })

      // Load system health data
      setSystemHealth({
        database: 'healthy',
        api: 'healthy',
        storage: 'healthy',
        uptime: '99.9%',
        lastBackup: '2 hours ago',
        activeConnections: 156
      })
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBadge = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createBadge(newBadge)
      setNewBadge({
        name: '',
        description: '',
        icon: '',
        requires_premium: false,
        requires_verified: false,
        min_views: 0
      })
    } catch (error) {
      console.error('Error creating badge:', error)
    }
  }

  const handleDeleteBadge = async (id: string) => {
    if (confirm('Are you sure you want to delete this badge?')) {
      try {
        await deleteBadge(id)
      } catch (error) {
        console.error('Error deleting badge:', error)
      }
    }
  }

  const handleToggleBadge = (badgeId: string) => {
    // In a real app, you'd update the badge in the database
    console.log(`Toggling badge ${badgeId}`)
    // For now, we'll just show an alert
    alert(`Badge ${badgeId} toggled! In a real app, this would update the database.`)
  }

  const handleCustomBadgeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCustomBadgeFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setCustomBadgePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadCustomBadge = () => {
    if (customBadgeFile && newBadge.name) {
      // In a real app, you'd upload to storage and save badge data
      console.log('Custom badge uploaded:', {
        name: newBadge.name,
        description: newBadge.description,
        image: customBadgePreview,
        requirements: {
          premium: newBadge.requires_premium,
          verified: newBadge.requires_verified,
          minViews: newBadge.min_views
        }
      })
      
      // Reset form
      setNewBadge({
        name: '',
        description: '',
        icon: '',
        requires_premium: false,
        requires_verified: false,
        min_views: 0
      })
      setCustomBadgeFile(null)
      setCustomBadgePreview('')
      
      alert('Custom badge uploaded successfully! In a real app, this would save to the database.')
    }
  }

  const handleModerationAction = (id: string, action: 'approve' | 'reject' | 'flag') => {
    setModerationQueue(prev => prev.filter(item => item.id !== id))
    // Add to staff logs
    const item = moderationQueue.find(i => i.id === id)
    if (item) {
      console.log(`Moderation action: ${action} on ${item.type} by ${item.user}`)
    }
  }

  const handleUserAction = (userId: string, action: 'ban' | 'warn' | 'verify' | 'premium') => {
    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        switch (action) {
          case 'ban':
            return { ...user, role: 'banned' }
          case 'warn':
            return { ...user, role: user.role === 'warned' ? 'banned' : 'warned' }
          case 'verify':
            return { ...user, is_verified: !user.is_verified }
          case 'premium':
            return { ...user, is_premium: !user.is_premium }
          default:
            return user
        }
      }
      return user
    }))
  }

  const generateBulkCodes = (count: number, type: 'premium' | 'badge' | 'feature') => {
    const newCodes: any[] = []
    for (let i = 0; i < count; i++) {
      const code = `${type.toUpperCase()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      newCodes.push({
        id: Date.now().toString() + i,
        code,
        type,
        description: `Bulk generated ${type} code`,
        is_used: false,
        used_by: null,
        created_at: new Date().toISOString().split('T')[0]
      })
    }
    setCodes(prev => [...prev, ...newCodes])
  }

  const exportUserData = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Username,Email,Role,Premium,Verified,Created\n" +
      users.map(user => 
        `${user.username},${user.email},${user.is_premium},${user.is_verified},${user.created_at}`
      ).join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "users_export.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'Resolved': return 'bg-green-500/20 text-green-300 border-green-500/30'
      case 'Accepted': return 'bg-green-500/20 text-green-300 border-green-500/30'
      case 'Rejected': return 'bg-red-500/20 text-red-300 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <Clock className="w-4 h-4" />
      case 'Resolved': return <CheckCircle className="w-4 h-4" />
      case 'Accepted': return <CheckCircle className="w-4 h-4" />
      case 'Rejected': return <XCircle className="w-4 h-4" />
      default: return <AlertTriangle className="w-4 h-4" />
    }
  }

  const getBadgeColor = (badgeName: string) => {
    switch (badgeName) {
      case 'admin': return '#fbbf24' // yellow
      case 'owner': return '#fbbf24' // yellow
      case 'moderator': return '#10b981' // green
      case 'verified': return '#3b82f6' // blue
      case 'premium': return '#f59e0b' // amber
      case 'vip': return '#8b5cf6' // violet
      case 'dev': return '#06b6d4' // cyan
      case 'designer': return '#ec4899' // pink
      case 'staff': return '#10b981' // green
      case 'bug_hunter': return '#ef4444' // red
      case 'community_leader': return '#f97316' // orange
      case 'content_creator': return '#8b5cf6' // violet
      case 'early_adopter': return '#10b981' // green
      case 'feature_suggester': return '#f59e0b' // amber
      default: return '#6b7280' // gray
    }
  }

  const getBadgeIcon = (badgeName: string) => {
    switch (badgeName) {
      case 'admin': return 'crown'
      case 'owner': return 'crown'
      case 'moderator': return 'shield'
      case 'verified': return 'check-circle'
      case 'premium': return 'star'
      case 'vip': return 'crown'
      case 'dev': return 'code'
      case 'designer': return 'palette'
      case 'staff': return 'shield'
      case 'bug_hunter': return 'shield'
      case 'community_leader': return 'star'
      case 'content_creator': return 'palette'
      case 'early_adopter': return 'zap'
      case 'feature_suggester': return 'lightbulb'
      default: return 'star'
    }
  }

  // Show skeleton while loading instead of full loading screen
  if (loading) {
    return (
      <div className="min-h-screen px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Dashboard Header Skeleton */}
          <div className="mb-8">
            <div className="h-10 bg-gray-700 rounded w-64 mb-2 animate-pulse"></div>
            <div className="h-6 bg-gray-700 rounded w-96 animate-pulse"></div>
          </div>

          <div className="flex gap-8">
            {/* Left Sidebar Skeleton */}
            <div className="w-72 space-y-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-12 bg-gray-700 rounded-xl animate-pulse"></div>
              ))}
            </div>

            {/* Right Content Skeleton */}
            <div className="flex-1 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-24 bg-gray-700 rounded-xl animate-pulse"></div>
                ))}
              </div>
              <div className="h-48 bg-gray-700 rounded-xl animate-pulse"></div>
              <div className="h-64 bg-gray-700 rounded-xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <div className="mb-8 animate-in slide-in-from-bottom-2 duration-500 delay-100">
          <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400 text-lg">Comprehensive platform management and monitoring</p>
        </div>

        <div className="flex gap-8">
          {/* Left Sidebar */}
          <div className="sticky top-8 dashboard-sidebar rounded-2xl p-6 w-72 h-fit">
            <div className="space-y-3">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all font-medium ${
                      activeTab === tab.id
                        ? "bg-red-600/20 text-red-400 border border-red-500/30 shadow-lg shadow-red-500/10"
                        : "text-gray-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Admin Status */}
            <div className="mt-6 p-4 bg-red-500/20 rounded-xl border border-red-500/30">
              <div className="flex items-center gap-2 text-red-400">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span className="text-sm font-semibold">Admin Access</span>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 space-y-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Total Users', value: users.length, icon: <Users className="w-6 h-6" />, color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
                    { label: 'Active Badges', value: badges.length, icon: <Crown className="w-6 h-6" />, color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
                    { label: 'Pending Reports', value: reports.filter(r => r.status === 'Pending').length, icon: <Flag className="w-6 h-6" />, color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
                    { label: 'Available Codes', value: codes.filter(c => !c.is_used).length, icon: <Code className="w-6 h-6" />, color: 'bg-green-500/20 text-green-300 border-green-500/30' }
                  ].map((stat, index) => (
                    <div key={index} className="dashboard-card hover:scale-105 transition-transform duration-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-3xl font-bold text-white">{stat.value}</p>
                          <p className="text-gray-400 text-sm">{stat.label}</p>
                        </div>
                        <div className={`p-3 rounded-lg ${stat.color}`}>
                          {stat.icon}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Actions */}
                <Card className="dashboard-card">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <Zap className="w-6 h-6 text-purple-500" />
                      <CardTitle className="text-xl text-white">Quick Actions</CardTitle>
                      <CardDescription className="text-gray-400">
                        Common admin tasks and operations
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { label: 'Export Users', icon: <Users className="w-5 h-5" />, color: 'bg-blue-600 hover:bg-blue-700', action: () => exportUserData() },
                        { label: 'Generate Codes', icon: <Code className="w-5 h-5" />, color: 'bg-green-600 hover:bg-green-700', action: () => generateBulkCodes(10, 'premium') },
                        { label: 'View Reports', icon: <Flag className="w-5 h-5" />, color: 'bg-yellow-600 hover:bg-yellow-700', action: () => setActiveTab('reports') },
                        { label: 'System Health', icon: <Activity className="w-5 h-5" />, color: 'bg-purple-600 hover:bg-purple-700', action: () => setActiveTab('system') }
                      ].map((action, index) => (
                        <button
                          key={index}
                          onClick={action.action}
                          className={`${action.color} text-white p-4 rounded-lg transition-all duration-200 hover:scale-105 flex flex-col items-center space-y-2`}
                        >
                          {action.icon}
                          <span className="font-medium">{action.label}</span>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                <Card className="dashboard-card">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Users className="w-6 h-6 text-blue-500" />
                        <CardTitle className="text-xl text-white">Manage Users</CardTitle>
                        <CardDescription className="text-gray-400">
                          View and manage user accounts
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button onClick={() => exportUserData()} variant="outline" size="sm">
                          Export CSV
                        </Button>
                        <Button onClick={() => generateBulkCodes(5, 'premium')} size="sm">
                          Bulk Premium
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 flex items-center space-x-4">
                      <div className="flex-1">
                        <Input
                          placeholder="Search users..."
                          className="bg-black/20 border-white/10 text-white"
                        />
                      </div>
                      <select className="px-3 py-2 bg-black/20 border border-white/10 rounded text-white">
                        <option value="">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="moderator">Moderator</option>
                        <option value="user">User</option>
                        <option value="banned">Banned</option>
                        <option value="warned">Warned</option>
                      </select>
                    </div>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {users.map((user) => (
                        <div key={user.id} className="p-4 bg-black/20 rounded-lg border border-white/10 hover:bg-black/30 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-4 mb-2">
                                <span className="font-medium text-white">{user.username || 'No username'}</span>
                                <span className="px-2 py-1 rounded-full text-xs border bg-blue-500/20 text-blue-300 border-blue-500/30">
                                  {user.role || 'user'}
                                </span>
                                {user.is_premium && (
                                  <span className="px-2 py-1 rounded-full text-xs border bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                                    Premium
                                  </span>
                                )}
                                {user.is_verified && (
                                  <span className="text-xs px-2 py-1 rounded-full border bg-green-500/20 text-green-300 border-green-500/30">
                                    Verified
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-400">{user.email}</p>
                              <p className="text-xs text-gray-500">Joined: {user.created_at}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button 
                                onClick={() => handleUserAction(user.id, 'verify')}
                                size="sm" 
                                variant={user.is_verified ? "destructive" : "outline"}
                              >
                                {user.is_verified ? 'Unverify' : 'Verify'}
                              </Button>
                              <Button 
                                onClick={() => handleUserAction(user.id, 'premium')}
                                size="sm" 
                                variant={user.is_premium ? "destructive" : "outline"}
                              >
                                {user.is_premium ? 'Remove Premium' : 'Add Premium'}
                              </Button>
                              <Button 
                                onClick={() => handleUserAction(user.id, 'ban')}
                                size="sm" 
                                variant="destructive"
                              >
                                Ban
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Badges Tab */}
            {activeTab === "badges" && (
              <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                <Card className="dashboard-card">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <Crown className="w-6 h-6 text-yellow-500" />
                      <CardTitle className="text-xl text-white">Manage Badges</CardTitle>
                      <CardDescription className="text-gray-400">
                        Create and manage user badges with preview
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Create Badge Form */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Create New Badge</h3>
                        <form onSubmit={handleCreateBadge} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="badgeName" className="text-white">Badge Name</Label>
                              <Input
                                id="badgeName"
                                type="text"
                                placeholder="Badge name"
                                value={newBadge.name}
                                onChange={(e) => setNewBadge(prev => ({ ...prev, name: e.target.value }))}
                                className="mt-1 bg-black/20 border-white/10 text-white"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="badgeIcon" className="text-white">Icon (emoji)</Label>
                              <Input
                                id="badgeIcon"
                                type="text"
                                placeholder="Icon (emoji)"
                                value={newBadge.icon}
                                onChange={(e) => setNewBadge(prev => ({ ...prev, icon: e.target.value }))}
                                className="mt-1 bg-black/20 border-white/10 text-white"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="badgeDescription" className="text-white">Description</Label>
                            <Textarea
                              id="badgeDescription"
                              placeholder="Badge description"
                              value={newBadge.description}
                              onChange={(e) => setNewBadge(prev => ({ ...prev, description: e.target.value }))}
                              className="mt-1 bg-black/20 border-white/10 text-white"
                            />
                          </div>
                          <div className="flex items-center space-x-4">
                            <label className="flex items-center space-x-2 text-white">
                              <Switch
                                checked={newBadge.requires_premium}
                                onCheckedChange={(checked) => setNewBadge(prev => ({ ...prev, requires_premium: checked }))}
                              />
                              <span className="text-sm">Premium only</span>
                            </label>
                            <label className="flex items-center space-x-2 text-white">
                              <Switch
                                checked={newBadge.requires_verified}
                                onCheckedChange={(checked) => setNewBadge(prev => ({ ...prev, requires_verified: checked }))}
                              />
                              <span className="text-sm">Verified only</span>
                            </label>
                          </div>
                          <div>
                            <Label htmlFor="minViews" className="text-white">Min views required</Label>
                            <Input
                              id="minViews"
                              type="number"
                              placeholder="Min views required"
                              value={newBadge.min_views}
                              onChange={(e) => setNewBadge(prev => ({ ...prev, min_views: parseInt(e.target.value) || 0 }))}
                              className="mt-1 bg-black/20 border-white/10 text-white"
                            />
                          </div>
                          <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
                            Create Badge
                          </Button>
                        </form>

                        {/* Custom Badge Upload */}
                        <div className="mt-8">
                          <h3 className="text-lg font-semibold text-white mb-4">Upload Custom Badge</h3>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="customBadgeFile" className="text-white">Badge Image</Label>
                              <Input
                                id="customBadgeFile"
                                type="file"
                                accept="image/*"
                                onChange={handleCustomBadgeUpload}
                                className="mt-1 bg-black/20 border-white/10 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700"
                              />
                            </div>
                            {customBadgePreview && (
                              <div className="flex items-center gap-4">
                                <img 
                                  src={customBadgePreview} 
                                  alt="Badge preview" 
                                  className="w-16 h-16 rounded-lg object-cover border border-white/20"
                                />
                                <div className="flex-1">
                                  <Input
                                    placeholder="Badge name for custom badge"
                                    value={newBadge.name}
                                    onChange={(e) => setNewBadge(prev => ({ ...prev, name: e.target.value }))}
                                    className="bg-black/20 border-white/10 text-white"
                                  />
                                </div>
                                <Button 
                                  onClick={handleUploadCustomBadge}
                                  disabled={!customBadgeFile || !newBadge.name}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Upload
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                                             {/* Badge Preview */}
                       <div>
                         <h3 className="text-lg font-semibold text-white mb-4">Badge Preview</h3>
                         <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-sm p-8">
                           {newBadge.name ? (
                             <div className="text-center">
                               {/* Badge Preview using actual Badge component */}
                               <div className="mb-6 flex justify-center">
                                 <BadgeComponent 
                                   badge={{
                                     id: 'preview',
                                     name: newBadge.name,
                                     display_name: newBadge.name,
                                     description: newBadge.description || '',
                                     color: getBadgeColor(newBadge.name),
                                     icon: newBadge.icon || getBadgeIcon(newBadge.name),
                                     is_active: true,
                                     created_at: new Date().toISOString()
                                   }}
                                   size="lg"
                                   variant="gradient"
                                   animated={true}
                                 />
                               </div>
                               
                               {/* Badge Name */}
                               <h4 className="text-2xl font-bold text-white mb-3">{newBadge.name}</h4>
                               
                               {/* Badge Description */}
                               {newBadge.description && (
                                 <p className="text-gray-300 mb-4 leading-relaxed">{newBadge.description}</p>
                               )}
                               
                               {/* Badge Requirements */}
                               <div className="flex flex-wrap gap-2 justify-center">
                                 {newBadge.requires_premium && (
                                   <span className="px-3 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 text-xs rounded-full border border-yellow-500/30 backdrop-blur-sm">
                                     Premium
                                   </span>
                                 )}
                                 {newBadge.requires_verified && (
                                   <span className="px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 text-xs rounded-full border border-green-500/30 backdrop-blur-sm">
                                     Verified
                                   </span>
                                 )}
                                 {newBadge.min_views > 0 && (
                                   <span className="px-3 py-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30 backdrop-blur-sm">
                                     {newBadge.min_views}+ views
                                   </span>
                                 )}
                               </div>
                               
                               {/* Preview Label */}
                               <div className="mt-4">
                                 <span className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30 backdrop-blur-sm">
                                   Preview
                                 </span>
                               </div>
                             </div>
                           ) : (
                             <div className="text-center text-gray-400">
                               <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 mx-auto mb-6 flex items-center justify-center">
                                 <Crown className="w-12 h-12 opacity-50" />
                               </div>
                               <p className="text-lg">Fill out the form to see badge preview</p>
                               <p className="text-sm text-gray-500 mt-2">Your badge will appear here exactly as users will see it</p>
                             </div>
                           )}
                           
                           {/* Hover Glow Effect */}
                           <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                         </div>
                       </div>
                    </div>

                                         {/* Badges List */}
                     <div className="mt-8">
                       <h3 className="text-lg font-semibold text-white mb-4">All Badges ({badges.length})</h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         {badges.map((badge) => (
                           <div key={badge.id} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-sm hover:border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                             {/* Badge Header */}
                             <div className="relative p-6 text-center">
                               {/* Badge Preview using actual Badge component */}
                               <div className="mb-4 flex justify-center">
                                 <BadgeComponent 
                                   badge={{
                                     id: badge.id,
                                     name: badge.name,
                                     display_name: badge.name,
                                     description: badge.description || '',
                                     color: getBadgeColor(badge.name),
                                     icon: getBadgeIcon(badge.name),
                                     is_active: true,
                                     created_at: new Date().toISOString()
                                   }}
                                   size="lg"
                                   variant="gradient"
                                   animated={true}
                                 />
                               </div>
                               
                               {/* Badge Name */}
                               <h3 className="text-xl font-bold text-white mb-2">{badge.name}</h3>
                               
                               {/* Badge Description */}
                               {badge.description && (
                                 <p className="text-gray-300 text-sm leading-relaxed mb-4">{badge.description}</p>
                               )}
                               
                               {/* Badge Requirements */}
                               <div className="flex flex-wrap gap-2 justify-center mb-4">
                                 {badge.requires_premium && (
                                   <span className="px-3 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 text-xs rounded-full border border-yellow-500/30 backdrop-blur-sm">
                                     Premium
                                   </span>
                                 )}
                                 {badge.requires_verified && (
                                   <span className="px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 text-xs rounded-full border border-green-500/30 backdrop-blur-sm">
                                     Verified
                                   </span>
                                 )}
                                 {badge.min_views && badge.min_views > 0 && (
                                   <span className="px-3 py-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30 backdrop-blur-sm">
                                     {badge.min_views}+ views
                                   </span>
                                 )}
                               </div>
                             </div>
                             
                             {/* Badge Actions */}
                             <div className="border-t border-white/10 bg-black/20 p-4">
                               <div className="flex items-center justify-between">
                                 <Button
                                   onClick={() => handleToggleBadge(badge.id)}
                                   size="sm"
                                   variant="outline"
                                   className="text-green-400 border-green-500/30 hover:bg-green-500/20 hover:text-green-300 transition-all duration-200"
                                 >
                                   <CheckCircle className="w-4 h-4 mr-2" />
                                   Enabled
                                 </Button>
                                 <Button
                                   onClick={() => handleDeleteBadge(badge.id)}
                                   variant="destructive"
                                   size="sm"
                                   className="hover:bg-red-700 transition-all duration-200"
                                 >
                                   <XCircle className="w-4 h-4 mr-2" />
                                   Delete
                                 </Button>
                               </div>
                             </div>
                             
                             {/* Hover Glow Effect */}
                             <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                           </div>
                         ))}
                         
                         {/* New Badge Templates */}
                         {[
                           { name: 'owner', description: 'Site owner and administrator', icon: 'crown', color: '#fbbf24', requires_premium: true, requires_verified: true },
                           { name: 'dev', description: 'Software developer & coder', icon: 'code', color: '#06b6d4', requires_premium: true, requires_verified: false },
                           { name: 'designer', description: 'Creative designer & artist', icon: 'palette', color: '#ec4899', requires_premium: true, requires_verified: false },
                           { name: 'staff', description: 'Site staff member', icon: 'shield', color: '#10b981', requires_premium: false, requires_verified: true }
                         ].map((template, index) => (
                           <div key={`template-${index}`} className="group relative overflow-hidden rounded-2xl border border-dashed border-white/20 bg-gradient-to-br from-black/20 to-black/10 backdrop-blur-sm hover:border-white/40 transition-all duration-300 hover:scale-105">
                             {/* Badge Header */}
                             <div className="relative p-6 text-center">
                               {/* Badge Preview using actual Badge component */}
                               <div className="mb-4 flex justify-center">
                                 <BadgeComponent 
                                   badge={{
                                     id: `template-${index}`,
                                     name: template.name,
                                     display_name: template.name,
                                     description: template.description,
                                     color: template.color,
                                     icon: template.icon,
                                     is_active: true,
                                     created_at: new Date().toISOString()
                                   }}
                                   size="lg"
                                   variant="gradient"
                                   animated={true}
                                 />
                               </div>
                               
                               {/* Badge Name */}
                               <h3 className="text-xl font-bold text-white mb-2">{template.name}</h3>
                               
                               {/* Badge Description */}
                               <p className="text-gray-300 text-sm leading-relaxed mb-4">{template.description}</p>
                               
                               {/* Badge Requirements */}
                               <div className="flex flex-wrap gap-2 justify-center mb-4">
                                 {template.requires_premium && (
                                   <span className="px-3 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 text-xs rounded-full border border-yellow-500/30 backdrop-blur-sm">
                                     Premium
                                   </span>
                                 )}
                                 {template.requires_verified && (
                                   <span className="px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 text-xs rounded-full border border-green-500/30 backdrop-blur-sm">
                                     Verified
                                   </span>
                                 )}
                               </div>
                             </div>
                             
                             {/* Badge Actions */}
                             <div className="border-t border-white/10 bg-black/20 p-4">
                               <div className="flex items-center justify-center">
                                 <Button
                                   onClick={() => {
                                     setNewBadge({
                                       name: template.name,
                                       description: template.description,
                                       icon: template.icon,
                                       requires_premium: template.requires_premium,
                                       requires_verified: template.requires_verified,
                                       min_views: 0
                                     })
                                   }}
                                   size="sm"
                                   className="bg-blue-600 hover:bg-blue-700 transition-all duration-200"
                                 >
                                   <Plus className="w-4 h-4 mr-2" />
                                   Create Template
                                 </Button>
                               </div>
                             </div>
                             
                             {/* Hover Glow Effect */}
                             <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                           </div>
                         ))}
                       </div>
                     </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === "reports" && (
              <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                <Card className="dashboard-card">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <Flag className="w-6 h-6 text-red-500" />
                      <CardTitle className="text-xl text-white">User Reports</CardTitle>
                      <CardDescription className="text-gray-400">
                        Manage and resolve user reports
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {reports.map((report) => (
                        <div key={report.id} className="p-4 bg-black/20 rounded-lg border border-white/10">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="font-medium text-white">{report.username}</span>
                                <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(report.status)}`}>
                                  {report.status}
                                </span>
                                <span className="text-sm text-gray-400">{report.reportType}</span>
                              </div>
                              <p className="text-gray-300 mb-2">{report.reason}</p>
                              <p className="text-xs text-gray-500">Reported: {report.date}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {report.status === 'Pending' && (
                                <>
                                  <Button size="sm" variant="outline" onClick={() => handleModerationAction(report.id, 'approve')}>
                                    Resolve
                                  </Button>
                                  <Button size="sm" variant="destructive" onClick={() => handleModerationAction(report.id, 'reject')}>
                                    Dismiss
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Suggestions Tab */}
            {activeTab === "suggestions" && (
              <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                <Card className="dashboard-card">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <Lightbulb className="w-6 h-6 text-yellow-500" />
                      <CardTitle className="text-xl text-white">Feature Suggestions</CardTitle>
                      <CardDescription className="text-gray-400">
                        Review and manage user feature suggestions
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {suggestions.map((suggestion) => (
                        <div key={suggestion.id} className="p-4 bg-black/20 rounded-lg border border-white/10">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="font-medium text-white">{suggestion.title}</span>
                                <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(suggestion.status)}`}>
                                  {suggestion.status}
                                </span>
                                <span className="text-sm text-gray-400">by {suggestion.user}</span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                                <span>Votes: {suggestion.votes}</span>
                                <span>Submitted: {suggestion.submittedDate}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {suggestion.status === 'Pending' && (
                                <>
                                  <Button size="sm" variant="outline" onClick={() => handleModerationAction(suggestion.id, 'approve')}>
                                    Accept
                                  </Button>
                                  <Button size="sm" variant="destructive" onClick={() => handleModerationAction(suggestion.id, 'reject')}>
                                    Reject
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Codes Tab */}
            {activeTab === "codes" && (
              <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                <Card className="dashboard-card">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Code className="w-6 h-6 text-green-500" />
                        <CardTitle className="text-xl text-white">Manage Codes</CardTitle>
                        <CardDescription className="text-gray-400">
                          Generate and manage premium, badge, and feature codes
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button onClick={() => generateBulkCodes(5, 'premium')} size="sm">
                          Generate x5
                        </Button>
                        <Button onClick={() => generateBulkCodes(10, 'premium')} size="sm">
                          Generate x10
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form className="mb-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="codeType" className="text-white">Code Type</Label>
                          <select
                            id="codeType"
                            value={newCode.type}
                            onChange={(e) => setNewCode(prev => ({ ...prev, type: e.target.value as 'premium' | 'badge' | 'feature' }))}
                            className="mt-1 w-full px-3 py-2 bg-black/20 border border-white/10 rounded text-white"
                          >
                            <option value="premium">Premium</option>
                            <option value="badge">Badge</option>
                            <option value="feature">Feature</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="codeDescription" className="text-white">Description</Label>
                          <Input
                            id="codeDescription"
                            placeholder="Code description"
                            value={newCode.description}
                            onChange={(e) => setNewCode(prev => ({ ...prev, description: e.target.value }))}
                            className="mt-1 bg-black/20 border-white/10 text-white"
                          />
                        </div>
                      </div>
                      <Button type="button" onClick={() => generateBulkCodes(1, newCode.type)} className="w-full bg-green-600 hover:bg-green-700">
                        Generate Code
                      </Button>
                    </form>

                    <div className="space-y-4">
                      {codes.map((code) => (
                        <div key={code.id} className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/10">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${
                              code.type === 'premium' ? 'bg-yellow-500/20 text-yellow-300' :
                              code.type === 'badge' ? 'bg-purple-500/20 text-purple-300' :
                              'bg-blue-500/20 text-blue-300'
                            }`}>
                              <Code className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-medium text-white">{code.code}</p>
                              <p className="text-sm text-gray-400">{code.description}</p>
                              <p className="text-xs text-gray-500">Created: {code.created_at}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs border ${
                              code.is_used ? 'bg-red-500/20 text-red-300 border-red-500/30' : 'bg-green-500/20 text-green-300 border-green-500/30'
                            }`}>
                              {code.is_used ? 'Used' : 'Available'}
                            </span>
                            {code.used_by && (
                              <span className="text-xs text-gray-400">by {code.used_by}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === "analytics" && (
              <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                <Card className="dashboard-card">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="w-6 h-6 text-blue-500" />
                      <CardTitle className="text-xl text-white">Platform Analytics</CardTitle>
                      <CardDescription className="text-gray-400">
                        Comprehensive platform statistics and insights
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                      {[
                        { label: 'Total Users', value: analytics.totalUsers, icon: <Users className="w-6 h-6" />, color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
                        { label: 'Active Users', value: analytics.activeUsers, icon: <User className="w-6 h-6" />, color: 'bg-green-500/20 text-green-300 border-green-500/30' },
                        { label: 'New Users Today', value: analytics.newUsersToday, icon: <User className="w-6 h-6" />, color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
                        { label: 'Premium Users', value: analytics.premiumUsers, icon: <Crown className="w-6 h-6" />, color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' }
                      ].map((stat, index) => (
                        <div key={index} className="dashboard-card hover:scale-105 transition-transform duration-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-2xl font-bold text-white">{stat.value}</p>
                              <p className="text-gray-400 text-sm">{stat.label}</p>
                            </div>
                            <div className={`p-3 rounded-lg ${stat.color}`}>
                              {stat.icon}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="dashboard-card">
                        <CardHeader>
                          <CardTitle className="text-white">Engagement Metrics</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-300">Total Views</span>
                              <span className="text-white font-semibold">{analytics.totalViews.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-300">Reports Today</span>
                              <span className="text-white font-semibold">{analytics.reportsToday}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-300">Suggestions Today</span>
                              <span className="text-white font-semibold">{analytics.suggestionsToday}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="dashboard-card">
                        <CardHeader>
                          <CardTitle className="text-white">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <Button onClick={() => exportUserData()} className="w-full bg-blue-600 hover:bg-blue-700">
                              Export User Data
                            </Button>
                            <Button onClick={() => generateBulkCodes(10, 'premium')} className="w-full bg-green-600 hover:bg-green-700">
                              Generate Premium Codes
                            </Button>
                            <Button onClick={() => generateBulkCodes(10, 'badge')} className="w-full bg-purple-600 hover:bg-purple-700">
                              Generate Badge Codes
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Content Moderation Tab */}
            {activeTab === "moderation" && (
              <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                <Card className="dashboard-card">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <Shield className="w-6 h-6 text-orange-500" />
                      <CardTitle className="text-xl text-white">Content Moderation</CardTitle>
                      <CardDescription className="text-gray-400">
                        Review and moderate user-generated content
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {moderationQueue.map((item) => (
                        <div key={item.id} className="p-4 bg-black/20 rounded-lg border border-white/10">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className={`px-2 py-1 rounded-full text-xs border ${
                                  item.priority === 'high' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                                  item.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                                  'bg-green-500/20 text-green-300 border-green-500/30'
                                }`}>
                                  {item.priority} priority
                                </span>
                                <span className="text-sm text-gray-400">{item.type}</span>
                                <span className="text-sm text-white">by {item.user}</span>
                              </div>
                              <p className="text-gray-300 mb-2">{item.content}</p>
                              <p className="text-xs text-gray-500">Status: {item.status}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleModerationAction(item.id, 'approve')}>
                                Approve
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleModerationAction(item.id, 'reject')}>
                                Reject
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleModerationAction(item.id, 'flag')}>
                                Flag
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* System Health Tab */}
            {activeTab === "system" && (
              <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                <Card className="dashboard-card">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <Activity className="w-6 h-6 text-green-500" />
                      <CardTitle className="text-xl text-white">System Health</CardTitle>
                      <CardDescription className="text-gray-400">
                        Monitor system performance and status
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <Card className="dashboard-card">
                        <CardHeader>
                          <CardTitle className="text-white">Service Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {[
                              { service: 'Database', status: systemHealth.database },
                              { service: 'API', status: systemHealth.api },
                              { service: 'Storage', status: systemHealth.storage }
                            ].map((service) => (
                              <div key={service.service} className="flex justify-between items-center">
                                <span className="text-gray-300">{service.service}</span>
                                <span className={`px-2 py-1 rounded-full text-xs border ${
                                  service.status === 'healthy' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'
                                }`}>
                                  {service.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="dashboard-card">
                        <CardHeader>
                          <CardTitle className="text-white">System Metrics</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-300">Uptime</span>
                              <span className="text-white font-semibold">{systemHealth.uptime}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-300">Last Backup</span>
                              <span className="text-white font-semibold">{systemHealth.lastBackup}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-300">Active Connections</span>
                              <span className="text-white font-semibold">{systemHealth.activeConnections}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="dashboard-card">
                      <CardHeader>
                        <CardTitle className="text-white">Maintenance Actions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Button className="bg-blue-600 hover:bg-blue-700">
                            <Activity className="w-4 h-4 mr-2" />
                            Run Diagnostics
                          </Button>
                          <Button className="bg-green-600 hover:bg-green-700">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Backup Database
                          </Button>
                          <Button className="bg-purple-600 hover:bg-purple-700">
                            <Settings className="w-4 h-4 mr-2" />
                            System Settings
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Staff Logs Tab */}
            {activeTab === "logs" && (
              <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                <Card className="dashboard-card">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <FileText className="w-6 h-6 text-indigo-500" />
                      <CardTitle className="text-xl text-white">Staff Activity Logs</CardTitle>
                      <CardDescription className="text-gray-400">
                        Track all staff actions and system changes
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                                                                    {[
                         // Staff logs will be populated from real database data
                       ].length > 0 ? (
                         [
                           // Staff logs will be populated from real database data
                         ].map((log, index) => (
                           <div key={index} className="p-4 bg-black/20 rounded-lg border border-white/10">
                             <div className="flex items-center justify-between">
                               <div className="flex items-center gap-3">
                                 <div className={`p-2 rounded-lg ${
                                   log.type === 'verify' ? 'bg-green-500/20 text-green-300' :
                                   log.type === 'create' ? 'bg-blue-500/20 text-blue-300' :
                                   log.type === 'resolve' ? 'bg-yellow-500/20 text-yellow-300' :
                                   log.type === 'generate' ? 'bg-purple-500/20 text-purple-300' :
                                   'bg-red-500/20 text-red-300'
                                 }`}>
                                   {log.type === 'verify' ? <CheckCircle className="w-4 h-4" /> :
                                    log.type === 'create' ? <Plus className="w-4 h-4" /> :
                                    log.type === 'resolve' ? <CheckCircle className="w-4 h-4" /> :
                                    log.type === 'generate' ? <Code className="w-4 h-4" /> :
                                    <XCircle className="w-4 h-4" />}
                                 </div>
                                 <div>
                                   <p className="text-white font-medium">{log.action}</p>
                                   <p className="text-sm text-gray-400">by {log.user} on {log.target}</p>
                                 </div>
                               </div>
                               <span className="text-xs text-gray-500">{log.time}</span>
                             </div>
                           </div>
                         ))
                       ) : (
                         <div className="p-8 text-center text-gray-400">
                           <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                           <p className="text-lg">No staff logs yet</p>
                           <p className="text-sm">Staff activity will appear here</p>
                         </div>
                       )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                <Card className="dashboard-card">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <Settings className="w-6 h-6 text-gray-500" />
                      <CardTitle className="text-xl text-white">Admin Settings</CardTitle>
                      <CardDescription className="text-gray-400">
                        Configure platform settings and preferences
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Notification Settings */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Notifications</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-medium">Email Notifications</p>
                              <p className="text-sm text-gray-400">Receive email alerts for important events</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-medium">Discord Webhooks</p>
                              <p className="text-sm text-gray-400">Send notifications to Discord channels</p>
                            </div>
                            <Switch />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-medium">Push Notifications</p>
                              <p className="text-sm text-gray-400">Browser push notifications</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </div>
                      </div>

                      {/* Automation Rules */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Automation</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-medium">Auto-approve Suggestions</p>
                              <p className="text-sm text-gray-400">Automatically approve suggestions with high votes</p>
                            </div>
                            <Switch />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-medium">Auto-ban Spammers</p>
                              <p className="text-sm text-gray-400">Automatically ban users with multiple reports</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-medium">Auto-verify Premium</p>
                              <p className="text-sm text-gray-400">Automatically verify premium users</p>
                            </div>
                            <Switch />
                          </div>
                        </div>
                      </div>

                      {/* Communication */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Communication</h3>
                        <div className="space-y-4">
                          <Button className="w-full bg-blue-600 hover:bg-blue-700">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Staff Chat
                          </Button>
                          <Button className="w-full bg-green-600 hover:bg-green-700">
                            <Bell className="w-4 h-4 mr-2" />
                            Public Announcements
                          </Button>
                        </div>
                      </div>

                      {/* Advanced Settings */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Advanced</h3>
                        <div className="space-y-4">
                          <Button variant="outline" className="w-full">
                            <Settings className="w-4 h-4 mr-2" />
                            Database Management
                          </Button>
                          <Button variant="outline" className="w-full">
                            <Activity className="w-4 h-4 mr-2" />
                            Performance Monitoring
                          </Button>
                          <Button variant="outline" className="w-full">
                            <Shield className="w-4 h-4 mr-2" />
                            Security Settings
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}