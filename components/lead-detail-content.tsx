import { getLead, updateLead, deleteLead } from "@/app/actions/leads"
import { createNote } from "@/app/actions/notes"
import { LeadActions } from "@/components/lead-actions"
import { LeadTimeline } from "@/components/lead-timeline"
import { LeadForm } from "@/components/lead-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatAED, formatDate } from "@/lib/utils"
import { calculateLeadUrgency } from "@/lib/lead-utils"
import { Phone, Mail, MapPin, Calendar, AlertCircle, Building2, DollarSign } from "lucide-react"
import { notFound } from "next/navigation"
import type { LeadStatus, Priority } from "@/lib/types"

interface LeadDetailContentProps {
  leadId: string
}

export async function LeadDetailContent({ leadId }: LeadDetailContentProps) {
  const lead = await getLead(leadId)

  if (!lead) {
    notFound()
  }

  const urgency = calculateLeadUrgency(lead)

  const statusColors: Record<string, string> = {
    New: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    Contacted: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    Qualified: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
    Follow: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
    Closed: "bg-green-500/10 text-green-700 dark:text-green-400",
  }

  const priorityColors: Record<string, string> = {
    Low: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
    Med: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    High: "bg-red-500/10 text-red-700 dark:text-red-400",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {lead.name || lead.phone || lead.email || "Unnamed Lead"}
            </h1>
            {urgency.isOverdue && (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                OVERDUE
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge className={statusColors[lead.status]}>
              {lead.status}
            </Badge>
            <Badge className={priorityColors[lead.priority]}>
              {lead.priority}
            </Badge>
            {lead.leadType && (
              <Badge variant="outline">
                {lead.leadType.replace(/([A-Z])/g, " $1").trim()}
              </Badge>
            )}
          </div>
        </div>
        <LeadActions lead={lead} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lead.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{lead.phone}</span>
              </div>
            )}
            {lead.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{lead.email}</span>
              </div>
            )}
            {lead.preferredLanguage && (
              <div>
                <span className="text-sm text-muted-foreground">Language: </span>
                <span>{lead.preferredLanguage}</span>
              </div>
            )}
            {lead.source && (
              <div>
                <span className="text-sm text-muted-foreground">Source: </span>
                <span>
                  {lead.source.replace(/([A-Z])/g, " $1").trim()}
                  {lead.sourceCustom && ` - ${lead.sourceCustom}`}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Property Requirements */}
        <Card>
          <CardHeader>
            <CardTitle>Property Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lead.areas && lead.areas.length > 0 && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex flex-wrap gap-1">
                  {lead.areas.map((area, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {(lead.budgetMin || lead.budgetMax) && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span>
                  {formatAED(lead.budgetMin)} - {formatAED(lead.budgetMax)}
                </span>
              </div>
            )}
            {(lead.beds || lead.baths) && (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>
                  {lead.beds && `${lead.beds} bed${lead.beds > 1 ? "s" : ""}`}
                  {lead.beds && lead.baths && " • "}
                  {lead.baths && `${lead.baths} bath${lead.baths > 1 ? "s" : ""}`}
                </span>
              </div>
            )}
            {lead.furnishing && (
              <div>
                <span className="text-sm text-muted-foreground">Furnishing: </span>
                <span>{lead.furnishing}</span>
              </div>
            )}
            {lead.moveInDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(lead.moveInDate)}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Follow-up Information */}
      <Card>
        <CardHeader>
          <CardTitle>Follow-up Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {lead.lastContactedAt ? (
            <div>
              <span className="text-sm text-muted-foreground">Last contacted: </span>
              <span>{formatDate(lead.lastContactedAt)}</span>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Never contacted
            </div>
          )}
          {lead.nextFollowUpAt ? (
            <div>
              <span className="text-sm text-muted-foreground">Next follow-up: </span>
              <span>{formatDate(lead.nextFollowUpAt)}</span>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              No follow-up scheduled
            </div>
          )}
          <div>
            <span className="text-sm text-muted-foreground">Location: </span>
            <span className="text-sm">
              {(lead as any).isInDubai ? "In Dubai" : "Not in Dubai"}
            </span>
          </div>
          {!(lead as any).isInDubai && (lead as any).arrivalDate && (
            <div>
              <span className="text-sm text-muted-foreground">Expected arrival: </span>
              <span>{formatDate((lead as any).arrivalDate)}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      {lead.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{lead.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <LeadTimeline leadId={leadId} notes={lead.leadNotes} />

      {/* Edit Form (Collapsible) */}
      <Card>
        <CardHeader>
          <CardTitle>Edit Lead</CardTitle>
          <CardDescription>Update lead information</CardDescription>
        </CardHeader>
        <CardContent>
          <LeadForm lead={lead} />
        </CardContent>
      </Card>
    </div>
  )
}
