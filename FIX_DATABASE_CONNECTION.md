# 🔧 Fix Database Connection Error

## Current Issue
Your app is trying to connect to `localhost:55432` but getting `ECONNREFUSED`. This means the database server is not running or the connection string is wrong.

If you see Prisma error `P1001` ("Can't reach database server"), it’s the same root problem: the app can’t open a TCP connection to the host/port in your connection string.

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
   Pick ONE of these formats:

   **A) Supabase Pooler (recommended for Vercel/serverless):**
   ```env
   DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   ```

   **B) Supabase Direct DB:**
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   ```

   Important:
   - If host contains `pooler.supabase.com`, use the pooler port (commonly `6543`) and add `?pgbouncer=true`.
   - If host starts with `db.<project-ref>.supabase.co`, use port `5432` (and do not add `pgbouncer=true`).

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

## If Build/Deploy Fails With Prisma Migrations

If your build logs show:
- `P3018` (migration failed to apply)
- `P3009` (found failed migrations; new migrations won’t run)

You need to resolve the failed migration state in the target database.

In this repo, a common cause is RLS policy creation already existing in Supabase.

Recovery (marks the migration as applied):
```bash
npx prisma migrate resolve --applied 20251231_enable_rls
```

Then retry:
```bash
npx prisma migrate deploy
```

## Debug Endpoint (Shows Effective DB Host/Port)

If you can open your deployed app, hit:
`/api/debug/status`

It returns `EFFECTIVE_DATABASE_URL_INFO` so you can confirm what host/port the server is actually trying to use.
