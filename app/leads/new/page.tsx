import { Nav } from "@/components/nav"
import { LeadForm } from "@/components/lead-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Toaster } from "@/components/ui/toaster"

export default function NewLeadPage() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>New Lead</CardTitle>
            <CardDescription>Add a new lead to your CRM</CardDescription>
          </CardHeader>
          <CardContent>
            <LeadForm />
          </CardContent>
        </Card>
      </main>
      <Toaster />
    </div>
  )
}
