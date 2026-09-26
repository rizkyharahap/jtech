#!/usr/bin/env node
/**
 * Base-agnostic link audit.
 *
 * Verifies that every internal href/src in the built output is prefixed with
 * the configured base and resolves to a real file in dist/. This is the check
 * that makes a single codebase work on both Vercel (base '/') and GitHub Pages
 * (base '/<repo>/').
 *
 * Run:  node scripts/audit-links.mjs
 * With a non-root base:  BASE_PATH=/jtech-company-profile pnpm build && node scripts/audit-links.mjs
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, extname, relative, basename } from 'node:path';

const DIST = 'dist';
const BASE = (process.env.BASE_PATH ?? process.env.BASE_URL ?? '/').replace(/\/+$/, '') + '/';

/**
 * Marker files that must never reach the published output. macOS recreates
 * .DS_Store constantly, and Astro copies anything under src/ and public/, so
 * this is checked as a build gate rather than relying on manual cleanup.
 */
const JUNK_FILES = ['.DS_Store', 'Thumbs.db', 'desktop.ini'];

/**
 * Every route now ships, so this audit is deliberately strict: no allowlist.
 * If a ref cannot be resolved to a file in dist/, the build is broken.
 * (The 404 page is excluded because it renders the same nav but is not a
 * normal destination; hash-only refs are skipped as anchors, not links.)
 */

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

if (!existsSync(DIST)) {
  console.error(`✗ ${DIST}/ not found — run \`pnpm build\` first.`);
  process.exit(1);
}

const pages = walk(DIST).filter((f) => extname(f) === '.html');
const problems = [];
let checked = 0;

// Gate: no OS marker files in the published output.
const junk = walk(DIST).filter((f) => JUNK_FILES.includes(basename(f)));
for (const j of junk) {
  problems.push({ page: relative(DIST, j), ref: j, why: 'OS marker file in published output' });
}

for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  const refs = [
    ...html.matchAll(/(?:href|src)="([^"]+)"/g),
  ].map((m) => m[1]);

  for (const ref of refs) {
    // skip external, anchors, mailto/tel, data URIs
    if (/^(https?:)?\/\//.test(ref) || /^(#|mailto:|tel:|data:|javascript:)/.test(ref)) continue;
    // skip hash-only "links" that were not interpolated (should not happen)
    if (ref.includes('[object')) {
      problems.push({ page: relative(DIST, page), ref, why: 'unresolved value rendered as [object Object]' });
      continue;
    }
    if (!ref.startsWith('/')) {
      problems.push({ page: relative(DIST, page), ref, why: 'not site-absolute' });
      continue;
    }
    checked++;

    // every internal path must carry the configured base
    if (!ref.startsWith(BASE)) {
      problems.push({ page: relative(DIST, page), ref, why: `missing base "${BASE}"` });
      continue;
    }
    // strip the base before the fs lookup
    const rel = ref.slice(BASE.length).split(/[?#]/)[0];

    const candidates = rel === '' || rel.endsWith('/')
      ? [join(DIST, rel, 'index.html')]
      : [join(DIST, rel), join(DIST, rel, 'index.html'), join(DIST, `${rel}.html`)];
    if (!candidates.some((c) => existsSync(c))) {
      problems.push({ page: relative(DIST, page), ref, why: 'target does not exist in dist/' });
    }
  }
}

console.log(`Base: "${BASE}"`);
console.log(`Audited ${pages.length} page(s), ${checked} internal reference(s).`);
if (problems.length) {
  console.error(`\n✗ ${problems.length} problem(s):`);
  for (const p of problems.slice(0, 40)) {
    console.error(`  ${p.page}: ${p.ref}  → ${p.why}`);
  }
  process.exit(1);
}
console.log('✓ All internal links are base-prefixed and resolve.');
