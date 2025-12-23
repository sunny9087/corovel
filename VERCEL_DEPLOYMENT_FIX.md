# Vercel Deployment Fix - Database Configuration

## 🚨 Problem
SQLite doesn't work on Vercel's serverless functions because:
- Vercel functions are ephemeral (no persistent file system)
- `better-sqlite3` has native dependencies that may not work in Vercel's environment
- Database file cannot be written/read in serverless environment

## ✅ Solution
The code has been updated to support both SQLite (local dev) and PostgreSQL (production).

### Option 1: Use Vercel Postgres (Recommended)

1. **Add Vercel Postgres to your project:**
   - Go to your Vercel project dashboard
   - Navigate to "Storage" tab
   - Click "Create Database"
   - Select "Postgres"
   - Create the database

2. **Update Prisma Schema:**
   ```bash
   # The schema needs to support PostgreSQL
   # Update datasource in prisma/schema.prisma
   ```

3. **Set Environment Variable:**
   - Vercel will automatically set `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING`
   - In Vercel dashboard, go to Settings → Environment Variables
   - Set `DATABASE_URL` to: `$POSTGRES_PRISMA_URL` (or use the connection string from Vercel)

4. **Update Prisma Schema for PostgreSQL:**
   Change `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"  // Changed from "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

5. **Run Migrations:**
   ```bash
   npx prisma migrate deploy
   ```

### Option 2: Use Turso (SQLite in the Cloud)

1. **Sign up at [turso.tech](https://turso.tech)**
2. **Create a database**
3. **Get connection string** (looks like: `libsql://...`)
4. **Set in Vercel:**
   - Environment Variable: `DATABASE_URL`
   - Value: Your Turso connection string
5. **Update Prisma Schema:**
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```
6. **Install Turso Prisma adapter:**
   ```bash
   npm install @libsql/client
   ```
7. **Update `lib/prisma.ts`** to use Turso adapter (see Turso docs)

### Option 3: Use Supabase (PostgreSQL)

1. **Sign up at [supabase.com](https://supabase.com)**
2. **Create a new project**
3. **Get connection string** from Settings → Database
4. **Set in Vercel:**
   - Environment Variable: `DATABASE_URL`
   - Value: Your Supabase connection string (use connection pooling URL)
5. **Update Prisma Schema:**
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
6. **Run migrations:**
   ```bash
   npx prisma migrate deploy
   ```

## 🔧 Quick Fix Steps (Vercel Postgres)

1. **In Vercel Dashboard:**
   - Go to your project → Storage → Create Database → Postgres

2. **Update `prisma/schema.prisma`:**
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. **Update model fields for PostgreSQL:**
   - Change `String` to `String @db.Text` for text fields
   - Change `Int` to `Int @db.Integer` for integers
   - Add `@default(uuid())` or `@default(cuid())` for IDs

4. **Create migration:**
   ```bash
   npx prisma migrate dev --name init_postgres
   ```

5. **Set environment variable in Vercel:**
   - `DATABASE_URL` = `$POSTGRES_PRISMA_URL` (or the connection string from Vercel)

6. **Deploy:**
   ```bash
   git add .
   git commit -m "Switch to PostgreSQL for Vercel"
   git push
   ```

## 📝 Updated Prisma Schema for PostgreSQL

Here's what your `prisma/schema.prisma` should look like for PostgreSQL:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../lib/generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                    String            @id @default(cuid())
  email                 String            @unique @db.Text
  passwordHash          String?           @map("password_hash") @db.Text
  name                  String?           @db.Text
  image                 String?           @db.Text
  points                Int               @default(0)
  referralCode          String            @unique @map("referral_code") @db.Text
  referredBy            String?          @map("referred_by") @db.Text
  emailVerified         Boolean           @default(false) @map("email_verified")
  emailVerificationToken String?         @map("email_verification_token") @db.Text
  resetPasswordToken    String?          @map("reset_password_token") @db.Text
  resetPasswordExpires  DateTime?        @map("reset_password_expires")
  createdAt             DateTime          @default(now()) @map("created_at")
  accounts              Account[]
  dailyTasks            DailyTask[]
  pointTransactions     PointTransaction[]
  userTasks             UserTask[]

  @@map("users")
}

// ... (rest of models with @db.Text annotations for String fields)
```

## ⚠️ Important Notes

- **Local Development:** Keep using SQLite locally by setting `DATABASE_URL="file:./dev.db"` in your local `.env`
- **Production:** Use PostgreSQL connection string in Vercel environment variables
- **Migrations:** Run `npx prisma migrate deploy` after setting up production database
- **Prisma Generate:** Run `npx prisma generate` after schema changes

## 🚀 After Fixing

1. Test login/register endpoints
2. Verify database connection in Vercel logs
3. Check that data persists across deployments
