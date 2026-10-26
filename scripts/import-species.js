/**
 * import-species.js
 *
 * Imports all species from scripts/species-data.json into Firestore
 * using the Firebase Admin SDK (bypasses security rules via service account).
 *
 * Setup (one-time):
 *   1. Go to Firebase Console → Project Settings → Service accounts
 *   2. Click "Generate new private key" → save as serviceAccountKey.json
 *      in the root of this project (it is gitignored)
 *   3. npm install firebase-admin
 *
 * Usage:
 *   node scripts/import-species.js              # dry-run (preview only)
 *   node scripts/import-species.js --write      # write to Firestore (skips existing)
 *   node scripts/import-species.js --write --force  # overwrite existing documents
 */

const { readFileSync, existsSync } = require('fs');
const { join } = require('path');

// ─── CLI flags ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const DRY_RUN = !args.includes('--write');
const FORCE = args.includes('--force');
const COLLECTION = 'species';

// ─── Check for firebase-admin ─────────────────────────────────────────────────
let adminApp;
let adminFirestore;
try {
  adminApp = require('firebase-admin/app');
  adminFirestore = require('firebase-admin/firestore');
} catch {
  console.error('\n❌ firebase-admin not installed. Run:\n');
  console.error('   npm install firebase-admin\n');
  process.exit(1);
}
const { initializeApp, cert } = adminApp;
const { getFirestore, Timestamp } = adminFirestore;

// ─── Check for service account key ───────────────────────────────────────────
const keyPath = join(__dirname, '..', 'serviceAccountKey.json');

if (!existsSync(keyPath)) {
  console.error('\n❌ serviceAccountKey.json not found.\n');
  console.error('   Steps to get it:');
  console.error('   1. Firebase Console → Project Settings → Service accounts');
  console.error('   2. Click "Generate new private key"');
  console.error('   3. Save the file as serviceAccountKey.json in the project root\n');
  process.exit(1);
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync(keyPath, 'utf-8'));
} catch (err) {
  console.error(`\n❌ Could not parse serviceAccountKey.json: ${err.message}\n`);
  process.exit(1);
}

// ─── Firebase Admin init ──────────────────────────────────────────────────────
initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

// ─── Load species data ────────────────────────────────────────────────────────
const dataPath = join(__dirname, 'species-data.json');

let data;
try {
  data = JSON.parse(readFileSync(dataPath, 'utf-8'));
} catch (err) {
  console.error(`\n❌ Could not read species-data.json: ${err.message}\n`);
  process.exit(1);
}

const species = data.species;

if (!Array.isArray(species) || species.length === 0) {
  console.error('\n❌ No species found in species-data.json\n');
  process.exit(1);
}

// ─── Import ───────────────────────────────────────────────────────────────────
async function importSpecies() {
  const now = Timestamp.now();
  const projectId = serviceAccount.project_id;

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  ASF Abelhas do Brasil — Firebase Species Importer');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Project   : ${projectId}`);
  console.log(`  Collection: ${COLLECTION}`);
  console.log(`  Species   : ${species.length}`);
  console.log(
    `  Mode      : ${DRY_RUN ? '🔍 DRY-RUN (no writes)' : FORCE ? '✏️  WRITE + OVERWRITE' : '✏️  WRITE (skip existing)'}`
  );
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (DRY_RUN) {
    console.log('  Run with --write to actually import. Preview:\n');
  }

  let created = 0;
  let skipped = 0;
  let overwritten = 0;
  let errors = 0;

  for (const item of species) {
    const { id, ...fields } = item;

    if (!id) {
      console.warn('  ⚠️  Skipping entry with missing id:', JSON.stringify(item).slice(0, 80));
      errors++;
      continue;
    }

    const docRef = db.collection(COLLECTION).doc(id);

    try {
      if (DRY_RUN) {
        console.log(
          `  📄 [dry-run] ${id.padEnd(34)} ${fields.commonName} (${fields.scientificName})`
        );
        created++;
        continue;
      }

      const existing = await docRef.get();

      if (existing.exists && !FORCE) {
        console.log(`  ⏭️  Skipped   ${id.padEnd(34)} already exists (use --force to overwrite)`);
        skipped++;
        continue;
      }

      const payload = {
        ...fields,
        createdAt: existing.exists ? existing.data().createdAt : now,
        updatedAt: now,
      };

      await docRef.set(payload);

      if (existing.exists) {
        console.log(`  ♻️  Updated   ${id.padEnd(34)} ${fields.commonName}`);
        overwritten++;
      } else {
        console.log(`  ✅ Created   ${id.padEnd(34)} ${fields.commonName}`);
        created++;
      }
    } catch (err) {
      console.error(`  ❌ Error     ${id.padEnd(34)} ${err.message}`);
      errors++;
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (DRY_RUN) {
    console.log(`  Preview: ${created} species ready to import.`);
    console.log('\n  To import for real, run:');
    console.log('    node scripts/import-species.js --write\n');
  } else {
    console.log(`  ✅ Created   : ${created}`);
    if (overwritten > 0) console.log(`  ♻️  Updated   : ${overwritten}`);
    if (skipped > 0) console.log(`  ⏭️  Skipped   : ${skipped}`);
    if (errors > 0) console.log(`  ❌ Errors    : ${errors}`);
    console.log('\n  Import complete! Check your Firestore console.\n');
  }

  process.exit(errors > 0 ? 1 : 0);
}

importSpecies();
