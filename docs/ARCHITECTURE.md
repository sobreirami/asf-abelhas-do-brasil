# ASF Abelhas do Brasil — Architecture

## Stack

| Item          | Value                                                      |
| ------------- | ---------------------------------------------------------- |
| Framework     | Expo SDK 58 + React Native 0.88 + React 19.3               |
| Navigation    | Expo Router 58 (file-based, App Directory)                 |
| Backend       | Firebase Firestore + Firebase Storage                      |
| Local storage | AsyncStorage (`@react-native-async-storage/async-storage`) |
| Animations    | react-native-reanimated 4.7 + react-native-worklets 0.13   |
| Gestures      | react-native-gesture-handler 3 (hook API)                  |
| Language      | TypeScript strict                                          |

---

## Folder structure

```
src/
├── app/                    ← Expo Router file-based routes
│   ├── _layout.tsx         ← Root layout: providers + stack config
│   ├── (tabs)/             ← NativeTabs group
│   │   ├── _layout.tsx     ← Tab layout (expo-router/native-tabs)
│   │   ├── index.tsx       ← Species gallery
│   │   ├── conservation.tsx ← Conservation status overview
│   │   ├── about.tsx       ← About ASF
│   │   └── preferences.tsx ← User settings
│   ├── species/[id].tsx    ← Species detail
│   ├── filters.tsx         ← Advanced filters modal
│   ├── report.tsx          ← Report modal
│   └── onboarding.tsx      ← First-run onboarding
│
├── components/             ← Reusable components
│   ├── home/               ← HomeScreen-specific
│   ├── species/            ← SpeciesDetail-specific
│   ├── preferences/        ← Preferences-specific
│   ├── about/              ← About-specific
│   └── ui/                 ← Generic UI primitives
│
├── contexts/               ← React 19 Contexts
│   ├── ThemeContext.tsx     ← light / dark / auto
│   ├── LanguageContext.tsx  ← active language + translations
│   └── FilterContext.tsx   ← gallery filter state
│
├── services/               ← Data access layer
│   ├── firebase.ts         ← Firebase init (reads from expo-constants)
│   ├── speciesService.ts   ← Firestore CRUD for species
│   ├── cacheService.ts     ← AsyncStorage offline cache
│   ├── favoritesService.ts ← Local favorites
│   ├── preferencesService.ts
│   ├── languageService.ts
│   └── storage.ts          ← AsyncStorage abstraction (swap-ready for MMKV)
│
├── types/
│   └── species.ts          ← Domain interfaces (Species, SpeciesFilter, …)
│
├── constants/
│   └── theme.ts            ← Colors, Spacing, Typography — single source of truth
│
├── hooks/
│   ├── useColorScheme.ts   ← Reads from ThemeContext
│   └── useThemeColor.ts    ← Returns color for current scheme
│
├── locales/                ← i18n string tables
│   ├── pt-BR.ts
│   ├── en.ts
│   └── es.ts
│
├── styles/                 ← Screen styles (legacy; target: co-locate next to screens)
│   └── screens/
│       ├── onboardingStyles.ts
│       └── tabs/
│           ├── homeStyles.ts
│           ├── aboutStyles.ts
│           └── preferencesStyles.ts
│
└── utils/
    └── haptics.ts          ← Haptic feedback wrappers
```

At the project root:

```
scripts/
├── import-species.js           ← seed Firestore from species-data.json
├── fetch-inaturalist-photos.js ← attach iNaturalist photo credits
├── backfill-covers.js          ← backfill cover photos on existing docs
├── species-data.json           ← curated dataset (source of truth for species content)
└── firestore-example-data.json ← minimal sample for schema reference
```

---

## Routes

```
/ (root Stack)
├── /onboarding                    — first run, no back history
├── /(tabs)                        — NativeTabs
│   ├── /                          — species gallery
│   ├── /about                     — about ASF
│   └── /preferences               — settings
├── /species/[id]                  — detail (presentation: card)
├── /filters                       — filters (containedTransparentModal)
└── /report                        — report error (containedTransparentModal)
```

---

## Provider tree

```tsx
<LanguageProvider>
  {' '}
  // outermost — sets locale before theme reads preferences
  <ThemeProvider>
    <FilterProvider>
      <NavigationThemeProvider>
        {' '}
        // react-navigation dark/light
        <Stack />
        <StatusBar />
      </NavigationThemeProvider>
    </FilterProvider>
  </ThemeProvider>
</LanguageProvider>
```

---

## Component pattern

Every complex component lives in its own folder:

```
ComponentName/
├── ComponentName.tsx   ← implementation
├── styles.ts           ← StyleSheet.create({})
├── index.ts            ← export { default } from './ComponentName'
└── constants.ts        ← (optional) local constants
```

Simple, single-file components live in `components/ui/`.

---

## Architecture decisions

| Decision                           | Rationale                                                                                               |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Online-first with offline fallback | Always fetches from Firebase; falls back to AsyncStorage cache on error                                 |
| Client-side filters                | Applied in-memory over the loaded list (Firestore queries only for `region`)                            |
| NativeTabs                         | `expo-router/native-tabs` gives native iOS/Android tab feel (Android `md` icons require `expo-symbols`) |
| No external state manager          | React Context is sufficient for the current scope                                                       |
| `storage.ts` abstraction           | Drop-in swap point for MMKV when native builds are available                                            |
