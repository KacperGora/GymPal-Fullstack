# GymPal — production fullstack SaaS

![CI](https://github.com/KacperGora/GymPal-Fullstack/actions/workflows/ci.yml/badge.svg?branch=dev)
![Frontend CI](https://github.com/KacperGora/GymPal-Fullstack/actions/workflows/frontend-ci.yml/badge.svg?branch=dev)
![Node Version](https://img.shields.io/badge/node-22-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)
![NestJS](https://img.shields.io/badge/NestJS-11-e0234e)
![Next.js](https://img.shields.io/badge/Next.js-16-black)

**Stack:** Next.js · NestJS · PostgreSQL · Redis · BullMQ · Prisma · Docker · GCP

**Key engineering:**
- Event-driven nutrition stats pipeline — meal writes enqueue BullMQ jobs, stats computed asynchronously
- Distributed Redis cache — shared across Cloud Run instances, survives container restarts
- JWT refresh token rotation with family-based revocation and brute-force lockout
- OpenAI integration with prompt builder, exponential backoff retry, and 6h cache layer
- Background workers, rate limiting, Sentry tracing, Swagger docs — production-grade from day one

🔗 **Live demo: https://gympal-frontend-hjz4j5fyoq-ey.a.run.app** · `demo@gympal.app` / `Demo123!`

---

## Architecture

```mermaid
graph TD
    subgraph Client
        N[Next.js 16<br/>React Query · Zustand · MUI]
    end

    subgraph API
        NE[NestJS 11<br/>Modules · Guards · Interceptors]
    end

    subgraph Data
        PG[(PostgreSQL 16<br/>Cloud SQL)]
        PR[Prisma ORM<br/>migrations · type-safety]
        RD[(Redis 7<br/>cache · queues)]
    end

    subgraph Jobs
        BQ[BullMQ Workers<br/>nutrition stats · cleanup]
    end

    N -->|REST / HTTP-only cookies| NE
    NE --> PR
    PR --> PG
    NE <-->|cache| RD
    NE -->|enqueue| BQ
    BQ -->|write stats| PR
    BQ <-->|job queue| RD

    subgraph CICD[CI/CD]
        GH[GitHub] -->|push| CB[Cloud Build]
        CB -->|deploy| N
        CB -->|deploy| NE
    end

    style N fill:#61dafb,stroke:#333
    style NE fill:#e0234e,color:#fff,stroke:#333
    style PG fill:#336791,color:#fff,stroke:#333
    style PR fill:#2d3748,color:#fff,stroke:#333
    style RD fill:#dc382d,color:#fff,stroke:#333
    style BQ fill:#f59e0b,stroke:#333
    style CB fill:#4285f4,color:#fff,stroke:#333
    style GH fill:#24292e,color:#fff,stroke:#333
```

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | Next.js 16 + React 19 | App Router, SSR, streaming |
| **State (server)** | React Query 5 | Cache, background refetch, optimistic updates |
| **State (client)** | Zustand 5 | See [Engineering Decisions](#engineering-decisions) |
| **UI** | Material UI 7 | Design system, accessible components |
| **Forms** | React Hook Form + Zod | Uncontrolled inputs, shared validation schemas |
| **Backend** | NestJS 11 | See [Engineering Decisions](#engineering-decisions) |
| **ORM** | Prisma 7 | See [Engineering Decisions](#engineering-decisions) |
| **Database** | PostgreSQL 16 | ACID, relational integrity, Cloud SQL |
| **Cache / Queues** | Redis 7 + BullMQ | Persistent cache, async background jobs |
| **Auth** | JWT + HTTP-only cookies | XSS-proof token storage, refresh rotation |
| **i18n** | next-intl | PL / EN, locale routing |
| **AI** | OpenAI GPT-4o-mini | Meal suggestions, retry + exponential backoff |
| **Monitoring** | Sentry | Performance tracing, error grouping |
| **API Docs** | Swagger / OpenAPI | Auto-generated from decorators |
| **Testing** | Jest · Vitest · Playwright | Unit, integration, E2E |
| **CI/CD** | GitHub Actions + Cloud Build | Lint → test → build → deploy |
| **Deployment** | Google Cloud Run | Serverless containers, auto-scaling |

---

## Features

- [x] Registration & login (JWT + HTTP-only cookies, refresh token rotation)
- [x] Exercise catalogue (strength, cardio, stretching, HIIT) — Wger API integration
- [x] Workout session tracking (CRUD)
- [x] Nutrition tracking — meals, macros, calories
- [x] AI meal suggestions — prompt builder with macro targeting, retry policy (3 attempts, exponential backoff), Redis cache keyed by (category × macro focus), ~$0.0001/request at scale
- [x] Daily nutrition statistics — recalculated via background job queue
- [x] User profile (weight, height, goals, activity level)
- [x] Rate limiting — global 100 req/60s, stricter on auth endpoints
- [x] Multi-language (PL / EN)
- [x] Responsive UI (MUI)
- [x] API documentation (Swagger)
- [x] Docker Compose for local development
- [ ] Mobile app (React Native — planned)

---

## Engineering Decisions

### Why Zustand instead of Redux?

Redux adds significant boilerplate (actions, reducers, selectors, middleware) for problems that often don't exist at this scale. Zustand gives a reactive store with a hooks-first API and zero ceremony:

```typescript
// Redux: actions → reducer → selector → connect
// Zustand: one slice, one hook
const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),   // immutable by convention
  clearUser: () => set({ user: null }),
}));
```

GymPal uses **React Query for all server state** (fetching, caching, mutations) and Zustand only for the small slice of truly global client state (auth user, UI preferences). Redux would be over-engineering.

---

### Why NestJS modules?

NestJS modules enforce **domain isolation** at the framework level. Each domain (auth, workouts, nutrition, ai, jobs…) is a self-contained module with its own providers, controllers and exports. This makes the dependency graph explicit and testable:

```
AppModule
├── AuthModule        (JWT strategy, guards)
├── WorkoutsModule    (sessions, exercises)
├── NutritionModule   (meals, daily stats)
├── AiModule          (OpenAI, prompt builder, retry)
├── JobsModule        (BullMQ processors, producers)
└── SharedModule      (Prisma, Redis, Logger, Cache)
```

Benefits: circular dependency detection at startup, easy mocking in tests, feature flags per module, clear ownership.

---

### Why Prisma instead of raw SQL / TypeORM?

Three reasons:

1. **Type safety end-to-end** — Prisma generates TypeScript types from `schema.prisma`. The compiler catches schema mismatches before runtime.

2. **Migration-first workflow** — `prisma migrate dev` produces SQL migrations as plain files, auditable in git history. No hidden state.

3. **Shared schema as contract** — The Zod DTOs in `shared/` are generated to match Prisma models. Frontend and backend share the same validation shapes, eliminating a whole class of API contract bugs.

TypeORM decorators scatter schema definition across entity classes; raw SQL loses type safety. Prisma centralises schema in one place and generates everything else.

---

### Why event-driven stats (BullMQ)?

Recalculating daily nutrition statistics synchronously on every meal write would block the request and make the endpoint slow under load. Instead:

```
User saves meal
      │
      ▼
API returns 201 immediately
      │
      ▼
BullMQ enqueues recalculate-daily-stats job
      │
      ▼
Worker picks up job → queries DB → updates DailyStat
```

This pattern decouples the write path from the computation, enables retries on failure, and provides a natural extension point for future jobs (email digests, streak calculations, export generation).

---

### Why Redis for caching?

The previous in-memory cache (`Map<string, CacheEntry>`) was lost on every container restart. On Cloud Run, containers cold-start frequently. Redis provides:

- **Persistence across restarts** — AI meal suggestions cached for 6h survive container recycling
- **Shared cache across instances** — Cloud Run scales horizontally; in-memory cache means cache misses on new instances
- **BullMQ dependency** — Redis is already required for the job queue; adding a cache layer is free

---

## Database Design

11 tables, fully relational with enforced foreign keys and indexes on all hot query paths.

```
User ──< Meal
     ──< FavoriteMeal
     ──< DailyStat          (upserted by BullMQ worker after every meal write)
     ──< WorkoutSession ──< WorkoutExercise
     ──< WaterIntake
     ──< UserProfile        (1-to-1)
     ──< RefreshToken       (family-based rotation, brute-force lockout)
     ──< FavoriteExercise

MealTemplate ──< MealTemplateIngredient ──> Ingredient
```

| Table | Key columns | Notes |
|-------|-------------|-------|
| `User` | id, email, failedLoginAttempts, lockedUntil | Brute-force lockout built-in |
| `RefreshToken` | tokenHash, familyId, expiresAt, revokedAt | Family rotation — stolen token revokes entire family |
| `Meal` | userId, name, calories, proteins, carbs, fats, category, date | Indexed on `userId` + `date` |
| `DailyStat` | userId, date, calories, proteins, carbs, fats | Unique on `(userId, date)`, written by background job |
| `WorkoutSession` | userId, name, date, duration, caloriesBurned | Indexed on `userId` |
| `WorkoutExercise` | workoutSessionId, wgerExerciseId, sets, reps, weight | Cascade delete with session |
| `UserProfile` | userId, height, weight, age, activity, goal | Used for TDEE calculation |
| `WaterIntake` | userId, date, glasses | Unique on `(userId, date)` |
| `MealTemplate` | name, category, macroFocus, totalCalories | Seeded reference data for AI suggestions |
| `Ingredient` | name, servingSize, calories, proteins, carbs, fats | Unique on `(name, servingSize, servingUnit)` |

---

## API Examples

Base URL: `https://gympal-backend-hjz4j5fyoq-ey.a.run.app`

Auth uses **HTTP-only cookies** — no Bearer token needed after login.

### Authentication

```http
POST /auth/register
{ "firstName": "Jan", "lastName": "Kowalski", "email": "jan@example.com", "password": "Secret123!" }

POST /auth/login
{ "email": "jan@example.com", "password": "Secret123!" }
→ Sets access_token + refresh_token cookies

POST /auth/refresh     # rotate refresh token
POST /auth/logout      # revoke token family
GET  /auth/me          # current user
```

### Nutrition

```http
POST /meals
{ "name": "Chicken breast", "calories": 165, "proteins": 31, "carbs": 0, "fats": 3.6, "category": "LUNCH", "date": "2026-03-16" }
→ 201 { id, name, calories, ... }
→ triggers BullMQ job → recalculates DailyStat

GET  /meals?date=2026-03-16    # all meals for a day
GET  /meals/recent             # last 6 unique meals (for quick-add)
PATCH /meals/:id               # partial update
DELETE /meals/:id

GET  /nutrition/daily-stats?date=2026-03-16
→ { calories: 1840, proteins: 142, carbs: 180, fats: 52 }

GET  /nutrition/weekly-stats
GET  /nutrition/tdee            # calculated from UserProfile (Mifflin-St Jeor)
```

### AI Meal Suggestions

```http
POST /ai/meal-suggestions
{ "category": "BREAKFAST", "date": "2026-03-16", "count": 3 }
→ cached in Redis for 6h per (category, macroTarget) key
→ [{ "name": "Oatmeal with banana", "calories": 380, "proteins": 12, ... }]
```

### Workouts

```http
POST /workouts
{ "name": "Push Day", "date": "2026-03-16", "duration": 60, "caloriesBurned": 420 }

POST /workouts/:id/exercises
{ "wgerExerciseId": 192, "exerciseName": "Bench Press", "sets": 4, "reps": 8, "weight": 80, "restTime": 90 }

GET  /workouts?from=2026-03-01&to=2026-03-31
GET  /workouts/stats/weekly
```

### Exercises (Wger API proxy + favorites)

```http
GET  /exercises-api?limit=20&offset=0
GET  /exercises-api/search/:term
GET  /exercises-api/category/:categoryId
POST /exercises-api/favorites     { "wgerExerciseId": 192, "name": "Bench Press", ... }
DELETE /exercises-api/favorites/:id
```

Full interactive docs: **http://localhost:4000/api/docs** (Swagger)

---

## Roadmap

### In progress
- [ ] Ingredient database with macro lookup (USDA-sourced, seeded)
- [ ] Meal templates with scaleable recipes

### Planned
- [ ] Mobile app (React Native / Expo)
- [ ] Weekly email digest (BullMQ scheduled job + Resend)
- [ ] Streak tracking and habit goals
- [ ] Barcode scanner for food logging
- [ ] Subscription tier (Stripe) with extended AI quota
- [ ] Export to CSV / PDF (nutrition reports)
- [ ] Social features — share workouts

---

## Project Structure

```
GymPal/
├── frontend/                 # Next.js 16 (App Router, i18n)
│   ├── app/[locale]/
│   │   ├── (auth)/           # Login, Register
│   │   └── (protected)/      # Dashboard, workouts, nutrition, profile
│   ├── features/             # Domain feature modules
│   ├── shared/
│   │   ├── api/              # Axios client + JWT interceptor
│   │   ├── providers/        # AuthProvider, ThemeProvider
│   │   └── stores/           # Zustand stores
│   └── e2e/                  # Playwright tests
│
├── backend/                  # NestJS 11
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/         # JWT strategy, refresh rotation
│   │   │   ├── workouts/     # Sessions, exercises
│   │   │   ├── nutrition/    # Meals, daily stats
│   │   │   ├── ai/           # OpenAI, prompt builder, retry
│   │   │   └── jobs/         # BullMQ processors & producers
│   │   └── shared/
│   │       ├── db/           # Prisma service
│   │       ├── redis/        # Redis service (cache + queue connection)
│   │       ├── cache/        # Cache abstraction (Redis-backed)
│   │       └── logger/       # Structured logger, correlation IDs
│   └── prisma/
│       ├── schema.prisma
│       └── migrations/
│
└── shared/                   # Zod schemas shared by frontend + backend
```

---

## Quick Start

### Docker (recommended)

```bash
git clone https://github.com/KacperGora/GymPal-Fullstack.git
cd GymPal-Fullstack
docker compose up -d
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3001 |
| Backend API | http://localhost:4000 |
| Swagger | http://localhost:4000/api/docs |
| Health Check | http://localhost:4000/health |

```bash
docker compose down        # stop
docker compose down -v     # stop + remove volumes
```

### Local Development

```bash
npm install

cp backend/.env.example backend/.env
# fill DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, REDIS_HOST

# database
cd backend
npx prisma generate
npx prisma migrate dev
npx prisma db seed

# start (separate terminals)
npm run start:dev -w backend   # :4000
npm run dev -w frontend        # :3001
```

---

## Scripts

| Scope | Script | Description |
|-------|--------|-------------|
| backend | `npm run start:dev -w backend` | Dev server with hot reload |
| backend | `npm run test -w backend` | Unit tests (Jest) |
| backend | `npm run test:cov -w backend` | Coverage report |
| backend | `npm run build -w backend` | Production build |
| frontend | `npm run dev -w frontend` | Dev server |
| frontend | `npm run test -w frontend` | Unit tests (Vitest) |
| frontend | `npm run e2e -w frontend` | E2E tests (Playwright) |
| frontend | `npm run build -w frontend` | Production build |

---

## Deployment

Deployed on **Google Cloud Run** (Europe West 3) with automated CI/CD:

1. Push to `dev` → GitHub Actions triggers Cloud Build
2. Cloud Build: lint → test → docker build (multi-stage) → push to Artifact Registry → deploy to Cloud Run
3. Secrets managed via **GCP Secret Manager** (DATABASE_URL, JWT_SECRET, OPENAI_API_KEY…)

```
Frontend: https://gympal-frontend-hjz4j5fyoq-ey.a.run.app
Backend:  https://gympal-backend-hjz4j5fyoq-ey.a.run.app
```

---

## Environment Variables

```env
# backend/.env
DATABASE_URL=postgresql://gympal:gympal@localhost:5432/gympal
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3001

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Optional
OPENAI_API_KEY=sk-...
SENTRY_DSN=
```

---

## License

Private repository.
