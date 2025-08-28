export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: January 2025</p>
        </div>
        <div className="bg-black/40 border border-red-500/20 rounded-2xl p-6">
          <div className="prose prose-invert max-w-none">
            <p>
              By accessing and using swims.cc, you accept and agree to be bound by the terms and provision of this
              agreement.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-3">Use License</h3>
            <p>
              Permission is granted to temporarily use swims.cc for personal, non-commercial transitory viewing only.
              This is the grant of a license, not a transfer of title.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-3">User Content</h3>
            <p>
              You retain ownership of content you upload to swims.cc. By uploading content, you grant us a license to
              store, display, and distribute your content as necessary to provide our services.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-3">Prohibited Uses</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Uploading illegal, harmful, or offensive content</li>
              <li>Attempting to gain unauthorized access to our systems</li>
              <li>Using our service to spam or harass others</li>
              <li>Violating any applicable laws or regulations</li>
            </ul>

            <h3 className="text-lg font-semibold mt-6 mb-3">Account Termination</h3>
            <p>We reserve the right to terminate accounts that violate these terms or engage in harmful activities.</p>

            <h3 className="text-lg font-semibold mt-6 mb-3">Contact Information</h3>
            <p>
              If you have questions about these Terms of Service, please contact us at{" "}
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
