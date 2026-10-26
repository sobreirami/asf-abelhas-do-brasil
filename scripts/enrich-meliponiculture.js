/**
 * enrich-meliponiculture.js
 *
 * Sets rationalBox (name + dimensions only) for species that have a known
 * rational hive model. Removes trapNest from all species.
 * Writes result back to scripts/species-data.json.
 *
 * Usage:
 *   node scripts/enrich-meliponiculture.js          # dry-run
 *   node scripts/enrich-meliponiculture.js --write  # updates the JSON file
 */

const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

const DATA_PATH = join(__dirname, 'species-data.json');
const args = process.argv.slice(2);
const DRY_RUN = !args.includes('--write');

// Only meliponini species with established rational hive models.
// Value is just the model name and chamber dimensions — nothing else.
// Species absent from this map will have rationalBox removed.
const RATIONAL_BOX = {
  jatai: 'INPA / PNN — câmara de cria 10×10×4 cm',
  mandacaia: 'INPA — câmara de cria 15×15×6 cm',
  'urucu-nordestina': 'INPA — câmara de cria 15×15×10 cm',
  tiuba: 'INPA — câmara de cria 15×15×8 cm',
  'urucu-amarela': 'INPA — câmara de cria 20×15×8 cm',
  manduri: 'PNN — câmara de cria 12×12×5 cm',
  guaraipo: 'INPA — câmara de cria 15×15×7 cm',
  'urucu-do-norte': 'INPA — câmara de cria 20×15×10 cm',
  mumbuca: 'INPA — câmara de cria 12×12×7 cm',
  irai: 'Mini-PNN — câmara de cria 8×8×4 cm',
  tubuna: 'PNN — câmara de cria 10×10×6 cm',
  mandaguari: 'PNN / INPA — câmara de cria 12×12×6 cm',
  canudo: 'INPA — câmara de cria 12×12×6 cm',
  mirim: 'Mini-PNN — câmara de cria 8×8×4 cm',
  'mirim-guacu': 'Mini-PNN — câmara de cria 10×10×5 cm',
  arapua: 'INPA — câmara de cria 15×15×8 cm',
  'moca-branca': 'PNN / INPA — câmara de cria 12×12×6 cm',
  cupira: 'INPA — câmara de cria 12×12×8 cm',
};

const raw = readFileSync(DATA_PATH, 'utf-8');
const data = JSON.parse(raw);

data.species = data.species.map((species) => {
  // Remove trapNest unconditionally
  const { trapNest: _removed, ...rest } = species;

  const box = RATIONAL_BOX[rest.id];
  if (box) {
    return { ...rest, rationalBox: box };
  }
  // Species without a rational box model: remove the field entirely
  const { rationalBox: _rb, ...noBox } = rest;
  return noBox;
});

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  ASF — rationalBox patch (names + dimensions only)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

data.species.forEach((s) => {
  const has = !!s.rationalBox;
  console.log(
    `  ${has ? '✅' : '  '} ${s.id.padEnd(32)} ${has ? s.rationalBox : '(sem caixa racional)'}`
  );
});

if (DRY_RUN) {
  console.log('\n  DRY-RUN — run with --write to apply.\n');
} else {
  writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
  console.log('\n  ✅ JSON atualizado.');
  console.log('  Próximo passo: node scripts/import-species.js --write --force\n');
}
