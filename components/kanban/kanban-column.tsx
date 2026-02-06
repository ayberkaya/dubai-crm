"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { KanbanCard } from "./kanban-card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { LeadStatus } from "@/lib/types"
import type { LeadWithRelations } from "@/lib/lead-utils"

interface KanbanColumnProps {
    id: LeadStatus
    title: string
    leads: LeadWithRelations[]
    activeId: string | null
}

export function KanbanColumn({ id, title, leads, activeId }: KanbanColumnProps) {
    const { setNodeRef } = useDroppable({
        id,
        data: {
            type: "Column",
            status: id,
        },
    })

    const statusColors: Record<string, string> = {
        New: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
        Contacted: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
        Qualified: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
        Follow: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
        Closed: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
    }

    return (
        <div className="flex w-80 flex-col shrink-0">
            <div className={cn("mb-3 flex items-center justify-between rounded-lg border p-3", statusColors[id] || "bg-muted")}>
                <div className="flex items-center gap-2 font-semibold">
                    {title}
                    <Badge variant="outline" className="bg-background/50">
                        {leads.length}
                    </Badge>
                </div>
            </div>

            <div
                ref={setNodeRef}
                className={cn(
                    "flex flex-1 flex-col gap-3 rounded-lg bg-muted/50 p-2 min-h-[500px] transition-colors",
                    // activeId && !leads.find(l => l.id === activeId) && "bg-muted" 
                )}
            >
                <SortableContext items={leads.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                    {leads.map((lead) => (
                        <KanbanCard key={lead.id} lead={lead} />
                    ))}
                </SortableContext>
            </div>
        </div>
    )
}
