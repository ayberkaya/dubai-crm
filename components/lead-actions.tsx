"use client"

import { useState } from "react"
import { markLeadAsContacted, deleteLead } from "@/app/actions/leads"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Phone, Trash2 } from "lucide-react"
import type { LeadWithRelations } from "@/lib/lead-utils"

interface LeadActionsProps {
  lead: LeadWithRelations
}

export function LeadActions({ lead }: LeadActionsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleMarkContacted = async () => {
    setLoading(true)
    try {
      await markLeadAsContacted(lead.id, true) // Auto-schedule next follow-up
      toast({
        title: "Lead marked as contacted",
        description: "Next follow-up scheduled in 2 days",
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark lead as contacted",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this lead?")) return

    setLoading(true)
    try {
      await deleteLead(lead.id)
      toast({
        title: "Lead deleted",
      })
      router.push("/leads")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete lead",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleMarkContacted}
        disabled={loading}
        variant="default"
        className="gap-2"
      >
        <Phone className="h-4 w-4" />
        Mark as Contacted
      </Button>
      <Button
        onClick={handleDelete}
        disabled={loading}
        variant="destructive"
        size="icon"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
