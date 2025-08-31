"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Star, Zap, Crown, Sparkles, ArrowRight, Shield, Clock, Users, Globe, Eye, Palette, Music, Code } from "lucide-react"
import Link from "next/link"

export default function PricingPage() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Everything you need to create an amazing bio page",
      features: [
        "Complete profile customization",

        "Advanced animations & effects",
        "Custom fonts & typography",
        "Gradient backgrounds",
        "Particle effects",
        "Social media integration",
        "Music player integration",
        "Badge system",
        "Public profile page",
        "Community support"
      ],
      popular: true,
      icon: Star,
      color: "from-green-500 to-emerald-600",
      buttonText: "Get Started Free",
      buttonVariant: "default" as const
    },
    {
      name: "Premium",
      price: "$9.99",
      period: "per month",
      description: "Unlock exclusive themes and advanced features",
      features: [
        "Everything in Free",
        "Premium theme collection",
        "Custom domain support",
        "Advanced analytics dashboard",
        "Priority verification",
        "Priority support",
        "Exclusive badges",
        "API access",
        "White-label options",
        "Early access to features"
      ],
      popular: false,
      icon: Crown,
      color: "from-yellow-500 to-orange-500",
      buttonText: "Start Premium",
      buttonVariant: "outline" as const
    },
    {
      name: "Pro",
      price: "$19.99",
      period: "per month",
      description: "Maximum customization and exclusive features",
      features: [
        "Everything in Premium",
        "Multiple custom domains",
        "Advanced analytics & insights",
        "Custom integrations",
        "Dedicated support",
        "White-label solutions",
        "Team collaboration",
        "Advanced security features",
        "Custom branding",
        "Priority feature requests"
      ],
      popular: false,
      icon: Zap,
      color: "from-purple-500 to-pink-500",
      buttonText: "Go Pro",
      buttonVariant: "outline" as const
    }
  ]

  const faqs = [
    {
      question: "What appearance features are free?",
      answer: "All basic appearance features are free including advanced animations, custom fonts, gradient backgrounds, particle effects, and basic theming. Premium themes require a subscription."
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time. You'll continue to have access to premium features until the end of your current billing period."
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 30-day money-back guarantee. If you're not satisfied with your premium features, contact us for a full refund."
    },
    {
      question: "Can I upgrade or downgrade my plan?",
      answer: "Yes, you can change your plan at any time. When upgrading, you'll be charged the prorated difference. When downgrading, changes take effect at the next billing cycle."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and cryptocurrency payments including Bitcoin and Ethereum."
    },
    {
      question: "Is there a free trial for premium features?",
      answer: "Yes! All new users get a 7-day free trial of Premium features when they sign up. No credit card required to start."
    },
    {
      question: "Can I use multiple domains with Pro plan?",
      answer: "Yes, the Pro plan includes support for up to 3 custom domains, perfect for creators with multiple brands or projects."
    }
  ]

  const benefits = [
    {
      icon: Palette,
      title: "Advanced Appearance",
      description: "Access to animations, custom fonts, gradients, and particle effects without any cost."
    },
    {
      icon: Music,
      title: "Music Integration",
      description: "Connect your Spotify and showcase your favorite tracks on your profile."
    },
    {
      icon: Code,
      title: "Developer Friendly",
      description: "Built with modern web technologies and designed for creators and developers."
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-purple-500/20 to-blue-500/20"></div>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
        <div className="relative z-10 px-6 py-16 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Powerful Features, Free Forever
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Get started with our most popular features completely free, including advanced appearance customization and music integration
            </p>
            
            {/* Quick Actions */}
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild className="bg-green-600 hover:bg-green-700 text-white">
                <Link href="/auth/signup">Start Free Now</Link>
              </Button>
              <Button asChild variant="outline" className="border-white text-white hover:bg-white/10">
                <Link href="/explore">View Examples</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="relative z-10 px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
            <p className="text-gray-300 text-lg">Start free with powerful features, upgrade when you need more.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {plans.map((plan, index) => {
              const Icon = plan.icon
              return (
                <Card 
                  key={index} 
                  className={`relative bg-black/20 backdrop-blur-md border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 ${
                    plan.popular ? 'ring-2 ring-green-500/50 scale-105' : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-8">
                    <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${plan.color} rounded-full flex items-center justify-center`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-white text-2xl">{plan.name}</CardTitle>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-white">{plan.price}</span>
                      <span className="text-gray-400 ml-2">/{plan.period}</span>
                    </div>
                    <CardDescription className="text-gray-300 text-base">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      asChild 
                      className={`w-full ${plan.buttonVariant === 'default' ? 'bg-green-600 hover:bg-green-700' : 'border-gray-600 text-white hover:bg-white/10'}`}
                      variant={plan.buttonVariant}
                    >
                      <Link href={plan.name === "Free" ? "/auth/signup" : "/auth/signup"}>
                        {plan.buttonText}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Benefits Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Why Choose swims.cc?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon
                return (
                  <Card key={index} className="bg-black/20 backdrop-blur-md border-gray-700/50 text-center">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                        <Icon className="w-6 h-6 text-green-400" />
                      </div>
                      <h3 className="text-white font-semibold mb-2">{benefit.title}</h3>
                      <p className="text-gray-300 text-sm">{benefit.description}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Feature Comparison */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Feature Comparison</h2>
            <Card className="bg-black/20 backdrop-blur-md border-gray-700/50">
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left text-white font-semibold py-4">Feature</th>
                        <th className="text-center text-green-400 font-semibold py-4">Free</th>
                        <th className="text-center text-yellow-400 font-semibold py-4">Premium</th>
                        <th className="text-center text-purple-400 font-semibold py-4">Pro</th>
                      </tr>
                    </thead>
                    <tbody className="space-y-4">

                      <tr className="border-b border-white/5">
                        <td className="text-white py-4">Advanced Animations</td>
                        <td className="text-center text-green-400">✅</td>
                        <td className="text-center text-green-400">✅</td>
                        <td className="text-center text-green-400">✅</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="text-white py-4">Custom Fonts & Colors</td>
                        <td className="text-center text-green-400">✅</td>
                        <td className="text-center text-green-400">✅</td>
                        <td className="text-center text-green-400">✅</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="text-white py-4">Premium Themes</td>
                        <td className="text-center text-red-400">❌</td>
                        <td className="text-center text-green-400">✅</td>
                        <td className="text-center text-green-400">✅</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="text-white py-4">Custom Domain</td>
                        <td className="text-center text-red-400">❌</td>
                        <td className="text-center text-green-400">✅</td>
                        <td className="text-center text-green-400">✅</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="text-white py-4">Advanced Analytics</td>
                        <td className="text-center text-red-400">❌</td>
                        <td className="text-center text-green-400">✅</td>
                        <td className="text-center text-green-400">✅</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="text-white py-4">Priority Support</td>
                        <td className="text-center text-red-400">❌</td>
                        <td className="text-center text-green-400">✅</td>
                        <td className="text-center text-green-400">✅</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FAQs */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
            <div className="max-w-4xl mx-auto space-y-4">
              {faqs.map((faq, index) => (
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

          {/* CTA Section */}
          <div className="text-center">
            <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-md border-green-500/30 max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle className="text-white text-3xl mb-4">Ready to Get Started?</CardTitle>
                <CardDescription className="text-gray-300 text-lg">
                  Join thousands of creators who trust swims.cc for their bio pages
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap justify-center gap-4">
                  <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 text-white">
                    <Link href="/auth/signup">
                      Start Free Now
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    <Link href="/explore">View Examples</Link>
                  </Button>
                </div>
                <p className="text-sm text-gray-400">
                  No credit card required • Advanced features included • Cancel anytime
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
