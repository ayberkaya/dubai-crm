#!/usr/bin/env tsx

/**
 * Pre-build validation script
 * Ensures DATABASE_URL is set and schema.prisma uses PostgreSQL
 */

import { readFileSync } from "fs"
import { join } from "path"

const schemaPath = join(process.cwd(), "prisma", "schema.prisma")
const schema = readFileSync(schemaPath, "utf-8")

// Check schema provider
const providerMatch = schema.match(/provider\s*=\s*["'](\w+)["']/)
if (!providerMatch) {
  console.error("❌ Error: Could not find provider in schema.prisma")
  process.exit(1)
}

const provider = providerMatch[1]
if (provider !== "postgresql") {
  console.error(
    `❌ Error: schema.prisma uses "${provider}" but this application requires PostgreSQL.\n` +
    `   Please update schema.prisma to use: provider = "postgresql"`
  )
  process.exit(1)
}

// Check DATABASE_URL
const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error(
    "❌ Error: DATABASE_URL environment variable is not set.\n" +
    "   Please set DATABASE_URL to a PostgreSQL connection string.\n" +
    "   Example: postgresql://user:password@host:port/database"
  )
  process.exit(1)
}

if (!databaseUrl.startsWith("postgresql://") && !databaseUrl.startsWith("postgres://")) {
  console.error(
    `❌ Error: DATABASE_URL must be a PostgreSQL connection string.\n` +
    `   Current value starts with: ${databaseUrl.substring(0, 30)}...\n` +
    `   Required format: postgresql://user:password@host:port/database`
  )
  process.exit(1)
}

console.log("✅ Environment validation passed")
console.log(`   Provider: ${provider}`)
console.log(`   DATABASE_URL: ${databaseUrl.substring(0, 30)}...`)
