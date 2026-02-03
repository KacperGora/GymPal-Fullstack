# GymPal

Aplikacja do śledzenia treningów, posiłków i postępów fitness.

## Tech Stack

| Warstwa | Technologie |
|---------|-------------|
| **Frontend** | Next.js 16, React 19, MUI 7, React Query, React Hook Form |
| **Backend** | NestJS 11, Prisma 7, PostgreSQL 16 |
| **Auth** | JWT + HTTP-only cookies, Passport.js |
| **i18n** | next-intl |
| **Testing** | Jest, Vitest, Playwright |
| **CI/CD** | GitHub Actions |

## Struktura projektu

```
├── frontend/          # Next.js app
├── backend/           # NestJS API
├── shared/            # Współdzielone typy i schematy Zod
└── mobile/            # (planowane) React Native
```

## Wymagania

- Node.js 20+
- PostgreSQL 16+
- npm 10+

## Instalacja

```bash
# Klonowanie repo
git clone https://github.com/twoj-user/gympal.git
cd gympal

# Instalacja zależności (wszystkie workspaces)
npm install

# Konfiguracja środowiska
cp backend/.env.example backend/.env
# Uzupełnij DATABASE_URL i JWT_SECRET
```

## Baza danych

```bash
cd backend

# Generowanie klienta Prisma
npx prisma generate

# Migracje
npx prisma migrate dev

# (opcjonalnie) Seed danych
npx prisma db seed
```

## Uruchomienie

```bash
# Backend (port 3000)
npm run start:dev --workspace=backend

# Frontend (port 3001)
npm run dev --workspace=frontend
```

## Skrypty

### Backend
| Skrypt | Opis |
|--------|------|
| `npm run start:dev -w backend` | Dev server z hot reload |
| `npm run test -w backend` | Testy jednostkowe |
| `npm run test:cov -w backend` | Coverage |
| `npm run build -w backend` | Build produkcyjny |

### Frontend
| Skrypt | Opis |
|--------|------|
| `npm run dev -w frontend` | Dev server |
| `npm run test -w frontend` | Testy Vitest |
| `npm run e2e -w frontend` | Testy E2E Playwright |
| `npm run build -w frontend` | Build produkcyjny |

## API

Główne endpointy:

- `POST /auth/register` - Rejestracja
- `POST /auth/login` - Logowanie
- `GET /auth/me` - Aktualny użytkownik
- `GET /workouts` - Lista treningów
- `POST /workouts` - Nowy trening
- `GET /exercises` - Katalog ćwiczeń

## Funkcjonalności

- Rejestracja i logowanie
- Katalog ćwiczeń (siłowe, cardio, rozciąganie, HIIT)
- Planowanie i śledzenie sesji treningowych
- Śledzenie posiłków i makroskładników
- Dzienne statystyki kaloryczne
- Profile użytkowników (waga, wzrost, cele)
- Wielojęzyczność (PL/EN)

## Licencja

Prywatne repozytorium.
