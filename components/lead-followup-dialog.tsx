"use client"

import { useState } from "react"
import { updateLead } from "@/app/actions/leads"
import { createNote } from "@/app/actions/notes"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn, formatDateShort } from "@/lib/utils"
import { CalendarIcon, Loader2 } from "lucide-react"
import type { LeadStatus } from "@/lib/types"

interface LeadFollowupDialogProps {
    leadId: string
    newStatus: LeadStatus
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: (newStatus: LeadStatus) => void
}

export function LeadFollowupDialog({
    leadId,
    newStatus,
    open,
    onOpenChange,
    onSuccess,
}: LeadFollowupDialogProps) {
    const [loading, setLoading] = useState(false)
    const [note, setNote] = useState("")
    // Default to 2 days from now
    const [nextFollowUp, setNextFollowUp] = useState<Date | undefined>(() => {
        const d = new Date()
        d.setDate(d.getDate() + 2)
        return d
    })

    const handleSubmit = async () => {
        setLoading(true)
        try {
            // 1. Update status and follow-up date
            const data: any = { status: newStatus }
            if (nextFollowUp) {
                data.nextFollowUpAt = nextFollowUp
            }

            await updateLead(leadId, data)

            // 2. Add note if provided
            if (note.trim()) {
                await createNote(leadId, `Status updated to ${newStatus}\n\n${note}`)
            } else {
                await createNote(leadId, `Status updated to ${newStatus}`)
            }

            onSuccess(newStatus)
            onOpenChange(false)
            setNote("") // Reset note
        } catch (error) {
            console.error("Failed to update lead", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Update Status to {newStatus}</DialogTitle>
                    <DialogDescription>
                        What happened? Don't forget to schedule the next follow-up.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Note (Optional)</h4>
                        <Textarea
                            placeholder="E.g., Client is interested in 2 beds facing marina..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={3}
                        />
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Next Follow-up</h4>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !nextFollowUp && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {nextFollowUp ? formatDateShort(nextFollowUp) : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={nextFollowUp}
                                    onSelect={setNextFollowUp}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirm
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
