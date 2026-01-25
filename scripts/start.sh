#!/bin/bash
set -e

# Sync database schema before starting the server
echo "🔄 Syncing database schema..."
npx prisma db push --skip-generate

# Start the Next.js server
echo "🚀 Starting Next.js server..."
exec next start
