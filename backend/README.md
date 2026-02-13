# GymPal Backend

REST API aplikacji GymPal do śledzenia treningów i żywienia, zbudowane z użyciem NestJS.

## Stack technologiczny

- **Framework:** NestJS 11
- **Baza danych:** PostgreSQL 16 + Prisma 7 ORM
- **Autoryzacja:** JWT + HTTP-only cookies + Refresh Token Rotation
- **Walidacja:** Zod (wspólne schematy z `@gympal/shared`, ZodValidationPipe per-endpoint)
- **Testy:** Jest (~70% pokrycia)
- **Dokumentacja:** Swagger/OpenAPI

## Szybki start

### Wymagania

- Node.js 22+
- PostgreSQL 16+
- npm/yarn/pnpm

### Instalacja

```bash
# Zainstaluj zależności
npm install

# Wygeneruj klienta Prisma
npx prisma generate

# Uruchom migracje
npx prisma migrate dev

# (Opcjonalnie) Wypełnij bazę danymi testowymi
npx prisma db seed
```

### Zmienne środowiskowe

Utwórz plik `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/gympal"
JWT_SECRET="twoj-jwt-secret"
JWT_REFRESH_SECRET="twoj-refresh-secret"
# Lokalny dev (frontend na porcie 3000)
CORS_ORIGIN="http://localhost:3000"
# Docker (frontend mapowany na 3001)
# CORS_ORIGIN="http://localhost:3001"
PORT=4000
```

### Uruchomienie

```bash
# Tryb deweloperski (watch mode)
npm run start:dev

# Produkcja
npm run build
npm run start:prod

# Tryb debugowania
npm run start:debug
```

## Dokumentacja API

Swagger UI dostępny pod `/api/docs` w środowiskach nieprodukcyjnych.

## Struktura projektu

```
src/
├── main.ts                 # Punkt wejścia aplikacji
├── app.module.ts           # Główny moduł
├── middlewares/            # Middleware HTTP (logowanie)
├── shared/
│   ├── db/                 # Serwis i moduł Prisma
│   ├── decorators/         # Własne dekoratory (@RequestUser)
│   └── pipes/              # Pipe'y walidacyjne (ZodValidationPipe)
├── generated/              # Wygenerowany klient Prisma
└── modules/
    ├── auth/               # Autoryzacja (JWT, refresh tokens)
    ├── exercises/          # Ulubione ćwiczenia
    ├── favorites/          # Ulubione ogólne
    ├── health/             # Health checks (/health)
    ├── meals/              # Śledzenie posiłków
    ├── nutrition/          # Statystyki żywieniowe
    ├── user-profile/       # Zarządzanie profilem
    ├── water/              # Śledzenie wody
    └── workouts/           # Sesje treningowe i ćwiczenia
```

## Moduły

| Moduł            | Opis                                             |
| ---------------- | ------------------------------------------------ |
| **Auth**         | Autoryzacja JWT, rotacja tokenów, token families |
| **Workouts**     | CRUD dla sesji treningowych i ćwiczeń            |
| **Meals**        | Logowanie posiłków z danymi żywieniowymi         |
| **Nutrition**    | Dzienne/tygodniowe statystyki żywieniowe         |
| **Water**        | Śledzenie dziennego spożycia wody                |
| **User Profile** | Preferencje, cele, pomiary użytkownika           |
| **Exercises**    | Zarządzanie ulubionymi ćwiczeniami               |
| **Health**       | Health checks dla Kubernetes/Railway             |

## Bezpieczeństwo

- **Rate Limiting:** ThrottlerGuard (100 req/min globalnie, 10 req/min dla refresh)
- **Nagłówki HTTP:** Helmet middleware
- **Bezpieczeństwo tokenów:**
  - SHA256 hashowane refresh tokeny w bazie
  - Token family tracking z wykrywaniem ponownego użycia
  - Fingerprinting urządzeń (userAgent, IP)
  - Automatyczne czyszczenie przez cron jobs
- **Cookies:** HttpOnly + Secure + SameSite=Lax

## Testowanie

```bash
# Testy jednostkowe
npm run test

# Tryb watch
npm run test:watch

# Raport pokrycia
npm run test:cov

# Testy E2E
npm run test:e2e
```

Raporty pokrycia generowane są w katalogu `coverage/`.

## Baza danych

### Komendy Prisma

```bash
# Generuj klienta po zmianach schematu
npx prisma generate

# Utwórz migrację
npx prisma migrate dev --name <nazwa_migracji>

# Zastosuj migracje (produkcja)
npx prisma migrate deploy

# Otwórz Prisma Studio (GUI)
npx prisma studio

# Zresetuj bazę
npx prisma migrate reset
```

### Przegląd schematu

Główne modele:

- `User` - Konta użytkowników z danymi autoryzacyjnymi
- `RefreshToken` - JWT refresh tokeny z family tracking
- `WorkoutSession` / `WorkoutExercise` - Dane treningowe
- `Meal` - Wpisy posiłków z wartościami odżywczymi
- `DailyStat` - Zagregowane statystyki dzienne
- `UserProfile` - Preferencje i cele użytkownika
- `WaterIntake` - Logi spożycia wody

## Docker

```bash
# Zbuduj obraz
docker build -t gympal-backend .

# Uruchom z docker-compose (z głównego katalogu)
docker-compose up backend
```

Dockerfile wykorzystuje multi-stage builds dla zoptymalizowanych obrazów produkcyjnych.

## Jakość kodu

```bash
# Lint
npm run lint

# Formatowanie
npm run format
```

Pre-commit hooks (Husky + lint-staged) zapewniają jakość kodu przy każdym commicie.

## Licencja

Prywatny - UNLICENSED
