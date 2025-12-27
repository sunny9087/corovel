# 🔧 Supabase Connection Troubleshooting

## Current Issue

Connection string is configured but can't reach Supabase:
- Error: `P1001: Can't reach database server`
- Connection string format: `postgres://postgres:Coroveldb1234@db.abcdefghijklmnopqrst.supabase.co:6543/postgres`

## Possible Solutions

### Solution 1: Use Direct Connection (Port 5432) Instead of Pooler (6543)

The pooler connection (6543) might have issues. Try the **direct connection** instead:

1. **Get Direct Connection String:**
   - Supabase Dashboard → Project Settings → Database
   - Under "Connection string" → **URI** tab
   - Look for connection string with port **5432** (not 6543)
   - Or use this format:
     ```
     postgresql://postgres.[PROJECT-REF]:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
     ```

2. **Update .env:**
   ```env
   DATABASE_URL="postgresql://postgres.abcdefghijklmnopqrst:Coroveldb1234@db.abcdefghijklmnopqrst.supabase.co:5432/postgres"
   ```

### Solution 2: URL Encode Password (If Special Characters)

If your password has special characters, they need to be URL-encoded.

For password `Coroveldb1234`, it should be fine, but if it has special chars:
- `@` becomes `%40`
- `#` becomes `%23`
- `$` becomes `%24`
- etc.

### Solution 3: Use Connection Pooling URL (Different Format)

Supabase also provides a connection pooling URL with a different format:

1. Supabase Dashboard → Project Settings → Database
2. Under "Connection pooling" → **Connection string** → **URI**
3. Copy that URL (usually different format)

### Solution 4: Verify Supabase Project Status

1. Check Supabase Dashboard - is the project **Active**?
2. Is it still provisioning? Wait a few more minutes
3. Check project settings - is the database enabled?

---

## Quick Fix to Try First

**Change port from 6543 to 5432 (direct connection):**

Update your `.env`:

```env
DATABASE_URL="postgresql://postgres.abcdefghijklmnopqrst:Coroveldb1234@db.abcdefghijklmnopqrst.supabase.co:5432/postgres"
```

**Changes:**
- `postgres://` → `postgresql://` (more standard)
- Port `6543` → `5432` (direct connection)
- Format: `postgres.[PROJECT-REF]` with dot notation

Then test:
```bash
npx prisma db push
```

---

## Alternative: Get Exact Connection String from Supabase

1. Go to Supabase Dashboard
2. Project Settings → Database
3. Scroll to "Connection string"
4. Copy the **exact** URI string (try both tabs: URI and Connection Pooling)
5. Paste directly into `.env` (don't modify it)

This ensures you have the correct format.

---

## Verify Connection Works

After updating, test:

```bash
npx prisma db push
```

Should see: ✅ "Everything is in sync" or tables created successfully

---

**Try Solution 1 first (change to port 5432) - that's the most common fix! 🚀**
