# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Copy root package.json and workspace package files
COPY package.json package-lock.json* ./
COPY shared/package.json ./shared/
COPY frontend/package.json ./frontend/

# Install all dependencies (including workspaces)
RUN npm ci

# Stage 2: Build shared package
FROM node:20-alpine AS build-shared
WORKDIR /app

# Copy shared source and hoisted dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY shared ./shared

# Build shared package
WORKDIR /app/shared
RUN npm run build

# Stage 3: Build frontend
FROM node:20-alpine AS build
WORKDIR /app

# Copy root package.json for workspace resolution
COPY package.json ./

# Copy all dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy built shared package
COPY --from=build-shared /app/shared ./shared

# Copy frontend source
COPY frontend ./frontend

# Build Next.js application
WORKDIR /app/frontend
ARG BACKEND_URL=http://localhost:4000
ENV BACKEND_URL=$BACKEND_URL
ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

# Stage 4: Production
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=build /app/frontend/.next/standalone ./
COPY --from=build /app/frontend/.next/static ./frontend/.next/static
COPY --from=build /app/frontend/public ./frontend/public

# Set correct permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

WORKDIR /app/frontend

# Railway assigns PORT dynamically, Next.js standalone needs HOSTNAME
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
