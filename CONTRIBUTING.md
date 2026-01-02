# Contributing to OneURL

Thank you for your interest in contributing to OneURL! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Architecture Overview](#architecture-overview)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style Guidelines](#code-style-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)
- [Common Tasks](#common-tasks)

## Code of Conduct

This project adheres to a [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to kartik.labhshetwar@gmail.com.

## Architecture Overview

OneURL uses a **split architecture** with a Next.js frontend and Express.js backend:

```
┌─────────────────────────────────┐      ┌─────────────────────────────────┐
│      FRONTEND (Next.js)         │      │      BACKEND (Express)          │
│      localhost:3000             │ ───► │      localhost:3001             │
└─────────────────────────────────┘      └─────────────────────────────────┘
                                                        │
                                                        ▼
                                         ┌─────────────────────────────────┐
                                         │      DATABASE (Neon)            │
                                         │      PostgreSQL Serverless      │
                                         └─────────────────────────────────┘
```

**Key Principle:** The frontend NEVER accesses the database directly. All data operations go through the backend API.

### Backend API Endpoints

| Endpoint | Description |
|----------|-------------|
| `/api/auth/*` | Authentication (Better Auth + Google OAuth) |
| `/api/profile` | User profile management |
| `/api/links` | Link CRUD operations |
| `/api/track` | Click tracking |
| `/api/analytics` | Analytics data |
| `/api/preview` | URL metadata fetching |
| `/api/uploadthing` | File uploads |

## Getting Started

### Prerequisites

- Node.js 20+ or Bun
- PostgreSQL database (Neon recommended)
- Git
- Google OAuth credentials
- UploadThing account (optional, for file uploads)

### Initial Setup

1. **Fork the repository** on GitHub

2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/oneurl.git
   cd oneurl
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/KartikLabhshetwar/oneurl.git
   ```

4. **Install dependencies**:
   ```bash
   # Frontend
   bun install

   # Backend
   cd backend && bun install && cd ..
   ```

5. **Set up environment variables**:

   **Frontend `.env`** (root directory):
   ```env
   NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
   ```

   **Backend `.env`** (`backend/` directory):
   ```env
   # Database
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

   # UploadThing (optional)
   UPLOADTHING_TOKEN=your-uploadthing-token
   ```

6. **Set up the database**:
   ```bash
   cd backend
   bun run prisma:generate
   bun run prisma:migrate
   cd ..
   ```

7. **Start the development servers**:
   ```bash
   # Both services
   bun run dev:all

   # Or separately:
   # Terminal 1 - Frontend
   bun run dev

   # Terminal 2 - Backend
   cd backend && bun run dev
   ```

## Development Workflow

### 1. Create a Branch

Always create a new branch from `main` for your work:

```bash
git checkout main
git pull upstream main
git checkout -b feature/your-feature-name
```

**Branch naming conventions:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `chore/` - Maintenance tasks

### 2. Make Your Changes

- **Frontend changes**: Work in root directory
- **Backend changes**: Work in `backend/` directory
- Follow the code style guidelines below
- Test your changes thoroughly

### 3. Commit Your Changes

Follow the commit message guidelines (see below).

### 4. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Code Style Guidelines

### TypeScript

- Use TypeScript for all new code
- Avoid `any` types - use proper types or `unknown`
- Use interfaces for object shapes, types for unions/intersections

### React Components (Frontend)

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks

```tsx
// Good
export function UserProfile({ userId }: { userId: string }) {
  const { data, isLoading } = useProfile(userId);
  
  if (isLoading) return <Spinner />;
  return <div>{data.name}</div>;
}
```

### Backend Services

- Keep business logic in `backend/src/services/`
- Routes should be thin - just handle HTTP and call services
- Always validate input with Zod

```typescript
// Good - in routes/profile.ts
router.get("/", requireAuth, async (req, res) => {
  const session = (req as any).session;
  const user = await profileService.getByUserId(session.user.id);
  res.json(user);
});
```

### API Calls from Frontend

- **Never** import database or Prisma in frontend code
- Use `fetchFromBackendServer` for server components
- Use `authClient` or fetch for client components

```typescript
// Good - server component
import { fetchFromBackendServer } from "@/lib/utils/server-api-client";

const res = await fetchFromBackendServer("/api/profile");
const profile = await res.json();

// Good - client component
const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/profile`);
```

### Naming Conventions

- **Components**: PascalCase (`UserProfile`)
- **Functions/Variables**: camelCase (`getUserData`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
- **Types/Interfaces**: PascalCase (`UserProfile`)

### Code Comments

- Don't add unnecessary comments
- Comment complex logic or business rules

```typescript
// Good - explains why
// Skip validation for admin users to allow bulk operations
if (user.role === "admin") return;
```

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `chore`: Maintenance tasks

### Scope

- `frontend`: Frontend changes
- `backend`: Backend changes
- `auth`: Authentication
- `db`: Database changes
- `api`: API changes

### Examples

```
feat(backend): add click tracking endpoint

- Add /api/track endpoint
- Implement tracking service
- Store click analytics in database
```

```
fix(frontend): handle expired session redirect

Previously, expired sessions caused app crashes.
Now properly redirects to login page.

Fixes #456
```

## Pull Request Process

### Before Submitting

1. **Update your branch**:
   ```bash
   git checkout main
   git pull upstream main
   git checkout your-branch
   git rebase main
   ```

2. **Run linting**:
   ```bash
   bun run lint
   ```

3. **Test your changes** manually in the browser

4. **Update documentation** if needed

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Affected Areas
- [ ] Frontend
- [ ] Backend
- [ ] Database schema
- [ ] API endpoints

## Testing
How was this tested?

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings/errors
```

## Project Structure

```
oneurl/
├── app/                        # Next.js App Router (Frontend)
│   ├── (auth)/                # Auth routes (login, signup)
│   ├── (dashboard)/           # Protected dashboard routes
│   ├── (onboarding)/          # Onboarding flow
│   ├── [username]/            # Public profile pages
│   └── api/                   # API route proxies (to backend)
├── components/                 # React components
│   ├── landing/               # Landing page components
│   └── ui/                    # Reusable UI components
├── lib/                        # Frontend utilities
│   ├── auth.ts                # Server-side auth utilities
│   ├── auth-client.ts         # Client-side auth
│   ├── auth-guard.ts          # Route protection
│   └── utils/
│       ├── server-api-client.ts  # Server component API calls
│       └── backend-client.ts     # Client component API calls
├── backend/                    # Express Backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── auth.ts        # Better Auth config
│   │   │   └── db.ts          # Prisma + Neon setup
│   │   ├── routes/            # API route handlers
│   │   ├── services/          # Business logic
│   │   └── middleware/        # Auth, rate limiting, etc.
│   └── prisma/
│       └── schema.prisma      # Database schema
└── public/                     # Static assets
```

## Common Tasks

### Adding a New Feature

1. Determine if it's frontend-only, backend-only, or both
2. Create a feature branch
3. **Backend work:**
   - Add service in `backend/src/services/`
   - Add route in `backend/src/routes/`
   - Add database migrations if needed
4. **Frontend work:**
   - Create components
   - Add API calls using the correct client
5. Test end-to-end
6. Create PR

### Adding a New API Endpoint (Backend)

1. Create or update route in `backend/src/routes/`
2. Add service logic in `backend/src/services/`
3. Add authentication middleware if needed
4. Add input validation with Zod
5. Update backend README with new endpoint

```typescript
// backend/src/routes/example.ts
router.get("/", requireAuth, async (req, res) => {
  const session = (req as any).session;
  const data = await exampleService.getData(session.user.id);
  res.json(data);
});
```

### Database Changes

1. Update `backend/prisma/schema.prisma`
2. Create migration:
   ```bash
   cd backend
   bun run prisma:migrate
   ```
3. Update related services and routes
4. Test thoroughly

### Adding a New UI Component

1. Create component in `components/ui/` or appropriate folder
2. Make it reusable and well-typed
3. Add proper accessibility attributes
4. Use Tailwind CSS for styling

## Getting Help

- **Questions?** Open a discussion on GitHub
- **Found a bug?** Open an issue with details
- **Have a feature request?** Open an issue with use case

## Recognition

Contributors will be recognized in:
- Project README
- Release notes
- GitHub contributors page

Thank you for contributing to OneURL! 🎉
