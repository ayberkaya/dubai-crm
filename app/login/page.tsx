"use client"

import { useState } from "react"
import { login } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await login(username, password)
      if (result?.error) {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: result.error,
        })
        setIsLoading(false)
      }
      // If no error, redirect will happen (Next.js handles it)
      // Don't set loading to false here as page will redirect
    } catch (error: any) {
      // Next.js redirect() throws a special error - ignore it
      // Check multiple ways Next.js might signal a redirect
      const isRedirectError = 
        error?.digest?.startsWith("NEXT_REDIRECT") ||
        error?.message?.includes("NEXT_REDIRECT") ||
        error?.digest?.includes("redirect") ||
        (error?.name === "RedirectError")
      
      if (isRedirectError) {
        // Redirect is happening, let Next.js handle it
        // Don't show error or reset loading state
        return
      }
      
      // Only show error for actual failures
      console.error("Login error:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "An unexpected error occurred",
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Dubai RCRM</CardTitle>
          <CardDescription>Enter your credentials to access the CRM</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  )
}
