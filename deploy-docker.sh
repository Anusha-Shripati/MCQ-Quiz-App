#!/bin/bash

# Exit on error
set -e

echo "📦 Starting Docker deployment process..."

# Create necessary directories
echo "📁 Creating log directories..."
mkdir -p backend/logs frontend/logs

# Build and start the containers
echo "🏗️ Building and starting containers..."
docker compose down
docker compose build --no-cache
docker compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if containers are running
echo "🔍 Checking container status..."
if docker ps | grep -q "mcq-quiz-backend" && docker ps | grep -q "mcq-quiz-frontend"; then
    echo "✅ Deployment successful!"
    echo "   - Backend running at http://localhost:3001"
    echo "   - Frontend running at http://localhost:9000"
    echo ""
    echo "📊 View container logs:"
    echo "   - Backend: docker logs -f mcq-quiz-backend"
    echo "   - Frontend: docker logs -f mcq-quiz-frontend"
else
    echo "❌ Deployment failed! Check container logs for details:"
    docker-compose logs
    exit 1
fi 