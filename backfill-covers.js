/**
 * backfill-covers.js
 *
 * Fills photos.thumbnail / photos.media / photos.original
 * from iNaturalistPhotos[0] for every species that has iNaturalist photos.
 *
 * Reads  : firestore-species-data-with-photos.json
 * Writes : firestore-species-data-with-photos.json (in-place)
 * Then imports directly to Firestore with firebase-admin.
 *
 * Usage:
 *   node backfill-covers.js              # dry-run
 *   node backfill-covers.js --write      # update Firestore
 */

const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

const args = process.argv.slice(2);
const DRY_RUN = !args.includes('--write');
const DATA_PATH = join(__dirname, 'firestore-species-data-with-photos.json');

// iNaturalist URL size helper
function toSize(url, size) {
  return url
    .replace(/\/medium\./, `/${size}.`)
    .replace(/\/large\./, `/${size}.`)
    .replace(/\/square\./, `/${size}.`)
    .replace(/\/small\./, `/${size}.`);
}

// ── Load data ────────────────────────────────────────────────────────────────
const data = JSON.parse(readFileSync(DATA_PATH, 'utf-8'));
const species = data.species;

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  ASF — Backfill cover photos from iNaturalist');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`  Mode: ${DRY_RUN ? '🔍 DRY-RUN' : '✏️  WRITE'}\n`);

let updated = 0;
let skipped = 0;

for (const s of species) {
  const inat = s.iNaturalistPhotos ?? [];
  const featured = s.featured ? '⭐' : '  ';

  if (inat.length === 0) {
    console.log(`${featured} ⚠️  SKIP  ${s.commonName} — no iNaturalist photos`);
    skipped++;
    continue;
  }

  const first = inat[0];
  const baseUrl = first.url; // already medium size

  const photos = {
    thumbnail: toSize(baseUrl, 'square'),
    media:     toSize(baseUrl, 'medium'),
    original:  toSize(baseUrl, 'large'),
  };

  if (!DRY_RUN) {
    s.photos = photos;
  }

  console.log(`${featured} ✅ ${s.commonName.padEnd(34)} © ${first.photographerName} (${first.licenseCode})`);
  console.log(`       thumbnail: ${photos.thumbnail}`);
  updated++;
}

console.log(`\n  Updated: ${updated}  Skipped: ${skipped}`);

if (DRY_RUN) {
  console.log('\n  Run with --write to apply changes.\n');
  process.exit(0);
}

// ── Save updated JSON ────────────────────────────────────────────────────────
writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
console.log('\n✓  JSON updated in-place');

// ── Import to Firestore ──────────────────────────────────────────────────────
let admin;
try {
  admin = require('firebase-admin');
} catch {
  console.error('\n❌ firebase-admin not installed. Run: npm install firebase-admin\n');
  process.exit(1);
}

const keyPath = join(__dirname, 'serviceAccountKey.json');
const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf-8'));

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function importCovers() {
  const now = admin.firestore.Timestamp.now();
  let saved = 0;
  let errors = 0;

  for (const s of species) {
    if (!s.photos?.thumbnail?.includes('inaturalist')) continue;
    const { id, ...fields } = s;
    try {
      const docRef = db.collection('species').doc(id);
      const existing = await docRef.get();
      await docRef.set({
        ...fields,
        createdAt: existing.exists ? existing.data().createdAt : now,
        updatedAt: now,
      });
      console.log(`  ♻️  ${id}`);
      saved++;
    } catch (err) {
      console.error(`  ❌ ${id}: ${err.message}`);
      errors++;
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  ♻️  Firestore updated : ${saved}`);
  if (errors) console.log(`  ❌ Errors           : ${errors}`);
  console.log('  Done!\n');
  process.exit(errors > 0 ? 1 : 0);
}

importCovers();
