# Quick Start Guide - Analytics, Leaderboard & Retention Hooks

## 🚀 Quick Setup (3 Steps)

### Step 1: Apply Database Migration
```bash
$env:DATABASE_URL="file:./dev.db"
npx prisma db push
npx prisma generate
```

### Step 2: Start Server
```bash
npm run dev
```

### Step 3: Test Features
1. Visit `http://localhost:3000` (or the port shown)
2. Register/Login
3. View dashboard with new features

## 📊 What's New

### Analytics (Automatic)
- All user actions are tracked automatically
- No configuration needed
- View analytics at `/admin` (if ADMIN_EMAILS is set)

### Leaderboard
- Shows top 10 users by points
- Your rank is highlighted
- Updates automatically

### Retention Hooks
- **Streak Warning**: Appears if you have a streak but haven't checked in today
- **Social Motivation**: Appears if you're in top 20%
- **Progress Feedback**: Shows when you earn points

## 🎯 Key Features

### Analytics Events Tracked
- ✅ User signup
- ✅ User login
- ✅ Daily check-in
- ✅ Task completion

### Leaderboard
- ✅ Top 10 users
- ✅ Your position highlighted
- ✅ Email privacy (masked)

### Retention Messages
- ✅ Streak warnings
- ✅ Social motivation
- ✅ Points feedback

## 🔧 Configuration

### Admin Access (Optional)
Add to `.env`:
```env
ADMIN_EMAILS="your-email@example.com"
```

If not set, all users can access `/admin`.

## ✅ Verification Checklist

- [ ] Database migration applied
- [ ] Prisma client regenerated
- [ ] Server starts without errors
- [ ] Dashboard loads with leaderboard
- [ ] Retention hooks appear conditionally
- [ ] Admin page accessible (if configured)
- [ ] Legal disclaimer visible in footer

## 📝 Testing

1. **Test Analytics**: Register → Login → Complete task → Check `/admin`
2. **Test Leaderboard**: Create multiple users → View dashboard
3. **Test Retention**: 
   - Have streak but don't check in → See warning
   - Be in top 20% → See motivation
   - Complete task → See points feedback

## 🎨 UI Features

- Dark Interlink-style theme
- Smooth animations
- Mobile responsive
- Clean card-based layout

## ⚠️ Important Notes

- Analytics tracking is **non-blocking** (won't slow down operations)
- Leaderboard uses **total points** (can be enhanced for weekly)
- Retention hooks are **subtle and non-intrusive**
- All features respect **legal compliance** (no crypto language)

---

**Everything is ready to use!** 🎉
