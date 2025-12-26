# 🚨 FIX: Build Error - Invalid Database String

## The Error
```
Error: P1013
The provided database string is invalid. `datasource.url` in `prisma.config.ts` is invalid: 
must start with the protocol `postgresql://` or `postgres://`
```

## The Problem
Vercel build is trying to use `file:./dev.db` (SQLite) but your schema is PostgreSQL.

## ✅ IMMEDIATE FIX

### Step 1: Get Your Vercel Postgres Connection String

1. Go to **Vercel Dashboard** → Your Project → **Storage** tab
2. Click on your **Postgres** database
3. Click **".env.local"** tab
4. **Copy the `POSTGRES_PRISMA_URL` value** (the full connection string)

It should look like:
```
postgresql://user:password@host:5432/database?sslmode=require
```

### Step 2: Set DATABASE_URL in Vercel

1. Vercel → **Settings** → **Environment Variables**
2. **Delete** any existing `DATABASE_URL` (if it has `file:./dev.db`)
3. **Add New:**
   - **Key:** `DATABASE_URL`
   - **Value:** Paste the **full connection string** you copied (NOT `$POSTGRES_PRISMA_URL`, the actual string)
   - **Environment:** ✅ Production, ✅ Preview, ✅ Development
4. Click **Save**

### Step 3: Redeploy

1. Go to **Deployments** tab
2. Click **"Redeploy"** on the latest deployment
3. OR push a new commit:
   ```bash
   git add .
   git commit -m "Fix: Set DATABASE_URL for PostgreSQL"
   git push
   ```

### Step 4: Verify Build Succeeds

Check the build logs - you should see:
- ✅ `Prisma schema loaded`
- ✅ `Running migrations`
- ✅ `Build completed successfully`

## 🔍 Why This Happened

The `prisma.config.ts` was reading `DATABASE_URL` from environment, but:
- It wasn't set in Vercel, OR
- It was set to the default `file:./dev.db` (SQLite)

Now it's fixed to:
- ✅ Validate the URL format
- ✅ Give clear error messages
- ✅ Check if on Vercel and require PostgreSQL

## ⚠️ Important

**DO NOT use `$POSTGRES_PRISMA_URL` as the value!**

Use the **actual connection string** from Vercel Storage → Postgres → .env.local → `POSTGRES_PRISMA_URL`

Example:
- ❌ Wrong: `$POSTGRES_PRISMA_URL`
- ✅ Correct: `postgresql://user:pass@host:5432/db?sslmode=require`

## ✅ After Fix

Your build should succeed and login/register will work!
