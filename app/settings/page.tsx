import { Nav } from "@/components/nav"
import { SettingsContent } from "@/components/settings-content"
import { Toaster } from "@/components/ui/toaster"

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="container mx-auto px-4 py-8">
        <SettingsContent />
      </main>
      <Toaster />
    </div>
  )
}
