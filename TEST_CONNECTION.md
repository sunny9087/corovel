# Test Your Database Connection

## Quick Test Commands

### 1. Test Connection
```bash
npx prisma db push
```

### 2. If Connection Works, Run Migrations
```bash
npx prisma migrate dev
```

### 3. Start Dev Server
```bash
npm run dev
```

## What to Check

1. **.env file exists** in project root ✅
2. **DATABASE_URL is set** to PostgreSQL connection string
3. **Connection string format:**
   - Starts with `postgresql://`
   - Contains username, password, host, port, database
   - Example: `postgresql://user:pass@host:5432/db?sslmode=require`

4. **From Vercel:**
   - Go to Storage → Postgres → ".env.local" tab
   - Copy `POSTGRES_PRISMA_URL` value
   - Paste as `DATABASE_URL` in your local `.env`

## If You Get Errors

### "Authentication failed"
- Double-check the connection string from Vercel
- Make sure you copied the entire string
- Verify no extra spaces or characters

### "Connection refused"  
- Database might be paused or not accessible
- Check Vercel database status
- Verify your IP is allowed (if database has IP restrictions)

### "Database does not exist"
- Use the exact connection string from Vercel
- Don't modify any part of it

## Success Indicators

✅ `npx prisma db push` completes without errors
✅ `npm run dev` starts without database errors
✅ You can access the app at `http://localhost:3000`
