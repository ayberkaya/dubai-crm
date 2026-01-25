"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import {
  getUnreadNotifications,
  markAllNotificationsAsRead,
} from "@/app/actions/notifications"
import { NotificationList } from "@/components/notification-list"
import { Bell, Moon, Sun, Monitor } from "lucide-react"

export function SettingsContent() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [autoScheduleNext, setAutoScheduleNext] = useState(true)
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const data = await getUnreadNotifications()
      setNotifications(data)
    } catch (error) {
      console.error("Failed to load notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead()
      await loadNotifications()
    } catch (error) {
      console.error("Failed to mark notifications as read:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your preferences and notifications
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Choose your preferred theme</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!mounted ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="theme-light" className="flex items-center gap-2 cursor-pointer">
                    <Sun className="h-4 w-4" />
                    Light
                  </Label>
                  <Switch id="theme-light" checked={false} disabled />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="theme-dark" className="flex items-center gap-2 cursor-pointer">
                    <Moon className="h-4 w-4" />
                    Dark
                  </Label>
                  <Switch id="theme-dark" checked={false} disabled />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="theme-system" className="flex items-center gap-2 cursor-pointer">
                    <Monitor className="h-4 w-4" />
                    System
                  </Label>
                  <Switch id="theme-system" checked={false} disabled />
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <Label htmlFor="theme-light" className="flex items-center gap-2 cursor-pointer">
                    <Sun className="h-4 w-4" />
                    Light
                  </Label>
                  <Switch
                    id="theme-light"
                    checked={theme === "light"}
                    onCheckedChange={() => setTheme("light")}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="theme-dark" className="flex items-center gap-2 cursor-pointer">
                    <Moon className="h-4 w-4" />
                    Dark
                  </Label>
                  <Switch
                    id="theme-dark"
                    checked={theme === "dark"}
                    onCheckedChange={() => setTheme("dark")}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="theme-system" className="flex items-center gap-2 cursor-pointer">
                    <Monitor className="h-4 w-4" />
                    System
                  </Label>
                  <Switch
                    id="theme-system"
                    checked={theme === "system"}
                    onCheckedChange={() => setTheme("system")}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Follow-up Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Follow-up Settings</CardTitle>
            <CardDescription>Configure default follow-up behavior</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-schedule" className="cursor-pointer">
                Auto-schedule next follow-up
              </Label>
              <Switch
                id="auto-schedule"
                checked={autoScheduleNext}
                onCheckedChange={setAutoScheduleNext}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              When enabled, marking a lead as contacted will automatically schedule
              the next follow-up in 2 days.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Manage your in-app notifications
              </CardDescription>
            </div>
            {notifications.length > 0 && (
              <Button onClick={handleMarkAllRead} variant="outline" size="sm">
                Mark all as read
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <NotificationList
            notifications={notifications}
            onRefresh={loadNotifications}
          />
        </CardContent>
      </Card>
    </div>
  )
}
