import type { Lead } from "@prisma/client"

export type LeadWithRelations = Omit<Lead, "areas"> & {
  areas: string | string[]
  leadNotes?: Array<{ id: string; content: string; createdAt: Date }>
  _count?: { leadNotes: number }
}

export type OverdueReason = "overdue_new_contact" | "overdue_follow_up" | null

export interface LeadUrgency {
  isOverdue: boolean
  reason: OverdueReason
  dueDate: Date | null
  daysOverdue: number | null
}

const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000

export function calculateLeadUrgency(lead: Lead | LeadWithRelations): LeadUrgency {
  const now = new Date()
  const createdAt = new Date(lead.createdAt)
  const lastContactedAt = lead.lastContactedAt ? new Date(lead.lastContactedAt) : null
  const nextFollowUpAt = lead.nextFollowUpAt ? new Date(lead.nextFollowUpAt) : null

  // Check if new lead not contacted within 48 hours
  if (!lastContactedAt) {
    const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
    if (hoursSinceCreation >= 48) {
      const daysOverdue = Math.floor((now.getTime() - createdAt.getTime() - FORTY_EIGHT_HOURS_MS) / (1000 * 60 * 60 * 24))
      return {
        isOverdue: true,
        reason: "overdue_new_contact",
        dueDate: new Date(createdAt.getTime() + FORTY_EIGHT_HOURS_MS),
        daysOverdue,
      }
    }
  }

  // Check if follow-up is overdue
  if (nextFollowUpAt && nextFollowUpAt <= now) {
    const daysOverdue = Math.floor((now.getTime() - nextFollowUpAt.getTime()) / (1000 * 60 * 60 * 24))
    return {
      isOverdue: true,
      reason: "overdue_follow_up",
      dueDate: nextFollowUpAt,
      daysOverdue,
    }
  }

  return {
    isOverdue: false,
    reason: null,
    dueDate: nextFollowUpAt,
    daysOverdue: null,
  }
}

export function isDueToday(lead: Lead | LeadWithRelations): boolean {
  if (!lead.nextFollowUpAt) return false
  const today = new Date()
  const dueDate = new Date(lead.nextFollowUpAt)
  return (
    dueDate.getFullYear() === today.getFullYear() &&
    dueDate.getMonth() === today.getMonth() &&
    dueDate.getDate() === today.getDate()
  )
}

export function isDueNext7Days(lead: Lead | LeadWithRelations): boolean {
  if (!lead.nextFollowUpAt) return false
  const now = new Date()
  const dueDate = new Date(lead.nextFollowUpAt)
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  return dueDate > now && dueDate <= sevenDaysFromNow
}

export function getPriorityWeight(priority: string): number {
  switch (priority) {
    case "High":
      return 3
    case "Med":
      return 2
    case "Low":
      return 1
    default:
      return 2
  }
}

export function sortLeadsByUrgency(leads: LeadWithRelations[]): LeadWithRelations[] {
  return [...leads].sort((a, b) => {
    const urgencyA = calculateLeadUrgency(a)
    const urgencyB = calculateLeadUrgency(b)

    // Overdue first
    if (urgencyA.isOverdue && !urgencyB.isOverdue) return -1
    if (!urgencyA.isOverdue && urgencyB.isOverdue) return 1

    // Among overdue, sort by days overdue (most overdue first)
    if (urgencyA.isOverdue && urgencyB.isOverdue) {
      const daysA = urgencyA.daysOverdue ?? 0
      const daysB = urgencyB.daysOverdue ?? 0
      if (daysA !== daysB) return daysB - daysA
    }

    // Then by due date (soonest first)
    if (urgencyA.dueDate && urgencyB.dueDate) {
      return urgencyA.dueDate.getTime() - urgencyB.dueDate.getTime()
    }
    if (urgencyA.dueDate) return -1
    if (urgencyB.dueDate) return 1

    // Then by priority
    const priorityDiff = getPriorityWeight(b.priority) - getPriorityWeight(a.priority)
    if (priorityDiff !== 0) return priorityDiff

    // Finally by creation date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}
