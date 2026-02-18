# MCQ Quiz Application

A full-stack application with Node.js backend and Next.js frontend.

## Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- npm (Node Package Manager)

## Project Structure

```
mcq-quiz-new/
├── backend/         # Node.js backend application
├── frontend/        # Next.js frontend application
├── package.json     # Root package.json for managing both applications
└── README.md       # This file
```

## Getting Started

#### Start Backend Services

To start the complete backend infrastructure (includes PostgreSQL, Redis, Prisma setup, and backend server):

```bash
make local-backend
```

This command will:

- Stop any existing backend processes
- Kill processes on PostgreSQL port (5432)
- Kill processes on Redis port (6379)
- Stop any running Docker containers
- Start PostgreSQL database container
- Start Redis container
- Generate Platform Prisma client
- Generate Tenant Prisma client
- Run Platform database migrations
- Start the backend development server

#### Start Frontend Services

To start the frontend development server:

```bash
make local-frontend
```

### 1. Initial Setup

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd mcq-quiz-new
   ```

2. Install dependencies for both frontend and backend:

   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   # In backend directory
   cd backend
   cp .env.sample .env
   # Update DATABASE_URL and TENANT_DB_URL if needed
   cd ..
   
   # In frontend directory
   cd frontend
   cp .env.sample .env
   # Update NEXT_PUBLIC_API_URL if needed
   cd ..
   ```

### 2. Database and Redis Setup

Start the required services using Docker:

- To start all things backend, PostgreSQL and Redis:

  ```bash
  npm run docker:up
  ```

- To start only PostgreSQL:

  ```bash
  npm run docker:db
  ```

- To start only Redis:
  ```bash
  npm run docker:redis
  ```

### 3. Database Migration (Manual - Optional)

If you need to run migrations manually:

```bash
# Platform database
npm run prisma:generate  # Generate Platform Prisma client
npm run prisma:migrate   # Run Platform database migrations

# Tenant database
npm run tenant:generate  # Generate Tenant Prisma client
npm run tenant:migrate   # Run Tenant database migrations
```

**Note:** `make local-backend` already runs Platform migrations automatically.

### 4. Running the Application

#### Development Mode

Start both frontend and backend in development mode:

```bash
npm run dev
```

This will:

- Start the backend on port 3001
- Start the frontend on port 3000
- Wait for the backend to be healthy before starting the frontend

### 5. Production Mode

Build and start the application in production mode:

```bash
npm run build
npm run start
```

## Tech Stack

### Backend
- Node.js + Express
- Prisma ORM (Platform + Tenant databases)
- PostgreSQL (Database-per-tenant isolation)
- Redis (Caching & Queue)
- BullMQ (Job queue)
- JWT Authentication

### Frontend
- Next.js 14 (App Router)
- React 18
- TypeScript
- Zustand (State Management)
- SWR (Data Fetching)
- TailwindCSS + ShadCN UI
- React Hook Form (Form Handling)
- Recharts (Charts & Analytics)

## Accessing the Application

### Tenant Application (Organizations)
- Frontend: http://localhost:3000
- Login with tenant user credentials

### Platform Admin (SaaS Owner)
- Frontend: http://admin.lr-mcq.local:3000
- Login: admin@logicrays.com / Admin@123
- **Note:** Add `127.0.0.1 admin.lr-mcq.local` to `/etc/hosts` (Linux/Mac) or `C:\Windows\System32\drivers\etc\hosts` (Windows)

### Backend & Tools
- Backend API: http://localhost:3001
- Platform Prisma Studio: http://localhost:5555 (run `npm run prisma:studio`)
- Tenant Prisma Studio: http://localhost:5556 (run `npm run tenant:studio`)

## Services

- PostgreSQL Database: localhost:5432
  - Platform DB: `platform_db`
  - Tenant DB: `app_db` (default for localhost)
- Redis: localhost:6379

## Environment Variables

### Backend Environment Variables

Key environment variables in `backend/.env`:

```env
# Platform Database (Central - manages tenants, plans, admins)
DATABASE_URL="postgresql://postgres:root@localhost:5432/platform_db"

# Tenant Database (Default for localhost development)
TENANT_DB_URL="postgresql://postgres:root@localhost:5432/app_db"

# Development tenant slug
DEV_TENANT_SLUG="localhost"

# Base domain for multi-tenancy
BASE_DOMAIN="lr-mcq.local"

# Redis
REDIS_HOST="redis-container"
REDIS_PORT=6379

# JWT
ACCESS_SECRET="access@secret"
ACCESS_EXPIRES="1d"
REFRESH_SECRET="referesh@secret"
REFRESH_EXPIRES="7d"
```

### Frontend Environment Variables

Key environment variables in `frontend/.env`:

```env
# Backend API URL
NEXT_PUBLIC_API_URL="http://localhost:3001"

# Image prefix for uploads
NEXT_PUBLIC_IMGAE_PREFIX="http://localhost:3001/"

# Development tenant slug
NEXT_PUBLIC_DEV_TENANT_SLUG="localhost"
```

## Troubleshooting

1. **Port already in use errors:**
   - Run `make local-backend` - it automatically kills processes on ports 3001, 5432, and 6379
   - Or manually: `lsof -ti:5432 | xargs kill -9` and `lsof -ti:6379 | xargs kill -9`

2. **Frontend fails to start:**
   - Ensure backend is running and healthy
   - Check backend logs for errors

3. **Database connection fails:**
   - Ensure PostgreSQL container is running: `docker ps`
   - Check Docker logs: `npm run docker:logs`
   - Verify DATABASE_URL in backend/.env

4. **Platform admin login not working:**
   - Add `127.0.0.1 admin.lr-mcq.local` to hosts file
   - Run platform seeder: `npm run seed:platform`
   - Use credentials: admin@logicrays.com / Admin@123

5. **Tenant not found error:**
   - Ensure platform database is migrated: `npm run prisma:migrate`
   - Create tenant record in platform database or use localhost for development

## Development Notes

- The backend runs on port 3001 by default
- The frontend runs on port 3000 by default
- **Multi-tenant architecture:** Each organization gets isolated database
- **Platform admin:** Manages tenants at admin.lr-mcq.local
- **Tenant access:** Organizations access at {tenant}.lr-mcq.local
- **Development mode:** Uses localhost as default tenant slug
- All processes are killed together when stopping the application (Ctrl+C)

## Additional Commands

### Database Management
```bash
# Platform database
npm run prisma:studio          # Open Platform Prisma Studio (port 5555)
npm run seed:platform          # Seed platform data (admins, roles, plans)

# Tenant database
npm run tenant:studio          # Open Tenant Prisma Studio (port 5556)
npm run seed:tenant            # Seed tenant data (users, roles, modules)
```

### Docker Management
```bash
npm run docker:ps              # View container status
npm run docker:logs            # View container logs
npm run docker:down            # Stop all containers
npm run docker:up-build        # Rebuild and start containers
```

## FrontEnd -> NextJs

- Charts -> Recharts
- UI Components -> ShadCn + Tailwind
- API calls -> SWR (React Query pattern)
- State Management -> Zustand
- Routing -> NextJs built-in routing
- Authentication -> JWT (JSON Web Tokens)
- Form Handling -> React Hook Form
