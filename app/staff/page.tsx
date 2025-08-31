"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
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
  Activity
} from 'lucide-react'

interface Report {
  id: string
  username: string
  reportType: string
  reason: string
  date: string
  status: 'Pending' | 'Resolved'
}

interface Suggestion {
  id: string
  title: string
  user: string
  votes: number
  submittedDate: string
  status: 'Pending' | 'Accepted' | 'Rejected'
}

interface User {
  id: string
  username: string
  email: string
  role: string
  is_premium: boolean
  is_verified: boolean
  created_at: string
}

interface Badge {
  id: string
  name: string
  description: string
  icon: string
  requires_premium: boolean
  requires_verified: boolean
  min_views: number
}

interface Code {
  id: string
  code: string
  type: 'premium' | 'badge' | 'feature'
  description: string
  is_used: boolean
  used_by: string | null
  created_at: string
}

export default function StaffDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [reports, setReports] = useState<Report[]>([])
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [badges, setBadges] = useState<Badge[]>([])
  const [codes, setCodes] = useState<Code[]>([])
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
  const [moderationQueue, setModerationQueue] = useState([
    { id: '1', type: 'profile', user: 'user123', content: 'Profile bio', status: 'pending', priority: 'high' },
    { id: '2', type: 'comment', user: 'user456', content: 'User comment', status: 'pending', priority: 'medium' },
    { id: '3', type: 'upload', user: 'user789', content: 'Profile image', status: 'pending', priority: 'low' }
  ])
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
    checkAccess()
  }, [])

  // Redirect unauthorized users
  useEffect(() => {
    if (!isLoading && !isAuthorized) {
      const timer = setTimeout(() => {
        window.location.href = '/'
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isLoading, isAuthorized])

  const checkAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single()
        
        const hasAccess = profile?.role === 'admin' || 
                         profile?.role === 'moderator' || 
                         profile?.role === 'staff'
        
        setIsAuthorized(hasAccess)
        
        if (hasAccess) {
          loadData()
        }
      }
    } catch (error) {
      console.error('Error checking access:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadData = async () => {
    try {
      // Load sample data for demo purposes
      setReports([
        {
          id: '1',
          username: '@user123',
          reportType: 'Inappropriate Content',
          reason: 'Profile contains offensive material',
          date: '2024-01-15 14:30',
          status: 'Pending'
        },
        {
          id: '2',
          username: '@spammer',
          reportType: 'Spam',
          reason: 'Multiple duplicate posts',
          date: '2024-01-15 12:15',
          status: 'Resolved'
        }
      ])

      setSuggestions([
        {
          id: '1',
          title: 'Dark mode toggle',
          user: '@user456',
          votes: 23,
          submittedDate: '2024-01-14',
          status: 'Pending'
        },
        {
          id: '2',
          title: 'Music player integration',
          user: '@musiclover',
          votes: 45,
          submittedDate: '2024-01-13',
          status: 'Accepted'
        }
      ])

      setUsers([
        {
          id: '1',
          username: 'admin',
          email: 'admin@example.com',
          role: 'admin',
          is_premium: true,
          is_verified: true,
          created_at: '2024-01-01'
        },
        {
          id: '2',
          username: 'user1',
          email: 'user1@example.com',
          role: 'user',
          is_premium: false,
          is_verified: false,
          created_at: '2024-01-02'
        }
      ])

      setBadges([
        {
          id: '1',
          name: 'Verified',
          description: 'Account verified by staff',
          icon: '✓',
          requires_premium: false,
          requires_verified: false,
          min_views: 0
        },
        {
          id: '2',
          name: 'Premium',
          description: 'Premium member badge',
          icon: '⭐',
          requires_premium: true,
          requires_verified: false,
          min_views: 0
        }
      ])

      setCodes([
        {
          id: '1',
          code: 'PREMIUM2024',
          type: 'premium',
          description: 'Premium access code',
          is_used: false,
          used_by: null,
          created_at: '2024-01-15'
        },
        {
          id: '2',
          code: 'BADGE123',
          type: 'badge',
          description: 'Special badge unlock',
          is_used: true,
          used_by: 'user1',
          created_at: '2024-01-14'
        }
      ])

      // Load analytics data
      setAnalytics({
        totalUsers: 1247,
        activeUsers: 89,
        newUsersToday: 12,
        premiumUsers: 156,
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
      console.error('Error loading data:', error)
    }
  }

  const handleSuggestionAction = (id: string, action: 'accept' | 'reject') => {
    setSuggestions(prev => prev.map(s => 
      s.id === id 
        ? { ...s, status: action === 'accept' ? 'Accepted' : 'Rejected' }
        : s
    ))
  }

  const handleReportStatus = (id: string) => {
    setReports(prev => prev.map(r => 
      r.id === id 
        ? { ...r, status: r.status === 'Pending' ? 'Resolved' : 'Pending' }
        : r
    ))
  }

  const handleCreateBadge = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const newBadgeData = {
        ...newBadge,
        id: Date.now().toString()
      }
      setBadges(prev => [...prev, newBadgeData])
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

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const newCodeData: Code = {
        ...newCode,
        id: Date.now().toString(),
        is_used: false,
        used_by: null,
        created_at: new Date().toISOString().split('T')[0]
      }
      setCodes(prev => [...prev, newCodeData])
      setNewCode({
        code: '',
        type: 'premium',
        description: ''
      })
    } catch (error) {
      console.error('Error creating code:', error)
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
    const newCodes: Code[] = []
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
        `${user.username},${user.email},${user.role},${user.is_premium},${user.is_verified},${user.created_at}`
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

  if (isLoading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-700 rounded"></div>
              <div className="h-96 bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="dashboard-card">
            <CardContent className="p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-4">Access Denied</h2>
              <p className="text-gray-300 mb-4">
                You don't have permission to access the staff dashboard. Staff privileges required.
              </p>
              <p className="text-sm text-gray-400">Redirecting to home page...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <div className="mb-8 animate-in slide-in-from-bottom-2 duration-500 delay-100">
          <h1 className="text-4xl font-bold text-white mb-2">Staff Dashboard</h1>
          <p className="text-gray-400 text-lg">Monitor and manage platform activity</p>
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

            {/* Staff Status */}
            <div className="mt-6 p-4 bg-green-500/20 rounded-xl border border-green-500/30">
              <div className="flex items-center gap-2 text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm font-semibold">Active Staff</span>
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
                    { label: 'Pending Reports', value: reports.filter(r => r.status === 'Pending').length, icon: <Flag className="w-6 h-6" />, color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
                    { label: 'Total Users', value: users.length, icon: <Users className="w-6 h-6" />, color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
                    { label: 'Active Badges', value: badges.length, icon: <Crown className="w-6 h-6" />, color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
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

                {/* Recent Reports */}
                <Card className="dashboard-card">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <Flag className="w-6 h-6 text-red-500" />
                      <CardTitle className="text-xl text-white">Recent Reports</CardTitle>
                      <CardDescription className="text-gray-400">
                        Latest user reports requiring attention
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {reports.slice(0, 3).map((report) => (
                        <div key={report.id} className="p-4 bg-black/20 rounded-lg border border-white/10 hover:bg-black/30 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-4">
                                <span className="font-medium text-white">{report.username}</span>
                                <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(report.status)}`}>
                                  <div className="flex items-center space-x-1">
                                    {getStatusIcon(report.status)}
                                    <span>{report.status}</span>
                                  </div>
                                </span>
                              </div>
                              <p className="text-sm text-gray-300 mt-1">
                                <span className="font-medium">{report.reportType}:</span> {report.reason}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">{report.date}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleReportStatus(report.id)}
                                className={`px-3 py-1 rounded text-sm transition-colors ${
                                  report.status === 'Pending'
                                    ? 'bg-green-600 hover:bg-green-700 text-white'
                                    : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                }`}
                              >
                                {report.status === 'Pending' ? 'Resolve' : 'Reopen'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="dashboard-card">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <Zap className="w-6 h-6 text-purple-500" />
                      <CardTitle className="text-xl text-white">Quick Actions</CardTitle>
                      <CardDescription className="text-gray-400">
                        Common staff tasks and operations
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { label: 'Review Reports', icon: <Flag className="w-5 h-5" />, color: 'bg-blue-600 hover:bg-blue-700' },
                        { label: 'Manage Users', icon: <Users className="w-5 h-5" />, color: 'bg-green-600 hover:bg-green-700' },
                        { label: 'Create Badge', icon: <Crown className="w-5 h-5" />, color: 'bg-purple-600 hover:bg-purple-700' },
                        { label: 'Generate Code', icon: <Code className="w-5 h-5" />, color: 'bg-red-600 hover:bg-red-700' }
                      ].map((action, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveTab(action.label.toLowerCase().includes('reports') ? 'reports' : 
                                                   action.label.toLowerCase().includes('users') ? 'users' : 
                                                   action.label.toLowerCase().includes('badge') ? 'badges' : 'codes')}
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
                      <select className="px-3 py-2 bg-black/20 border border-white/10 rounded text-white">
                        <option value="">All Status</option>
                        <option value="premium">Premium</option>
                        <option value="verified">Verified</option>
                        <option value="regular">Regular</option>
                      </select>
                    </div>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {users.map((user) => (
                        <div key={user.id} className="p-4 bg-black/20 rounded-lg border border-white/10 hover:bg-black/30 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-4 mb-2">
                                <span className="font-medium text-white">{user.username}</span>
                                <span className={`px-2 py-1 rounded-full text-xs border ${
                                  user.role === 'admin' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                                  user.role === 'moderator' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' :
                                  user.role === 'banned' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                                  user.role === 'warned' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                                  'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                }`}>
                                  {user.role}
                                </span>
                                {user.is_premium && (
                                  <span className="px-2 py-1 rounded-full text-xs border bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                                    Premium
                                  </span>
                                )}
                                {user.is_verified && (
                                  <span className="px-2 py-1 rounded-full text-xs border bg-green-500/20 text-green-300 border-green-500/30">
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
                                onClick={() => handleUserAction(user.id, 'warn')}
                                size="sm" 
                                variant="outline"
                                className="bg-yellow-600 hover:bg-yellow-700"
                              >
                                Warn
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

            {/* Reports Tab */}
            {activeTab === "reports" && (
              <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                <Card className="dashboard-card">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <Flag className="w-6 h-6 text-red-500" />
                      <CardTitle className="text-xl text-white">User Reports</CardTitle>
                      <CardDescription className="text-gray-400">
                        Review and handle user reports
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {reports.map((report) => (
                        <div key={report.id} className="p-4 bg-black/20 rounded-lg border border-white/10 hover:bg-black/30 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-4">
                                <span className="font-medium text-white">{report.username}</span>
                                <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(report.status)}`}>
                                  <div className="flex items-center space-x-1">
                                    {getStatusIcon(report.status)}
                                    <span>{report.status}</span>
                                  </div>
                                </span>
                              </div>
                              <p className="text-sm text-gray-300 mt-1">
                                <span className="font-medium">{report.reportType}:</span> {report.reason}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">{report.date}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleReportStatus(report.id)}
                                className={`px-3 py-1 rounded text-sm transition-colors ${
                                  report.status === 'Pending'
                                    ? 'bg-green-600 hover:bg-green-700 text-white'
                                    : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                }`}
                              >
                                {report.status === 'Pending' ? 'Resolve' : 'Reopen'}
                              </button>
                              <Button size="sm" variant="outline">View Details</Button>
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
                        Review and moderate user suggestions
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {suggestions.map((suggestion) => (
                        <div key={suggestion.id} className="p-4 bg-black/20 rounded-lg border border-white/10 hover:bg-black/30 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-white">{suggestion.title}</h3>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                                <span>by {suggestion.user}</span>
                                <span className="flex items-center space-x-1">
                                  <ThumbsUp className="w-4 h-4" />
                                  <span>{suggestion.votes}</span>
                                </span>
                                <span>{suggestion.submittedDate}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(suggestion.status)}`}>
                                <div className="flex items-center space-x-1">
                                  {getStatusIcon(suggestion.status)}
                                  <span>{suggestion.status}</span>
                                </div>
                              </span>
                              {suggestion.status === 'Pending' && (
                                <>
                                  <Button
                                    onClick={() => handleSuggestionAction(suggestion.id, 'accept')}
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    Accept
                                  </Button>
                                  <Button
                                    onClick={() => handleSuggestionAction(suggestion.id, 'reject')}
                                    size="sm"
                                    variant="destructive"
                                  >
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

            {/* Badges Tab */}
            {activeTab === "badges" && (
              <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                <Card className="dashboard-card">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <Crown className="w-6 h-6 text-yellow-500" />
                      <CardTitle className="text-xl text-white">Manage Badges</CardTitle>
                      <CardDescription className="text-gray-400">
                        Create and manage user badges
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateBadge} className="mb-6 space-y-4">
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

                    <div className="space-y-4">
                      {badges.map((badge) => (
                        <div key={badge.id} className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/10">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">{badge.icon || '★'}</span>
                            <div>
                              <p className="font-medium text-white">{badge.name}</p>
                              {badge.description && (
                                <p className="text-sm text-gray-400">{badge.description}</p>
                              )}
                            </div>
                          </div>
                          <Button
                            onClick={() => {
                              setBadges(prev => prev.filter(b => b.id !== badge.id))
                            }}
                            variant="destructive"
                            size="sm"
                          >
                            Delete
                          </Button>
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
                    <div className="flex items-center gap-3">
                      <Code className="w-6 h-6 text-green-500" />
                      <CardTitle className="text-xl text-white">Manage Codes</CardTitle>
                      <CardDescription className="text-gray-400">
                        Generate and manage redemption codes
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateCode} className="mb-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="codeText" className="text-white">Code</Label>
                          <Input
                            id="codeText"
                            type="text"
                            placeholder="e.g., PREMIUM2024"
                            value={newCode.code}
                            onChange={(e) => setNewCode(prev => ({ ...prev, code: e.target.value }))}
                            className="mt-1 bg-black/20 border-white/10 text-white"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="codeType" className="text-white">Type</Label>
                          <select
                            id="codeType"
                            value={newCode.type}
                            onChange={(e) => setNewCode(prev => ({ ...prev, type: e.target.value as any }))}
                            className="mt-1 w-full px-3 py-2 bg-black/20 border border-white/10 rounded text-white"
                          >
                            <option value="premium">Premium</option>
                            <option value="badge">Badge</option>
                            <option value="feature">Feature</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="codeDescription" className="text-white">Description</Label>
                        <Textarea
                          id="codeDescription"
                          placeholder="What this code unlocks"
                          value={newCode.description}
                          onChange={(e) => setNewCode(prev => ({ ...prev, description: e.target.value }))}
                          className="mt-1 bg-black/20 border-white/10 text-white"
                        />
                      </div>
                      <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                        Generate Code
                      </Button>
                    </form>

                    <div className="space-y-4">
                      {codes.map((code) => (
                        <div key={code.id} className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/10">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4">
                              <span className="font-mono font-medium text-white">{code.code}</span>
                              <span className={`px-2 py-1 rounded-full text-xs border ${
                                code.type === 'premium' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                                code.type === 'badge' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                                'bg-blue-500/20 text-blue-300 border-blue-500/30'
                              }`}>
                                {code.type}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs border ${
                                code.is_used ? 'bg-red-500/20 text-red-300 border-red-500/30' : 'bg-green-500/20 text-green-300 border-green-500/30'
                              }`}>
                                {code.is_used ? 'Used' : 'Available'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-400 mt-1">{code.description}</p>
                            {code.used_by && (
                              <p className="text-xs text-gray-500 mt-1">Used by: {code.used_by}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">Created: {code.created_at}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              onClick={() => {
                                setCodes(prev => prev.filter(c => c.id !== code.id))
                              }}
                              variant="destructive"
                              size="sm"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
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
                      <FileText className="w-6 h-6 text-blue-500" />
                      <CardTitle className="text-xl text-white">Staff Activity Logs</CardTitle>
                      <CardDescription className="text-gray-400">
                        Track staff actions and system events
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { action: 'Badge Created', user: 'admin', target: 'Premium Badge', time: '2 minutes ago' },
                        { action: 'Report Resolved', user: 'moderator', target: 'User Report #123', time: '15 minutes ago' },
                        { action: 'Code Generated', user: 'admin', target: 'PREMIUM2024', time: '1 hour ago' },
                        { action: 'User Banned', user: 'moderator', target: 'spammer123', time: '2 hours ago' }
                      ].map((log, index) => (
                        <div key={index} className="p-4 bg-black/20 rounded-lg border border-white/10">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-4">
                                <span className="font-medium text-white">{log.action}</span>
                                <span className="text-sm text-gray-400">by {log.user}</span>
                              </div>
                              <p className="text-sm text-gray-300 mt-1">Target: {log.target}</p>
                              <p className="text-xs text-gray-500 mt-1">{log.time}</p>
                            </div>
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
                        { label: 'Active Users', value: analytics.activeUsers, icon: <Activity className="w-6 h-6" />, color: 'bg-green-500/20 text-green-300 border-green-500/30' },
                        { label: 'New Today', value: analytics.newUsersToday, icon: <User className="w-6 h-6" />, color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
                        { label: 'Premium Users', value: analytics.premiumUsers, icon: <Crown className="w-6 h-6" />, color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' }
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

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card className="dashboard-card">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg text-white">Engagement Metrics</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-300">Total Profile Views</span>
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
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg text-white">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <Button onClick={() => exportUserData()} className="w-full bg-blue-600 hover:bg-blue-700">
                              Export User Data (CSV)
                            </Button>
                            <Button onClick={() => generateBulkCodes(10, 'premium')} className="w-full bg-green-600 hover:bg-green-700">
                              Generate 10 Premium Codes
                            </Button>
                            <Button onClick={() => generateBulkCodes(20, 'badge')} className="w-full bg-purple-600 hover:bg-purple-700">
                              Generate 20 Badge Codes
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
                        <div key={item.id} className="p-4 bg-black/20 rounded-lg border border-white/10 hover:bg-black/30 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-4 mb-2">
                                <span className="font-medium text-white">{item.user}</span>
                                <span className={`px-2 py-1 rounded-full text-xs border ${
                                  item.priority === 'high' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                                  item.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                                  'bg-green-500/20 text-green-300 border-green-500/30'
                                }`}>
                                  {item.priority} priority
                                </span>
                                <span className="px-2 py-1 rounded-full text-xs border bg-blue-500/20 text-blue-300 border-blue-500/30">
                                  {item.type}
                                </span>
                              </div>
                              <p className="text-sm text-gray-300">{item.content}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                onClick={() => handleModerationAction(item.id, 'approve')}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleModerationAction(item.id, 'reject')}
                                size="sm"
                                variant="destructive"
                              >
                                Reject
                              </Button>
                              <Button
                                onClick={() => handleModerationAction(item.id, 'flag')}
                                size="sm"
                                variant="outline"
                              >
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Service Status</h3>
                        <div className="space-y-3">
                          {[
                            { service: 'Database', status: systemHealth.database, color: systemHealth.database === 'healthy' ? 'text-green-400' : 'text-red-400' },
                            { service: 'API', status: systemHealth.api, color: systemHealth.api === 'healthy' ? 'text-green-400' : 'text-red-400' },
                            { service: 'Storage', status: systemHealth.storage, color: systemHealth.storage === 'healthy' ? 'text-green-400' : 'text-red-400' }
                          ].map((service, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                              <span className="text-gray-300">{service.service}</span>
                              <span className={`font-semibold ${service.color}`}>{service.status}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">System Metrics</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                            <span className="text-gray-300">Uptime</span>
                            <span className="text-white font-semibold">{systemHealth.uptime}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                            <span className="text-gray-300">Last Backup</span>
                            <span className="text-white font-semibold">{systemHealth.lastBackup}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                            <span className="text-gray-300">Active Connections</span>
                            <span className="text-white font-semibold">{systemHealth.activeConnections}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
                      <div className="flex items-center gap-3">
                        <Activity className="w-5 h-5 text-blue-400" />
                        <div>
                          <h4 className="font-medium text-white">System Maintenance</h4>
                          <p className="text-sm text-blue-300">Next scheduled maintenance: Tomorrow at 2:00 AM UTC</p>
                        </div>
                      </div>
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
                      <CardTitle className="text-xl text-white">Staff Settings</CardTitle>
                      <CardDescription className="text-gray-400">
                        Configure staff dashboard preferences
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-white mb-4">Notifications</h3>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-white">Email Notifications</h4>
                                <p className="text-sm text-gray-400">New reports and suggestions</p>
                              </div>
                              <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-white">Discord Webhooks</h4>
                                <p className="text-sm text-gray-400">Send alerts to Discord</p>
                              </div>
                              <Switch />
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-white">Push Notifications</h4>
                                <p className="text-sm text-gray-400">Browser push notifications</p>
                              </div>
                              <Switch defaultChecked />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-white mb-4">Automation</h3>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-white">Auto-approve Suggestions</h4>
                                <p className="text-sm text-gray-400">High-vote suggestions</p>
                              </div>
                              <Switch />
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-white">Auto-ban Spammers</h4>
                                <p className="text-sm text-gray-400">Multiple reports trigger</p>
                              </div>
                              <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-white">Auto-verify Premium</h4>
                                <p className="text-sm text-gray-400">Premium users auto-verified</p>
                              </div>
                              <Switch />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Communication</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-white">Staff Chat</h4>
                              <p className="text-sm text-gray-400">Internal communication</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-white">Public Announcements</h4>
                              <p className="text-sm text-gray-400">Site-wide notifications</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
                        <div className="flex items-center gap-3">
                          <Settings className="w-5 h-5 text-blue-400" />
                          <div>
                            <h4 className="font-medium text-white">Advanced Settings</h4>
                            <p className="text-sm text-blue-300">Configure API limits, rate limiting, and security policies</p>
                          </div>
                          <Button size="sm" variant="outline">Configure</Button>
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
