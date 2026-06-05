# ASF Abelhas do Brasil — Contributing

## Commit convention

All commits must follow [Conventional Commits](https://www.conventionalcommits.org/) and be written in **English**.

```
<type>(<scope>): <short description>

[optional body]
[optional footer]
```

### Types

| Type       | When to use                                                  |
| ---------- | ------------------------------------------------------------ |
| `feat`     | New feature or screen                                        |
| `fix`      | Bug fix                                                      |
| `refactor` | Code change that is not a fix or feature                     |
| `style`    | Formatting, missing semicolons, whitespace — no logic change |
| `perf`     | Performance improvement                                      |
| `test`     | Adding or updating tests                                     |
| `docs`     | Documentation only                                           |
| `chore`    | Build system, dependencies, config                           |
| `ci`       | CI/CD configuration                                          |

### Scopes (optional but encouraged)

`home`, `species`, `filters`, `onboarding`, `firebase`, `cache`, `i18n`, `theme`, `nav`, `deps`

### Examples

```
feat(filters): add biome multi-select filter
fix(species): prevent crash when photoGallery is undefined
refactor(cache): replace AsyncStorage with MMKV
chore(deps): bump expo to 56.0.8
docs: add CONTRIBUTING.md
perf(home): wrap FlatList callbacks in useCallback
```

### Rules

- Subject line: max 72 characters, imperative mood, no period at end
- No Portuguese in commit messages — English only
- Breaking changes: add `!` after type/scope and a `BREAKING CHANGE:` footer

```
feat(nav)!: replace bottom tabs with native tabs

BREAKING CHANGE: tab routes renamed — /gallery is now /
```

---

## Branch strategy

| Branch         | Purpose                   |
| -------------- | ------------------------- |
| `main`         | Stable, always deployable |
| `feat/<name>`  | New features              |
| `fix/<name>`   | Bug fixes                 |
| `chore/<name>` | Maintenance, deps, config |

Merge to `main` via PR. No force-push to `main`.

---

## Before submitting a PR

```bash
npm run lint          # no errors allowed
npm run format:check  # no formatting issues
npm run type:check    # no TypeScript errors
```

---

## Adding a new species field

1. Update `src/types/species.ts`
2. Update `scripts/firestore-example-data.json` with a sample value
3. Update `docs/SETUP.md` schema section
4. Update the detail screen if the field should be displayed
