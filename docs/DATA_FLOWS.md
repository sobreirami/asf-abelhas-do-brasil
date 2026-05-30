# ASF Abelhas do Brasil — Data Flows

## Species list (HomeScreen)

```
HomeScreen (mount)
  ├── fetchFeaturedSpecies()
  │     ├── Firestore: where('featured', '==', true) + limit(10)
  │     ├── cacheFeaturedSpecies(species)   → AsyncStorage
  │     └── on error: getCachedFeaturedSpecies() → AsyncStorage
  │
  └── fetchSpecies(lastDoc?, filters?)
        ├── Firestore: orderBy('commonName') + limit(20) + optional filters
        ├── cacheSpeciesList(species)        → AsyncStorage (first page, no filters only)
        └── on error: getCachedSpeciesList() → AsyncStorage
```

---

## Offline strategy

**Online-first with fallback:** every read attempts Firebase first. On network error, the last cached response is returned. Cache is updated on every successful first-page fetch (no filters, no pagination cursor).

---

## Filters

```
FilterContext
  activeFilters: FilterOptions     ← global state
  pendingTagFilter: string | null  ← tag selected from species detail

HomeScreen
  useFocusEffect (useCallback) → applies pendingTagFilter on screen focus
  useEffect([species, activeFilters]) → applyFilters() runs client-side

FiltersScreen (modal)
  → updates activeFilters in context → HomeScreen re-renders
```

Client-side filters applied in-memory:

| Filter               | Source                                     |
| -------------------- | ------------------------------------------ |
| `searchText`         | commonName / scientificName contains match |
| `behavior`           | exact match                                |
| `regions`            | array-contains-any                         |
| `biomes`             | array-contains-any                         |
| `conservationStatus` | exact match                                |
| `tags`               | array-contains-any                         |

> `region` and `behavior` are also sent to Firestore as query constraints when present — all others are applied client-side only.

---

## Search

`searchSpecies(term)` in `speciesService.ts`:

1. Checks AsyncStorage cache first (avoids full Firestore read)
2. If cache is empty, fetches all documents and filters client-side

> Not scalable beyond ~500 documents. See [IMPROVEMENTS.md](IMPROVEMENTS.md) for Algolia/index alternatives.

---

## Onboarding

```
App start (_layout.tsx)
  → AsyncStorage.getItem('@onboarding_completed')
      ├── null   → router.replace('/onboarding')
      └── 'true' → continue to (tabs)

OnboardingScreen (finish)
  → AsyncStorage.setItem('@onboarding_completed', 'true')
  → router.replace('/(tabs)')
```

---

## Theme

```
ThemeContext
  themePreference: 'light' | 'dark' | 'auto'   ← persisted via preferencesService
  'auto' → reads useColorScheme() from system

Components
  const colorScheme = useColorScheme()          ← from ThemeContext hook
  const colors = Colors[colorScheme]            ← from @/constants/theme
```

---

## Language

```
LanguageContext
  language: 'pt-BR' | 'en' | 'es'  ← persisted via languageService
  t: TranslationObject               ← full string table for active locale

Components
  const { t } = useLanguage()
  t.home.filters, t.species.title, …
```

---

## Species detail lifecycle

```
HomeScreen
  └── SpeciesCard (thumbnail)
        └── onPress → router.push('/species/{id}')
              └── SpeciesDetailScreen
                    ├── fetchSpeciesById(id)    ← Firestore, no cache
                    ├── PhotoCarousel           ← photoGallery[]
                    ├── tag press
                    │     └── setPendingTagFilter(tag)
                    │           └── router.back()
                    │                 └── HomeScreen useFocusEffect applies tag filter
                    └── ReportModal (bottom sheet)
                          └── addDoc(collection 'reports'), …
```

---

## Favorites

```
favoritesService  (AsyncStorage)
  getFavorites()   → string[]  (species IDs)
  addFavorite(id)
  removeFavorite(id)
  isFavorite(id)   → boolean
```
