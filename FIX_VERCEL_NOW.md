# 🚨 FIX: "unable to open database file" Error on Vercel

## The Problem
Your app is trying to use SQLite on Vercel, but SQLite doesn't work on serverless functions. You need PostgreSQL.

## ✅ Solution (Do These Steps in Order)

### Step 1: Add Vercel Postgres Database

1. Go to https://vercel.com/dashboard
2. Click on your **"corovel"** project
3. Click **"Storage"** tab (top navigation bar)
4. Click **"Create Database"** button
5. Select **"Postgres"**
6. Click **"Create"**
7. Wait ~30 seconds for it to provision

### Step 2: Set Environment Variable in Vercel

1. In Vercel project, go to **Settings** → **Environment Variables**
2. Click **"Add New"**
3. Enter:
   - **Key:** `DATABASE_URL`
   - **Value:** `$POSTGRES_PRISMA_URL` (this variable is auto-created by Vercel)
   - **Environment:** Check ✅ Production, ✅ Preview, ✅ Development
4. Click **"Save"**

### Step 3: Update Your Local Code

The schema has been updated to PostgreSQL. Now run:

```bash
# Generate Prisma client for PostgreSQL
npx prisma generate

# This will create a migration
npx prisma migrate dev --name switch_to_postgresql
```

**Note:** If you get an error about DATABASE_URL, that's OK for now. We'll set it up on Vercel.

### Step 4: Commit and Push

```bash
git add .
git commit -m "Switch to PostgreSQL for Vercel deployment"
git push
```

### Step 5: Run Migrations on Vercel

After Vercel deploys, you need to run migrations. You have 2 options:

**Option A: Using Vercel CLI (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project (if not already linked)
vercel link

# Run migrations
npx prisma migrate deploy
```

**Option B: Automatic (Already Added to package.json)**
The `vercel-build` script will automatically run migrations on each deploy. Just push your code and Vercel will handle it.

### Step 6: Verify It Works

1. Go to Vercel → Your Project → **Logs**
2. Look for successful database connections (no more "unable to open database file" errors)
3. Try registering a new user
4. Try logging in

## 🔧 What Changed

1. ✅ **Schema updated:** Changed from `sqlite` to `postgresql`
2. ✅ **Added `@db.Text`:** All String fields now have PostgreSQL type annotations
3. ✅ **Updated prisma.ts:** Automatically detects SQLite vs PostgreSQL
4. ✅ **Added build scripts:** Automatically runs migrations on Vercel

## ⚠️ Important Notes

- **Local Development:** Keep `DATABASE_URL="file:./dev.db"` in your local `.env` for SQLite
- **Production:** Vercel will use `$POSTGRES_PRISMA_URL` automatically
- **Migrations:** Run `npx prisma migrate deploy` after first deployment

## 🐛 If You Still Get Errors

1. **Check environment variable:**
   - Vercel → Settings → Environment Variables
   - Make sure `DATABASE_URL` = `$POSTGRES_PRISMA_URL`

2. **Check Prisma client:**
   ```bash
   npx prisma generate
   ```

3. **Check migrations ran:**
   - Look in Vercel build logs for "Running migrations"
   - Or manually run: `npx prisma migrate deploy`

4. **Check database exists:**
   - Vercel → Storage tab
   - Make sure Postgres database is created and running

## ✅ After These Steps

Your login and register will work! The "unable to open database file" error will be gone.

---

## Quick Reference

**Vercel Dashboard:** https://vercel.com/dashboard  
**Your Project:** corovel  
**Storage Tab:** Where you create the Postgres database  
**Environment Variables:** Settings → Environment Variables  
**Database URL:** `$POSTGRES_PRISMA_URL` (auto-created by Vercel)
