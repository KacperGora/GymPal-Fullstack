# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Copy root package.json and workspace package files
COPY package.json package-lock.json* ./
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/

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

# Stage 3: Build backend
FROM node:20-alpine AS build
WORKDIR /app

# Copy root package.json for workspace resolution
COPY package.json ./
COPY tsconfig.json ./

# Copy all dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend/node_modules ./backend/node_modules

# Copy built shared package
COPY --from=build-shared /app/shared ./shared

COPY backend ./backend
# Generate Prisma Client and build backend
WORKDIR /app/backend
RUN rm -rf dist
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
# Install production dependencies only
COPY package.json package-lock.json* ./
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/
RUN npm ci --omit=dev --workspace=backend --workspace=shared
# Copy built shared package
COPY --from=build-shared /app/shared/dist ./shared/dist
COPY --from=build-shared /app/shared/package.json ./shared/
# Copy built backend
COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/backend/prisma ./backend/prisma
WORKDIR /app/backend
COPY backend/prisma.config.ts ./prisma.config.ts
COPY backend/start.sh ./start.sh
RUN chmod +x ./start.sh
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate
EXPOSE 4000
ENTRYPOINT ["sh", "/app/backend/start.sh"]