# GymPal

![Node Version](https://img.shields.io/badge/node-%3E%3D22.0.0-brightgreen)
![License](https://img.shields.io/badge/license-Private-red)

Aplikacja do śledzenia treningów, posiłków i postępów fitness.

## Funkcjonalności

- [x] Rejestracja i logowanie użytkowników (JWT + HTTP-only cookies)
- [x] Katalog ćwiczeń (siłowe, cardio, rozciąganie, HIIT)
- [x] Planowanie i śledzenie sesji treningowych
- [x] Zarządzanie treningami (CRUD)
- [x] Śledzenie postępów i statystyk
- [x] Profile użytkowników (waga, wzrost, cele)
- [x] Wielojęzyczność (PL/EN)
- [x] Responsywny interfejs użytkownika
- [x] Dokumentacja API (Swagger)
- [x] Docker Compose dla łatwego wdrożenia
- [ ] Śledzenie posiłków i makroskładników
- [ ] Dzienne statystyki kaloryczne
- [ ] Aplikacja mobilna (React Native)

## Architektura

```mermaid
graph LR
    A[Frontend<br/>Next.js 16<br/>React 19<br/>MUI 7] -->|HTTP/REST| B[Backend<br/>NestJS 11<br/>Prisma 7]
    B -->|SQL| C[(PostgreSQL 16)]
    A -.->|Shared Types| D[Shared<br/>Zod Schemas]
    B -.->|Shared Types| D

    style A fill:#61dafb,stroke:#333,stroke-width:2px
    style B fill:#e0234e,stroke:#333,stroke-width:2px
    style C fill:#336791,stroke:#333,stroke-width:2px
    style D fill:#3068b7,stroke:#333,stroke-width:2px
```

**Główne komponenty:**
- **Frontend**: Next.js z React Query do zarządzania stanem serwera
- **Backend**: NestJS z Prisma ORM do komunikacji z bazą danych
- **Shared**: Wspólne schematy walidacji Zod używane w frontend i backend
- **Baza danych**: PostgreSQL 16 do przechowywania danych aplikacji

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

## Wymagania wstępne

- Node.js 22+ (zalecane: użyj nvm do zarządzania wersjami)
- PostgreSQL 16+
- npm 10+
- Docker i Docker Compose (opcjonalnie, do szybkiego startu)

## Quick Start z Docker

Najszybszy sposób na uruchomienie całej aplikacji:

```bash
# Klonowanie repo
git clone https://github.com/twoj-user/gympal.git
cd gympal

# Uruchomienie całego stacku (postgres, backend, frontend)
docker compose up -d

# Sprawdzenie statusu kontenerów
docker compose ps
```

Aplikacja będzie dostępna pod adresami:
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:4000
- **API Documentation (Swagger)**: http://localhost:4000/api/docs
- **Health Check**: http://localhost:4000/health
- **PostgreSQL**: localhost:5432 (user: gympal, password: gympal, db: gympal)

Zatrzymanie i wyczyszczenie:
```bash
docker compose down
docker compose down -v  # z usunięciem volumenu bazy danych
```

## Development Setup (lokalne uruchomienie)

### 1. Instalacja zależności

```bash
# Klonowanie repo
git clone https://github.com/twoj-user/gympal.git
cd gympal

# Instalacja zależności (wszystkie workspaces)
npm install
```

### 2. Konfiguracja środowiska

```bash
# Konfiguracja backendu
cp backend/.env.example backend/.env
# Uzupełnij DATABASE_URL i JWT_SECRET w pliku backend/.env
```

Przykładowa zawartość `.env`:
```env
DATABASE_URL=postgresql://gympal:gympal@localhost:5432/gympal
JWT_SECRET=your_secure_jwt_secret_key_here
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3001
```

### 3. Przygotowanie bazy danych

Upewnij się, że PostgreSQL jest uruchomiony lokalnie lub użyj Docker:

```bash
# Opcja A: Docker (zalecane)
docker run --name gympal-postgres -e POSTGRES_USER=gympal -e POSTGRES_PASSWORD=gympal -e POSTGRES_DB=gympal -p 5432:5432 -d postgres:16-alpine

# Opcja B: Lokalna instalacja PostgreSQL
# Utwórz bazę danych 'gympal' ręcznie
```

Następnie uruchom migracje Prisma:

```bash
cd backend

# Generowanie klienta Prisma
npx prisma generate

# Uruchomienie migracji
npx prisma migrate dev

# (opcjonalnie) Załadowanie przykładowych danych
npx prisma db seed
```

### 4. Uruchomienie aplikacji

Uruchom backend i frontend w osobnych terminalach:

```bash
# Terminal 1: Backend (port 4000)
npm run start:dev --workspace=backend

# Terminal 2: Frontend (port 3001)
npm run dev --workspace=frontend
```

Aplikacja będzie dostępna pod adresami:
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:4000
- **API Documentation**: http://localhost:4000/api/docs

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

## Dokumentacja API

Backend udostępnia pełną dokumentację API w formacie OpenAPI/Swagger:

- **Swagger UI**: http://localhost:4000/api/docs
- **OpenAPI JSON**: http://localhost:4000/api-json

### Główne endpointy

**Autentykacja:**
- `POST /auth/register` - Rejestracja nowego użytkownika
- `POST /auth/login` - Logowanie (zwraca JWT w HTTP-only cookie)
- `POST /auth/logout` - Wylogowanie
- `GET /auth/me` - Pobranie danych zalogowanego użytkownika

**Treningi:**
- `GET /workouts` - Lista treningów użytkownika
- `POST /workouts` - Utworzenie nowego treningu
- `GET /workouts/:id` - Szczegóły treningu
- `PATCH /workouts/:id` - Aktualizacja treningu
- `DELETE /workouts/:id` - Usunięcie treningu

**Ćwiczenia:**
- `GET /exercises` - Katalog ćwiczeń
- `GET /exercises/:id` - Szczegóły ćwiczenia
- `POST /exercises` - Dodanie nowego ćwiczenia (admin)

**Health Check:**
- `GET /health` - Status backendu i połączenia z bazą danych

## Licencja

Prywatne repozytorium.
