# GymPal Frontend — Architektura

## Podział `app/(auth)/` vs `features/auth/`

### `app/(auth)/` — routing

Definiuje URL-e: `/login`, `/register`, `/remind-password`. Pliki `page.tsx` to punkty wejścia dla Next.js. Komponenty formularzy (`LoginForm.tsx` itd.) zostają tu, bo są specyficzne dla danej strony.

### `features/auth/` — logika i reużywalne elementy

Rzeczy niezwiązane z konkretnym URL-em:

- **`api/`** — wywołania HTTP (`login()`, `getMe()`)
- **`queries/`** — hooki React Query (`useMe`)
- **`mutations/`** — hooki mutacji (`useLogin`, `useRegister`)
- **`components/`** — współdzielone komponenty auth (`AuthCard`, `AuthFormLayout`, `AuthSubmitButton`) — używane przez login, register i remind-password jednocześnie

## Zasada

> Jeśli komponent/logika jest używana tylko na jednej stronie — zostaje w `app/(auth)/login/components/`. Jeśli jest współdzielona między stronami auth — idzie do `features/auth/components/`.

## Struktura

```
app/(auth)/login/
├── page.tsx                ← definiuje URL /login
└── components/
    └── LoginForm.tsx       ← używany TYLKO na /login

features/auth/
├── components/
│   ├── AuthCard.tsx        ← używany na /login, /register, /remind-password
│   └── AuthSubmitButton.tsx
├── api/auth.api.ts         ← login(), getMe() — logika HTTP
└── queries/useMe.ts        ← hook React Query
```
