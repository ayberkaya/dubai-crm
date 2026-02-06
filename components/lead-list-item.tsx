"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatAED, formatDateShort, generateWhatsAppLink } from "@/lib/utils"
import { calculateLeadUrgency, type LeadWithRelations } from "@/lib/lead-utils"
import { Phone, Mail, MapPin, Calendar, AlertCircle, MessageCircle } from "lucide-react"
import type { LeadStatus, Priority } from "@/lib/types"
import { ContactedDialog } from "@/components/contacted-dialog"

interface LeadListItemProps {
  lead: LeadWithRelations
  showUrgency?: boolean
}

export function LeadListItem({ lead, showUrgency = false }: LeadListItemProps) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const urgency = showUrgency ? calculateLeadUrgency(lead) : null

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

  const leadName = lead.name || lead.phone || lead.email || "Unnamed Lead"
  const areasArray = Array.isArray(lead.areas) ? lead.areas : (lead.areas ? JSON.parse(lead.areas) : [])

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if selecting text
    if (window.getSelection()?.toString()) return
    // Handle Command/Ctrl + Click for new tab
    if (e.metaKey || e.ctrlKey) {
      window.open(`/leads/${lead.id}`, '_blank')
      return
    }
    router.push(`/leads/${lead.id}`)
  }

  return (
    <>
      <div className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
        <div className="flex items-center justify-between gap-4">
          <div
            onClick={handleCardClick}
            className="flex-1 min-w-0 cursor-pointer"
            role="link"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                router.push(`/leads/${lead.id}`)
              }
            }}
          >
            <div className="flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-base truncate">
                    {leadName}
                  </h3>
                  {urgency?.isOverdue && (
                    <Badge variant="destructive" className="gap-1 shrink-0">
                      <AlertCircle className="h-3 w-3" />
                      OVERDUE
                    </Badge>
                  )}
                  <Badge className={statusColors[lead.status]}>{lead.status}</Badge>
                  <Badge className={priorityColors[lead.priority]}>{lead.priority}</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {lead.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3 w-3" />
                      <span>{lead.phone}</span>
                      {generateWhatsAppLink(lead.phone) && (
                        <Link
                          href={generateWhatsAppLink(lead.phone)!}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-0.5 text-[10px] font-medium text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 bg-green-50 dark:bg-green-950/30 rounded px-1.5 py-0.5 hover:bg-green-100 dark:hover:bg-green-950/50 transition-colors"
                          title="Open WhatsApp"
                        >
                          <MessageCircle className="h-2.5 w-2.5" />
                          WA
                        </Link>
                      )}
                    </div>
                  )}
                  {lead.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <span className="truncate max-w-[200px]">{lead.email}</span>
                    </div>
                  )}
                  {areasArray.length > 0 && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {areasArray.slice(0, 2).join(", ")}
                      {areasArray.length > 2 && ` +${areasArray.length - 2}`}
                    </div>
                  )}
                  {(lead.budgetMin || lead.budgetMax) && (
                    <div>
                      {formatAED(lead.budgetMin)} - {formatAED(lead.budgetMax)}
                    </div>
                  )}
                  {lead.nextFollowUpAt && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDateShort(lead.nextFollowUpAt)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {urgency?.isOverdue && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 shrink-0"
              onClick={(e) => {
                e.preventDefault()
                setDialogOpen(true)
              }}
            >
              <Phone className="h-4 w-4" />
              Contacted
            </Button>
          )}
        </div>
      </div>
      <ContactedDialog
        leadId={lead.id}
        leadName={leadName}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  )
}
