# ✅ Verify Your .env Setup

## Check Your .env File

Your `.env` file should have `DATABASE_URL` set to your Vercel Postgres connection string.

### Step 1: Get the Correct Connection String from Vercel

1. Go to **Vercel Dashboard** → Your Project → **Storage** tab
2. Click on your **Postgres** database
3. Click **".env.local"** tab
4. **Copy the `POSTGRES_PRISMA_URL` value** (the full connection string)

It should look like:
```
postgresql://default:password@ep-xxx-xxx.us-east-1.postgres.vercel-storage.com:5432/verceldb?sslmode=require
```

### Step 2: Add to Your Local .env File

Create or update `.env` in your project root:

```env
DATABASE_URL="postgresql://default:password@ep-xxx-xxx.us-east-1.postgres.vercel-storage.com:5432/verceldb?sslmode=require"
```

**Important:**
- Use the **actual connection string** from Vercel (not `$POSTGRES_PRISMA_URL`)
- Keep the quotes around it
- Make sure there are no extra spaces
- The connection string should start with `postgresql://`

### Step 3: Verify It Works

1. **Test the connection:**
   ```bash
   npx prisma db push
   ```

2. **If it works, run migrations:**
   ```bash
   npx prisma migrate dev
   ```

3. **Start dev server:**
   ```bash
   npm run dev
   ```

## Common Issues

### Issue 1: "Authentication failed"
- **Cause:** Wrong password or username in connection string
- **Fix:** Copy the connection string again from Vercel, make sure it's exact

### Issue 2: "Connection refused"
- **Cause:** Database might not be accessible from your IP
- **Fix:** Check Vercel database settings, ensure it allows connections from your IP

### Issue 3: "Database does not exist"
- **Cause:** Wrong database name in connection string
- **Fix:** Use the exact connection string from Vercel

## Quick Test

Run this to test your connection:
```bash
npx prisma db push
```

If it succeeds, you're good to go! ✅
