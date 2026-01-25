"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Application error:", error)
    }
  }, [error])

  // Check if this is a database connection error
  const isDatabaseError = 
    error.message?.includes("DATABASE_URL") ||
    error.message?.includes("PrismaClientInitializationError") ||
    error.message?.includes("file:") ||
    error.message?.includes("postgresql://")

  const errorMessage = error.message || "An unexpected error occurred"
  const helpfulMessage = isDatabaseError
    ? "Database connection error. Please ensure DATABASE_URL is set to a valid PostgreSQL connection string in your environment variables."
    : errorMessage

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle>Something went wrong</CardTitle>
          </div>
          <CardDescription>
            {helpfulMessage}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isDatabaseError && (
            <div className="p-3 bg-muted rounded-md text-sm">
              <p className="font-medium mb-1">Database Configuration Required:</p>
              <p className="text-muted-foreground">
                This application requires PostgreSQL. Set DATABASE_URL to a connection string like:
                <code className="block mt-2 p-2 bg-background rounded text-xs">
                  postgresql://user:password@host:port/database
                </code>
              </p>
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            {error.digest
              ? `Error ID: ${error.digest}`
              : "Please check your configuration and try again."}
          </p>
          <div className="flex gap-2">
            <Button onClick={reset} variant="default">
              Try again
            </Button>
            <Button onClick={() => (window.location.href = "/")} variant="outline">
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
