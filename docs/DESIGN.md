# ASF Abelhas do Brasil — Design System

Single source of truth for colors, typography, spacing, and shared UI components.
All tokens live in `src/constants/theme.ts`. Never hardcode values — always use tokens.

---

## Color tokens

Import: `import { Colors } from '@/constants/theme'`
Usage: `const colors = Colors[colorScheme ?? 'light']`

### Light theme

| Token                        | Hex                     | Use                                                                        |
| ---------------------------- | ----------------------- | -------------------------------------------------------------------------- |
| `colors.text`                | `#2C3E35`               | All body text, headings                                                    |
| `colors.background`          | `#FFFFFF`               | Screen backgrounds                                                         |
| `colors.backgroundSecondary` | `#FFFEF5`               | Subtle off-white sections                                                  |
| `colors.card`                | `#FFFFFF`               | Card / surface backgrounds                                                 |
| `colors.primary`             | `#F5B800`               | Brand yellow — buttons, active indicators                                  |
| `colors.onPrimary`           | `#2C3E35`               | Text **on top of** primary yellow — never use white on yellow (fails WCAG) |
| `colors.secondary`           | `#6B8E23`               | Accent green — icons, secondary actions                                    |
| `colors.accent`              | `#FF9500`               | Orange — tertiary accent                                                   |
| `colors.success`             | `#4CAF50`               | Success states                                                             |
| `colors.warning`             | `#FFC107`               | Warning states                                                             |
| `colors.error`               | `#F44336`               | Error states, danger actions                                               |
| `colors.icon`                | `#5F7161`               | Icons, secondary/muted text                                                |
| `colors.border`              | `#E0E5DE`               | Dividers, input borders, chip borders                                      |
| `colors.tabIconDefault`      | `#8B9A8F`               | Inactive tab icons                                                         |
| `colors.tabIconSelected`     | `#F5B800`               | Active tab icon                                                            |
| `colors.cardBlur`            | `rgba(255,255,255,0.8)` | Glass/blur overlays                                                        |
| `colors.shadow`              | `rgba(0,0,0,0.1)`       | Drop shadow color                                                          |

### Dark theme

| Token                        | Hex                  | Use                                                         |
| ---------------------------- | -------------------- | ----------------------------------------------------------- |
| `colors.text`                | `#E8EDE7`            | All body text, headings                                     |
| `colors.background`          | `#1A1F1A`            | Screen backgrounds                                          |
| `colors.backgroundSecondary` | `#252A25`            | Subtle dark sections                                        |
| `colors.card`                | `#2A2F2A`            | Card / surface backgrounds                                  |
| `colors.primary`             | `#FFD700`            | Brand gold — buttons, active indicators                     |
| `colors.onPrimary`           | `#1A1F1A`            | Text **on top of** primary gold — never use white on yellow |
| `colors.secondary`           | `#8FBC8F`            | Accent green (lighter for dark bg)                          |
| `colors.accent`              | `#FFB84D`            | Orange accent                                               |
| `colors.success`             | `#66BB6A`            | Success states                                              |
| `colors.warning`             | `#FFD54F`            | Warning states                                              |
| `colors.error`               | `#EF5350`            | Error states                                                |
| `colors.icon`                | `#A8B5A8`            | Icons, secondary/muted text                                 |
| `colors.border`              | `#3A4A3A`            | Dividers, input borders, chip borders                       |
| `colors.tabIconDefault`      | `#6B7A6B`            | Inactive tab icons                                          |
| `colors.tabIconSelected`     | `#FFD700`            | Active tab icon                                             |
| `colors.cardBlur`            | `rgba(42,47,42,0.8)` | Glass/blur overlays                                         |
| `colors.shadow`              | `rgba(0,0,0,0.3)`    | Drop shadow color                                           |

### Contrast audit (WCAG 2.1)

| Pair                                         | Ratio   | AA normal | AA large | Notes                                   |
| -------------------------------------------- | ------- | --------- | -------- | --------------------------------------- |
| `text` on `background` (light)               | 11.3    | ✅        | ✅       | Excellent                               |
| `text` on `background` (dark)                | 14.1    | ✅        | ✅       | Excellent                               |
| `icon` on `background` (light)               | 5.22    | ✅        | ✅       | Good                                    |
| `icon` on `background` (dark)                | 7.84    | ✅        | ✅       | Excellent                               |
| `primary` text on `background` (light)       | 1.78    | ❌        | ❌       | **Never use yellow as text on white**   |
| `onPrimary` (`#2C3E35`) on `primary` (light) | ~6.4    | ✅        | ✅       | Use for button/chip text on yellow      |
| `onPrimary` (`#1A1F1A`) on `primary` (dark)  | ~10.9   | ✅        | ✅       | Use for button/chip text on gold        |
| White on `primary` (light or dark)           | 1.4–1.8 | ❌        | ❌       | **Never use white text on yellow/gold** |
| White on `success`                           | 2.77    | ❌        | ❌       | Use dark text on success badges         |
| White on `warning`                           | 1.63    | ❌        | ❌       | Use dark text on warning badges         |
| White on `error`                             | 3.68    | ❌        | ⚠️       | Only large/bold text passes             |

> **Rule:** yellow and gold backgrounds (`primary`, `warning`) always need dark text (`onPrimary` or `text`).
> White text is only safe on `secondary`, `accent`, `error` when used at bold/large sizes.

---

## `onPrimary` token

`onPrimary` is defined in `Colors` and must be used whenever text or icons appear on a `primary`-colored background:

```ts
const colors = Colors[colorScheme ?? 'light'];
// ✅ correct
<Text style={{ color: colors.onPrimary }}>Aplicar</Text>

// ❌ wrong — white on yellow fails WCAG (ratio 1.40–1.78)
<Text style={{ color: '#FFFFFF' }}>Aplicar</Text>
```

---

## Typography

Import: `import { FontSize, FontWeight } from '@/constants/theme'`

| Token              | Value | Use                                    |
| ------------------ | ----- | -------------------------------------- |
| `FontSize.xs`      | 12    | Captions, badges, fine print           |
| `FontSize.sm`      | 14    | Secondary text, chip labels, subtitles |
| `FontSize.md`      | 16    | Body text (default)                    |
| `FontSize.lg`      | 18    | Emphasized body, card titles           |
| `FontSize.xl`      | 20    | Section headings                       |
| `FontSize.xxl`     | 24    | Screen section titles                  |
| `FontSize.xxxl`    | 32    | Screen titles                          |
| `FontSize.display` | 40    | Hero / large display text              |

| Token                 | Value   | Use                        |
| --------------------- | ------- | -------------------------- |
| `FontWeight.regular`  | `'400'` | Body text                  |
| `FontWeight.medium`   | `'500'` | Labels, secondary emphasis |
| `FontWeight.semibold` | `'600'` | Buttons, field labels      |
| `FontWeight.bold`     | `'700'` | Headings, titles           |

---

## Spacing

Import: `import { Spacing } from '@/constants/theme'`

| Token         | Value | Common use                              |
| ------------- | ----- | --------------------------------------- |
| `Spacing.xs`  | 4     | Internal micro gaps, icon-text gap      |
| `Spacing.sm`  | 8     | Chip padding, small gaps                |
| `Spacing.md`  | 16    | Default padding, section gaps           |
| `Spacing.lg`  | 24    | Screen horizontal padding, card padding |
| `Spacing.xl`  | 32    | Large vertical gaps                     |
| `Spacing.xxl` | 48    | Section separators                      |

---

## Border radius

Import: `import { BorderRadius } from '@/constants/theme'`

| Token               | Value | Use                       |
| ------------------- | ----- | ------------------------- |
| `BorderRadius.sm`   | 8     | Badges, small elements    |
| `BorderRadius.md`   | 12    | Buttons, inputs, cards    |
| `BorderRadius.lg`   | 16    | Modal panels, large cards |
| `BorderRadius.xl`   | 24    | Bottom sheets             |
| `BorderRadius.full` | 9999  | Pills (chips, tags)       |

---

## Shadows

Import: `import { Shadows } from '@/constants/theme'`

Spread with `...Shadows.sm` (or `md`, `lg`) on a `View` style:

```ts
<View style={[styles.card, { backgroundColor: colors.card }, Shadows.md]} />
```

| Token        | Elevation | Use                     |
| ------------ | --------- | ----------------------- |
| `Shadows.sm` | 2         | Cards, chips            |
| `Shadows.md` | 4         | Modals, active cards    |
| `Shadows.lg` | 8         | Bottom sheets, overlays |

---

## Shared UI Components

All live in `src/components/ui/` and are exported from `src/components/ui/index.ts`.

---

### `Button`

**File:** `src/components/ui/Button.tsx`

A themed, animated button with press feedback (scale + opacity). Handles the `onPrimary` contrast rule automatically.

```tsx
import { Button } from '@/components/ui';

// Primary (filled yellow)
<Button label="Aplicar filtros" onPress={handleApply} />

// Secondary (outlined)
<Button label="Limpar" onPress={handleClear} variant="secondary" />

// Danger
<Button label="Excluir conta" onPress={handleDelete} variant="danger" />

// Full width
<Button label="Começar" onPress={handleStart} fullWidth />

// With icon
<Button label="Próximo" onPress={handleNext} iconRight="arrow-forward" />
```

**Props:**

| Prop        | Type                                   | Default     | Description                |
| ----------- | -------------------------------------- | ----------- | -------------------------- |
| `label`     | `string`                               | required    | Button text                |
| `onPress`   | `() => void`                           | required    | Press handler              |
| `variant`   | `'primary' \| 'secondary' \| 'danger'` | `'primary'` | Visual style               |
| `size`      | `'sm' \| 'md' \| 'lg'`                 | `'md'`      | Height/padding             |
| `fullWidth` | `boolean`                              | `false`     | Stretch to container width |
| `iconLeft`  | `IoniconName`                          | —           | Icon before label          |
| `iconRight` | `IoniconName`                          | —           | Icon after label           |
| `disabled`  | `boolean`                              | `false`     | Disabled state             |
| `loading`   | `boolean`                              | `false`     | Shows activity indicator   |

**Press interaction:** scales to `0.96` on press with 100ms spring, returns to `1.0` on release.

---

### `Chip`

**File:** `src/components/ui/Chip.tsx`

A selectable pill used for filters and tags. Handles selected/unselected state with accessible roles and press animation.

```tsx
import { Chip } from '@/components/ui';

// Selectable filter chip
<Chip
  label="Cerrado"
  selected={selectedBiomes.includes('Cerrado')}
  onPress={() => toggleBiome('Cerrado')}
/>

// Tag chip (non-selectable, navigates on press)
<Chip label="#meliponicultura" onPress={handleTagPress} />

// Chip with custom prefix
<Chip label="meliponicultura" prefix="#" onPress={handleTagPress} />
```

**Props:**

| Prop       | Type         | Default  | Description                          |
| ---------- | ------------ | -------- | ------------------------------------ |
| `label`    | `string`     | required | Chip text                            |
| `onPress`  | `() => void` | required | Press handler                        |
| `selected` | `boolean`    | `false`  | Selected/active state                |
| `prefix`   | `string`     | —        | Text prepended to label (e.g. `'#'`) |
| `disabled` | `boolean`    | `false`  | Disabled state                       |

**States:**

- **Unselected:** `colors.card` background, `colors.border` border, `colors.text` text
- **Selected:** `colors.primary` background, `colors.primary` border, `colors.onPrimary` text (fixes contrast)
- **Pressed:** scales to `0.94` with opacity `0.8`

**Accessibility:** `accessibilityRole="button"`, `accessibilityState={{ selected }}`.

---

### `Badge`

**File:** `src/components/ui/Badge.tsx` _(planned)_

Conservation status badge used in `SpeciesCard`.

```tsx
<Badge label="Vulnerável" color={colors.warning} />
```

Uses dark text (`#1A1F1A`) on light badge colors to ensure WCAG compliance.

---

### `InfoCard`

**File:** `src/components/ui/InfoCard.tsx` _(planned)_

Icon + label + value row used in the species detail screen.

```tsx
<InfoCard icon="resize" title={t.species.size} value="12 mm" />
```

---

## Rules for AI code generation

1. **Never hardcode colors.** Always `Colors[colorScheme ?? 'light'].tokenName`.
2. **Never hardcode spacing or font sizes.** Always `Spacing.x` or `FontSize.x`.
3. **Yellow/gold backgrounds need dark text.** `colors.onPrimary`, not `'#FFFFFF'`.
4. **Chip selected state:** `colors.primary` bg + `colors.onPrimary` text, not primary text on light bg.
5. **Button primary text:** `colors.onPrimary`, not white.
6. **All interactive elements** need `accessibilityLabel` and `accessibilityRole`.
7. **Selectable elements** need `accessibilityState={{ selected: boolean }}`.
8. **Touch targets** must be ≥ 44pt — use `minHeight: 44` on pressable containers.
9. **Use `Chip` from `@/components/ui`** for any pill/tag/filter element.
10. **Use `Button` from `@/components/ui`** for any action button.
11. **Press feedback is mandatory** — use the animated components, never bare `View`-wrapped `Pressable` without visual feedback.
