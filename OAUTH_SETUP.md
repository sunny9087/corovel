# OAuth Setup Guide

This application now supports Google and Facebook OAuth authentication alongside email/password authentication.

## Setup Instructions

### 1. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Choose "Web application"
6. Add authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
7. Copy the Client ID and Client Secret

### 2. Facebook OAuth Setup (Optional)

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or select an existing one
3. Add "Facebook Login" product
4. Go to Settings → Basic
5. Add authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/facebook`
   - Production: `https://yourdomain.com/api/auth/callback/facebook`
6. Copy the App ID and App Secret

### 3. Environment Variables

Add these to your `.env.local` file:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000  # Change to your production URL
NEXTAUTH_SECRET=your-secret-key-here  # Generate with: openssl rand -base64 32

# Google OAuth (Required for Google login)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Facebook OAuth (Optional - only if you want Facebook login)
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret
```

### 4. Generate NEXTAUTH_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Or use an online generator: https://generate-secret.vercel.app/32

## Features

- ✅ Google OAuth login/signup
- ✅ Facebook OAuth login/signup (if configured)
- ✅ Email/password authentication (existing)
- ✅ Account linking (same email can use both OAuth and password)
- ✅ OAuth users automatically get verified emails
- ✅ Profile pictures and names from OAuth providers
- ✅ Integrated with existing session system
- ✅ Analytics tracking for OAuth signups/logins

## How It Works

1. Users can click "Sign in with Google" or "Sign in with Facebook" on login/register pages
2. They're redirected to the OAuth provider
3. After authorization, they're redirected back and automatically logged in
4. New OAuth users are created with:
   - Email verified automatically
   - Profile picture and name from provider
   - No password (OAuth only)
   - Referral code generated
   - Starting points: 0

5. Existing users can link OAuth accounts if they use the same email

## Notes

- OAuth users cannot use password login (they'll see a message to use OAuth)
- Email/password users can link OAuth accounts by signing in with the same email
- All authentication methods integrate with the existing session system
- Analytics events are tracked for both OAuth and email/password authentication
