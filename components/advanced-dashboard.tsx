"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, Heart, Share2, TrendingUp, Users, Sparkles, BarChart3 } from "lucide-react"

interface AdvancedDashboardProps {
  profile: any
  analytics: any
}

export function AdvancedDashboard({ profile, analytics }: AdvancedDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("7d")
  const [animatedStats, setAnimatedStats] = useState({
    views: 0,
    shares: 0,
    engagement: 0,
  })

  useEffect(() => {
    // Animate stats on load
    const timer = setTimeout(() => {
      setAnimatedStats({
        views: analytics?.total_views || 0,
        shares: analytics?.total_shares || 0,
        engagement: analytics?.engagement_rate || 0,
      })
    }, 500)

    return () => clearTimeout(timer)
  }, [analytics])

  const statCards = [
    {
      title: "Profile Views",
      value: animatedStats.views,
      icon: Eye,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      change: "+12%",
    },
    {
      title: "Shares",
      value: animatedStats.shares,
      icon: Share2,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      change: "+15%",
    },
    {
      title: "Engagement",
      value: `${animatedStats.engagement}%`,
      icon: TrendingUp,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      change: "+5%",
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Welcome Header */}
      <motion.div variants={itemVariants} className="text-center py-8">
        <motion.h1
          className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          Welcome back, {profile?.display_name || profile?.username}!
        </motion.h1>
        <p className="text-gray-400">Here's how your profile is performing</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div key={stat.title} variants={itemVariants}>
            <Card className="bg-black/40 backdrop-blur-xl border-red-500/20 hover:border-red-500/40 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
                    <motion.p
                      className="text-2xl font-bold text-white mt-1"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.5, type: "spring" }}
                    >
                      {typeof stat.value === "number" ? (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                        >
                          {stat.value.toLocaleString()}
                        </motion.span>
                      ) : (
                        stat.value
                      )}
                    </motion.p>
                    <Badge variant="secondary" className="mt-2 text-xs bg-green-500/20 text-green-400">
                      {stat.change}
                    </Badge>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Advanced Analytics */}
      <motion.div variants={itemVariants}>
        <Card className="bg-black/40 backdrop-blur-xl border-red-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-red-400" />
              Advanced Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <TabsList className="grid w-full grid-cols-4 bg-black/20">
                <TabsTrigger value="24h">24h</TabsTrigger>
                <TabsTrigger value="7d">7 days</TabsTrigger>
                <TabsTrigger value="30d">30 days</TabsTrigger>
                <TabsTrigger value="90d">90 days</TabsTrigger>
              </TabsList>

              <TabsContent value={selectedPeriod} className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold">Top Performing Links</h3>
                    {[1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-lg bg-red-500/10"
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <span className="text-gray-300">Social Link {i}</span>
                        <Badge variant="outline" className="border-red-500/50 text-red-400">
                          {Math.floor(Math.random() * 100)} clicks
                        </Badge>
                      </motion.div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-white font-semibold">Recent Activity</h3>
                    {[1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                        <span className="text-gray-300 text-sm">Profile viewed {i} hours ago</span>
                      </motion.div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-white font-semibold">Achievements</h3>
                    {[
                      { title: "First 100 Views", icon: Eye },
                      { title: "Social Butterfly", icon: Users },
                      { title: "Rising Star", icon: Sparkles },
                    ].map((achievement, i) => (
                      <motion.div
                        key={achievement.title}
                        className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/10"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <achievement.icon className="w-5 h-5 text-yellow-400" />
                        <span className="text-gray-300 text-sm">{achievement.title}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
