# Crek - Points & Rewards Application

A Next.js-based points and rewards application with daily check-ins, referral program, and secure authentication.

## Features

- ✅ **User Authentication** - Secure registration and login with email verification
- ✅ **Points System** - Earn points through daily check-ins (+5 points/day)
- ✅ **Referral Program** - Get rewarded for referring friends (+10 points each)
- ✅ **Points History** - Track all your point transactions
- ✅ **Password Reset** - Secure password recovery via email
- ✅ **Security Features**:
  - JWT-based session management
  - CSRF protection
  - Rate limiting
  - Input validation with Zod
  - Password hashing with bcrypt
  - Email verification

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens with HTTP-only cookies
- **Styling**: Tailwind CSS
- **Validation**: Zod

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd crek
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:

```env
# Database
# Example (Supabase / hosted Postgres)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB?sslmode=require"

# Application
APP_URL="http://localhost:3000"
NODE_ENV="development"

# Session/JWT Secret (must be at least 32 characters in production)
SESSION_SECRET="dev-secret-change-in-production-min-32-chars-please-use-random-string"

# Email Configuration (optional - will log to console if not configured)
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="your-email@example.com"
SMTP_PASSWORD="your-password"
SMTP_FROM="noreply@crek.app"

# Rate Limiting with Upstash Redis (optional - uses in-memory if not configured)
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""
```

4. Run database migrations:
```bash
npx prisma migrate dev
```

5. Generate Prisma client:
```bash
npx prisma generate
```

6. Start the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

### Required

- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Secret key for JWT tokens (min 32 chars in production)

### Optional

- `APP_URL` - Base URL of the application (default: `http://localhost:3000`)
- `NODE_ENV` - Environment mode (`development` or `production`)

### Email Configuration (Optional)

If not configured, emails will be logged to the console in development.

- `SMTP_HOST` - SMTP server hostname
- `SMTP_PORT` - SMTP server port (default: 587)
- `SMTP_USER` - SMTP username
- `SMTP_PASSWORD` - SMTP password
- `SMTP_FROM` - Email sender address

### Rate Limiting (Optional)

For production, configure Upstash Redis for distributed rate limiting. If not configured, uses in-memory rate limiting (not suitable for production with multiple instances).

- `UPSTASH_REDIS_REST_URL` - Upstash Redis REST URL
- `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis REST token

## Project Structure

```
crek/
├── app/                  # Next.js App Router pages and API routes
│   ├── api/             # API endpoints
│   │   ├── auth/        # Authentication routes
│   │   └── tasks/       # Task-related routes
│   ├── dashboard/       # Dashboard page
│   ├── login/           # Login page
│   └── register/        # Registration page
├── components/          # React components
├── lib/                 # Utility functions and libraries
│   ├── auth.ts         # Authentication utilities
│   ├── jwt.ts          # JWT session management
│   ├── csrf.ts         # CSRF protection
│   ├── rate-limit.ts   # Rate limiting
│   ├── email.ts        # Email sending
│   └── validation.ts   # Input validation schemas
└── prisma/             # Database schema and migrations
```

## Security Features

1. **Session Management**: JWT-based sessions with signed tokens
2. **CSRF Protection**: All POST requests require CSRF tokens
3. **Rate Limiting**: Protects against brute force attacks
4. **Input Validation**: All inputs validated with Zod schemas
5. **Password Security**: Bcrypt hashing with salt rounds
6. **Email Verification**: Required before full account access
7. **Secure Cookies**: HTTP-only, secure (in production), SameSite protection

## Database Migrations

To create a new migration:
```bash
npx prisma migrate dev --name migration_name
```

To apply migrations:
```bash
npx prisma migrate deploy
```

## Production Deployment

1. Set all required environment variables
2. Use a strong `SESSION_SECRET` (at least 32 random characters)
3. Configure SMTP for email sending
4. Set up Upstash Redis for rate limiting (recommended)
5. Run database migrations: `npx prisma migrate deploy`
6. Build the application: `npm run build`
7. Start the server: `npm start`

## License

[Add your license here]
