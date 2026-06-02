# ─────────────────────────────────────────────
# Stage 1: Build dependencies
# ──────────────────────────────────────────────
FROM node:lts-alpine3.23 AS builder

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy only package files first (for better layer caching)
COPY package.json ./

# Install production + dev dependencies
RUN pnpm install --frozen-lockfile=false

# Copy the rest of the application source code
COPY . .

# ──────────────────────────────────────────────
# Stage 2: Production image
# ─────────────────────────────────────────────
FROM node:lts-alpine3.23

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy built dependencies from builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy application source code
COPY . .

# Expose the service port (adjust if needed)
EXPOSE 5001

# Start the app using ESM entry point
CMD ["node", "index.js"]