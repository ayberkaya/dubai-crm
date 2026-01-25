"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, Settings, Bell, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNotifications } from "@/components/notification-provider"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { logout } from "@/app/actions/auth"

export function Nav() {
  const pathname = usePathname()
  const { unreadCount } = useNotifications()

  const navItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/leads", label: "Leads", icon: Users },
    { href: "/settings", label: "Settings", icon: Settings },
  ]

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold">
            Dubai RCRM
          </Link>
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/settings">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Badge>
              )}
            </Button>
          </Link>
          <ThemeToggle />
          <form action={logout}>
            <Button type="submit" variant="ghost" size="icon" title="Logout">
              <LogOut className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </nav>
  )
}
