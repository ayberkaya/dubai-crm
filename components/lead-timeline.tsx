"use client"

import { useState } from "react"
import { createNote } from "@/app/actions/notes"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { formatDate } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { MessageSquare, Phone } from "lucide-react"
import { useRouter } from "next/navigation"

interface LeadTimelineProps {
  leadId: string
  notes: Array<{ id: string; content: string; createdAt: Date }>
}

export function LeadTimeline({ leadId, notes }: LeadTimelineProps) {
  const [newNote, setNewNote] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleAddNote = async () => {
    if (!newNote.trim()) return

    setLoading(true)
    try {
      await createNote(leadId, newNote)
      setNewNote("")
      toast({
        title: "Note added",
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline</CardTitle>
        <CardDescription>Activity history and notes</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Note Form */}
        <div className="space-y-2">
          <Textarea
            placeholder="Add a note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            rows={3}
          />
          <Button onClick={handleAddNote} disabled={loading || !newNote.trim()}>
            Add Note
          </Button>
        </div>

        {/* Timeline Items */}
        <div className="space-y-4">
          {notes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet</p>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="flex gap-3 pb-4 border-b last:border-0">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Note</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(note.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
