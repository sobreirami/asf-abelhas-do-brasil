# ASF Abelhas do Brasil

Mobile app for the catalog of Brazilian native stingless bees, built for the Associação de Saúde da Família (ASF). Users can browse, search, filter and read detailed profiles of stingless bee species.

---

## Getting started

### Prerequisites

- Node.js 20+
- npm 10+
- Xcode (iOS, macOS only)
- Android Studio (Android)
- Expo CLI: `npm install -g expo-cli`

### Install and run

```bash
git clone https://github.com/sobreirami/asf-abelhas-do-brasil.git
cd asf-abelhas-do-brasil

cp .env.example .env   # fill in Firebase credentials

npm install
npm start              # Expo Go (quick preview)
npm run ios            # iOS simulator
npm run android        # Android emulator
```

---

## Architecture

```
src/app/ (Expo Router)
    ├── (tabs)/             ← NativeTabs: Gallery · About · Preferences
    ├── species/[id]        ← Species detail (card presentation)
    ├── filters             ← Advanced filters (transparent modal)
    ├── report              ← Report error (transparent modal)
    └── onboarding          ← First-run flow
```

| Layer                | Responsibility                                                        |
| -------------------- | --------------------------------------------------------------------- |
| `app/`               | File-based routes (Expo Router) + co-located styles                   |
| `components/`        | Reusable UI components — folder pattern with `styles.ts` + `index.ts` |
| `contexts/`          | Global state: `ThemeContext`, `LanguageContext`, `FilterContext`      |
| `services/`          | Data access: Firebase Firestore + AsyncStorage cache                  |
| `types/`             | TypeScript domain types (`Species`, `SpeciesFilter`, …)               |
| `constants/theme.ts` | `Colors`, `Spacing`, `Typography` — single source of truth            |
| `locales/`           | i18n strings: `pt-BR.ts`, `en.ts`, `es.ts`                            |

**Stack:** React Native · Expo SDK 56 · Expo Router 56 · Firebase · Reanimated v4 · TypeScript strict

---

## Data flow

### Species list

```
HomeScreen (mount)
  ├── fetchFeaturedSpecies()  → Firestore (featured == true, limit 10) → cache
  └── fetchSpecies()          → Firestore (paginated, 20/page)         → cache

Filters (client-side, applied in-memory)
  searchText · behavior · regions · biomes · conservationStatus · tags
```

### Offline fallback

Online-first: always fetches from Firebase. On error, falls back to AsyncStorage cache. Cache is refreshed on every successful first-page fetch.

---

## Scripts

| Script               | Description                        |
| -------------------- | ---------------------------------- |
| `npm start`          | Start Metro bundler                |
| `npm run ios`        | Build and open on iOS simulator    |
| `npm run android`    | Build and open on Android emulator |
| `npm run lint`       | Run ESLint                         |
| `npm run lint:fix`   | Auto-fix ESLint errors             |
| `npm run format`     | Format with Prettier               |
| `npm run type:check` | TypeScript check (`tsc --noEmit`)  |

---

## Environment variables

Credentials are read via `expo-constants` from `app.json → extra`. Copy `.env.example` to `.env` and fill in the Firebase values.

```bash
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=...
FIREBASE_STORAGE_BUCKET=...
FIREBASE_MESSAGING_SENDER_ID=...
FIREBASE_APP_ID=...
```

> **Never commit `.env`** — it is listed in `.gitignore`.

---

## Build and distribution (EAS)

```bash
# Development build
eas build --profile development --platform ios

# Production build
eas build --platform all

# OTA update (no new build required)
eas update --branch production --message "fix: species detail crash"
```

Configuration in `eas.json`. Project ID: `a0d5f249-00a0-4622-98ca-e79a4ba16f4c`.

---

## Code conventions

- **Code in English** — variables, functions, types, comments
- **UI strings in Portuguese** — all user-visible text stays in pt-BR (base language)
- No hardcoded colors — always `Colors[colorScheme]` from `@/constants/theme`
- No hardcoded spacing — always `Spacing.*` from `@/constants/theme`
- No `any` — use `unknown` + type guards, or proper Firebase types (`Timestamp`)
- New visible text → add key to all 3 locale files (`pt-BR.ts`, `en.ts`, `es.ts`)

---

## Documentation

| Doc                                          | Content                                       |
| -------------------------------------------- | --------------------------------------------- |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Project structure, routing, provider tree     |
| [docs/SETUP.md](docs/SETUP.md)               | Firebase setup, Firestore schema, EAS         |
| [docs/DATA_FLOWS.md](docs/DATA_FLOWS.md)     | Species loading, filters, offline, onboarding |
| [docs/PATTERNS.md](docs/PATTERNS.md)         | TypeScript, components, styles, imports       |
| [docs/VERSIONING.md](docs/VERSIONING.md)     | Semantic versioning and release cycle         |
| [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) | Commit convention and PR guidelines           |
| [docs/IMPROVEMENTS.md](docs/IMPROVEMENTS.md) | Known issues and planned improvements         |
