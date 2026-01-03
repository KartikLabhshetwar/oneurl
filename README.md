<img width="2752" height="1536" alt="og" src="https://github.com/user-attachments/assets/3449d15c-1ebc-4f69-8d16-c2d85aee597f" />

# OneURL

**One URL for all your links** - An open-source alternative to Linktree. Create a beautiful profile page to share all your important links in one place.

## Features

- **Custom Profile Pages** - Create personalized profile pages with your unique username
- **Link Management** - Add, edit, and reorganize your links effortlessly
- **Deep Analytics** - Track clicks and view detailed insights about your audience engagement
- **Avatar Upload** - Upload and customize your profile picture with drag-and-drop support
- **Responsive Design** - Your profile looks perfect on every device
- **Fast & Modern** - Built with Next.js 16 and React 19 for instant page loads

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Backend:** Express.js (separate service for link previews)
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **File Upload:** UploadThing + React Dropzone
- **State Management:** TanStack Query (React Query)
- **Styling:** Tailwind CSS
- **UI Components:** Base UI React
- **Charts:** Recharts

## Prerequisites

Before you begin, ensure you have:

- Node.js 20+ or Bun installed
- PostgreSQL database (local or cloud like Neon)
- UploadThing account (free tier available)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/KartikLabhshetwar/oneurl.git
cd oneurl
```

### 2. Install Dependencies

```bash
bun install
# or
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/oneurl"

# UploadThing - for file uploads
UPLOADTHING_TOKEN="your-uploadthing-token"

# Backend Service
# Development: http://localhost:3001
# Production: https://api.oneurl.live
BACKEND_URL="http://localhost:3001"
```

> **Note:** UploadThing is optional. If not configured, you can still use the app but avatar uploads won't work. Sign up at [uploadthing.com](https://uploadthing.com) to get your credentials.

### 4. Set Up Database

```bash
# Generate Prisma Client
bun prisma generate

# Run migrations
bun prisma migrate dev
```

### 5. Set Up Backend Service

The backend service handles link preview metadata fetching. Create a `.env` file in the `backend` directory:

```env
PORT=3001
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

Install backend dependencies:

```bash
cd backend
bun install
cd ..
```

### 6. Run the Development Servers

**Option 1: Run both services together**

```bash
bun run dev:all
```

**Option 2: Run separately**

```bash
# Terminal 1 - Frontend
bun run dev

# Terminal 2 - Backend
bun run dev:backend
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The backend service runs on [http://localhost:3001](http://localhost:3001).

## Project Structure

```
oneurl/
├── app/                    # Next.js app directory
│   ├── (dashboard)/       # Dashboard routes
│   ├── (onboarding)/      # Onboarding flow
│   ├── [username]/        # Public profile pages
│   └── api/               # API routes
├── backend/               # Express backend service
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Rate limiting, validation, error handling
│   │   └── utils/         # Metadata fetching utilities
│   └── package.json       # Backend dependencies
├── components/            # React components
│   ├── landing/           # Landing page components
│   └── ui/                # UI component library
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and services
│   ├── generated/         # Generated Prisma client
│   ├── hooks/             # Custom hooks
│   ├── services/          # Business logic services
│   └── validations/       # Zod schemas
├── prisma/                # Prisma schema and migrations
└── public/                # Static assets
```

## Available Scripts

**Frontend:**

- `bun run dev` - Start Next.js development server
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Run ESLint

**Backend:**

- `bun run dev:backend` - Start backend development server
- `bun run build:backend` - Build backend for production
- `bun run start:backend` - Start backend production server

**Both:**

- `bun run dev:all` - Run both frontend and backend in development mode

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

Quick start:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

For detailed guidelines, see [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

This project is licensed under the BSD 3-Clause License - see the [LICENSE](./LICENSE) file for details.

---

Made by [Kartik Labhshetwar](https://github.com/KartikLabhshetwar)
