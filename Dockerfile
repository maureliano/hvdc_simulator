# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files from builder
COPY --from=builder /app/package*.json ./

# Install production dependencies only
RUN npm install --legacy-peer-deps --only=production

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["node", "dist/index.js"]
