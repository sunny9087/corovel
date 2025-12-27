# 🔧 Fix Database Connection Error

## Current Issue
Your app is trying to connect to `localhost:55432` but getting `ECONNREFUSED`. This means the database server is not running or the connection string is wrong.

## Solution Options

### Option 1: Use Vercel Postgres (Recommended)

If you want to use Vercel Postgres for local development:

1. **Get your Vercel Postgres connection string:**
   - Go to **Vercel Dashboard** → Your Project → **Storage** tab
   - Click on your **Postgres** database
   - Click **".env.local"** tab
   - Copy the **full `POSTGRES_PRISMA_URL` value**

2. **Update your `.env` file:**
   ```env
   DATABASE_URL="paste-the-full-connection-string-from-vercel-here"
   ```
   
   It should look like:
   ```
   postgresql://default:password@ep-xxx-xxx.us-east-1.postgres.vercel-storage.com:5432/verceldb?sslmode=require
   ```

3. **Test the connection:**
   ```bash
   npx prisma db push
   ```

4. **Run migrations:**
   ```bash
   npx prisma migrate dev
   ```

### Option 2: Use Local PostgreSQL

If you want to use a local PostgreSQL database:

1. **Install PostgreSQL** (if not installed):
   - Download from: https://www.postgresql.org/download/windows/
   - Or use Docker: `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres`

2. **Create the database:**
   ```sql
   CREATE DATABASE crek_dev;
   ```

3. **Update your `.env` file:**
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/crek_dev"
   ```
   
   **Note:** Change `postgres:postgres` to your actual PostgreSQL username and password.

4. **Test the connection:**
   ```bash
   npx prisma db push
   ```

5. **Run migrations:**
   ```bash
   npx prisma migrate dev
   ```

### Option 3: Use Supabase (Free PostgreSQL)

1. **Create a Supabase project:**
   - Go to https://supabase.com
   - Create a new project
   - Wait for it to be ready

2. **Get connection string:**
   - Go to **Project Settings** → **Database**
   - Copy the **Connection string** (URI format)

3. **Update your `.env` file:**
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   ```

4. **Test the connection:**
   ```bash
   npx prisma db push
   ```

5. **Run migrations:**
   ```bash
   npx prisma migrate dev
   ```

## After Fixing Connection

Once your connection works:

1. **Run migrations:**
   ```bash
   npx prisma migrate dev
   ```

2. **Restart your dev server:**
   ```bash
   npm run dev
   ```

3. **Test registration/login** - should work now!

## Current Error Details

- **Error:** `ECONNREFUSED`
- **Trying to connect to:** `localhost:55432`
- **Database:** `crek_dev`
- **Issue:** Database server not running or wrong connection string

## Quick Check

Run this to test your connection:
```bash
npx prisma db push
```

If it succeeds, your connection is working! ✅
