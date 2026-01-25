import { Nav } from "@/components/nav"
import { LeadDetailContent } from "@/components/lead-detail-content"
import { Toaster } from "@/components/ui/toaster"
import { notFound } from "next/navigation"

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string }
}) {
  const resolvedParams = await params
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="container mx-auto px-4 py-8">
        <LeadDetailContent leadId={resolvedParams.id} />
      </main>
      <Toaster />
    </div>
  )
}
