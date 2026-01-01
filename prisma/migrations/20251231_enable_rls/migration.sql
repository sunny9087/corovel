-- Enable Row Level Security on all tables
-- This protects against direct access via Supabase's PostgREST API

-- Enable RLS on users table
ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;

-- Enable RLS on accounts table
ALTER TABLE "public"."accounts" ENABLE ROW LEVEL SECURITY;

-- Enable RLS on tasks table
ALTER TABLE "public"."tasks" ENABLE ROW LEVEL SECURITY;

-- Enable RLS on user_tasks table
ALTER TABLE "public"."user_tasks" ENABLE ROW LEVEL SECURITY;

-- Enable RLS on daily_tasks table
ALTER TABLE "public"."daily_tasks" ENABLE ROW LEVEL SECURITY;

-- Enable RLS on point_transactions table
ALTER TABLE "public"."point_transactions" ENABLE ROW LEVEL SECURITY;

-- Enable RLS on analytics_events table
ALTER TABLE "public"."analytics_events" ENABLE ROW LEVEL SECURITY;

-- Create policies to allow the service role (Prisma connection) full access
-- The postgres/service_role user bypasses RLS, so these policies mainly
-- block access from Supabase's anon/authenticated keys via PostgREST

-- Policy for users table - allow service role full access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'users'
      AND policyname = 'service_role_all_users'
  ) THEN
    CREATE POLICY "service_role_all_users" ON "public"."users"
      FOR ALL
      TO postgres, service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Policy for accounts table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'accounts'
      AND policyname = 'service_role_all_accounts'
  ) THEN
    CREATE POLICY "service_role_all_accounts" ON "public"."accounts"
      FOR ALL
      TO postgres, service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Policy for tasks table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'tasks'
      AND policyname = 'service_role_all_tasks'
  ) THEN
    CREATE POLICY "service_role_all_tasks" ON "public"."tasks"
      FOR ALL
      TO postgres, service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Policy for user_tasks table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_tasks'
      AND policyname = 'service_role_all_user_tasks'
  ) THEN
    CREATE POLICY "service_role_all_user_tasks" ON "public"."user_tasks"
      FOR ALL
      TO postgres, service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Policy for daily_tasks table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'daily_tasks'
      AND policyname = 'service_role_all_daily_tasks'
  ) THEN
    CREATE POLICY "service_role_all_daily_tasks" ON "public"."daily_tasks"
      FOR ALL
      TO postgres, service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Policy for point_transactions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'point_transactions'
      AND policyname = 'service_role_all_point_transactions'
  ) THEN
    CREATE POLICY "service_role_all_point_transactions" ON "public"."point_transactions"
      FOR ALL
      TO postgres, service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Policy for analytics_events table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'analytics_events'
      AND policyname = 'service_role_all_analytics_events'
  ) THEN
    CREATE POLICY "service_role_all_analytics_events" ON "public"."analytics_events"
      FOR ALL
      TO postgres, service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;
