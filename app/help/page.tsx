"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HelpCircle, MessageCircle, BookOpen, Video, Mail, Phone, MessageSquare, Search, ChevronDown } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  const helpSections = [
    {
      id: "getting-started",
      title: "Getting Started",
      description: "Learn the basics of creating and customizing your bio page",
      icon: BookOpen,
      items: [
        "How to create your first bio page",
        "Setting up your profile information",
        "Customizing your appearance",
        "Adding social media links",
        "Uploading profile pictures and banners"
      ]
    },
    {
      id: "features",
      title: "Features & Customization",
      description: "Explore all the features available on swims.cc",
      icon: HelpCircle,
      items: [
        "Premium features and benefits",
        "Advanced styling options",
        "Badge system explained",
        "Music integration",
        "Reveal page functionality"
      ]
    },
    {
      id: "account",
      title: "Account & Security",
      description: "Manage your account and keep it secure",
      icon: MessageCircle,
      items: [
        "Account settings and preferences",
        "Password and security",
        "Discord integration",
        "Verification process",
        "Privacy settings"
      ]
    },
    {
      id: "discord",
      title: "Discord Integration",
      description: "Connect your Discord account and unlock staff features",
      icon: MessageSquare,
      items: [
        "How to connect Discord",
        "Staff role requirements",
        "Automatic role assignment",
        "Discord bot features",
        "Troubleshooting connection issues"
      ]
    },
    {
      id: "premium",
      title: "Premium Features",
      description: "Unlock advanced customization and exclusive features",
      icon: HelpCircle,
      items: [
        "Advanced styling options",
        "Custom card effects and glow",
        "Typography customization",
        "Background effects and animations",
        "Reveal page functionality"
      ]
    }
  ]

  const faqs = [
    {
      question: "How do I create my bio page?",
      answer: "Simply sign up for an account, log in, and go to your profile dashboard. From there, you can customize your profile, add links, and make it public."
    },
    {
      question: "What are premium features?",
      answer: "Premium features include advanced styling options, reveal pages, custom animations, and priority support. Upgrade to unlock the full potential of your bio page."
    },
    {
      question: "How do I connect my Discord?",
      answer: "In your profile dashboard, go to the Discord section and click 'Connect Discord'. This will authenticate you through Discord and sync your account."
    },
    {
      question: "Can I change my username?",
      answer: "Yes, you can change your username in your profile settings. Keep in mind that usernames must be unique across the platform."
    },
    {
      question: "How do I make my profile public?",
      answer: "In your profile settings, toggle the 'Make profile public' switch. This will make your bio page accessible to anyone with the link."
    },
    {
      question: "What if I forget my password?",
      answer: "Use the 'Forgot Password' option on the login page. You'll receive a reset link via email to create a new password."
    },
    {
      question: "How do I get staff access?",
      answer: "Staff access is automatically granted to users with the appropriate Discord role. Connect your Discord account and ensure you have the required role in our server."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and cryptocurrency payments including Bitcoin and Ethereum."
    }
  ]

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const filteredSections = helpSections.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.items.some(item => item.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-purple-500/20 to-blue-500/20"></div>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
        <div className="relative z-10 px-6 py-16 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Help Center
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Get help with creating, customizing, and managing your bio page on swims.cc
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search help articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-black/20 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild className="bg-red-500 hover:bg-red-600 text-white">
                <Link href="/auth/signup">Get Started</Link>
              </Button>
              <Button asChild variant="outline" className="border-white text-white hover:bg-white/10">
                <Link href="/explore">View Examples</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative z-10 px-6 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Help Sections */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Help Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSections.map((section) => {
                const Icon = section.icon
                const isExpanded = expandedSections.has(section.id)
                
                return (
                  <Card key={section.id} className="bg-black/20 backdrop-blur-md border-gray-700/50 hover:border-gray-600/50 transition-all duration-200">
                    <CardHeader className="cursor-pointer" onClick={() => toggleSection(section.id)}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className="w-6 h-6 text-red-400" />
                          <CardTitle className="text-white">{section.title}</CardTitle>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                      <CardDescription className="text-gray-300">
                        {section.description}
                      </CardDescription>
                    </CardHeader>
                    
                    {isExpanded && (
                      <CardContent className="pt-0">
                        <ul className="space-y-2">
                          {section.items.map((item, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                              <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    )}
                  </Card>
                )
              })}
            </div>
          </div>

          {/* FAQs */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
            <div className="max-w-4xl mx-auto space-y-4">
              {filteredFaqs.map((faq, index) => (
                <Card key={index} className="bg-black/20 backdrop-blur-md border-gray-700/50">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Contact Section */}
          <div className="text-center">
            <Card className="bg-black/20 backdrop-blur-md border-gray-700/50 max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-white text-2xl">Still Need Help?</CardTitle>
                <CardDescription className="text-gray-300">
                  Can't find what you're looking for? Get in touch with our support team.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap justify-center gap-4">
                  <Button asChild variant="outline" className="border-gray-600 text-white hover:bg-white/10">
                    <Link href="/discord">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Join Discord
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="border-gray-600 text-white hover:bg-white/10">
                    <Link href="mailto:support@swims.cc">
                      <Mail className="w-4 h-4 mr-2" />
                      Email Support
                    </Link>
                  </Button>
                </div>
                <p className="text-sm text-gray-400">
                  We typically respond within 24 hours during business days.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
