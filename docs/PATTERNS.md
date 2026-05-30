# ASF Abelhas do Brasil — Patterns & Conventions

## Language rules

- **Code in English** — variable names, function names, types, interfaces, comments
- **UI strings in Portuguese** — all user-visible text stays in pt-BR (base language); translations in `en.ts` / `es.ts`

```ts
// correct
const selectedSpecies: Species | null = null;
const loadingMore = false;

// wrong
const especieSelecionada: Species | null = null;
```

---

## TypeScript

- `strict: true` — no exceptions
- No `any` — use `unknown` + type guards, or correct Firebase types (`Timestamp`)
- Interfaces for domain objects (`Species`, `SpeciesFilter`)
- Type aliases for unions (`ThemePreference = 'light' | 'dark' | 'auto'`)
- Path alias: `@/*` → `./src/*`
- All service functions must declare explicit return types

---

## Components

### Complex component — folder pattern

```
ComponentName/
├── ComponentName.tsx   ← implementation
├── styles.ts           ← StyleSheet.create({})
├── index.ts            ← export { default } from './ComponentName'
└── constants.ts        ← (optional) local constants
```

### Simple component

Single file `ComponentName.tsx` in `src/components/ui/`.

### Props

No `React.FC` — use explicit function declarations with typed props:

```ts
// correct
type SpeciesCardProps = { species: Species; onPress: () => void };
export default function SpeciesCard({ species, onPress }: SpeciesCardProps) {}

// wrong
const SpeciesCard: React.FC<SpeciesCardProps> = ({ species, onPress }) => {};
```

---

## Styles

- `StyleSheet.create()` in a `styles.ts` file co-located with the screen or component
- Colors always via `Colors[colorScheme]` from `@/constants/theme` — never hardcoded
- Spacing always via `Spacing.*` from `@/constants/theme`
- Screens in `app/` have their styles file in the same folder (`homeStyles.ts`, etc.)

```ts
// correct
import { Colors, Spacing } from '@/constants/theme';
const colors = Colors[colorScheme];
<View style={{ padding: Spacing.lg, backgroundColor: colors.background }} />

// wrong
<View style={{ padding: 16, backgroundColor: '#FFFFFF' }} />
```

---

## Contexts

- One context per domain: `ThemeContext`, `LanguageContext`, `FilterContext`
- Use `use(Context)` from React 19 — not `useContext`
- Always throw if used outside provider:

```ts
export function useFilter() {
  const context = use(FilterContext);
  if (context === undefined) throw new Error('useFilter must be used within FilterProvider');
  return context;
}
```

- `setActiveFilters` is `Dispatch<SetStateAction<FilterOptions>>` — accepts updater functions

---

## Services

- One file per data domain
- Named exports (no classes)
- Explicit return types on all async functions
- Errors propagated to caller — no silent swallowing
- No empty `try { ... } catch (e) { throw e }` — remove the wrapper

---

## Hooks and performance

- `useFocusEffect` callbacks must be wrapped in `useCallback` with correct deps
- `renderItem`, `renderHeader`, and other FlatList callbacks should use `useCallback`
- Avoid recreating expensive objects on every render

```ts
// correct
useFocusEffect(
  useCallback(() => {
    if (pendingTagFilter) {
      /* … */
    }
  }, [pendingTagFilter])
);

// wrong — violates rules-of-hooks
useFocusEffect(() => {
  if (pendingTagFilter) {
    /* … */
  }
});
```

---

## Navigation

- `router.push()` — forward navigation
- `router.replace()` — navigation without history (onboarding → home)
- `router.back()` — go back
- URL params for simple data: `/species/[id]`
- Context for cross-screen state: `pendingTagFilter`

---

## i18n

Add keys to **all three** locale files whenever a new user-visible string is added:

```
src/locales/
├── pt-BR.ts   ← base language
├── en.ts
└── es.ts
```

---

## Imports — preferred order

1. React and built-in hooks
2. External packages (`expo-*`, `react-native-*`, `firebase/*`)
3. Internal aliases (`@/components`, `@/contexts`, `@/services`, …)
4. Relative imports (`./styles`, `../utils`)

---

## Naming

| Element            | Convention                  | Example                         |
| ------------------ | --------------------------- | ------------------------------- |
| Components         | PascalCase                  | `SpeciesCard`                   |
| Hooks              | camelCase with `use` prefix | `useColorScheme`                |
| Service functions  | camelCase                   | `fetchSpecies`                  |
| Contexts           | PascalCase + suffix         | `ThemeContext`, `ThemeProvider` |
| Types / Interfaces | PascalCase                  | `Species`, `FilterOptions`      |
| Constants          | UPPER_SNAKE or camelCase    | `PAGE_SIZE`, `Colors`           |
| Route files        | kebab-case or `[param]`     | `species/[id].tsx`              |
| Style objects      | `styles`                    | `styles.container`              |
| Docs               | UPPER_SNAKE_CASE            | `ARCHITECTURE.md`               |

---

## Lint and formatting

ESLint with `eslint-config-expo` (flat config) + Prettier integrated.

Key rules:

- `prettier/prettier` → error — formatting is mandatory
- `@typescript-eslint/no-explicit-any` → warning
- `react-hooks/rules-of-hooks` → error
- `react-hooks/exhaustive-deps` → warning
- `no-console` → warning (except `warn` and `error`)
- `prefer-const` → error

Run before committing:

```bash
npm run lint
npm run format:check
npm run type:check
```
