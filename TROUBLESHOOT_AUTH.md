# Login/Register Troubleshooting Steps

## Quick Diagnosis

1. **Check Vercel Environment Variables**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Verify these are ALL set:
     - ✅ `DATABASE_URL` - Your Supabase PostgreSQL connection string
     - ✅ `NEXTAUTH_URL=https://www.corovel.com` (with https://)
     - ✅ `APP_URL=https://www.corovel.com` (with https://)
     - ✅ `SESSION_SECRET` - A secure random string (min 32 chars)
     - ✅ `NEXTAUTH_SECRET` - A secure random string (min 32 chars)
     - ✅ `GOOGLE_CLIENT_ID` - From Google Cloud Console
     - ✅ `GOOGLE_CLIENT_SECRET` - From Google Cloud Console

2. **Test Deployment Status**
   - Visit `https://www.corovel.com/api/debug/status`
   - Should return JSON with:
     ```json
     {
       "status": "ok",
       "environment": { ... },
       "database": "connected"
     }
     ```
   - If database shows error, check DATABASE_URL in Vercel

3. **Test Login Page**
   - Go to `https://www.corovel.com/login`
   - Open DevTools → Console (F12)
   - Enter test email and password
   - Click Sign In
   - Check console for error messages
   - Look for "Login error:" logs

4. **Check Browser Cookies**
   - DevTools → Application → Cookies → www.corovel.com
   - Should see `csrf-token` cookie
   - If missing, check if cookies are being blocked

5. **Test Registration Page**
   - Go to `https://www.corovel.com/register`
   - Open DevTools → Console (F12)
   - Fill in email and password
   - Click "Join Now"
   - Check console for error messages

## Common Issues & Solutions

### Issue: "Login failed" with no details
**Check:**
1. Database connection: Visit `/api/debug/status`
2. Email exists in database (use direct DB query if needed)
3. Password is correct
4. Check Vercel logs for detailed error

### Issue: "CSRF token error"
**Check:**
1. Browser cookies are enabled
2. `/api/csrf-token` endpoint is responding
3. Cookies are being set with `domain: undefined` (not domain-specific)

### Issue: "Failed to fetch"
**Check:**
1. CSRF fetch failed - network issue or endpoint error
2. Check browser Network tab for failed requests
3. Verify `/api/csrf-token` returns 200 OK

### Issue: Registration succeeds but email not received
**This is expected if SMTP is not configured**
- Email verification is optional
- User should still be able to login
- Check Vercel logs for email service errors

### Issue: Login page shows "Configuration" error
**This is OAuth setup issue, not auth service issue**
- Check Google OAuth credentials in Vercel
- Verify redirect URIs in Google Cloud Console
- Email/password login should still work

## Advanced Debugging

### Check Vercel Logs
```bash
vercel logs --follow
```

### What to look for in logs:
- `Login error:` - Check the detailed error message
- `Registration error:` - Check the detailed error message
- `Database error` - Connection issue
- `Rate limit` - Too many requests

### Direct Database Query (if you have access)
```sql
SELECT id, email, email_verified FROM users LIMIT 5;
```

### Test CSRF Endpoint Directly
Open browser console and run:
```javascript
fetch('/api/csrf-token')
  .then(r => r.json())
  .then(d => console.log(d))
```

Should return:
```json
{ "token": "..." }
```

## Deployment Checklist

Before saying auth works, verify:

- [ ] Vercel deployment is green (no errors)
- [ ] All env variables are set in Vercel
- [ ] `/api/debug/status` returns `"database": "connected"`
- [ ] Can see `csrf-token` cookie in DevTools
- [ ] Can create account (registration succeeds)
- [ ] Can login with credentials (redirects to dashboard)
- [ ] Dashboard loads after login
- [ ] User stays logged in after page refresh
- [ ] Google OAuth works (optional, for OAuth testing)

## Quick Fix Checklist

If nothing is working:

1. ✅ Verify DATABASE_URL is set in Vercel
2. ✅ Verify NEXTAUTH_URL has `https://` prefix
3. ✅ Verify APP_URL has `https://` prefix
4. ✅ Verify SESSION_SECRET is set (min 32 chars)
5. ✅ Clear Vercel build cache and redeploy
6. ✅ Check `/api/debug/status` endpoint
7. ✅ Test with email/password first (not Google OAuth)
8. ✅ Check browser console for JavaScript errors
9. ✅ Check Vercel runtime logs for server errors

## Next Steps

1. Test the `/api/debug/status` endpoint
2. Share what you see in the console when trying to login
3. Share any error messages from the debug endpoint
4. I'll help fix based on the actual error

Remember: The database is Supabase PostgreSQL, so DATABASE_URL must be the Supabase connection string!
