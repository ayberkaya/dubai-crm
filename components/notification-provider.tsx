"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { getUnreadNotificationCount, checkAndCreateNotifications } from "@/app/actions/notifications"
import { useToast } from "@/components/ui/use-toast"

interface NotificationContextType {
  unreadCount: number
  refreshNotifications: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default")
  const { toast } = useToast()

  const refreshNotifications = useCallback(async () => {
    try {
      await checkAndCreateNotifications()
      const count = await getUnreadNotificationCount()
      setUnreadCount(count)
    } catch (error: any) {
      // Ignore Next.js redirect errors
      if (error?.digest?.startsWith("NEXT_REDIRECT") || error?.message?.includes("NEXT_REDIRECT")) {
        return
      }
      
      console.error("Failed to refresh notifications:", error)
      
      // Only show toast for database connection errors, not for every refresh failure
      if (error instanceof Error && error.message.includes("DATABASE_URL")) {
        toast({
          variant: "destructive",
          title: "Database Connection Error",
          description: "Please check your database configuration. The application requires a PostgreSQL database.",
        })
      }
      // Silently fail for other errors - don't spam user with notifications
    }
  }, [toast])

  useEffect(() => {
    // Request notification permission
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          setNotificationPermission(permission)
        })
      } else {
        setNotificationPermission(Notification.permission)
      }
    }

    // Initial load
    refreshNotifications()

    // Check every 60 seconds
    const interval = setInterval(() => {
      refreshNotifications()
    }, 60000)

    return () => clearInterval(interval)
  }, [refreshNotifications])

  // Show browser notification when count increases
  useEffect(() => {
    if (unreadCount > 0 && notificationPermission === "granted") {
      new Notification("Dubai RCRM", {
        body: `${unreadCount} ${unreadCount === 1 ? "lead needs" : "leads need"} your attention`,
        icon: "/favicon.ico",
        tag: "lead-notification",
      })
    }
  }, [unreadCount, notificationPermission])

  return (
    <NotificationContext.Provider value={{ unreadCount, refreshNotifications }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within NotificationProvider")
  }
  return context
}
