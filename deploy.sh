#!/bin/bash

# Exit on error
set -e

echo "📦 Starting deployment process..."

# Install dependencies if needed
echo "🔧 Installing Backend dependencies..."

npm install

cd backend
npm install

echo "🔧 Installing Frontend dependencies..."
cd ../frontend
npm install

cd ..

# Generate Prisma client
echo "🔄 Generating Prisma client..."
npm run prisma:generate

# Run database migrations
echo "🗃️ Running database migrations..."
npm run prisma:migrate:prod

# Build the application
echo "🏗️ Building the application..."
npm run build

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
  echo "❌ PM2 is not installed. Installing globally..."
  npm install -g pm2
fi

# Create logs directory
echo "📁 Creating logs directory..."
mkdir -p backend/logs

# Check if PM2 processes exist
echo "🔍 Checking for existing PM2 processes..."
if pm2 list | grep -q "mcq-quiz-backend"; then
    echo "♻️ Reloading existing PM2 processes..."
    pm2 reload ecosystem.config.js
else
    echo "🆕 No existing processes found. Starting new deployment..."
    pm2 start ecosystem.config.js
fi

# Save PM2 process list
echo "💾 Saving PM2 process list..."
pm2 save

# Setup PM2 to start on system boot
# echo "⚙️ Setting up PM2 startup..."
# pm2 startup

echo "✅ Deployment complete!"
echo "   - Backend running at http://localhost:3001"
echo "   - Frontend running at http://localhost:3000"
echo ""
echo "📊 Monitor your applications with: pm2 monit"
echo "📜 View logs with: pm2 logs" 