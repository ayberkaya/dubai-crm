"use client"

import { useState } from "react"
import { updateLead, deleteLead } from "@/app/actions/leads"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Trash2 } from "lucide-react"
import type { LeadWithRelations } from "@/lib/lead-utils"
import type { LeadStatus } from "@/lib/types"

interface LeadActionsProps {
  lead: LeadWithRelations
}

export function LeadActions({ lead }: LeadActionsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<LeadStatus>(lead.status as LeadStatus)

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true)
    try {
      await updateLead(lead.id, { status: newStatus as LeadStatus })
      setStatus(newStatus as LeadStatus)
      toast({
        title: "Status updated",
        description: `Lead status changed to ${newStatus}`,
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
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
      <Select
        value={status}
        onValueChange={handleStatusChange}
        disabled={loading}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          {(["New", "Contacted", "Qualified", "Follow", "Closed"] as LeadStatus[]).map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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
