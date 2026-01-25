import { Nav } from "@/components/nav"
import { DashboardContent } from "@/components/dashboard-content"
import { Toaster } from "@/components/ui/toaster"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="container mx-auto px-4 py-8">
        <DashboardContent />
      </main>
      <Toaster />
    </div>
  )
}
