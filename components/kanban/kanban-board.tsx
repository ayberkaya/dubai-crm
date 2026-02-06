"use client"

import {
    DndContext,
    DragOverlay,
    useSensors,
    useSensor,
    PointerSensor,
    defaultDropAnimationSideEffects,
    type DragStartEvent,
    type DragOverEvent,
    type DragEndEvent,
    type DropAnimation,
} from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import { useState, useMemo } from "react"
import { createPortal } from "react-dom"
import { KanbanColumn } from "./kanban-column"
import { KanbanCard } from "./kanban-card"
import type { LeadWithRelations } from "@/lib/lead-utils"
import type { LeadStatus } from "@/lib/types"
import { LeadFollowupDialog } from "@/components/lead-followup-dialog"


interface KanbanBoardProps {
    leads: LeadWithRelations[]
    onLeadUpdate: (leadId: string, status: LeadStatus) => void
}

const COLUMNS: { id: LeadStatus; title: string }[] = [
    { id: "New", title: "New" },
    { id: "Contacted", title: "Contacted" },
    { id: "Qualified", title: "Qualified" },
    { id: "Follow", title: "Follow Up" },
    { id: "Closed", title: "Closed" },
]

export function KanbanBoard({ leads, onLeadUpdate }: KanbanBoardProps) {
    const [activeLead, setActiveLead] = useState<LeadWithRelations | null>(null)
    const [pendingUpdate, setPendingUpdate] = useState<{ leadId: string, status: LeadStatus } | null>(null)

    // We need local state for optimistic UI updates
    // In a real app we might sync this with the parent state, 
    // but for DnD specifically, local state is often smoother
    // We'll rely on the parent to update the 'leads' prop eventually

    // Actually, to mix DnD state and parent state, it's best if we compute columns
    // from props, but use a local state for the drag operation's visual effect?
    // No, standard practice is to use local state that gets initialized from props, 
    // and then when props change, we update local state if needed.
    // OR, simpler: derive everything from props, but we need instant feedback on drop.

    // Let's use the pattern where we layout columns based on props.
    // But we need to handle dragOver (moving between columns) optimistically.
    // So we probably need a local copy of leads.
    const [items, setItems] = useState<LeadWithRelations[]>(leads)

    // Sync with props when they change (e.g. from server revalidation)
    // We only sync if we are not currently dragging
    useMemo(() => {
        if (!activeLead) {
            setItems(leads)
        }
    }, [leads, activeLead])


    const leadsByStatus = useMemo(() => {
        const grouped: Record<LeadStatus, LeadWithRelations[]> = {
            New: [],
            Contacted: [],
            Qualified: [],
            Follow: [],
            Closed: [],
        }

        // Ensure we handle status string differences if any
        items.forEach((lead) => {
            // Casting to any to avoid strict type checking if DB has unexpected values
            const status = (lead.status as LeadStatus) || "New"
            if (grouped[status]) {
                grouped[status].push(lead)
            } else {
                // Fallback for unknown status
                if (!grouped["New"]) grouped["New"] = []
                grouped["New"].push(lead)
            }
        })

        return grouped
    }, [items])

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Require 8px movement to start drag, prevents accidental drags on clicks
            },
        })
    )

    const onDragStart = (event: DragStartEvent) => {
        const { active } = event
        const activeLead = items.find((l) => l.id === active.id)
        if (activeLead) {
            setActiveLead(activeLead)
        }
    }

    const onDragOver = (event: DragOverEvent) => {
        const { active, over } = event
        if (!over) return

        const activeId = active.id
        const overId = over.id

        if (activeId === overId) return

        const isActiveTask = active.data.current?.type === "Lead"
        const isOverTask = over.data.current?.type === "Lead"
        const isOverColumn = over.data.current?.type === "Column"

        if (!isActiveTask) return

        // Implements dropping a Task over another Task
        if (isActiveTask && isOverTask) {
            setItems((leads) => {
                const activeIndex = leads.findIndex((t) => t.id === activeId)
                const overIndex = leads.findIndex((t) => t.id === overId)

                // if (leads[activeIndex].status !== leads[overIndex].status) {
                //   // Logic for changing status is handled here for visual feedback
                //   // But actuall changing the status field is better done in onDragEnd or here?
                //   // If we change it here, it looks instant.
                //    leads[activeIndex].status = leads[overIndex].status
                // }

                // To support reordering within column, we'd use arrayMove
                // But we first need to make sure they have the same status in our local state
                const newLeads = [...leads]
                const activeLead = newLeads[activeIndex]
                const overLead = newLeads[overIndex]

                if (activeLead.status !== overLead.status) {
                    activeLead.status = overLead.status
                    // We're just modifying the object in place or shallow copy, 
                    // but since we spread [...leads], the array reference changes.
                    // However, react might not detect deep change if we mutate 'activeLead'.
                    // Better to create a new object.
                    newLeads[activeIndex] = { ...activeLead, status: overLead.status }
                }

                // Note: Reordering logic is complex without a defined 'order' field in DB.
                // For now, we will rely on default sort (createdAt usually), so reordering
                // visually in the column is temporary until refresh.
                // If we want persistent reorder, we need an 'order' field.
                // For THIS task, we probably just want to change status.

                return arrayMove(newLeads, activeIndex, overIndex)
            })
        }

        // Implements dropping a Task over a Column
        if (isActiveTask && isOverColumn) {
            setItems((leads) => {
                const activeIndex = leads.findIndex((t) => t.id === activeId)
                const activeLead = leads[activeIndex]
                // const newStatus = overId as LeadStatus
                // FIX: overId is the column ID (which is the status string)
                const newStatus = over.data.current?.status as LeadStatus

                if (activeLead.status !== newStatus) {
                    const newLeads = [...leads]
                    newLeads[activeIndex] = { ...activeLead, status: newStatus }
                    return arrayMove(newLeads, activeIndex, activeIndex) // Just update status, position effectively "end" or keep relative?
                }
                return leads
            })
        }
    }

    const onDragEnd = (event: DragEndEvent) => {
        setActiveLead(null)
        const { active, over } = event

        if (!over) return

        const activeId = active.id

        // Verify the item exists
        const activeIndex = items.findIndex(l => l.id === activeId)
        if (activeIndex === -1) return

        const activeItem = items[activeIndex]

        // Check if it landed in a column or on another card
        let newStatus: LeadStatus | undefined

        if (over.data.current?.type === "Column") {
            newStatus = over.data.current.status as LeadStatus
        } else if (over.data.current?.type === "Lead") {
            const overIndex = items.findIndex(l => l.id === over.id)
            if (overIndex !== -1) {
                newStatus = items[overIndex].status as LeadStatus
            }
        }

        // Trigger update if status changed
        if (newStatus && newStatus !== activeItem.status) {
            // If moving to active status, show dialog
            if (["Contacted", "Qualified", "Follow"].includes(newStatus)) {
                setPendingUpdate({ leadId: activeItem.id, status: newStatus })
                // The draggable item is already visually moved due to optimistic update in onDragOver
            } else {
                onLeadUpdate(activeItem.id, newStatus)
            }
        }
    }

    const dropAnimation: DropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: "0.5",
                },
            },
        }),
    }

    return (
        <DndContext
            sensors={sensors}
            onDragStart={onDragStart}
            onDragOver={onDragOver} // Handle moving between columns
            onDragEnd={onDragEnd}
        >
            <div className="flex h-full gap-4 overflow-x-auto pb-4">
                {COLUMNS.map((col) => (
                    <KanbanColumn
                        key={col.id}
                        id={col.id}
                        title={col.title}
                        leads={leadsByStatus[col.id]}
                        activeId={activeLead?.id || null}
                    />
                ))}
            </div>
            {typeof window === "object" && createPortal(
                <DragOverlay dropAnimation={dropAnimation}>
                    {activeLead && (
                        <div className="w-[var(--radix-select-trigger-width)]">
                            <KanbanCard lead={activeLead} />
                        </div>
                    )}
                </DragOverlay>,
                document.body
            )}

            {pendingUpdate && (
                <LeadFollowupDialog
                    leadId={pendingUpdate.leadId}
                    newStatus={pendingUpdate.status}
                    open={!!pendingUpdate}
                    onOpenChange={(open) => {
                        if (!open) {
                            // If cancelled, revert optimistic constraints
                            setItems(leads)
                            setPendingUpdate(null)
                        }
                    }}
                    onSuccess={() => {
                        const { leadId, status } = pendingUpdate
                        onLeadUpdate(leadId, status)
                        setPendingUpdate(null)
                    }}
                />
            )}
        </DndContext>
    )
}
