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
	npm run docker:db
	npm run docker:redis
	npm run prisma:generate
	npm run tenant:generate
	npm run prisma:migrate
	npm run dev:backend

# Run frontend
local-frontend:
	@if [ ! -d "node_modules" ]; then \
		echo "🔧 Installing dependencies..."; \
		npm install; \
	fi
	npm run dev:frontend
