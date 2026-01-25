import { PrismaClient } from "@prisma/client"

// Validate DATABASE_URL is set and is a PostgreSQL connection string
const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL environment variable is not set. " +
    "Please set DATABASE_URL to a PostgreSQL connection string (e.g., postgresql://user:password@host:port/database)"
  )
}

if (!databaseUrl.startsWith("postgresql://") && !databaseUrl.startsWith("postgres://")) {
  throw new Error(
    `DATABASE_URL must be a PostgreSQL connection string starting with "postgresql://" or "postgres://". ` +
    `Current value: ${databaseUrl.substring(0, 20)}... ` +
    `This application requires PostgreSQL, not SQLite.`
  )
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
