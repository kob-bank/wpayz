# Build stage
FROM node:20-alpine AS builder
ARG NPM_TOKEN
ENV NPM_TOKEN=${NPM_TOKEN}

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY .npmrc ./

# Replace NPM_TOKEN placeholder in .npmrc and install dependencies
RUN sed -i "s|\${NPM_TOKEN}|${NPM_TOKEN}|g" .npmrc && \
    npm install && \
    npm cache clean --force

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage - use lightweight Node.js image (no Playwright needed)
FROM node:20-alpine
ARG NPM_TOKEN
ENV NPM_TOKEN=${NPM_TOKEN}

WORKDIR /app

# Set timezone
ENV TZ="Asia/Bangkok"
RUN apk add --no-cache tzdata && \
    ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Install dumb-init
RUN apk add --no-cache dumb-init

# Copy package files
COPY package*.json ./
COPY .npmrc ./

# Copy built application
COPY --from=builder /app/dist ./dist

# Replace NPM_TOKEN placeholder and install production dependencies only
RUN sed -i "s|\${NPM_TOKEN}|${NPM_TOKEN}|g" .npmrc && \
    npm install --only=production && \
    npm cache clean --force && \
    rm -f .npmrc

# Create non-root user
RUN addgroup -g 1001 -S appuser && \
    adduser -S -u 1001 -G appuser appuser && \
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
