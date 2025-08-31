"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useEffect, useRef, useState } from "react"
import Link from "next/link"
// Card already imported above
import { createClient } from "@/lib/supabase/client"

export default function HomePage() {
  const supabase = createClient()
  const [publicProfiles, setPublicProfiles] = useState<any[]>([])
  const scrollerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, user_id, username, display_name, avatar_url")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(40)
      const reserved = new Set(["dashboard","admin","auth","profile","privacy","terms","changelog","status","copyright","redeem"])
      setPublicProfiles((data || []).filter((p: any) => p.username && !reserved.has(String(p.username).toLowerCase())))
    }
    load()
  }, [])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el || publicProfiles.length === 0) return
    let frame: number
    const step = () => {
      if (el.scrollWidth > el.clientWidth) {
        el.scrollLeft = (el.scrollLeft + 0.7) % (el.scrollWidth - el.clientWidth)
      }
      frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [publicProfiles.length])
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission for local server
    setTimeout(() => {
      console.log("[v0] Form submitted:", formData)
      setSubmitMessage("Thank you for your message! We'll get back to you soon.")
      setFormData({ name: "", email: "", message: "" })
      setIsSubmitting(false)

      // Clear success message after 5 seconds
      setTimeout(() => setSubmitMessage(""), 5000)
    }, 1000)
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="min-h-screen text-foreground">
      {/* Global header provided by app/layout.tsx */}

      {/* Carousel will be inserted after hero below */}

      <section
        id="hero"
        className="relative min-h-screen flex items-center"
      >
        {/* Soft bottom gradient for hero section only */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0f0b0c] to-transparent pointer-events-none" />
        
        <div className="container mx-auto text-center max-w-4xl relative z-10 pt-20 bg-transparent">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance glow-text text-white">
            Create Your Perfect <span className="text-primary">Bio Page</span>
          </h1>
          <p className="text-xl text-gray-200 font-light mb-8 max-w-2xl mx-auto text-pretty">
            Build stunning, customizable bio pages with secure file hosting. Everything you need for your digital
            presence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30 border border-primary/20"
              onClick={() => (window.location.href = "/auth/signup")}
            >
              Create Your Bio
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 bg-transparent backdrop-blur-sm"
              onClick={() => scrollToSection("features")}
            >
              View Examples
            </Button>
          </div>
        </div>
      </section>

      {/* Live Profiles Section - Always visible */}
      <section className="px-4 py-16 bg-background">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-6 text-center">
            Live Profiles ({publicProfiles.length})
          </h3>
          
          {/* Debug info */}
          <div className="text-center mb-4 text-xs text-gray-500">
            Debug: {publicProfiles.length} profiles loaded
          </div>
      
          {publicProfiles.length > 0 ? (
            <div className="relative infinite-scroll-container">
              {/* Gradient overlays */}
              <div className="scroll-gradient-overlay"></div>
        
              <div className="infinite-scroll-content">
                {/* First set */}
                {publicProfiles.map((p, idx) => (
                  <Link 
                    key={`first-${p.id}-${idx}`} 
                    href={`/${p.username}`} 
                    prefetch={false} 
                    className="group block mx-2"
                  >
                    <Card className="w-64 bg-black/40 border-red-500/20 backdrop-blur-xl px-5 py-4 hover:border-red-500/40 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20">
                      <div className="flex items-center gap-4">
                        <img
                          src={p.avatar_url || "/placeholder-user.jpg"}
                          alt={p.display_name || p.username}
                          className="w-12 h-12 rounded-xl object-cover border-2 border-white/20 group-hover:border-red-500/40 transition-colors"
                        />
                        <div className="truncate flex-1">
                          <p className="text-white font-semibold truncate text-sm">
                            {p.display_name || p.username}
                          </p>
                          <p className="text-xs text-gray-400 truncate mt-1">
                            /{p.username}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
          
                {/* Duplicate set for seamless looping */}
                {publicProfiles.map((p, idx) => (
                  <Link 
                    key={`second-${p.id}-${idx}`} 
                    href={`/${p.username}`} 
                    prefetch={false} 
                    className="group block mx-2"
                  >
                    <Card className="w-64 bg-black/40 border-red-500/20 backdrop-blur-xl px-5 py-4 hover:border-red-500/40 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20">
                      <div className="flex items-center gap-4">
                        <img
                          src={p.avatar_url || "/placeholder-user.jpg"}
                          alt={p.display_name || p.username}
                          className="w-12 h-12 rounded-xl object-cover border-2 border-white/20 group-hover:border-red-500/40 transition-colors"
                        />
                        <div className="truncate flex-1">
                          <p className="text-white font-semibold truncate text-sm">
                            {p.display_name || p.username}
                          </p>
                          <p className="text-xs text-gray-400 truncate mt-1">
                            /{p.username}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400">
              <p>Loading profiles...</p>
            </div>
          )}
      
          {/* View all button */}
          <div className="text-center mt-8">
            <Button
              variant="outline"
              className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 bg-transparent backdrop-blur-sm"
              onClick={() => (window.location.href = "/explore")}
            >
              View All Profiles
            </Button>
          </div>
        </div>
      </section>

      <section id="features" className="py-24 px-4 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 glow-text">Platform Features</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to create stunning bio pages and manage your digital presence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="card-glass">
              <CardHeader>
                <div className="text-2xl mb-2">
                  <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <CardTitle className="text-primary">Custom Themes</CardTitle>
                <CardDescription className="text-card-foreground">
                  Choose from dozens of modern, responsive themes or create your own unique design
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-glass">
              <CardHeader>
                <div className="text-2xl mb-2">
                  <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                  </svg>
                </div>
                <CardTitle className="text-primary">File Hosting</CardTitle>
                <CardDescription className="text-card-foreground">
                  Fast, secure file hosting with unlimited bandwidth for all your digital assets
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-glass">
              <CardHeader>
                <div className="text-2xl mb-2">
                  <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                  </svg>
                </div>
                <CardTitle className="text-primary">Lightning Fast</CardTitle>
                <CardDescription className="text-card-foreground">
                  Optimized performance ensures your page loads instantly for every visitor
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-glass">
              <CardHeader>
                <div className="text-2xl mb-2">
                  <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                  </svg>
                </div>
                <CardTitle className="text-primary">Link Management</CardTitle>
                <CardDescription className="text-card-foreground">
                  Organize all your social links, projects, and content in one beautiful page
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-glass">
              <CardHeader>
                <div className="text-2xl mb-2">
                  <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22,21H2V3H4V19H6V10H10V19H12V6H16V19H18V14H22V21Z" />
                  </svg>
                </div>
                <CardTitle className="text-primary">Analytics</CardTitle>
                <CardDescription className="text-card-foreground">
                  Track your page views, clicks, and engagement with detailed analytics
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-glass">
              <CardHeader>
                <div className="text-2xl mb-2">
                  <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17,19H7V5H17M17,1H7C5.89,1 5,1.89 5,3V21C5,22.1 5.9,23 7,23H17C18.1,23 19,22.1 19,21V3C19,1.89 18.1,1 17,1Z" />
                  </svg>
                </div>
                <CardTitle className="text-primary">Mobile Optimized</CardTitle>
                <CardDescription className="text-card-foreground">
                  Your bio page looks perfect on every device with responsive design
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section id="faq" className="py-24 px-4 bg-muted/20">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground text-lg">Everything you need to know about creating your bio page</p>
          </div>

          <div className="space-y-4">
            <details className="group border border-border rounded-lg">
              <summary className="flex justify-between items-center p-6 cursor-pointer hover:bg-muted/10 transition-colors">
                <span className="font-medium text-foreground">Is it free to create a bio page?</span>
                <span className="text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-6 pb-6 text-muted-foreground">
                Yes! You can create and customize your bio page completely free. Premium features like custom domains
                and advanced analytics are available with our paid plans.
              </div>
            </details>

            <details className="group border border-border rounded-lg">
              <summary className="flex justify-between items-center p-6 cursor-pointer hover:bg-muted/10 transition-colors">
                <span className="font-medium text-foreground">Can I use my own domain?</span>
                <span className="text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-6 pb-6 text-muted-foreground">
                Connect your custom domain to give your bio page a professional look that matches your brand.
              </div>
            </details>

            <details className="group border border-border rounded-lg">
              <summary className="flex justify-between items-center p-6 cursor-pointer hover:bg-muted/10 transition-colors">
                <span className="font-medium text-foreground">How much storage do I get for files?</span>
                <span className="text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-6 pb-6 text-muted-foreground">
                Free accounts get 1GB of storage, while premium plans offer up to 100GB with unlimited bandwidth for all
                your files and media.
              </div>
            </details>

            <details className="group border border-border rounded-lg">
              <summary className="flex justify-between items-center p-6 cursor-pointer hover:bg-muted/10 transition-colors">
                <span className="font-medium text-foreground">Can I customize the design?</span>
                <span className="text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-6 pb-6 text-muted-foreground">
                Yes! Choose from our collection of themes, customize colors and fonts, or create your own design with
                our advanced editor.
              </div>
            </details>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-24 px-4 bg-muted/10">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 glow-text">Simple Pricing</h2>
            <p className="text-muted-foreground text-lg">Choose the plan that works for you</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="card-glass">
              <CardHeader className="p-8">
                <CardTitle className="text-2xl text-primary mb-2">Free</CardTitle>
                <div className="text-3xl font-bold mb-4">
                  $0<span className="text-lg text-muted-foreground">/month</span>
                </div>
                <CardDescription className="text-card-foreground mb-6">
                  Perfect for getting started with your bio page
                </CardDescription>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span> Custom bio page
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span> 1GB file storage
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span> Basic themes
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span> Mobile optimized
                  </li>
                </ul>
                <Button className="w-full mt-6 bg-primary hover:bg-primary/90">Get Started</Button>
              </CardHeader>
            </Card>

            <Card className="card-glass border-primary/50">
              <CardHeader className="p-8">
                <CardTitle className="text-2xl text-primary mb-2">Pro</CardTitle>
                <div className="text-3xl font-bold mb-4">
                  $9<span className="text-lg text-muted-foreground">/month</span>
                </div>
                <CardDescription className="text-card-foreground mb-6">
                  Everything you need for a professional presence
                </CardDescription>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span> Everything in Free
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span> Custom domain
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span> 100GB storage
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span> Advanced analytics
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span> Premium themes
                  </li>
                </ul>
                <Button className="w-full mt-6 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700">
                  Upgrade to Pro
                </Button>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section id="contact" className="py-24 px-4 bg-muted/10">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 glow-text">Get In Touch</h2>
            <p className="text-muted-foreground text-lg">Have questions? We'd love to hear from you.</p>
          </div>

          <Card className="card-glass">
            <CardHeader className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="bg-background/50 border-border/50 backdrop-blur-sm"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="bg-background/50 border-border/50 backdrop-blur-sm"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    className="bg-background/50 border-border/50 backdrop-blur-sm min-h-[120px]"
                    placeholder="Tell us about your project..."
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>

                {submitMessage && <div className="text-center text-primary font-medium">{submitMessage}</div>}
              </form>
            </CardHeader>
          </Card>
        </div>
      </section>
    </div>
  )
}
