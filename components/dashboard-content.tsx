import { getDashboardData } from "@/app/actions/leads"
import { LeadCard } from "@/components/lead-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export async function DashboardContent() {
  const data = await getDashboardData()

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

      <div className="grid gap-6">
        {/* Overdue Section */}
        <Card className="border-destructive">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <CardTitle>Overdue</CardTitle>
              </div>
              <Badge variant="destructive">{data.overdue.length}</Badge>
            </div>
            <CardDescription>
              Leads that need immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.overdue.length === 0 ? (
              <p className="text-sm text-muted-foreground">No overdue leads</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {data.overdue.map((lead) => (
                  <LeadCard key={lead.id} lead={lead} showUrgency />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Due Today Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Due Today</CardTitle>
              <Badge variant="secondary">{data.dueToday.length}</Badge>
            </div>
            <CardDescription>
              Follow-ups scheduled for today
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.dueToday.length === 0 ? (
              <p className="text-sm text-muted-foreground">No leads due today</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {data.dueToday.map((lead) => (
                  <LeadCard key={lead.id} lead={lead} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Due Next 7 Days Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Due Next 7 Days</CardTitle>
              <Badge variant="secondary">{data.dueNext7Days.length}</Badge>
            </div>
            <CardDescription>
              Upcoming follow-ups
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.dueNext7Days.length === 0 ? (
              <p className="text-sm text-muted-foreground">No leads due in the next 7 days</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {data.dueNext7Days.map((lead) => (
                  <LeadCard key={lead.id} lead={lead} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
