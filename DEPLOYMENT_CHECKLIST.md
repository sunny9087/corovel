# Deployment Checklist for Corovel

## ✅ Pre-Deployment Verification

### Build Status
- ✅ Build successful (`npm run build`)
- ✅ No linting errors
- ✅ Prisma schema validated
- ✅ TypeScript compilation successful

### Code Quality
- ✅ All features implemented and tested
- ✅ Streak calculation fixed (uses point transactions)
- ✅ Weekly progress target fixed (7 days instead of 5)
- ✅ Task completion unique constraint handled
- ✅ OAuth integration (Google) configured
- ✅ Error handling in place

---

## 🔧 Environment Variables Required for Production

### Required Variables

```env
# Database
DATABASE_URL="file:./prod.db"  # Or your production database path

# Application
APP_URL="https://yourdomain.com"  # Your production URL
NODE_ENV="production"

# Session/JWT (MUST be at least 32 characters, use a strong random string)
SESSION_SECRET="your-super-secret-random-string-min-32-chars"

# NextAuth
NEXTAUTH_URL="https://yourdomain.com"  # Must match your production URL
NEXTAUTH_SECRET="your-nextauth-secret-min-32-chars"  # Different from SESSION_SECRET
```

### Optional but Recommended

```env
# Email Configuration (for password reset, email verification)
SMTP_HOST="smtp.your-provider.com"
SMTP_PORT="587"
SMTP_USER="your-email@domain.com"
SMTP_PASSWORD="your-smtp-password"
SMTP_FROM="noreply@yourdomain.com"

# OAuth (Google)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Rate Limiting (Upstash Redis - recommended for production)
UPSTASH_REDIS_REST_URL="https://your-redis-url.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"
```

---

## 📋 Deployment Steps

### 1. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run migrations (if deploying to new environment)
npx prisma migrate deploy

# Or if using existing database, ensure schema is up to date
npx prisma db push
```

### 2. Environment Configuration
- [ ] Set all required environment variables in your hosting platform
- [ ] Ensure `SESSION_SECRET` and `NEXTAUTH_SECRET` are strong random strings (32+ chars)
- [ ] Update `APP_URL` and `NEXTAUTH_URL` to your production domain
- [ ] Configure OAuth redirect URIs in Google Cloud Console:
  - `https://yourdomain.com/api/auth/callback/google`

### 3. Build & Deploy
```bash
# Build the application
npm run build

# Start production server
npm start
```

### 4. Post-Deployment Verification
- [ ] Test user registration
- [ ] Test email/password login
- [ ] Test Google OAuth login (if configured)
- [ ] Test daily check-in
- [ ] Verify streak calculation
- [ ] Verify weekly progress (should show X/7)
- [ ] Test password reset flow
- [ ] Verify email verification
- [ ] Check leaderboard functionality
- [ ] Test referral system

---

## 🚨 Important Notes

### Database
- **SQLite**: Works for small to medium deployments
- **For production at scale**: Consider migrating to PostgreSQL or MySQL
- Ensure database file is backed up regularly
- Database file location: Set via `DATABASE_URL` environment variable

### Security
- **Never commit `.env` file** - it's already in `.gitignore`
- Use strong, random secrets for `SESSION_SECRET` and `NEXTAUTH_SECRET`
- Enable HTTPS in production
- Configure CORS if needed
- Review rate limiting configuration

### OAuth Setup
- Update Google OAuth redirect URIs to production URL
- Ensure `NEXTAUTH_URL` matches your production domain exactly
- See `GOOGLE_OAUTH_SETUP.md` for detailed instructions

### Email Configuration
- Configure SMTP for production email sending
- Without SMTP, emails will only log to console (not suitable for production)
- Test email sending after deployment

### Rate Limiting
- In-memory rate limiting works for single-instance deployments
- For multi-instance deployments, configure Upstash Redis
- See `lib/rate-limit.ts` for configuration

---

## 🌐 Platform-Specific Notes

### Vercel
- Set environment variables in Vercel dashboard
- SQLite may not work on Vercel (use external database)
- Consider using Vercel Postgres or external database
- Build command: `npm run build`
- Output directory: `.next`

### Railway
- Set environment variables in Railway dashboard
- SQLite works but consider external database for production
- Build command: `npm run build`
- Start command: `npm start`

### Docker
- Ensure `DATABASE_URL` points to persistent volume
- Run migrations in container startup script
- Example Dockerfile:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Self-Hosted
- Ensure Node.js 18+ is installed
- Set up process manager (PM2, systemd, etc.)
- Configure reverse proxy (Nginx, Caddy, etc.)
- Set up SSL certificates (Let's Encrypt)
- Configure firewall rules

---

## 🔍 Troubleshooting

### Build Errors
- Clear `.next` directory: `rm -rf .next`
- Clear `node_modules/.cache`: `rm -rf node_modules/.cache`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### Database Issues
- Ensure `DATABASE_URL` is correct
- Run `npx prisma generate` after schema changes
- Check database file permissions

### OAuth Not Working
- Verify `NEXTAUTH_URL` matches production domain exactly
- Check Google OAuth redirect URIs in Google Cloud Console
- Ensure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
- Check browser console for errors

### Session Issues
- Verify `SESSION_SECRET` is set and at least 32 characters
- Check cookie settings (secure, sameSite)
- Ensure HTTPS is enabled in production

---

## 📊 Current Features Status

- ✅ User Authentication (Email/Password + Google OAuth)
- ✅ Daily Check-in System
- ✅ Points System
- ✅ Referral Program
- ✅ Leaderboard
- ✅ Analytics Dashboard
- ✅ Email Verification
- ✅ Password Reset
- ✅ Task Management
- ✅ Streak Tracking (fixed)
- ✅ Weekly Progress (fixed - 7 days)
- ✅ CSRF Protection
- ✅ Rate Limiting
- ✅ Security Features

---

## 📝 Post-Deployment Tasks

1. Monitor application logs for errors
2. Set up database backups
3. Configure monitoring/alerting
4. Test all user flows
5. Update documentation with production URLs
6. Set up error tracking (Sentry, etc.)
7. Configure analytics (if needed)

---

## ✅ Ready for Deployment

Your application is ready for deployment! All critical issues have been fixed:
- ✅ Streak calculation working correctly
- ✅ Weekly progress shows 7 days
- ✅ Task completion handles unique constraints
- ✅ Build successful
- ✅ No linting errors
- ✅ Prisma schema valid

Good luck with your deployment! 🚀
