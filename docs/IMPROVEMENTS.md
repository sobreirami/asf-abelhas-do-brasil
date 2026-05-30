# ASF Abelhas do Brasil — Improvements

Known issues and planned work, ordered by priority.

---

## Critical

### 1. `searchSpecies` does not scale

`searchSpecies()` fetches all Firestore documents and filters client-side. Beyond ~500 species this becomes slow and expensive.

**Short-term fix:** use the local AsyncStorage cache as the search source (already implemented — cache hit avoids the Firestore read).

**Long-term fix:** Algolia or a Firestore extension for full-text search, or a normalized `searchKey` field with `startAt`/`endAt` range queries.

---

## Important

### 2. `src/styles/` should be co-located

Screen styles live in `src/styles/screens/` and are imported via `@/styles/screens/*`. The goal is to move each file next to its screen (e.g., `src/app/(tabs)/homeStyles.ts`) and delete the `src/styles/` tree.

**Action:** for each screen, move its style file next to it and update the import, then:

```bash
grep -r "from '@/styles/" src/   # should return nothing after migration
git rm -r src/styles/
```

### 3. `src/components/species/ReportModal.tsx` is a re-export

The standalone file exists only because the sandbox cannot delete mounted files. The canonical implementation is in `src/components/species/ReportModal/`.

**Action:** `git rm src/components/species/ReportModal.tsx`

### 4. `preferencesStyles.ts` uses hardcoded values

`src/styles/screens/tabs/preferencesStyles.ts` uses raw numbers (`20`, `30`, `34`, `17`) instead of `Spacing.*` and `FontSize.*` constants.

**Action:** refactor to use constants from `@/constants/theme`.

---

## Quality

### 5. No tests

No test setup exists. Suggested minimal stack:

```bash
npm install --save-dev jest jest-expo @testing-library/react-native
```

Start with unit tests for `speciesService.ts` and `cacheService.ts`, then component tests for `SpeciesCard` and filter logic.

### 6. No Error Boundary

A render error in any screen crashes the app without recovery. Add a top-level `ErrorBoundary` in `src/app/_layout.tsx`.

### 7. Migrate AsyncStorage → MMKV

`storage.ts` is already abstracted as a swap point. MMKV is ~10x faster and synchronous.

```ts
// storage.ts — MMKV drop-in
import { MMKV } from 'react-native-mmkv';
const storage = new MMKV();
export const storageAdapter = {
  getItem: (key: string) => storage.getString(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.delete(key),
};
```

See `MMKV_MIGRATION.md` for the full migration plan.

---

## Future

| Item                      | Notes                                                            |
| ------------------------- | ---------------------------------------------------------------- |
| Species comparison screen | Side-by-side two species                                         |
| Favorites tab             | Surface favorited species in a dedicated tab                     |
| Push notifications        | "Species of the day" — `expo-notifications` is already installed |
| Algolia search            | Replace client-side full-text search                             |
| React Query               | Replace manual fetch + cache + loading logic in services         |
| Jest setup                | Unit + component tests                                           |
