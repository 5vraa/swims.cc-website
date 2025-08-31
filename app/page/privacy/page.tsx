export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: January 2025</p>
        </div>

        <div className="bg-black/40 border border-red-500/20 rounded-2xl p-6">
          <div className="prose prose-invert max-w-none">
            <p>We collect information you provide directly to us, such as when you create an account or contact us.</p>

            <h3 className="text-lg font-semibold mt-6 mb-3">Personal Information</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Email address and username</li>
              <li>Profile information you choose to provide</li>
              <li>Content you upload to our service</li>
            </ul>

            <h3 className="text-lg font-semibold mt-6 mb-3">Usage Information</h3>
            <p>
              We automatically collect certain information about your use of our service, including page views, clicks,
              and other analytics data.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-3">How We Use Your Information</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide and maintain our service</li>
              <li>To communicate with you about your account</li>
              <li>To improve our service and develop new features</li>
              <li>To comply with legal obligations</li>
            </ul>

            <h3 className="text-lg font-semibold mt-6 mb-3">Information Sharing</h3>
            <p>
              We do not sell, trade, or otherwise transfer your personal information to third parties without your
              consent, except as described in this policy.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-3">Data Security</h3>
            <p>
              We implement appropriate security measures to protect your personal information against unauthorized
              access, alteration, disclosure, or destruction.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-3">Contact Us</h3>
            <p>
              If you have questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:support@swims.cc" className="text-primary hover:underline">
                support@swims.cc
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
