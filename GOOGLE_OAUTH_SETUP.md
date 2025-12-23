# Google OAuth Setup Guide for Corovel

This guide will walk you through setting up Google OAuth authentication for your Corovel application.

## Part A: Google Cloud Console Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click **"New Project"**
4. Enter project name: `Corovel` (or your preferred name)
5. Click **"Create"**
6. Wait for the project to be created and select it

### Step 2: Configure OAuth Consent Screen

1. In the left sidebar, go to **"APIs & Services"** → **"OAuth consent screen"**
2. Choose **"External"** user type (unless you have a Google Workspace account)
3. Click **"Create"**
4. Fill in the required information:
   - **App name**: `Corovel`
   - **User support email**: Your email address
   - **Developer contact information**: Your email address
5. Click **"Save and Continue"**
6. On **Scopes** page, click **"Save and Continue"** (no additional scopes needed)
7. On **Test users** page, add your test email if needed, then click **"Save and Continue"**
8. Review and click **"Back to Dashboard"**

### Step 3: Create OAuth 2.0 Credentials

1. In the left sidebar, go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. Select application type: **"Web application"**
4. Give it a name: `Corovel Web Client`
5. Under **"Authorized redirect URIs"**, click **"+ ADD URI"** and add:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
6. Click **"Create"**
7. **Important**: Copy the **Client ID** and **Client Secret** immediately (you won't see the secret again)

### Step 4: Add Production Redirect URI (When Deploying)

When you deploy to production (e.g., Vercel, Netlify), you'll need to:
1. Go back to Google Cloud Console → Credentials
2. Edit your OAuth client
3. Add your production redirect URI:
   ```
   https://yourdomain.com/api/auth/callback/google
   ```

---

## Part B: Environment Variables Setup

### Step 1: Create/Update `.env.local` File

Create or update the `.env.local` file in your project root:

```env
# Database
DATABASE_URL="file:./dev.db"

# Application
APP_URL="http://localhost:3000"
NODE_ENV="development"

# Session/JWT (must be at least 32 characters in production)
SESSION_SECRET="your-super-secret-session-key-minimum-32-characters-long"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-nextauth-key-minimum-32-characters-long"

# Google OAuth (Required for Google login)
GOOGLE_CLIENT_ID="your-google-client-id-here.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret-here"

# Email (Optional - for email verification)
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="your-email@example.com"
SMTP_PASSWORD="your-password"
SMTP_FROM="noreply@corovel.app"

# Redis for Rate Limiting (Optional)
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""
```

### Step 2: Generate Secure Secrets

Generate secure secrets for `SESSION_SECRET` and `NEXTAUTH_SECRET`:

**On Windows (PowerShell):**
```powershell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString() + [System.Guid]::NewGuid().ToString()))
```

**On Mac/Linux:**
```bash
openssl rand -base64 32
```

**Or use online generator:**
https://generate-secret.vercel.app/32

### Step 3: Replace Placeholder Values

Replace the placeholder values in `.env.local`:
- `GOOGLE_CLIENT_ID`: Paste the Client ID from Google Cloud Console
- `GOOGLE_CLIENT_SECRET`: Paste the Client Secret from Google Cloud Console
- `SESSION_SECRET`: Use the generated secret
- `NEXTAUTH_SECRET`: Use the generated secret (can be same as SESSION_SECRET)

---

## Part C: Database Migration

The database schema already supports OAuth (Account model exists). If you haven't run migrations yet:

```bash
npx prisma db push
```

Or if you want to create a migration:

```bash
npx prisma migrate dev --name add_oauth_support
```

---

## Part D: Testing Locally

### Step 1: Start the Development Server

```bash
npm run dev
```

### Step 2: Test Google OAuth Login

1. Open `http://localhost:3000/login`
2. You should see a **"Continue with Google"** button below the email/password form
3. Click the button
4. You'll be redirected to Google's sign-in page
5. Sign in with your Google account
6. Authorize the application
7. You'll be redirected back to `/dashboard`

### Step 3: Verify User Creation

1. Check your database - a new user should be created with:
   - Email from Google account
   - `emailVerified: true`
   - `passwordHash: null`
   - Name and profile image from Google
   - Unique referral code

### Step 4: Test Existing User Login

1. If you already have an account with the same email (created via email/password):
2. Click "Continue with Google" with that email
3. The accounts should be linked automatically
4. You can now use either login method

---

## How It Works

### New User Flow (Google OAuth):

1. User clicks "Continue with Google"
2. Redirected to Google sign-in
3. User authorizes
4. Google redirects back to `/api/auth/callback/google`
5. NextAuth creates new user in database:
   - Email from Google
   - Name and profile picture from Google
   - `emailVerified: true` (Google emails are verified)
   - `passwordHash: null` (no password needed)
   - Unique referral code generated
6. Session created
7. User redirected to `/dashboard`

### Existing User Flow (Google OAuth):

1. User clicks "Continue with Google"
2. User signs in with Google (same email as existing account)
3. NextAuth finds existing user by email
4. OAuth account is linked to existing user
5. User profile updated with Google data if available
6. Session created
7. User redirected to `/dashboard`

### Security Features:

- ✅ CSRF protection (built into NextAuth)
- ✅ Secure session management
- ✅ Email verification (automatic for Google accounts)
- ✅ Account linking (prevents duplicate accounts)
- ✅ Rate limiting (existing protection still applies)

---

## Troubleshooting

### Issue: "Continue with Google" button doesn't appear

**Solution:**
- Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in `.env.local`
- Restart the dev server after adding environment variables
- Check browser console for errors

### Issue: "Redirect URI mismatch"

**Solution:**
- Verify redirect URI in Google Cloud Console exactly matches:
  ```
  http://localhost:3000/api/auth/callback/google
  ```
- Make sure there are no trailing slashes
- Check that `NEXTAUTH_URL` in `.env.local` matches

### Issue: "Configuration error"

**Solution:**
- Ensure `NEXTAUTH_SECRET` is set in `.env.local`
- Regenerate secret if needed
- Restart dev server

### Issue: User not created/linked properly

**Solution:**
- Check database connection
- Verify Prisma schema is up to date: `npx prisma db push`
- Check server logs for errors

---

## Production Deployment

When deploying to production:

1. **Update Redirect URIs in Google Cloud Console:**
   - Add your production URL: `https://yourdomain.com/api/auth/callback/google`

2. **Update Environment Variables:**
   - Set `NEXTAUTH_URL` to your production URL
   - Use strong, unique secrets for `SESSION_SECRET` and `NEXTAUTH_SECRET`
   - Set `NODE_ENV=production`

3. **Test Production OAuth:**
   - Visit your production login page
   - Test Google OAuth flow
   - Verify user creation and login

---

## Summary

✅ **What's Working:**
- Google OAuth login/signup
- Automatic user creation
- Account linking for existing users
- Session management
- Email/password auth still works
- Protected routes work with both auth methods

✅ **Files Created/Updated:**
- `lib/auth-nextauth.ts` - NextAuth configuration
- `components/GoogleSignInButton.tsx` - Google button component
- `components/OAuthButtons.tsx` - OAuth buttons wrapper
- `app/api/auth/providers/route.ts` - Provider availability check
- `app/providers.tsx` - SessionProvider wrapper
- `app/layout.tsx` - Updated to include Providers

✅ **No Breaking Changes:**
- Existing email/password authentication works
- Existing users can still login
- Database schema compatible
- All existing features preserved
