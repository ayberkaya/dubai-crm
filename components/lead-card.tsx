import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatAED, formatDateShort } from "@/lib/utils"
import { calculateLeadUrgency, type LeadWithRelations } from "@/lib/lead-utils"
import { Phone, Mail, MapPin, Calendar, AlertCircle } from "lucide-react"
import type { Lead } from "@prisma/client"
import type { LeadStatus, Priority } from "@/lib/types"

interface LeadCardProps {
  lead: LeadWithRelations
  showUrgency?: boolean
}

export function LeadCard({ lead, showUrgency = false }: LeadCardProps) {
  const urgency = showUrgency ? calculateLeadUrgency(lead) : null

  const statusColors: Record<string, string> = {
    New: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    Contacted: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    Qualified: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
    Viewing: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
    Negotiation: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
    Won: "bg-green-500/10 text-green-700 dark:text-green-400",
    Lost: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
  }

  const priorityColors: Record<string, string> = {
    Low: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
    Med: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    High: "bg-red-500/10 text-red-700 dark:text-red-400",
  }

  return (
    <Link href={`/leads/${lead.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">
                {lead.name || lead.phone || lead.email || "Unnamed Lead"}
              </h3>
              {lead.leadType && (
                <p className="text-sm text-muted-foreground mt-1">
                  {lead.leadType.replace(/([A-Z])/g, " $1").trim()}
                </p>
              )}
            </div>
            {urgency?.isOverdue && (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                OVERDUE
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <Badge className={statusColors[lead.status]}>
              {lead.status}
            </Badge>
            <Badge className={priorityColors[lead.priority]}>
              {lead.priority}
            </Badge>
          </div>

          <div className="space-y-1 text-sm">
            {lead.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-3 w-3" />
                {lead.phone}
              </div>
            )}
            {lead.email && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-3 w-3" />
                {lead.email}
              </div>
            )}
            {(() => {
              const areasArray = Array.isArray(lead.areas) ? lead.areas : (lead.areas ? JSON.parse(lead.areas) : [])
              return areasArray.length > 0 && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {areasArray.slice(0, 2).join(", ")}
                  {areasArray.length > 2 && ` +${areasArray.length - 2}`}
                </div>
              )
            })()}
            {lead.budgetMin || lead.budgetMax ? (
              <div className="text-muted-foreground">
                {formatAED(lead.budgetMin)} - {formatAED(lead.budgetMax)}
              </div>
            ) : null}
            {lead.nextFollowUpAt && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {formatDateShort(lead.nextFollowUpAt)}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
