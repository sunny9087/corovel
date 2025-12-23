# 🚨 CRITICAL: Fix Registration/Login Error

## The Problem
Error: `Invalid prisma.user.findUnique() invocation: unable to`

This means:
1. Prisma client was generated for SQLite but you're using PostgreSQL
2. OR database tables don't exist yet (migrations not run)
3. OR DATABASE_URL is not set correctly

## ✅ IMMEDIATE FIX (Do This Now)

### Step 1: Verify Vercel Postgres is Set Up

1. Go to Vercel Dashboard → Your Project → **Storage** tab
2. Make sure you see a **Postgres** database listed
3. If not, create one: Click "Create Database" → "Postgres"

### Step 2: Verify Environment Variable

1. Vercel → Settings → **Environment Variables**
2. Check that `DATABASE_URL` exists
3. Value should be: `$POSTGRES_PRISMA_URL` (or the actual connection string)
4. Make sure it's enabled for **Production**, **Preview**, and **Development**

### Step 3: Regenerate Prisma Client Locally

**IMPORTANT:** You need to set a PostgreSQL DATABASE_URL locally to generate the correct client:

```bash
# Temporarily set PostgreSQL URL (use a test database or your Vercel URL)
# Option A: Use Vercel's connection string (get it from Vercel Storage → Postgres → .env.local)
export DATABASE_URL="postgresql://user:password@host:5432/database"

# OR Option B: Create a local .env file with PostgreSQL URL
# Get the connection string from Vercel Storage → Postgres → .env.local
# Copy POSTGRES_PRISMA_URL value

# Then generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name init_postgresql
```

### Step 4: Get Vercel Postgres Connection String

1. Vercel → Storage → Your Postgres Database
2. Click on the database
3. Go to **".env.local"** tab
4. Copy the `POSTGRES_PRISMA_URL` value
5. This is your `DATABASE_URL` for Vercel

### Step 5: Set DATABASE_URL in Vercel

1. Vercel → Settings → Environment Variables
2. **Delete** the old `DATABASE_URL` if it exists
3. **Add New:**
   - Key: `DATABASE_URL`
   - Value: Paste the `POSTGRES_PRISMA_URL` you copied (the full connection string)
   - Environment: ✅ Production, ✅ Preview, ✅ Development
4. Click **Save**

### Step 6: Commit and Redeploy

```bash
# Make sure schema.prisma has provider = "postgresql"
git add .
git commit -m "Fix: Regenerate Prisma client for PostgreSQL"
git push
```

### Step 7: After Deployment, Run Migrations

After Vercel finishes deploying:

**Option A: Using Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Set DATABASE_URL for migrations
export DATABASE_URL="your-postgres-connection-string-from-vercel"

# Run migrations
npx prisma migrate deploy
```

**Option B: Add Migration Script to Vercel**

The `vercel-build` script should automatically run migrations. If it doesn't work, check Vercel build logs.

### Step 8: Verify It Works

1. Check Vercel logs - should see successful database connections
2. Try registering a new user
3. Should work now! ✅

## 🔍 Troubleshooting

### If you still get "Invalid findUnique invocation":

1. **Check Prisma client was regenerated:**
   ```bash
   # Delete old client
   rm -rf lib/generated/prisma
   
   # Regenerate with PostgreSQL
   export DATABASE_URL="your-postgres-url"
   npx prisma generate
   ```

2. **Check schema.prisma:**
   - Should have `provider = "postgresql"`
   - Should NOT have `provider = "sqlite"`

3. **Check DATABASE_URL format:**
   - Should start with `postgresql://` or `postgres://`
   - NOT `file:./dev.db`

4. **Check migrations ran:**
   - Look in Vercel build logs for "Running migrations"
   - Or check database directly - tables should exist

### If migrations fail:

1. **Check DATABASE_URL is correct:**
   - Get it from Vercel Storage → Postgres → .env.local
   - Should be the `POSTGRES_PRISMA_URL` value

2. **Run migrations manually:**
   ```bash
   export DATABASE_URL="your-postgres-url-from-vercel"
   npx prisma migrate deploy
   ```

## ✅ Quick Checklist

- [ ] Vercel Postgres database created
- [ ] DATABASE_URL set in Vercel (use POSTGRES_PRISMA_URL)
- [ ] schema.prisma has `provider = "postgresql"`
- [ ] Prisma client regenerated locally with PostgreSQL
- [ ] Migration created and committed
- [ ] Code pushed to trigger Vercel deployment
- [ ] Migrations run on Vercel (check build logs)
- [ ] Test registration/login

## 🎯 Most Likely Issue

The Prisma client is still SQLite-based. You MUST:
1. Set a PostgreSQL DATABASE_URL locally
2. Run `npx prisma generate` 
3. This regenerates the client for PostgreSQL
4. Commit the regenerated client
5. Push to Vercel

The `vercel-build` script will also regenerate it, but it's better to do it locally first.
