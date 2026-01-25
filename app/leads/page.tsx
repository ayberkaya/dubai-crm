import { Nav } from "@/components/nav"
import { LeadsContent } from "@/components/leads-content"
import { Toaster } from "@/components/ui/toaster"

export default function LeadsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="container mx-auto px-4 py-8">
        <LeadsContent />
      </main>
      <Toaster />
    </div>
  )
}
