/**
 * Fetches CC-licensed photos + full attribution from iNaturalist API v2
 * for each species in scripts/species-data.json.
 *
 * Usage:
 *   INAT_TOKEN=<your_jwt> node scripts/fetch-inaturalist-photos.js
 *
 * Output: scripts/species-data.json (updated in place)
 *
 * Only photos with open CC licenses are included. One photo per photographer
 * is kept to maximise visual diversity.
 */

import { readFileSync, writeFileSync } from 'fs';

const TOKEN = process.env.INAT_TOKEN;
if (!TOKEN) {
  console.error(
    'Missing INAT_TOKEN env variable. Run as:\n  INAT_TOKEN=<jwt> node scripts/fetch-inaturalist-photos.js'
  );
  process.exit(1);
}

const PHOTOS_PER_SPECIES = 5;
const DELAY_MS = 600;
const INAT_V2 = 'https://api.inaturalist.org/v2';

const CC_LICENSES = 'cc-by,cc-by-nc,cc-by-sa,cc-by-nc-sa,cc-by-nd,cc-by-nc-nd,cc0';

const LICENSE_URLS = {
  cc0: 'https://creativecommons.org/publicdomain/zero/1.0/',
  'cc-by': 'https://creativecommons.org/licenses/by/4.0/',
  'cc-by-nc': 'https://creativecommons.org/licenses/by-nc/4.0/',
  'cc-by-sa': 'https://creativecommons.org/licenses/by-sa/4.0/',
  'cc-by-nd': 'https://creativecommons.org/licenses/by-nd/4.0/',
  'cc-by-nc-sa': 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
  'cc-by-nc-nd': 'https://creativecommons.org/licenses/by-nc-nd/4.0/',
};

// iNaturalist v2 photo URLs use /square.ext — swap to medium or large
function toSize(url, size) {
  return url.replace(/\/square\./, `/${size}.`).replace(/\/small\./, `/${size}.`);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchPhotos(scientificName) {
  const params = new URLSearchParams({
    taxon_name: scientificName,
    quality_grade: 'research',
    photos: 'true',
    license: CC_LICENSES,
    per_page: '30', // fetch more so we can deduplicate by photographer
    order_by: 'votes',
    fields: 'id,photos.url,photos.license_code,photos.attribution,user.login,user.name',
  });

  const res = await fetch(`${INAT_V2}/observations?${params}`, {
    headers: {
      Authorization: TOKEN,
      Accept: 'application/json',
      'User-Agent': 'ASF-Abelhas-do-Brasil/1.0 (sobreira.michel@gmail.com)',
    },
  });

  if (!res.ok) {
    const body = await res.text();
    console.warn(`  ⚠ HTTP ${res.status}: ${body.slice(0, 120)}`);
    return [];
  }

  const data = await res.json();
  const results = data.results ?? [];

  const seenPhotographer = new Set();
  const credits = [];

  for (const obs of results) {
    if (credits.length >= PHOTOS_PER_SPECIES) break;

    const user = obs.user ?? {};
    const photographerName = user.name || user.login || 'Unknown';

    for (const photo of obs.photos ?? []) {
      if (credits.length >= PHOTOS_PER_SPECIES) break;
      if (!photo.license_code || !photo.url) continue;

      // one photo per photographer for visual diversity
      if (seenPhotographer.has(photographerName)) continue;
      seenPhotographer.add(photographerName);

      credits.push({
        url: toSize(photo.url, 'medium'),
        urlLarge: toSize(photo.url, 'large'),
        attribution: photo.attribution ?? '',
        photographerName,
        photographerLogin: user.login ?? '',
        licenseCode: photo.license_code,
        licenseUrl: LICENSE_URLS[photo.license_code] ?? '',
        iNaturalistPhotoId: photo.id,
        observationId: obs.id,
      });
    }
  }

  return credits;
}

async function main() {
  const raw = readFileSync(new URL('./species-data.json', import.meta.url), 'utf-8');
  const data = JSON.parse(raw);
  const species = data.species ?? [];

  console.log(`iNaturalist API v2 — fetching photos for ${species.length} species...\n`);

  let found = 0;
  let empty = 0;

  for (let i = 0; i < species.length; i++) {
    const s = species[i];
    process.stdout.write(`[${i + 1}/${species.length}] ${s.commonName} (${s.scientificName}) … `);

    const credits = await fetchPhotos(s.scientificName);
    console.log(
      `${credits.length} photo(s)${credits.length ? ' — ' + credits.map((c) => c.photographerName).join(', ') : ''}`
    );

    s.iNaturalistPhotos = credits;
    if (credits.length > 0) found++;
    else empty++;

    if (i < species.length - 1) await sleep(DELAY_MS);
  }

  writeFileSync(new URL('./species-data.json', import.meta.url), JSON.stringify(data, null, 2));

  console.log(`\n✓  Done — ${found} species with photos, ${empty} without`);
  console.log('✓  Written to scripts/species-data.json');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
