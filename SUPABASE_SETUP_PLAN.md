# 🎯 Supabase Setup Plan - Step by Step

## ⚠️ Important Principles

1. **✅ ONE Database System Only** - Supabase ONLY, no mixing
2. **✅ Clean Migration** - Fresh start with Supabase
3. **✅ Step-by-Step** - Auth → Tasks → Analytics (not all at once)

---

## 📋 Phase 1: Supabase Setup & Connection

### Step 1: Create Supabase Project

1. Go to: https://supabase.com
2. Sign up / Login
3. Click **"New Project"**
4. Fill in:
   - **Project Name:** `corovel` (or your choice)
   - **Database Password:** Choose a strong password (SAVE THIS!)
   - **Region:** Choose closest to you
5. Wait 2-3 minutes for project to be ready

### Step 2: Get Connection String

1. In Supabase Dashboard → **Project Settings** (gear icon)
2. Click **"Database"** in sidebar
3. Scroll to **"Connection string"** section
4. Select **"URI"** tab
5. Copy the connection string - it looks like:
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```

### Step 3: Update .env File

**IMPORTANT:** Remove any old database URLs!

Update your `.env` file:

```env
# Database - SUPABASE ONLY (no localhost, no other DBs)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

# Remove or comment out any old DATABASE_URL lines
# DATABASE_URL=postgresql://postgres:postgres@localhost:55432/crek_dev  ❌ DELETE THIS
```

### Step 4: Test Connection

```bash
npx prisma db push
```

**Expected Result:** ✅ "Everything is in sync" or tables created successfully

---

## 📋 Phase 2: Database Schema Setup (Clean)

### Step 5: Create Fresh Migration for Supabase

Since we're starting fresh with Supabase, we'll create a new migration:

```bash
npx prisma migrate dev --name init_supabase
```

This will:
- Create all tables in Supabase
- Generate migration file
- Apply it to your Supabase database

**Verify:** Check Supabase Dashboard → **Table Editor** - you should see all tables

---

## 📋 Phase 3: Auth Setup (First Priority)

### Step 6: Test Authentication Only

Before adding tasks/analytics, verify auth works:

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Test Registration:**
   - Go to `/register`
   - Create a test user
   - Check Supabase → **Table Editor** → `users` table
   - Should see new user ✅

3. **Test Login:**
   - Go to `/login`
   - Login with test user
   - Should redirect to dashboard ✅

4. **Verify in Database:**
   - Check `users` table in Supabase
   - Check `accounts` table (for OAuth if used)
   - Verify data is being saved correctly ✅

**✅ AUTH WORKING?** → Proceed to Phase 4
**❌ AUTH NOT WORKING?** → Fix auth issues first (don't move forward)

---

## 📋 Phase 4: Tasks Setup (Second Priority)

### Step 7: Initialize Tasks System

Only after auth is working:

1. **Seed Tasks:**
   ```bash
   npx tsx scripts/seed-tasks.ts
   ```
   Or manually add tasks via Supabase Dashboard

2. **Test Daily Check-in:**
   - Login to dashboard
   - Click "Daily Check-in" button
   - Check database:
     - `point_transactions` table should have entry
     - `user_tasks` table should have entry
     - `users` table `points` should increase

3. **Verify Tasks:**
   - Check `tasks` table in Supabase
   - Check `user_tasks` table
   - Verify point transactions ✅

**✅ TASKS WORKING?** → Proceed to Phase 5
**❌ TASKS NOT WORKING?** → Fix task issues first

---

## 📋 Phase 5: Analytics Setup (Last Priority)

### Step 8: Initialize Analytics

Only after auth AND tasks are working:

1. **Test Analytics Events:**
   - Perform actions (register, login, check-in)
   - Check `analytics_events` table in Supabase
   - Verify events are being tracked ✅

2. **Test Leaderboard:**
   - Create multiple users with different points
   - Check leaderboard page
   - Verify rankings are correct ✅

**✅ ANALYTICS WORKING?** → Complete! ✅

---

## 🔍 Verification Checklist

After each phase, verify:

### ✅ Phase 1 - Connection
- [ ] `npx prisma db push` succeeds
- [ ] Can see tables in Supabase Dashboard
- [ ] No connection errors

### ✅ Phase 2 - Schema
- [ ] All tables created in Supabase
- [ ] Migration file created
- [ ] Schema matches Prisma schema

### ✅ Phase 3 - Auth
- [ ] Can register new user
- [ ] User appears in `users` table
- [ ] Can login with registered user
- [ ] Session works correctly
- [ ] OAuth works (if configured)

### ✅ Phase 4 - Tasks
- [ ] Tasks table has data
- [ ] Can complete daily check-in
- [ ] Points increase correctly
- [ ] Point transactions recorded
- [ ] Weekly progress calculates correctly

### ✅ Phase 5 - Analytics
- [ ] Events tracked in `analytics_events`
- [ ] Leaderboard shows correct rankings
- [ ] All features working together

---

## ❌ What NOT to Do

1. **❌ Don't keep old DATABASE_URL** - Remove localhost/old connections
2. **❌ Don't mix databases** - Supabase ONLY
3. **❌ Don't rush** - Complete one phase before moving to next
4. **❌ Don't skip testing** - Verify each phase works before proceeding
5. **❌ Don't add features** - Focus on getting existing features working first

---

## 🚨 Troubleshooting

### Connection Fails

1. **Check connection string format:**
   - Must be URI format from Supabase
   - Password must be URL-encoded if special characters
   - Should use port 6543 (pooler) or 5432 (direct)

2. **Check firewall:**
   - Supabase allows connections by default
   - No IP whitelist needed

3. **Verify credentials:**
   - Password is correct
   - Project is active (not paused)

### Auth Not Working

1. **Check `users` table exists** in Supabase
2. **Check data is being saved** - look in Table Editor
3. **Check console for errors** - look for Prisma errors
4. **Verify environment variables** - SESSION_SECRET, etc.

### Tasks Not Working

1. **Check `tasks` table has data** - seed tasks first
2. **Check `user_tasks` table** - verify completions are saved
3. **Check `point_transactions`** - verify points are recorded
4. **Verify calculations** - check streak/weekly progress logic

---

## 📝 Next Steps

1. Start with **Phase 1** - Set up Supabase connection
2. Complete **Phase 2** - Database schema
3. Test **Phase 3** - Auth only (stop here until working)
4. Then **Phase 4** - Tasks (stop here until working)
5. Finally **Phase 5** - Analytics

**Take your time. Don't rush. One phase at a time.**

---

## 🎯 Current Status

- [ ] Phase 1: Supabase setup
- [ ] Phase 2: Schema migration
- [ ] Phase 3: Auth working
- [ ] Phase 4: Tasks working
- [ ] Phase 5: Analytics working

**Let's start with Phase 1! 🚀**
