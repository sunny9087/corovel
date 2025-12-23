# 🚨 QUICK FIX: Login/Register 500 Error on Vercel

## The Problem
SQLite doesn't work on Vercel. Your app needs PostgreSQL.

## ✅ Fastest Solution (5 minutes)

### Step 1: Add Vercel Postgres Database
1. Go to [vercel.com](https://vercel.com) → Your Project
2. Click **"Storage"** tab
3. Click **"Create Database"**
4. Select **"Postgres"**
5. Click **"Create"**

### Step 2: Update Prisma Schema
Replace `prisma/schema.prisma` with the PostgreSQL version:

```bash
# Copy the PostgreSQL schema
cp prisma/schema.postgresql.prisma prisma/schema.prisma
```

Or manually change:
```prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

And add `@db.Text` to all String fields (see `schema.postgresql.prisma` for reference).

### Step 3: Set Environment Variable in Vercel
1. Go to **Settings** → **Environment Variables**
2. Add/Update:
   - **Key:** `DATABASE_URL`
   - **Value:** `$POSTGRES_PRISMA_URL` (Vercel auto-creates this)
   - **Environment:** Production, Preview, Development (check all)

### Step 4: Generate Prisma Client & Run Migrations
```bash
# Generate Prisma client
npx prisma generate

# Create and run migration
npx prisma migrate dev --name init_postgres

# For production, after deploying:
npx prisma migrate deploy
```

### Step 5: Deploy
```bash
git add .
git commit -m "Switch to PostgreSQL for Vercel"
git push
```

## 🔍 Verify It Works
1. Check Vercel deployment logs
2. Try login/register again
3. Should work now! ✅

## 📝 Alternative: Use Supabase (Free)
If you prefer not to use Vercel Postgres:

1. Sign up at [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings → Database
4. Set `DATABASE_URL` in Vercel to that connection string
5. Follow steps 2-5 above

## ⚠️ Important
- **Local dev:** Keep `DATABASE_URL="file:./dev.db"` in your local `.env` for SQLite
- **Production:** Use PostgreSQL connection string from Vercel
- The code now auto-detects SQLite vs PostgreSQL based on `DATABASE_URL` format
