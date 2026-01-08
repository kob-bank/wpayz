# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY .npmrc ./

# Install dependencies
RUN npm install && \
    npm cache clean --force

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage - use Playwright image for browser support
FROM mcr.microsoft.com/playwright:v1.40.0-focal

WORKDIR /app

# Set timezone
ENV TZ="Asia/Bangkok"
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Install dumb-init
RUN apt-get update && apt-get install -y dumb-init && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./
COPY .npmrc ./

# Copy built application
COPY --from=builder /app/dist ./dist

# Install production dependencies only
RUN npm install --only=production && \
    npm cache clean --force && \
    rm -f .npmrc

# Create non-root user
RUN groupadd -r appuser && \
    useradd -r -g appuser appuser && \
    chown -R appuser:appuser /app

USER appuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "dist/main.js"]
