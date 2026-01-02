# OneURL Backend API

Express.js backend service handling authentication, database operations, file uploads, analytics, and link management.

## Architecture

```
Frontend (oneurl.live)  ──►  Backend API (api.oneurl.live)  ──►  Neon PostgreSQL
     :3000                         :3001
```

**Key Principle:** The frontend never accesses the database directly. All operations go through this backend API.

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Health check |
| `/api/auth/*` | Authentication (Better Auth + Google OAuth) |
| `/api/profile` | User profile CRUD, username, avatar, publish |
| `/api/links` | Link management (CRUD, reorder) |
| `/api/track` | Click tracking |
| `/api/analytics` | Analytics data (clicks, referrers, devices) |
| `/api/preview` | URL metadata/OG image fetching |
| `/api/uploadthing` | File uploads (avatars, link images) |

## Tech Stack

- **Runtime:** Bun / Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL (Neon serverless)
- **ORM:** Prisma with `@prisma/adapter-neon`
- **Authentication:** Better Auth
- **File Uploads:** UploadThing
- **Validation:** Zod

## Development

```bash
cd backend
bun install
bun run dev
```

## Production

```bash
bun run build
bun run start
```

## Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Database - Neon PostgreSQL
DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"

# Server
PORT=3001
NODE_ENV=development
BACKEND_URL=http://localhost:3001

# Frontend URL(s) for CORS - comma separated for multiple
FRONTEND_URL=http://localhost:3000

# Better Auth
BETTER_AUTH_URL=http://localhost:3001
BETTER_AUTH_SECRET=your-secret-key-minimum-32-characters

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# UploadThing
UPLOADTHING_TOKEN=your-uploadthing-token
```

### Production Environment

```env
DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"
PORT=3001
NODE_ENV=production
BACKEND_URL=https://api.oneurl.live
FRONTEND_URL=https://oneurl.live
BETTER_AUTH_URL=https://api.oneurl.live
BETTER_AUTH_SECRET=your-production-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
UPLOADTHING_TOKEN=your-uploadthing-token
```

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── auth.ts        # Better Auth configuration
│   │   ├── db.ts          # Prisma + Neon setup
│   │   └── uploadthing.ts # File upload configuration
│   ├── middleware/
│   │   ├── auth.ts        # Authentication middleware
│   │   ├── errorHandler.ts
│   │   ├── logger.ts
│   │   ├── rateLimiter.ts
│   │   └── validator.ts
│   ├── routes/
│   │   ├── analytics.ts   # Analytics endpoints
│   │   ├── auth.ts        # Auth routes (Better Auth)
│   │   ├── links.ts       # Link CRUD
│   │   ├── preview.ts     # URL metadata fetching
│   │   ├── profile.ts     # Profile management
│   │   ├── track.ts       # Click tracking
│   │   └── uploadthing.ts # File uploads
│   ├── services/
│   │   ├── analytics.service.ts
│   │   ├── link.service.ts
│   │   ├── profile.service.ts
│   │   └── tracking.service.ts
│   └── server.ts          # Express app entry
├── prisma/
│   └── schema.prisma      # Database schema
└── package.json
```

## Rate Limiting

- **Preview endpoint:** 10 requests/minute, 100 requests/15 minutes
- **General API:** Configured per-endpoint

## Google OAuth Setup

1. Create project at [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URI:
   - Development: `http://localhost:3001/api/auth/callback/google`
   - Production: `https://api.oneurl.live/api/auth/callback/google`
