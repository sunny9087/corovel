# Setup Instructions for Multi-Task System & Interlink-Style Dashboard

## Overview
This update adds a comprehensive task system and a modern dark-themed dashboard inspired by Interlink-style design.

## Prerequisites
- Node.js 18+ installed
- SQLite database already exists (dev.db)
- All dependencies installed (`npm install`)

## Step-by-Step Setup

### 1. Apply Database Migration

The new schema adds `tasks` and `user_tasks` tables. Apply the migration:

```bash
# Set environment variable (if not already set)
$env:DATABASE_URL="file:./dev.db"

# Push schema changes to database
npx prisma db push

# OR use migration (if you prefer)
npx prisma migrate dev --name add_tasks_system
```

### 2. Seed Default Tasks

Initialize the default tasks in the database:

```bash
# Install tsx if not already installed
npm install --save-dev tsx

# Run the seeding script
npx tsx scripts/seed-tasks.ts
```

Or manually insert tasks via Prisma Studio:
```bash
npx prisma studio
```

Default tasks:
- **Daily Check-in**: 5 points (daily)
- **Referral Sign-up**: 10 points (referral)
- **Profile Completion**: 5 points (one-time)
- **Weekly Challenge**: 20 points (weekly, auto-awarded)

### 3. Regenerate Prisma Client

After schema changes, regenerate the client:

```bash
npx prisma generate
```

### 4. Restart Development Server

```bash
npm run dev
```

## Testing the System

### Test Daily Check-in
1. Login to dashboard
2. Click "Complete Task" on Daily Check-in card
3. Verify points increase by 5
4. Try clicking again (should show "Already Completed")

### Test Profile Completion
1. Login to dashboard
2. Click "Complete Task" on Profile Completion card
3. Verify points increase by 5
4. Card should show "Completed" status

### Test Weekly Challenge
1. Complete 5 daily check-ins within the same week
2. Weekly challenge should auto-award 20 points
3. Check progress ring updates

### Test Referral
1. Copy referral code from dashboard
2. Register new user with that code
3. Both users should receive 10 points

## New Features

### Task System
- **Daily Tasks**: Can be completed once per day
- **One-Time Tasks**: Can only be completed once
- **Referral Tasks**: Automatically completed during sign-up
- **Weekly Tasks**: Automatically awarded based on criteria

### Dashboard Features
- **Animated Points Counter**: Smooth number animation
- **Daily Streak Tracking**: Visual progress bar
- **Weekly Challenge Progress**: Circular progress ring
- **Task Cards**: Modern card-based layout with hover effects
- **Dark Theme**: Interlink-style dark color scheme

### API Endpoints

#### GET `/api/tasks/list`
Returns all active tasks with user completion status, streak, and weekly progress.

#### POST `/api/tasks/complete`
Completes a task and awards points. Requires:
- `taskId`: Task identifier

## Troubleshooting

### Migration Fails
If migration fails due to existing data:
```bash
# Backup your database first!
# Then try:
npx prisma db push --accept-data-loss
```

### Tasks Not Showing
1. Verify tasks were seeded: `npx prisma studio` → Check `tasks` table
2. Check task `is_active` field is `true`
3. Restart dev server after seeding

### Points Not Updating
1. Check browser console for errors
2. Verify CSRF token is being sent
3. Check API route logs in terminal

### Weekly Challenge Not Triggering
- Ensure you've completed 5 daily check-ins in the current week
- Weekly challenge resets every Monday
- Check `user_tasks` table to verify daily completions

## File Structure Changes

### New Files
- `lib/tasks.ts` - Task management utilities
- `components/TaskCard.tsx` - Task card component
- `components/ProgressRing.tsx` - Circular progress indicator
- `components/AnimatedPoints.tsx` - Animated points counter
- `app/api/tasks/list/route.ts` - List tasks API
- `app/api/tasks/complete/route.ts` - Complete task API
- `scripts/seed-tasks.ts` - Task seeding script
- `prisma/migrations/20251222000000_add_tasks_system/migration.sql` - Migration SQL

### Modified Files
- `prisma/schema.prisma` - Added Task and UserTask models
- `app/dashboard/page.tsx` - Complete redesign with Interlink theme
- `app/globals.css` - Dark theme styles
- `lib/auth.ts` - Added referral task completion
- `app/api/tasks/daily-checkin/route.ts` - Updated to use new task system
- `components/ReferralCodeDisplay.tsx` - Dark theme styling
- `components/LogoutButton.tsx` - Dark theme styling
- `components/PointsHistory.tsx` - Dark theme styling

## Legal Compliance

The dashboard footer displays the exact required disclaimer:
> "Tasks reward internal points only. Points have no monetary value and are not cryptocurrency."

No crypto or monetary language appears elsewhere in the UI.

## Build for Production

```bash
npm run build
npm start
```

Ensure all environment variables are set:
- `DATABASE_URL`
- `SESSION_SECRET`
- Other required vars (see README.md)

## Next Steps

1. Test all task types
2. Verify streak calculations
3. Test weekly challenge auto-award
4. Customize colors in `globals.css` if needed
5. Add more tasks via Prisma Studio or admin panel (future feature)
