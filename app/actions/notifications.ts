"use server"

import { prisma } from "@/lib/prisma"
import type { NotificationType } from "@/lib/types"
import { calculateLeadUrgency, isDueToday } from "@/lib/lead-utils"
import { startOfDay } from "date-fns"

export async function checkAndCreateNotifications() {
  const leads = await prisma.lead.findMany()

  const now = new Date()
  const todayStart = startOfDay(now)
  const todayEnd = new Date(todayStart)
  todayEnd.setDate(todayEnd.getDate() + 1)

  for (const lead of leads) {
    const urgency = calculateLeadUrgency(lead)

    // Create overdue_new_contact notification if needed
    if (urgency.reason === "overdue_new_contact") {
      // Check if notification already exists for today
      const existing = await prisma.notification.findFirst({
        where: {
          leadId: lead.id,
          type: "OverdueNewContact",
          createdAt: {
            gte: todayStart,
            lt: todayEnd,
          },
        },
      })

      if (!existing) {
        await prisma.notification.create({
          data: {
            leadId: lead.id,
            type: "OverdueNewContact",
          },
        })
      }
    }

    // Create overdue_follow_up notification if needed
    if (urgency.reason === "overdue_follow_up") {
      const existing = await prisma.notification.findFirst({
        where: {
          leadId: lead.id,
          type: "OverdueFollowUp",
          createdAt: {
            gte: todayStart,
            lt: todayEnd,
          },
        },
      })

      if (!existing) {
        await prisma.notification.create({
          data: {
            leadId: lead.id,
            type: "OverdueFollowUp",
          },
        })
      }
    }

    // Create due_today notification if needed
    if (isDueToday(lead) && !urgency.isOverdue) {
      const existing = await prisma.notification.findFirst({
        where: {
          leadId: lead.id,
          type: "DueToday",
          createdAt: {
            gte: todayStart,
            lt: todayEnd,
          },
        },
      })

      if (!existing) {
        await prisma.notification.create({
          data: {
            leadId: lead.id,
            type: "DueToday",
          },
        })
      }
    }
  }
}

export async function getUnreadNotifications() {
  return prisma.notification.findMany({
    where: { read: false },
    include: {
      lead: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  })
}

export async function markNotificationAsRead(id: string) {
  await prisma.notification.update({
    where: { id },
    data: { read: true },
  })
}

export async function markAllNotificationsAsRead() {
  await prisma.notification.updateMany({
    where: { read: false },
    data: { read: true },
  })
}

export async function getUnreadNotificationCount() {
  return prisma.notification.count({
    where: { read: false },
  })
}
