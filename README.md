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
   cp .env.sample .env
   ```

### 2. Database and Redis Setup

Start the required services using Docker:

- To start both PostgreSQL and Redis:

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

### 3. Database Migration

Run the following commands to set up the database:

```bash
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
```

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

#### Production Mode

Build and start the application in production mode:

```bash
npm run build
npm run start
```

### 5. Additional Commands

- View Docker container status:

  ```bash
  npm run docker:ps
  ```

- View Docker container logs:

  ```bash
  npm run docker:logs
  ```

- Stop all Docker containers:

  ```bash
  npm run docker:down
  ```

- Rebuild and start Docker containers:

  ```bash
  npm run docker:up-build
  ```

- Run linting:
  ```bash
  npm run lint
  ```

## Accessing the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Prisma Studio (Database GUI): http://localhost:5555 (after running `npm run prisma:studio`)

## Services

- PostgreSQL Database: localhost:5432
- Redis: localhost:6379

## Environment Variables

Key environment variables in `.env`:

```env
# Database
DATABASE_URL="postgres://postgres:root@localhost:5432/app_db"

# Redis
REDIS_HOST="redis-container"
REDIS_PORT=6379

# JWT
ACCESS_SECRET="access@secret"
ACCESS_EXPIRES="1d"
REFRESH_SECRET="referesh@secret"
REFRESH_EXPIRES="7d"
```

## Troubleshooting

1. If the frontend fails to start, ensure the backend is running and healthy
2. Check Docker container logs using `npm run docker:logs`
3. Ensure all required ports (3000, 3001, 5432, 6379) are available
4. If database connection fails, ensure PostgreSQL container is running

## Development Notes

- The backend runs on port 3001 by default (configurable in package.json config)
- The frontend waits for the backend's healthcheck before starting
- All processes are killed together when stopping the application (Ctrl+C)
