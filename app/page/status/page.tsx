import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, XCircle, Clock } from "lucide-react"

export default function StatusPage() {
  const services = [
    { name: "Website", status: "operational", uptime: "99.9%" },
    { name: "API", status: "operational", uptime: "99.8%" },
    { name: "File Storage", status: "operational", uptime: "99.9%" },
    { name: "Database", status: "operational", uptime: "100%" },
    { name: "Authentication", status: "operational", uptime: "99.7%" },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "degraded":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case "outage":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "operational":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Operational</Badge>
      case "degraded":
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Degraded</Badge>
      case "outage":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Outage</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">System Status</h1>
          <p className="text-muted-foreground">Current status of all swims.cc services</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              All Systems Operational
            </CardTitle>
            <CardDescription>All services are running normally</CardDescription>
          </CardHeader>
        </Card>

        <div className="grid gap-4">
          {services.map((service) => (
            <Card key={service.name}>
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-3">
                  {getStatusIcon(service.status)}
                  <div>
                    <h3 className="font-medium">{service.name}</h3>
                    <p className="text-sm text-muted-foreground">Uptime: {service.uptime}</p>
                  </div>
                </div>
                {getStatusBadge(service.status)}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  )
}
