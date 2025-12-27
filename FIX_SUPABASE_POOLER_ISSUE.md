# 🔧 Fix: Supabase Pooler Prepared Statement Error

## Current Issue

✅ **Connection is working!** But you're getting:
```
ERROR: prepared statement "s1" already exists
```

This happens because Supabase's **connection pooler** (port 6543) doesn't work well with Prisma migrations.

## Solution: Use Direct Connection (Port 5432)

### Step 1: Get Direct Connection String from Supabase

1. Go to **Supabase Dashboard** → Your Project
2. **Settings** → **Database**
3. Scroll to **"Connection string"** section
4. Look for **"Direct connection"** (not Connection Pooling)
5. Or change your connection string format:

**Current (Pooler - port 6543):**
```
postgresql://postgres.tckngcqpdgfojkjfpzne:Coroveldb1234@aws-1-ap-south-1.pooler.supabase.com:6543/postgres
```

**Should be (Direct - port 5432):**
```
postgresql://postgres.tckngcqpdgfojkjfpzne:Coroveldb1234@db.tckngcqpdgfojkjfpzne.supabase.co:5432/postgres
```

**Changes:**
- `pooler.supabase.com:6543` → `db.[PROJECT-REF].supabase.co:5432`
- Host changes from `aws-1-ap-south-1.pooler` to `db.tckngcqpdgfojkjfpzne`

### Step 2: Update .env File

Replace your `DATABASE_URL` with direct connection:

```env
DATABASE_URL="postgresql://postgres.tckngcqpdgfojkjfpzne:Coroveldb1234@db.tckngcqpdgfojkjfpzne.supabase.co:5432/postgres"
```

### Step 3: Test Again

```bash
npx prisma migrate dev --name init_supabase
```

Should work now! ✅

---

## Alternative: Get Exact String from Supabase

1. Supabase Dashboard → Settings → Database
2. Scroll to **"Connection string"**
3. Look for **"Direct connection"** section
4. Copy the URI string (should have port 5432)
5. Paste into `.env`

---

## Quick Fix

Try updating your `.env` to use direct connection:

```env
DATABASE_URL="postgresql://postgres.tckngcqpdgfojkjfpzne:Coroveldb1234@db.tckngcqpdgfojkjfpzne.supabase.co:5432/postgres"
```

Then run:
```bash
npx prisma migrate dev --name init_supabase
```

---

**The connection IS working - we just need to use direct connection instead of pooler! 🚀**
