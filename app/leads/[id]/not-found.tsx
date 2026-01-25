import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Nav } from "@/components/nav"

export default function LeadNotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Lead not found</h1>
          <p className="text-muted-foreground">The lead you&apos;re looking for doesn&apos;t exist.</p>
          <Button asChild>
            <Link href="/leads">Back to Leads</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
