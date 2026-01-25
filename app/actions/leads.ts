"use server"

import { prisma } from "@/lib/prisma"
import type {
  LeadStatus,
  LeadType,
  LeadSource,
  Language,
  Priority,
  Furnishing,
} from "@/lib/types"
import { revalidatePath } from "next/cache"
import { calculateLeadUrgency, isDueToday, isDueNext7Days } from "@/lib/lead-utils"

export interface CreateLeadInput {
  name?: string
  phone?: string
  email?: string
  preferredLanguage?: Language
  source?: LeadSource
  sourceCustom?: string
  leadType?: LeadType
  budgetMin?: number
  budgetMax?: number
  areas?: string[]
  beds?: number
  baths?: number
  furnishing?: Furnishing
  moveInDate?: Date | string
  notes?: string
  status?: LeadStatus
  priority?: Priority
  nextFollowUpAt?: Date | string
  lastContactedAt?: Date | string
  isInDubai?: boolean
  arrivalDate?: Date | string
}

export async function createLead(input: CreateLeadInput) {
  // Validation: at least one of name, phone, or email
  if (!input.name && !input.phone && !input.email) {
    throw new Error("At least one of name, phone, or email is required")
  }

  // Default next_follow_up_at to now + 2 days if not provided
  const defaultNextFollowUp = new Date()
  defaultNextFollowUp.setDate(defaultNextFollowUp.getDate() + 2)

  const lead = await prisma.lead.create({
    data: {
      name: input.name || null,
      phone: input.phone || null,
      email: input.email || null,
      preferredLanguage: input.preferredLanguage || null,
      source: input.source || null,
      sourceCustom: input.sourceCustom || null,
      leadType: input.leadType || null,
      budgetMin: input.budgetMin || null,
      budgetMax: input.budgetMax || null,
      areas: JSON.stringify(input.areas || []),
      beds: input.beds || null,
      baths: input.baths || null,
      furnishing: input.furnishing || null,
      moveInDate: input.moveInDate ? new Date(input.moveInDate) : null,
      notes: input.notes || null,
      status: input.status || "New",
      priority: input.priority || "Med",
      nextFollowUpAt: input.nextFollowUpAt
        ? new Date(input.nextFollowUpAt)
        : defaultNextFollowUp,
      isInDubai: input.isInDubai ?? true,
      arrivalDate: input.arrivalDate ? new Date(input.arrivalDate) : null,
    },
  })

  revalidatePath("/")
  revalidatePath("/leads")
  return lead
}

export async function updateLead(id: string, input: Partial<CreateLeadInput>) {
  const updateData: any = {}

  if (input.name !== undefined) updateData.name = input.name || null
  if (input.phone !== undefined) updateData.phone = input.phone || null
  if (input.email !== undefined) updateData.email = input.email || null
  if (input.preferredLanguage !== undefined)
    updateData.preferredLanguage = input.preferredLanguage || null
  if (input.source !== undefined) updateData.source = input.source || null
  if (input.sourceCustom !== undefined)
    updateData.sourceCustom = input.sourceCustom || null
  if (input.leadType !== undefined) updateData.leadType = input.leadType || null
  if (input.budgetMin !== undefined) updateData.budgetMin = input.budgetMin || null
  if (input.budgetMax !== undefined) updateData.budgetMax = input.budgetMax || null
  if (input.areas !== undefined) updateData.areas = JSON.stringify(input.areas || [])
  if (input.beds !== undefined) updateData.beds = input.beds || null
  if (input.baths !== undefined) updateData.baths = input.baths || null
  if (input.furnishing !== undefined) updateData.furnishing = input.furnishing || null
  if (input.moveInDate !== undefined)
    updateData.moveInDate = input.moveInDate ? new Date(input.moveInDate) : null
  if (input.notes !== undefined) updateData.notes = input.notes || null
  if (input.status !== undefined) updateData.status = input.status
  if (input.priority !== undefined) updateData.priority = input.priority
  if (input.nextFollowUpAt !== undefined)
    updateData.nextFollowUpAt = input.nextFollowUpAt instanceof Date
      ? input.nextFollowUpAt
      : input.nextFollowUpAt
        ? new Date(input.nextFollowUpAt)
        : null
  if (input.lastContactedAt !== undefined)
    updateData.lastContactedAt = input.lastContactedAt instanceof Date
      ? input.lastContactedAt
      : input.lastContactedAt
        ? new Date(input.lastContactedAt)
        : null
  if (input.isInDubai !== undefined) updateData.isInDubai = input.isInDubai
  if (input.arrivalDate !== undefined)
    updateData.arrivalDate = input.arrivalDate instanceof Date
      ? input.arrivalDate
      : input.arrivalDate
        ? new Date(input.arrivalDate)
        : null

  const lead = await prisma.lead.update({
    where: { id },
    data: updateData,
  })

  revalidatePath("/")
  revalidatePath("/leads")
  revalidatePath(`/leads/${id}`)
  return lead
}

export async function deleteLead(id: string) {
  await prisma.lead.delete({
    where: { id },
  })

  revalidatePath("/")
  revalidatePath("/leads")
}

export async function markLeadAsContacted(id: string, autoScheduleNext?: boolean) {
  const now = new Date()
  const updateData: any = {
    lastContactedAt: now,
  }

  // Auto-schedule next follow-up if enabled
  if (autoScheduleNext) {
    const nextFollowUp = new Date()
    nextFollowUp.setDate(nextFollowUp.getDate() + 2)
    updateData.nextFollowUpAt = nextFollowUp
  }

  const lead = await prisma.lead.update({
    where: { id },
    data: updateData,
  })

  revalidatePath("/")
  revalidatePath("/leads")
  revalidatePath(`/leads/${id}`)
  return lead
}

export async function getLead(id: string) {
  if (!id) {
    return null
  }
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      leadNotes: {
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: { leadNotes: true },
      },
    },
  })

  if (!lead) return null

  return {
    ...lead,
    areas: JSON.parse(lead.areas || "[]") as string[],
  }
}

export async function getLeads(filters?: {
  search?: string
  status?: LeadStatus
  leadType?: LeadType
  source?: LeadSource
  priority?: Priority
  language?: Language
  budgetMin?: number
  budgetMax?: number
}) {
  const where: any = {}

  if (filters?.search) {
    const searchTerm = filters.search
    where.OR = [
      { name: { contains: searchTerm } },
      { phone: { contains: searchTerm } },
      { email: { contains: searchTerm } },
      { areas: { contains: searchTerm } },
      { notes: { contains: searchTerm } },
    ]
  }

  if (filters?.status) where.status = filters.status
  if (filters?.leadType) where.leadType = filters.leadType
  if (filters?.source) where.source = filters.source
  if (filters?.priority) where.priority = filters.priority
  if (filters?.language) where.preferredLanguage = filters.language
  if (filters?.budgetMin !== undefined) where.budgetMin = { gte: filters.budgetMin }
  if (filters?.budgetMax !== undefined) where.budgetMax = { lte: filters.budgetMax }

  const leads = await prisma.lead.findMany({
    where,
    include: {
      _count: {
        select: { leadNotes: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return leads.map((lead) => ({
    ...lead,
    areas: JSON.parse(lead.areas || "[]") as string[],
  }))
}

export async function getDashboardData() {
  const allLeads = await prisma.lead.findMany({
    include: {
      _count: {
        select: { leadNotes: true },
      },
    },
  })

  const overdue: typeof allLeads = []
  const dueToday: typeof allLeads = []
  const dueNext7Days: typeof allLeads = []

  for (const lead of allLeads) {
    const urgency = calculateLeadUrgency(lead)
    if (urgency.isOverdue) {
      overdue.push(lead)
    } else if (isDueToday(lead)) {
      dueToday.push(lead)
    } else if (isDueNext7Days(lead)) {
      dueNext7Days.push(lead)
    }
  }

  return {
    overdue: overdue.map((lead) => ({
      ...lead,
      areas: JSON.parse(lead.areas || "[]") as string[],
    })),
    dueToday: dueToday.map((lead) => ({
      ...lead,
      areas: JSON.parse(lead.areas || "[]") as string[],
    })),
    dueNext7Days: dueNext7Days.map((lead) => ({
      ...lead,
      areas: JSON.parse(lead.areas || "[]") as string[],
    })),
    totalLeads: allLeads.length,
  }
}
