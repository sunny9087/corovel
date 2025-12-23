# Quick Start: Google OAuth Setup

## 3-Step Setup Process

### Step 1: Get Google OAuth Credentials (5 minutes)

1. Visit: https://console.cloud.google.com/
2. Create new project: "Corovel"
3. Go to: **APIs & Services** → **Credentials**
4. Click: **+ CREATE CREDENTIALS** → **OAuth client ID**
5. Application type: **Web application**
6. Name: `Corovel Web Client`
7. Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
8. Click **Create** and **copy** Client ID and Client Secret

### Step 2: Add to Environment Variables (2 minutes)

Add these lines to your `.env.local` file:

```env
GOOGLE_CLIENT_ID="paste-your-client-id-here"
GOOGLE_CLIENT_SECRET="paste-your-client-secret-here"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-32-character-string"
```

**Generate NEXTAUTH_SECRET:**
- Windows PowerShell: `[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString() + [System.Guid]::NewGuid().ToString()))`
- Mac/Linux: `openssl rand -base64 32`
- Online: https://generate-secret.vercel.app/32

### Step 3: Restart Dev Server

```bash
npm run dev
```

## Test It

1. Go to: http://localhost:3000/login
2. Click: **"Continue with Google"** button
3. Sign in with Google
4. You're logged in! 🎉

## Features

✅ One-click Google login
✅ Automatic account creation
✅ Links to existing accounts (same email)
✅ Email/password still works
✅ Profile picture & name from Google
✅ Email automatically verified

---

**Need detailed instructions?** See `GOOGLE_OAUTH_SETUP.md`
