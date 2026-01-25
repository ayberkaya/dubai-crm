"use client"

import { markNotificationAsRead } from "@/app/actions/notifications"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { AlertCircle, Calendar, Phone } from "lucide-react"
import type { NotificationType } from "@/lib/types"

interface NotificationListProps {
  notifications: Array<{
    id: string
    type: NotificationType
    read: boolean
    createdAt: Date
    lead: {
      id: string
      name: string | null
      phone: string | null
      email: string | null
    }
  }>
  onRefresh: () => void
}

export function NotificationList({ notifications, onRefresh }: NotificationListProps) {
  const router = useRouter()

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationAsRead(id)
      onRefresh()
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  const handleClick = async (notification: NotificationListProps["notifications"][0]) => {
    await handleMarkRead(notification.id)
    router.push(`/leads/${notification.lead.id}`)
  }

  const getNotificationMessage = (type: NotificationType, lead: NotificationListProps["notifications"][0]["lead"]) => {
    const leadName = lead.name || lead.phone || lead.email || "Unnamed Lead"
    switch (type) {
      case "OverdueNewContact":
        return `${leadName} hasn't been contacted in 48+ hours`
      case "OverdueFollowUp":
        return `Follow-up for ${leadName} is overdue`
      case "DueToday":
        return `Follow-up for ${leadName} is due today`
      case "ArrivalReminder":
        return `${leadName} is arriving in Dubai tomorrow`
      default:
        return `Action needed for ${leadName}`
    }
  }

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "OverdueNewContact":
      case "OverdueFollowUp":
        return <AlertCircle className="h-4 w-4 text-destructive" />
      case "DueToday":
        return <Calendar className="h-4 w-4 text-yellow-600" />
      case "ArrivalReminder":
        return <Calendar className="h-4 w-4 text-blue-600" />
      default:
        return <Phone className="h-4 w-4" />
    }
  }

  if (notifications.length === 0) {
    return <p className="text-sm text-muted-foreground">No notifications</p>
  }

  return (
    <div className="space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors ${
            notification.read ? "opacity-60" : ""
          }`}
          onClick={() => handleClick(notification)}
        >
          <div className="flex-shrink-0 mt-0.5">
            {getNotificationIcon(notification.type)}
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-sm">{getNotificationMessage(notification.type, notification.lead)}</p>
            <p className="text-xs text-muted-foreground">
              {formatDate(notification.createdAt)}
            </p>
          </div>
          {!notification.read && (
            <Badge variant="destructive" className="h-2 w-2 rounded-full p-0" />
          )}
        </div>
      ))}
    </div>
  )
}
