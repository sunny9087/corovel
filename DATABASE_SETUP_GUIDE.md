# 🗄️ Database Setup Guide - Step by Step

## Current Situation

Your app is configured for **PostgreSQL only** but can't connect because:
- `.env` has `DATABASE_URL=postgresql://postgres:postgres@localhost:55432/crek_dev`
- No database server is running at `localhost:55432`
- Connection fails with `ECONNREFUSED`

---

## 🎯 Solution Options (Choose One)

### **Option 1: Vercel Postgres** ⭐ RECOMMENDED (Since you already have it)

**Best for:** Production deployment on Vercel + local development

**Steps:**

1. **Get Vercel Postgres Connection String:**
   ```
   1. Go to: https://vercel.com/dashboard
   2. Click your project
   3. Go to "Storage" tab
   4. Click your Postgres database
   5. Click ".env.local" tab
   6. Copy the FULL value of POSTGRES_PRISMA_URL
   ```

2. **Update your `.env` file:**
   ```env
   DATABASE_URL="paste-the-complete-connection-string-here"
   ```
   
   Example format:
   ```
   postgresql://default:AbCd1234@ep-cool-name-123456.us-east-1.postgres.vercel-storage.com:5432/verceldb?sslmode=require
   ```

3. **Test Connection:**
   ```bash
   npx prisma db push
   ```

4. **Run Migrations:**
   ```bash
   npx prisma migrate dev
   ```

5. **Verify:**
   ```bash
   npm run dev
   ```

**✅ Pros:**
- Works for both local dev AND production
- No local database setup needed
- Free tier available
- Auto-scales with Vercel

**❌ Cons:**
- Requires internet connection
- Free tier has limits

---

### **Option 2: Supabase (Free PostgreSQL in Cloud)** 🚀

**Best for:** Free, reliable PostgreSQL without Vercel account

**Steps:**

1. **Create Supabase Account:**
   - Go to: https://supabase.com
   - Sign up (free)
   - Click "New Project"

2. **Get Connection String:**
   - Project Settings → Database
   - Under "Connection string" → URI
   - Copy the connection string

3. **Update `.env`:**
   ```env
   DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
   ```

4. **Test & Migrate:**
   ```bash
   npx prisma db push
   npx prisma migrate dev
   ```

**✅ Pros:**
- Completely free
- Easy setup
- Great dashboard
- No credit card needed

**❌ Cons:**
- Separate service (not integrated with Vercel)
- Requires internet

---

### **Option 3: Local PostgreSQL** 💻

**Best for:** Offline development, full control

**Steps:**

1. **Install PostgreSQL:**
   - **Windows:** Download from https://www.postgresql.org/download/windows/
   - **Or use Docker:**
     ```bash
     docker run -d -p 5432:5432 --name postgres -e POSTGRES_PASSWORD=postgres postgres:15
     ```

2. **Create Database:**
   ```sql
   -- Connect to PostgreSQL (using psql or pgAdmin)
   CREATE DATABASE crek_dev;
   ```

3. **Update `.env`:**
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/crek_dev"
   ```
   *(Change password if you set a different one)*

4. **Test & Migrate:**
   ```bash
   npx prisma db push
   npx prisma migrate dev
   ```

**✅ Pros:**
- Works offline
- Full control
- Fast (local)

**❌ Cons:**
- Requires PostgreSQL installation
- Only works on your machine
- Need to manage backups

---

### **Option 4: Docker PostgreSQL** 🐳

**Best for:** Easy local setup without full PostgreSQL installation

**Steps:**

1. **Run PostgreSQL Container:**
   ```bash
   docker run -d \
     --name crek-postgres \
     -p 5432:5432 \
     -e POSTGRES_PASSWORD=postgres \
     -e POSTGRES_DB=crek_dev \
     postgres:15
   ```

2. **Update `.env`:**
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/crek_dev"
   ```

3. **Test & Migrate:**
   ```bash
   npx prisma db push
   npx prisma migrate dev
   ```

**✅ Pros:**
- No PostgreSQL installation needed
- Easy to start/stop
- Isolated environment

**❌ Cons:**
- Requires Docker
- Only works locally

---

## 🎯 My Recommendation

**For Your Case:** I recommend **Option 1 (Vercel Postgres)** because:
1. You already have Vercel Postgres set up
2. Works seamlessly with Vercel deployment
3. No local setup needed
4. Easy to use for both dev and production

---

## ✅ After Database Setup

Once connection works, run these commands:

```bash
# 1. Push schema to database
npx prisma db push

# 2. Run migrations (creates all tables)
npx prisma migrate dev

# 3. Generate Prisma Client (if needed)
npx prisma generate

# 4. Start dev server
npm run dev
```

---

## 🔍 Verify Setup

Test that everything works:

1. **Check connection:**
   ```bash
   npx prisma db push
   # Should say "Everything is in sync" ✅
   ```

2. **Start app:**
   ```bash
   npm run dev
   # Should start without database errors ✅
   ```

3. **Test registration:**
   - Go to http://localhost:3000/register
   - Try registering a new user
   - Should work without errors ✅

---

## ❓ Still Having Issues?

If connection still fails:

1. **Verify connection string format:**
   - Must start with `postgresql://` or `postgres://`
   - No extra spaces or quotes
   - Should be on one line

2. **Check firewall/network:**
   - For cloud databases (Vercel/Supabase), ensure your IP isn't blocked
   - Try from different network

3. **Test with psql (if local):**
   ```bash
   psql "postgresql://postgres:postgres@localhost:5432/crek_dev"
   ```

4. **Check Prisma logs:**
   - Add to `lib/prisma.ts` temporarily:
   ```typescript
   log: ["query", "info", "warn", "error"]
   ```

---

## 📝 Quick Checklist

- [ ] Choose database option (Vercel/Supabase/Local/Docker)
- [ ] Get connection string
- [ ] Update `.env` with `DATABASE_URL`
- [ ] Test: `npx prisma db push`
- [ ] Run migrations: `npx prisma migrate dev`
- [ ] Start dev server: `npm run dev`
- [ ] Test registration/login
- [ ] ✅ Database setup complete!

---

**Need help with a specific option? Let me know which one you want to use!**
