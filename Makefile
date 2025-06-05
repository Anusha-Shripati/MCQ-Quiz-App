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
	npm run docker:down
	npm run docker:db
	npm run prisma:generate
	npm run prisma:migrate
	npm run dev:backend

# Run frontend
local-frontend:
	@if [ ! -d "node_modules" ]; then \
		echo "🔧 Installing dependencies..."; \
		npm install; \
	fi
	npm run dev:frontend
