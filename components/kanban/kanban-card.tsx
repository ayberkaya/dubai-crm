"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { LeadCard } from "@/components/lead-card"
import type { LeadWithRelations } from "@/lib/lead-utils"

interface KanbanCardProps {
    lead: LeadWithRelations
}

export function KanbanCard({ lead }: KanbanCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: lead.id,
        data: {
            type: "Lead",
            lead,
        },
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="touch-none"
        >
            {/* We disable urgency actions in kanban for now to keep it clean */}
            <LeadCard lead={lead} showUrgency={false} />
        </div>
    )
}
