# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# ASF Abelhas do Brasil

Mobile catalog of Brazilian native stingless bees (ASF). Users browse, filter and read detailed profiles of bee species — 3 languages, light/dark theme.

## Documentation

@docs/ARCHITECTURE.md
@docs/SETUP.md
@docs/DATA_FLOWS.md
@docs/PATTERNS.md
@docs/DESIGN.md
@docs/VERSIONING.md
@docs/CONTRIBUTING.md
@docs/IMPROVEMENTS.md

---

## Commands

```bash
npm start              # Expo dev server (Metro bundler)
npm run ios            # iOS simulator
npm run android        # Android emulator
npm run lint           # ESLint
npm run lint:fix       # ESLint with auto-fix
npm run format:check   # Prettier check
npm run format         # Prettier write
npm run type:check     # TypeScript (tsc --noEmit)
```

Before committing: `npm run lint && npm run format:check && npm run type:check`

---

## Stack

| Item          | Value                                                    |
| ------------- | -------------------------------------------------------- |
| Framework     | Expo SDK 58 + React Native 0.88 + React 19.3             |
| Navigation    | Expo Router 58 (file-based, App Directory)               |
| Backend       | Firebase Firestore + Firebase Storage                    |
| Local storage | AsyncStorage (abstracted in `storage.ts` — MMKV-ready)   |
| Animations    | react-native-reanimated 4.7 + react-native-worklets 0.13 |
| Gestures      | react-native-gesture-handler 3 (hook API)                |
| Language      | TypeScript strict                                        |

## Structure

```
src/
├── app/           ← routes (screens import styles from src/styles/)
├── components/    ← folder pattern: ComponentName/ + styles.ts + index.ts
├── contexts/      ← ThemeContext, LanguageContext, FilterContext
├── services/      ← Firebase + AsyncStorage
├── styles/        ← screen styles (legacy location; target: co-locate next to screens)
├── types/         ← Species, SpeciesFilter, …
├── constants/     ← theme.ts (Colors, Spacing, Typography)
├── hooks/         ← useColorScheme, useThemeColor
├── locales/       ← pt-BR.ts, en.ts, es.ts
└── utils/         ← haptics.ts
```

---

## Rules

- **Code in English** — variables, functions, types, comments
- **UI strings in Portuguese** — all user-visible text (base language)
- No hardcoded colors — always `Colors[colorScheme]` from `@/constants/theme`
- No hardcoded spacing — always `Spacing.*` from `@/constants/theme`
- No `any` — use `Timestamp` for Firestore dates, `unknown` + type guards elsewhere
- `use(Context)` from React 19 — not `useContext`
- No `React.FC` — explicit function declarations with typed props
- `useFocusEffect` callbacks must be wrapped in `useCallback`
- New visible text → add key to all 3 locale files (`pt-BR.ts`, `en.ts`, `es.ts`)
- Commits in English, Conventional Commits format (see `docs/CONTRIBUTING.md`)

## Environment & config

- Credentials live in `.env` (gitignored) — copy from `.env.example`
- **`app.config.js`** (not `app.json`) reads `.env` via `dotenv` and injects into `expo-constants` — Firebase credentials are read at runtime from `Constants.expoConfig.extra`
- Firebase field names in Firestore must be exact — a trailing space (`"featured "`) makes `where('featured', '==', true)` return 0 results silently

## Architecture decisions

- **Online-first + offline fallback** — always fetches Firebase; falls back to AsyncStorage on error
- **Client-side filters** — applied in-memory over loaded list; Firestore queries only for `region`/`behavior`
- **NativeTabs** — `expo-router/native-tabs` for native tab behavior on iOS/Android (Android `md` icons require `expo-symbols`)
- **No external state manager** — React Context is sufficient
- **`storage.ts` abstraction** — drop-in swap point for MMKV
- **expo-router SDK 58** — no direct `@react-navigation/*` imports; use re-exports from `expo-router` (`ThemeProvider`, `DarkTheme`, `DefaultTheme`)

## Skeleton loading

`src/components/ui/SkeletonLoader.tsx` exports:

- `default SkeletonLoader` — generic animated block
- `SkeletonSpeciesCard` — card used in the gallery list
- `SkeletonSpeciesDetail` — full-screen skeleton for the species detail screen

## Known tech debt

1. `src/styles/` — screen styles live here instead of co-located next to each screen. Before deleting, migrate all `@/styles/screens/*` imports into files next to their respective screens, then `git rm -r src/styles/`
2. `src/components/species/ReportModal.tsx` — delete with `git rm` (re-export; impl in `ReportModal/`)
3. `searchSpecies` — not scalable beyond ~500 docs; consider Algolia
4. `preferencesStyles.ts` — uses hardcoded values instead of `Spacing`/`FontSize`
5. No tests — add `jest` + `jest-expo`
