"use client"

import { useState } from "react"
import { updateLead } from "@/app/actions/leads"
import { createNote } from "@/app/actions/notes"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface ContactedDialogProps {
  leadId: string
  leadName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ContactedDialog({
  leadId,
  leadName,
  open,
  onOpenChange,
}: ContactedDialogProps) {
  const [note, setNote] = useState("")
  const [followUpDate, setFollowUpDate] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!note.trim()) {
      toast({
        title: "Error",
        description: "Please enter what was discussed",
        variant: "destructive",
      })
      return
    }

    if (!followUpDate) {
      toast({
        title: "Error",
        description: "Please select a follow-up date",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Update lead: set last_contacted_at and next_follow_up_at
      const followUpDateTime = new Date(followUpDate)
      followUpDateTime.setHours(9, 0, 0, 0) // Set to 9 AM
      
      await updateLead(leadId, {
        lastContactedAt: new Date(),
        nextFollowUpAt: followUpDateTime,
      })

      // Add note
      await createNote(leadId, note)

      toast({
        title: "Lead updated",
        description: "Follow-up scheduled successfully",
      })

      setNote("")
      setFollowUpDate("")
      onOpenChange(false)
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update lead",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Set default follow-up date to tomorrow
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const defaultDate = followUpDate || tomorrow.toISOString().split("T")[0]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Mark as Contacted</DialogTitle>
            <DialogDescription>
              What was discussed with {leadName}?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="note">What was discussed?</Label>
              <Textarea
                id="note"
                placeholder="E.g., Eşiyle görüşüyor. Tekrar arayalım."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="followUpDate">Follow-up Date</Label>
              <Input
                id="followUpDate"
                type="date"
                value={followUpDate || defaultDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                required
              />
              <p className="text-xs text-muted-foreground">
                The lead will appear as overdue again on this date if not contacted.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
