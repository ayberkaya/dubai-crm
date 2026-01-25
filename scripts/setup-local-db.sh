#!/bin/bash

# Start PostgreSQL in Docker if not running
if ! docker ps | grep -q postgres; then
  echo "Starting PostgreSQL container..."
  docker run -d \
    --name dubai-rcrm-postgres \
    -e POSTGRES_PASSWORD=postgres \
    -e POSTGRES_USER=postgres \
    -p 5432:5432 \
    postgres:latest
  echo "Waiting for PostgreSQL to start..."
  sleep 5
fi

# Create database
echo "Creating database..."
docker exec -i dubai-rcrm-postgres psql -U postgres -c "CREATE DATABASE dubai_rcrm;" 2>/dev/null || echo "Database might already exist"

# Grant permissions
echo "Granting permissions..."
docker exec -i dubai-rcrm-postgres psql -U postgres -d dubai_rcrm -c "
GRANT ALL PRIVILEGES ON DATABASE dubai_rcrm TO postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
" 2>/dev/null || echo "Permissions might already be set"

echo "Database setup complete!"
echo "DATABASE_URL is already set in .env file"
