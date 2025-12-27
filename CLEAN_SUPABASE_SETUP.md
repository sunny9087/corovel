# 🧹 Clean Supabase Setup - No Mixing!

## ⚠️ CRITICAL: Remove All Old Database References

Before connecting to Supabase, we MUST clean up:

### Step 1: Clean .env File

Your `.env` should have **ONLY ONE** `DATABASE_URL` pointing to Supabase:

```env
# ✅ CORRECT - Supabase ONLY
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

# ❌ DELETE THESE IF THEY EXIST:
# DATABASE_URL=postgresql://postgres:postgres@localhost:55432/crek_dev
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/crek_dev
# POSTGRES_PRISMA_URL=...
# Any other database URLs
```

### Step 2: Verify Prisma Config

`prisma.config.ts` should use `DATABASE_URL` or `POSTGRES_PRISMA_URL`:
- ✅ It already does this correctly
- ✅ No changes needed here

### Step 3: Verify lib/prisma.ts

`lib/prisma.ts` should use PostgreSQL adapter:
- ✅ Already configured correctly
- ✅ Uses `process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL`
- ✅ For Supabase, we'll use `DATABASE_URL` only

---

## 🎯 Supabase Connection Steps

### 1. Get Supabase Connection String

1. Supabase Dashboard → Project Settings → Database
2. Copy **URI** connection string (not Connection Pooling)
3. Format: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres`

### 2. Update .env

```env
# Database - SUPABASE ONLY
DATABASE_URL="paste-supabase-connection-string-here"

# Remove all other DATABASE_URL lines!
```

### 3. Test Connection

```bash
npx prisma db push
```

If successful, you'll see tables created in Supabase Dashboard.

### 4. Run Migration

```bash
npx prisma migrate dev --name init_supabase
```

---

## ✅ Verification

After setup, verify:

1. **Only one DATABASE_URL** in `.env` → Supabase
2. **Connection test succeeds** → `npx prisma db push` works
3. **Tables visible** in Supabase Dashboard
4. **No old database references** anywhere

---

## 🚨 Common Mistakes to Avoid

1. ❌ Keeping `localhost:55432` in .env
2. ❌ Having multiple DATABASE_URL lines
3. ❌ Mixing Supabase with local PostgreSQL
4. ❌ Using wrong port (use 6543 for pooler, 5432 for direct)

---

**Ready to start? Let's do Phase 1! 🚀**
