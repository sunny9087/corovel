#!/bin/bash

# Run Prisma migrations in production
echo "Running Prisma migrations..."
npx prisma migrate deploy --skip-generate

if [ $? -ne 0 ]; then
  echo "Migration failed!"
  exit 1
fi

echo "Migrations completed successfully"
