import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CopyrightPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Copyright Policy</h1>
          <p className="text-muted-foreground">DMCA and Copyright Information</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Digital Millennium Copyright Act (DMCA)</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none">
            <p>
              swims.cc respects the intellectual property rights of others and expects our users to do the same. We
              respond to notices of alleged copyright infringement that comply with the DMCA.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-3">Filing a DMCA Notice</h3>
            <p>If you believe your copyrighted work has been infringed, please provide the following information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>A physical or electronic signature of the copyright owner</li>
              <li>Identification of the copyrighted work claimed to have been infringed</li>
              <li>Identification of the material that is claimed to be infringing</li>
              <li>Your contact information</li>
              <li>A statement of good faith belief that the use is not authorized</li>
              <li>A statement that the information is accurate and you are authorized to act</li>
            </ul>

            <h3 className="text-lg font-semibold mt-6 mb-3">Counter-Notification</h3>
            <p>
              If you believe your content was removed in error, you may file a counter-notification with the same
              information requirements.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-3">Repeat Infringers</h3>
            <p>We will terminate the accounts of users who are repeat infringers of copyright.</p>

            <h3 className="text-lg font-semibold mt-6 mb-3">Contact for Copyright Issues</h3>
            <p>
              Send DMCA notices to:{" "}
              <a href="mailto:copyright@swims.cc" className="text-primary hover:underline">
                copyright@swims.cc
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
