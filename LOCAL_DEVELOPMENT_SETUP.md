# Local Development Setup

## ⚠️ Important: Database Configuration

Since the schema is now **PostgreSQL** (required for Vercel deployment), you need a PostgreSQL database for local development too.

## ✅ Quick Setup Options

### Option 1: Use Supabase (Free, Recommended)

1. Sign up at [supabase.com](https://supabase.com) (free tier)
2. Create a new project
3. Go to **Settings** → **Database**
4. Copy the **Connection string** (URI format)
5. Add to your local `.env` file:
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
   ```

### Option 2: Use Local PostgreSQL

1. Install PostgreSQL locally:
   - Windows: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
   - Mac: `brew install postgresql`
   - Linux: `sudo apt-get install postgresql`

2. Create a database:
   ```bash
   createdb corovel_dev
   ```

3. Add to your `.env` file:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/corovel_dev"
   ```
   (Replace `password` with your PostgreSQL password)

### Option 3: Use Docker PostgreSQL

1. Run PostgreSQL in Docker:
   ```bash
   docker run --name corovel-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=corovel_dev -p 5432:5432 -d postgres
   ```

2. Add to your `.env` file:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/corovel_dev"
   ```

### Option 4: Use Vercel Postgres for Local Dev

1. Get your Vercel Postgres connection string:
   - Vercel Dashboard → Storage → Postgres → ".env.local" tab
   - Copy `POSTGRES_PRISMA_URL`

2. Add to your local `.env` file:
   ```env
   DATABASE_URL="paste-the-connection-string-here"
   ```

## 📝 After Setting Up Database

1. **Run migrations:**
   ```bash
   npx prisma migrate dev
   ```

2. **Start dev server:**
   ```bash
   npm run dev
   ```

## 🔄 Switching Between Local and Production

- **Local:** Uses `DATABASE_URL` from `.env` file
- **Vercel:** Automatically uses `POSTGRES_PRISMA_URL` (set by Vercel)

The code automatically detects which environment you're in and uses the appropriate database URL.

## ⚠️ Note

You **cannot** use SQLite locally anymore because:
- The schema is PostgreSQL
- Prisma client is generated for PostgreSQL
- Vercel requires PostgreSQL

You must use PostgreSQL for both local development and production.
