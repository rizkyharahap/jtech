#!/usr/bin/env node
/**
 * Phase 4 asset maintenance.
 *
 *   1. Prune source images that no page references, so the build stops
 *      copying dead weight into dist/.
 *   2. Report the image budget so regressions are visible.
 *
 * Usage:
 *   node scripts/prune-assets.mjs            # dry run — lists what would go
 *   node scripts/prune-assets.mjs --write    # actually move to a quarantine dir
 *
 * Nothing is deleted: unreferenced files are moved to
 * resources/unused-images/ so they remain available for future pages.
 */
import { readdirSync, readFileSync, statSync, mkdirSync, renameSync, existsSync } from 'node:fs';
import { join, extname, basename } from 'node:path';

const SRC_IMG = 'src/assets/img';
const QUARANTINE = 'resources/unused-images';
const WRITE = process.argv.includes('--write');

const KEEP_ALWAYS = new Set(['logo-dark.png', 'logo-light.png']);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

/** All source text we can scan for references (astro/ts/json/md). */
const sourceFiles = walk('src').filter((f) =>
  ['.astro', '.ts', '.json', '.md'].includes(extname(f)),
);
const sourceText = sourceFiles.map((f) => readFileSync(f, 'utf8')).join('\n');
const sourceBasenames = sourceFiles.map((f) => basename(f));
/** Strip .astro/.ts wrappers from import.meta.glob so the pattern still matches. */
const searchText = `${sourceText}\n${sourceBasenames.join('\n')}`;

const images = readdirSync(SRC_IMG).filter((f) => /\.(jpe?g|png)$/i.test(f));
const used = [];
const unused = [];

for (const img of images) {
  if (KEEP_ALWAYS.has(img)) {
    used.push(img);
    continue;
  }
  const stem = img.replace(/\.(jpe?g|png)$/i, '');
  // A reference is: an exact filename import, a glob match on the stem, or a
  // collection key like "p14" resolving through the glob.
  const referenced = searchText.includes(img) || searchText.includes(`'${stem}'`) || searchText.includes(`"${stem}"`);
  (referenced ? used : unused).push(img);
}

const bytes = (list) =>
  list.reduce((n, f) => n + statSync(join(SRC_IMG, f)).size, 0) / 1048576;

console.log(`Source images      : ${images.length}`);
console.log(`  referenced       : ${used.length}  (${bytes(used).toFixed(1)} MB)`);
console.log(`  unreferenced     : ${unused.length}  (${bytes(unused).toFixed(1)} MB)`);

if (unused.length) {
  console.log('\nUnreferenced (not copied to dist once pruned):');
  for (const f of unused) console.log(`  - ${f}`);
}

if (!unused.length) {
  console.log('\n✓ Nothing to prune.');
  process.exit(0);
}

if (!WRITE) {
  console.log('\nDry run. Re-run with --write to move these to ' + QUARANTINE + '/');
  process.exit(0);
}

mkdirSync(QUARANTINE, { recursive: true });
let moved = 0;
for (const f of unused) {
  const from = join(SRC_IMG, f);
  let to = join(QUARANTINE, f);
  let i = 1;
  while (existsSync(to)) to = join(QUARANTINE, `${f.replace(/(\.\w+)$/, `-${i++}$1`)}`);
  renameSync(from, to);
  moved++;
}
console.log(`\n✓ Moved ${moved} file(s) to ${QUARANTINE}/`);
console.log('  (recoverable — nothing was deleted)');
