# Use official Node.js LTS image with Alpine for smaller size
FROM node:lts-alpine3.23 AS builder

# Set working directory
WORKDIR /app

# Copy pnpm lockfile and workspace config first to leverage layer caching
COPY package.json pnpm-workspace.yaml ./

# Install pnpm globally (if not already in base image)
RUN npm install -g pnpm@latest

# Install dependencies (including workspace packages if any)
RUN pnpm install

# Copy source code
COPY . .

# Build the app (if you have a build step like TypeScript or bundling)
# Uncomment if needed:
# RUN pnpm run build

# --- Production stage ---
FROM node:lts-alpine3.23

WORKDIR /app

# Install pnpm again (needed to run scripts that may depend on it)
RUN npm install -g pnpm@latest

# Copy only necessary files from builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

# If you built assets (like dist/), copy them too:
# COPY --from=builder /app/dist ./dist

# Copy your actual service code
COPY index.js ./index.js
COPY routes/ ./routes/
COPY models/ ./models/
COPY middleware/ ./middleware/

# Expose port (adjust if your app uses different port)
EXPOSE 3000

# Health check (optional but recommended)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "index.js"]