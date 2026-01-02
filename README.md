<img width="2752" height="1536" alt="og" src="https://github.com/user-attachments/assets/3449d15c-1ebc-4f69-8d16-c2d85aee597f" />

# OneURL

**One URL for all your links** - An open-source alternative to Linktree. Create a beautiful profile page to share all your important links in one place.

## Features

- **Google OAuth Authentication** - Secure and seamless sign-in with your existing Google account
- **Custom Profile Pages** - Create personalized profile pages with your unique username
- **Link Management** - Add, edit, and reorganize your links effortlessly
- **Deep Analytics** - Track clicks and view detailed insights about your audience engagement
- **Avatar Upload** - Upload and customize your profile picture with drag-and-drop support
- **Responsive Design** - Your profile looks perfect on every device
- **Fast & Modern** - Built with Next.js 16 and React 19 for instant page loads

## Architecture

```
┌─────────────────────────────────┐      ┌─────────────────────────────────┐
│      FRONTEND (Next.js)         │      │      BACKEND (Express)          │
│      oneurl.live (:3000)        │ ───► │      api.oneurl.live (:3001)    │
└─────────────────────────────────┘      └─────────────────────────────────┘
                                                        │
                                                        ▼
                                         ┌─────────────────────────────────┐
                                         │      DATABASE (Neon)            │
                                         │      PostgreSQL Serverless      │
                                         └─────────────────────────────────┘
```

**Key Principle:** The frontend never accesses the database directly. All data operations go through the backend API.

## Tech Stack

### Frontend
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **State Management:** TanStack Query (React Query)
- **Styling:** Tailwind CSS
- **UI Components:** Base UI React
- **Charts:** Recharts

### Backend
- **Framework:** Express.js
- **Database:** PostgreSQL with Prisma ORM + Neon Serverless
- **Authentication:** Better Auth (Google OAuth)
- **File Upload:** UploadThing

## Prerequisites

Before you begin, ensure you have:

- Node.js 20+ or Bun installed
- PostgreSQL database (Neon recommended for serverless)
- Google OAuth credentials
- UploadThing account (free tier available)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/KartikLabhshetwar/oneurl.git
cd oneurl
```

### 2. Install Dependencies

```bash
# Frontend
bun install

# Backend
cd backend && bun install && cd ..
```

### 3. Set Up Environment Variables

**Frontend `.env`** (root directory):

```env
# Backend API URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

# UploadThing (for client-side uploads)
NEXT_PUBLIC_UPLOADTHING_APP_ID=your-app-id
```

**Backend `.env`** (`backend/` directory):

```env
# Database - Neon PostgreSQL
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require

# Server
PORT=3001
NODE_ENV=development
BACKEND_URL=http://localhost:3001
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

### 4. Set Up Database

```bash
cd backend

# Generate Prisma Client
bun run prisma:generate

# Run migrations
bun run prisma:migrate
```

### 5. Run the Development Servers

**Option 1: Run both services together**
```bash
bun run dev:all
```

**Option 2: Run separately**
```bash
# Terminal 1 - Frontend
bun run dev

# Terminal 2 - Backend
cd backend && bun run dev
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:3001](http://localhost:3001)

## Project Structure

```
oneurl/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication routes (login, signup)
│   ├── (dashboard)/       # Dashboard routes (protected)
│   ├── (onboarding)/      # Onboarding flow
│   ├── [username]/        # Public profile pages
│   └── api/               # API route proxies
├── backend/               # Express backend service
│   ├── src/
│   │   ├── config/        # Auth, DB, UploadThing config
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Rate limiting, validation, auth
│   │   └── server.ts      # Express app entry
│   └── prisma/            # Database schema
├── components/            # React components
│   ├── landing/           # Landing page components
│   └── ui/                # UI component library
├── lib/                   # Utility functions
│   ├── auth.ts            # Server-side auth utilities
│   ├── auth-client.ts     # Client-side auth
│   ├── auth-guard.ts      # Route protection
│   └── utils/             # API clients
└── public/                # Static assets
```

## Backend API Endpoints

| Endpoint | Description |
|----------|-------------|
| `/api/auth/*` | Authentication (Better Auth + Google OAuth) |
| `/api/profile` | User profile management |
| `/api/links` | Link CRUD operations |
| `/api/track` | Click tracking |
| `/api/analytics` | Analytics data |
| `/api/preview` | URL metadata fetching |
| `/api/uploadthing` | File uploads |

## Available Scripts

**Frontend:**
- `bun run dev` - Start Next.js development server
- `bun run build` - Build for production
- `bun run start` - Start production server

**Backend:**
- `bun run dev:backend` - Start backend development server
- `bun run build:backend` - Build backend for production
- `bun run start:backend` - Start backend production server

**Both:**
- `bun run dev:all` - Run both frontend and backend

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - Development: `http://localhost:3001/api/auth/callback/google`
   - Production: `https://api.oneurl.live/api/auth/callback/google`
6. Copy Client ID and Client Secret to backend `.env`

## Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Import repository to Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_BACKEND_URL=https://api.oneurl.live`
4. Deploy

### Backend (Railway/Render/Fly.io)

1. Deploy the `backend/` directory
2. Add all environment variables from backend `.env`
3. Set `FRONTEND_URL=https://oneurl.live`
4. Configure DNS: `api.oneurl.live` → backend service

### Production Checklist

**Frontend:**
- [ ] Set `NEXT_PUBLIC_BACKEND_URL` to production backend URL

**Backend:**
- [ ] Set up Neon PostgreSQL database
- [ ] Configure Google OAuth with production redirect URI
- [ ] Set `FRONTEND_URL` to `https://oneurl.live`
- [ ] Set `BACKEND_URL` to `https://api.oneurl.live`
- [ ] Set `NODE_ENV` to `production`
- [ ] Verify CORS allows frontend origin
- [ ] Test health endpoint: `https://api.oneurl.live/health`

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](./CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

Made by [Kartik Labhshetwar](https://github.com/KartikLabhshetwar)
