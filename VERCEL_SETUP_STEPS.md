# 🚨 URGENT: Fix Vercel Database Error

## Error: "unable to open database file"

This happens because **SQLite doesn't work on Vercel**. You need PostgreSQL.

## ✅ Quick Fix (5 minutes)

### Step 1: Add Vercel Postgres Database

1. Go to your Vercel project: https://vercel.com/dashboard
2. Click **"Storage"** tab (in the top navigation)
3. Click **"Create Database"** button
4. Select **"Postgres"**
5. Click **"Create"**
6. Wait for it to provision (takes ~30 seconds)

### Step 2: Set Environment Variable

1. In Vercel, go to **Settings** → **Environment Variables**
2. Click **"Add New"**
3. Set:
   - **Key:** `DATABASE_URL`
   - **Value:** `$POSTGRES_PRISMA_URL` (Vercel auto-creates this variable)
   - **Environment:** Check all (Production, Preview, Development)
4. Click **"Save"**

### Step 3: Update Schema (Already Done ✅)

The schema has been updated to PostgreSQL. You just need to:
1. Generate Prisma client
2. Create migration
3. Deploy

### Step 4: Generate & Deploy

Run these commands locally:

```bash
# Generate Prisma client for PostgreSQL
npx prisma generate

# Create migration
npx prisma migrate dev --name init_postgres

# Commit and push
git add .
git commit -m "Switch to PostgreSQL for Vercel"
git push
```

### Step 5: Run Migrations on Vercel

After deployment, you need to run migrations. You have two options:

**Option A: Using Vercel CLI (Recommended)**
```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login
vercel login

# Link your project
vercel link

# Run migrations
npx prisma migrate deploy
```

**Option B: Add to package.json scripts**
Add this to your `package.json`:
```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

Then Vercel will automatically run migrations on each deploy.

### Step 6: Verify

1. Check Vercel logs - should see successful database connection
2. Try registering a new user
3. Try logging in

## 🔧 Alternative: Use Supabase (Free)

If you prefer not to use Vercel Postgres:

1. Sign up at https://supabase.com
2. Create new project
3. Go to Settings → Database
4. Copy the "Connection string" (URI format)
5. Set `DATABASE_URL` in Vercel to that connection string
6. Follow steps 3-6 above

## ⚠️ Important Notes

- **Local Development:** Keep using SQLite locally by setting `DATABASE_URL="file:./dev.db"` in your local `.env` file
- **Production:** The code automatically detects PostgreSQL vs SQLite based on the `DATABASE_URL` format
- **Migrations:** Always run `npx prisma migrate deploy` after schema changes in production

## 🐛 Troubleshooting

If you still get errors:

1. **Check environment variable is set:**
   - Go to Vercel → Settings → Environment Variables
   - Verify `DATABASE_URL` is set to `$POSTGRES_PRISMA_URL`

2. **Check Prisma client is generated:**
   ```bash
   npx prisma generate
   ```

3. **Check migrations are run:**
   ```bash
   npx prisma migrate deploy
   ```

4. **Check Vercel build logs:**
   - Look for Prisma-related errors
   - Make sure `prisma generate` runs during build

## ✅ After Fix

Your login and register should work! The error "unable to open database file" will be gone because you're now using PostgreSQL instead of SQLite.
