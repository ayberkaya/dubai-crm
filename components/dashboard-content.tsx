import { getDashboardData } from "@/app/actions/leads"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Plus } from "lucide-react"
import Link from "next/link"
import { TabbedDashboard } from "@/components/tabbed-dashboard"

export async function DashboardContent() {
  let data
  try {
    data = await getDashboardData()
  } catch (error) {
    // Return error UI instead of throwing to prevent full page crash
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          </div>
        </div>
        <Card className="border-destructive">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle>Error loading dashboard</CardTitle>
            </div>
            <CardDescription>
              {error instanceof Error ? error.message : "Failed to load dashboard data"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Please check your database connection and try refreshing the page.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            {data.totalLeads} total leads
          </p>
        </div>
        <Link href="/leads/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Lead
          </Button>
        </Link>
      </div>

      <TabbedDashboard data={data} />
    </div>
  )
}
