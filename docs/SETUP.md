# ASF Abelhas do Brasil — Setup

## Prerequisites

- Node.js 20+
- npm 10+
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli`
- Xcode (iOS, macOS only)
- Android Studio (Android)
- Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
- Expo account at [expo.dev](https://expo.dev)

---

## Installation

```bash
git clone https://github.com/sobreirami/asf-abelhas-do-brasil.git
cd asf-abelhas-do-brasil

cp .env.example .env   # fill in Firebase credentials
npm install
```

---

## Environment variables

Credentials are injected via `expo-constants` from `app.json → extra`. The `firebase.ts` service reads them at runtime — **never hardcode credentials in source code**.

```bash
# .env
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=...
FIREBASE_STORAGE_BUCKET=...
FIREBASE_MESSAGING_SENDER_ID=...
FIREBASE_APP_ID=...
```

> `.env` is gitignored. Never commit it.

---

## Firebase — Firestore schema

Collection: `species`

```
species/{id}
  commonName: string
  scientificName: string
  shortDescription: string
  longDescription: string
  regions: string[]
  biomes: string[]
  sizeMm: number
  behavior: string
  nest: string
  conservationStatus: string
  tags: string[]
  favoredPlants: string[]
  photos: { thumbnail, media, original }
  photoGallery?: string[]
  scientificArticles?: { title, url }[]
  featured?: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
```

Sample data: `firestore-example-data.json`

---

## Firestore indexes

Composite indexes are needed for filtered + ordered queries. If you see an index error in the console, follow the link provided by Firebase to create it.

Queries in use:

| Query                                                  | Index required         |
| ------------------------------------------------------ | ---------------------- |
| `orderBy('commonName') + limit(20)`                    | Default (auto-created) |
| `where('regions', 'array-contains', v) + orderBy(...)` | Composite              |
| `where('behavior', '==', v) + orderBy(...)`            | Composite              |
| `where('featured', '==', true) + limit(10)`            | Single field           |

---

## Firestore security rules

See `firestore.rules` at the root. Current rules: public read, authenticated write.

---

## Running the app

### Expo Go (quick preview)

```bash
npm start
# Scan the QR code with the Expo Go app
```

Some native modules (reanimated, glass effects) may not work in Expo Go.

### Simulator / emulator (recommended for development)

```bash
npm run ios        # iOS simulator
npm run android    # Android emulator
```

---

## EAS Build

```bash
# Development build (includes native modules)
eas build --profile development --platform ios

# Production build
eas build --platform all
```

Configuration in `eas.json`. Project ID: `a0d5f249-00a0-4622-98ca-e79a4ba16f4c`.

---

## OTA updates (Expo Updates)

```bash
eas update --branch production --message "fix: species detail crash"
```

The app is configured with `updates.url` pointing to EAS Update. Updates are delivered without a new App Store / Play Store submission.
