.PHONY: help local-backend local-frontend

help:
	@echo "Available commands:"
	@echo "  help              - Show this help message"
	@echo "  local-backend     - Set up and run the backend infrastructure:"
	@echo "                      - Stops any running containers"
	@echo "                      - Starts PostgreSQL database container"
	@echo "                      - Starts Redis container"
	@echo "                      - Generates Prisma client"
	@echo "                      - Runs database migrations"
	@echo "                      - Starts backend development server"
	@echo "  local-frontend    - Start the frontend development server"

# Setup local infrastructure (DB, Redis, migrations) and run backend
local-backend:
	@if [ ! -d "node_modules" ]; then \
		echo "🔧 Installing dependencies..."; \
		npm install; \
	fi
	@echo "🛑 Stopping any existing backend processes..."
	@-pkill -f "npm run dev:backend" 2>/dev/null || true
	@-pkill -f "nodemon.*backend" 2>/dev/null || true
	@-lsof -ti:3001 | xargs kill -9 2>/dev/null || true
	@echo "🛑 Killing processes on PostgreSQL port (5432)..."
	@-lsof -ti:5432 | xargs kill -9 2>/dev/null || true
	@echo "🛑 Killing processes on Redis port (6379)..."
	@-lsof -ti:6379 | xargs kill -9 2>/dev/null || true
	@sleep 1
	npm run docker:down
	@echo "🚀 Starting PostgreSQL database..."
	npm run docker:db
	@echo "⏳ Waiting for PostgreSQL to be healthy..."
	@until [ "$$(docker inspect --format='{{.State.Health.Status}}' postgres-container 2>/dev/null)" = "healthy" ]; do \
		echo "PostgreSQL is starting up - waiting 3 seconds..."; \
		sleep 3; \
	done
	@echo "✅ PostgreSQL is ready!"
	@echo "🚀 Starting Redis..."
	npm run docker:redis
	@echo "⏳ Waiting for Redis to be ready..."
	@until docker exec redis-container redis-cli ping >/dev/null 2>&1; do \
		echo "Redis is starting up - waiting 2 seconds..."; \
		sleep 2; \
	done
	@echo "✅ Redis is ready!"
	@echo "🔧 Generating Prisma clients..."
	npm run prisma:generate
	npm run tenant:generate
	@echo "🗄️ Running database migrations..."
	npm run prisma:migrate
	@echo "🚀 Starting backend development server..."
	npm run dev:backend

# Run frontend
local-frontend:
	@if [ ! -d "node_modules" ]; then \
		echo "🔧 Installing dependencies..."; \
		npm install; \
	fi
	npm run dev:frontend
