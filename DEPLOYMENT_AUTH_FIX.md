# Authentication Fix for Production Deployment

## Issues Identified

1. **Missing HTTPS in URLs** - `NEXTAUTH_URL` and `APP_URL` were missing `https://` protocol
2. **Cookie Domain Configuration** - Cookies weren't properly configured for production domain
3. **Rate Limiting Error Handling** - Rate limiter failures were causing 500 errors
4. **Missing Error Logging** - Insufficient error details for debugging production issues

## Fixes Applied

### 1. Environment Variables (`.env`)
Updated URLs to include proper protocol:
```env
NEXTAUTH_URL=https://www.corovel.com
APP_URL=https://www.corovel.com
```

### 2. Cookie Configuration (`lib/jwt.ts` & `lib/csrf.ts`)
- Added domain-specific cookie configuration for production
- Set `domain: '.corovel.com'` to work with both `www.corovel.com` and `corovel.com`
- Maintained secure settings for production (`secure: true`, `httpOnly: true` for session)

### 3. Rate Limiting (`app/api/auth/login/route.ts` & `register/route.ts`)
- Added try-catch blocks around rate limiting checks
- Prevents rate limiter failures from causing 500 errors
- Continues operation if rate limiting service is unavailable

### 4. Error Logging
- Enhanced error logging with detailed stack traces
- Added error details (message, stack, name) for better debugging

## Deployment Steps

### Step 1: Update Vercel Environment Variables
Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Ensure these variables are set correctly:

```env
DATABASE_URL=your_database_connection_string_here
NEXTAUTH_SECRET=your_nextauth_secret_min_32_chars
SESSION_SECRET=your_session_secret_min_32_chars
NEXTAUTH_URL=https://www.corovel.com
APP_URL=https://www.corovel.com
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

**Note:** Replace the placeholder values with your actual credentials from your Vercel project settings.

**Important:** 
- ✅ URLs MUST include `https://`
- ✅ No trailing slashes on URLs
- ✅ All secrets should be production-ready (keep them secret!)

### Step 2: Update Google OAuth Redirect URIs
Go to Google Cloud Console → APIs & Services → Credentials → Your OAuth Client

Add these authorized redirect URIs:
```
https://www.corovel.com/api/auth/callback/google
https://corovel.com/api/auth/callback/google
```

Also add authorized JavaScript origins:
```
https://www.corovel.com
https://corovel.com
```

### Step 3: Redeploy on Vercel

Option A - Automatic (Recommended):
```bash
git add .
git commit -m "fix: authentication issues for production deployment"
git push origin main
```

Option B - Manual:
- Go to Vercel Dashboard
- Click "Redeploy" on the latest deployment
- Wait for deployment to complete

### Step 4: Test Authentication

After deployment completes, test:

1. **Registration Flow:**
   - Go to https://www.corovel.com/register
   - Create a new account
   - Check browser console for errors
   - Verify email is sent (check logs if not)

2. **Login Flow:**
   - Go to https://www.corovel.com/login
   - Login with test credentials
   - Should redirect to dashboard

3. **Google OAuth:**
   - Click "Continue with Google"
   - Should redirect properly through OAuth flow
   - Should create account or login successfully

4. **Cookie Verification:**
   - Open DevTools → Application → Cookies
   - Should see `user-session` cookie with:
     - Domain: `.corovel.com`
     - Secure: ✓
     - HttpOnly: ✓
     - SameSite: Lax

### Step 5: Monitor Logs

Check Vercel deployment logs for any errors:
```bash
vercel logs --follow
```

Or in Vercel Dashboard → Your Deployment → Runtime Logs

Look for:
- "Login error:" entries
- "Registration error:" entries
- Database connection issues
- Rate limiting warnings

## Testing Locally

Before deploying, test locally with production-like settings:

1. Update your local `.env` file with the changes
2. Run the development server:
   ```bash
   npm run dev
   ```
3. Test login and registration at `http://localhost:3000`

## Common Issues & Solutions

### Issue: "Invalid CSRF token"
**Solution:** Clear browser cookies and try again. CSRF tokens are session-based.

### Issue: "Login failed. Please try again."
**Solution:** 
- Check Vercel logs for detailed error
- Verify DATABASE_URL is correct
- Ensure database is accessible from Vercel

### Issue: "Configuration" error on OAuth
**Solution:**
- Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in Vercel
- Check redirect URIs in Google Console match exactly

### Issue: Cookies not being set
**Solution:**
- Ensure URLs have `https://` in production
- Check browser console for cookie warnings
- Verify domain settings in cookie configuration

### Issue: Rate limiting errors
**Solution:**
- The fixes should prevent this from breaking auth
- Consider adding Upstash Redis for production rate limiting
- Add these env vars if you set up Redis:
  ```env
  UPSTASH_REDIS_REST_URL=your_redis_url
  UPSTASH_REDIS_REST_TOKEN=your_redis_token
  ```

## Rollback Plan

If issues persist after deployment:

1. **Revert Code:**
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Or redeploy previous version:**
   - Go to Vercel Dashboard → Deployments
   - Find last working deployment
   - Click "⋯" → "Redeploy"

## Additional Recommendations

### 1. Add Health Check Endpoint
Create `app/api/health/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ 
      status: "ok", 
      database: "connected",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { status: "error", database: "disconnected" },
      { status: 500 }
    );
  }
}
```

### 2. Set Up Error Monitoring
Consider adding error monitoring service like:
- Sentry
- LogRocket
- Datadog

### 3. Enable Vercel Analytics
Enable analytics in Vercel Dashboard to track:
- Page load times
- API response times
- User sessions

## Need Help?

If authentication still isn't working:

1. Check Vercel logs: `vercel logs`
2. Test database connection: Visit `/api/health`
3. Verify all environment variables in Vercel Dashboard
4. Check browser console for client-side errors
5. Review network tab for failed requests

## Checklist

Before marking this as complete, verify:

- [ ] Environment variables updated in Vercel with `https://`
- [ ] Google OAuth redirect URIs updated
- [ ] Code deployed to Vercel
- [ ] Registration works on production
- [ ] Login works on production
- [ ] Google OAuth works on production
- [ ] Cookies are being set properly
- [ ] No 500 errors in production logs
- [ ] Dashboard loads after successful login
