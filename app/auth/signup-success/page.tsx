import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Mail, CheckCircle, ArrowRight } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="bg-card border-border">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl font-bold">Account Created!</CardTitle>
            <CardDescription>Check your email to get started</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span className="text-sm">Confirmation email sent</span>
              </div>
              <p className="text-sm text-muted-foreground">
                We've sent a confirmation link to your email address. Click the link to activate your account and start
                building your personalized bio page.
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 text-left">
              <h3 className="font-semibold text-sm mb-2">What happens next?</h3>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-3 h-3" />
                  Click the confirmation link in your email
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-3 h-3" />
                  Sign in to your account
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-3 h-3" />
                  Customize your bio page with photos and links
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/auth/login">Go to Login</Link>
              </Button>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
