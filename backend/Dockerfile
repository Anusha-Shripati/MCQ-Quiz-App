# Stage 1: Build Environment
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire application code
COPY . .

# Generate Prisma client
RUN npm run prisma:generate

# Stage 2: Production Image
FROM node:22-alpine AS production

WORKDIR /app

# Copy dependencies and application code from the builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app ./

# Copy the environment sample file
COPY .env.sample .env

# Expose the application port
EXPOSE 3001

# Command to start the application
CMD ["npm", "start"]
