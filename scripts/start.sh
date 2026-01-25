#!/bin/bash
set -e

# Sync database schema before starting the server
echo "🔄 Syncing database schema..."
npx prisma db push --skip-generate

# Ensure default user exists (idempotent - safe to run multiple times)
echo "👤 Ensuring default user exists..."
npx tsx scripts/add-user.ts || {
  echo "⚠️  Warning: Failed to create/update user. Continuing anyway..."
}

# Start the Next.js server
echo "🚀 Starting Next.js server..."
exec next start
