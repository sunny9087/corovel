# Troubleshooting Guide

## If the app isn't opening or showing errors:

### 1. Check Database Connection
```bash
# Verify database exists
$env:DATABASE_URL="file:./dev.db"
npx prisma db push
npx prisma generate
```

### 2. Check Dev Server
```bash
# Make sure dev server is running
npm run dev
```

The server should start on `http://localhost:3000` (or another port if 3000 is busy).

### 3. Test Analytics
Visit: `http://localhost:3000/test-analytics`

This page will:
- Test database connection
- Test analytics functions
- Show any errors clearly

### 4. Common Issues

#### Issue: "Cannot find module" errors
**Solution:**
```bash
npm install
npx prisma generate
```

#### Issue: Database errors
**Solution:**
```bash
$env:DATABASE_URL="file:./dev.db"
npx prisma db push
```

#### Issue: TypeScript errors
**Solution:**
```bash
npm run build
```
Check the output for specific errors.

#### Issue: Browser console errors
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for failed requests

### 5. Verify All Features

#### Test Dashboard
1. Login/Register
2. Visit `/dashboard`
3. Should see:
   - Points display
   - Leaderboard
   - Tasks
   - Retention hooks (if conditions met)

#### Test Analytics
1. Visit `/admin` (if ADMIN_EMAILS is set)
2. Should see analytics summary

#### Test Leaderboard
1. Create multiple users
2. Complete tasks to earn points
3. Visit dashboard
4. Leaderboard should show top 10

### 6. Check Logs

#### Server Logs
Check the terminal where `npm run dev` is running for errors.

#### Browser Console
Open DevTools (F12) → Console tab

### 7. Reset Everything (Last Resort)

```bash
# Delete database
Remove-Item dev.db

# Regenerate Prisma
$env:DATABASE_URL="file:./dev.db"
npx prisma db push
npx prisma generate

# Reinstall dependencies
Remove-Item -Recurse node_modules
npm install

# Clear Next.js cache
Remove-Item -Recurse .next

# Restart dev server
npm run dev
```

## Quick Diagnostic Commands

```bash
# Check if everything compiles
npm run build

# Check database
$env:DATABASE_URL="file:./dev.db"
npx prisma studio
# This opens a GUI to view database

# Check for linting errors
npm run lint
```

## Still Having Issues?

1. Check the terminal output from `npm run dev`
2. Check browser console (F12)
3. Visit `/test-analytics` to see specific errors
4. Verify all environment variables are set
