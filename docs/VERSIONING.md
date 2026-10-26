# ASF Abelhas do Brasil — Versioning

## Format

The project follows [Semantic Versioning](https://semver.org/):

```
MAJOR.MINOR.PATCH[-rcN]
```

| Component | When to increment                                                 | Example       |
| --------- | ----------------------------------------------------------------- | ------------- |
| **MAJOR** | Breaking change — redesigned navigation, incompatible data model  | 1.0.0 → 2.0.0 |
| **MINOR** | New feature — new screen, new filter type, new language           | 1.0.0 → 1.1.0 |
| **PATCH** | Bug fix, UI adjustment, copy change                               | 1.1.0 → 1.1.1 |
| **-rcN**  | Release candidate — build for device testing before final release | 1.1.0-rc1     |

---

## Where to update

| File            | Field          |
| --------------- | -------------- |
| `app.config.js` | `expo.version` |
| `package.json`  | `version`      |

Both fields must be kept in sync. `app.config.js` is the source of truth for the Expo / EAS build system.

---

## Release cycle

```
development
    │
    ├── v1.1.0-rc1  ← first device test build
    ├── v1.1.0-rc2  ← fixes found in testing
    ├── v1.1.0      ← final release → App Store + Play Store
    │
    ├── v1.1.1      ← hotfix (if needed)
    │
    ├── v1.2.0-rc1  ← next feature
    └── ...
```

### Step by step

1. Develop on `main` (or in a feature branch → merge to `main`)
2. When ready to test on device: bump version to `-rcN` in `app.config.js` and `package.json`
3. Run `eas build --profile preview` and install on device — since SDK 58, Android release builds are R8-minified: smoke-test them, and add keep rules via `expo-build-properties` → `android.extraProguardRules` (never edit `android/` by hand)
4. If bugs found: fix, bump to `-rc(N+1)`, repeat
5. When approved: remove `-rcN` suffix, bump final version
6. Run `eas build --profile production`
7. Submit to App Store / Play Store
8. Publish OTA update via `eas update` for minor fixes that don't need a new binary (requires `expo-updates` — see [SETUP.md](SETUP.md#ota-updates-expo-updates))

---

## OTA vs binary release

| Change type                           | Delivery                                    |
| ------------------------------------- | ------------------------------------------- |
| JS / TS / assets only                 | OTA (`eas update`) — no store submission    |
| Native module added or updated        | New binary (`eas build`) + store submission |
| `app.config.js` native config changed | New binary required                         |

> OTA delivery requires `expo-updates`, which is not installed yet — until it is, every change ships as a new binary.

---

## Version history

| Version | Date | Description                                                               |
| ------- | ---- | ------------------------------------------------------------------------- |
| 1.0.0   | —    | Initial release — species gallery, filters, 3 languages, light/dark theme |
