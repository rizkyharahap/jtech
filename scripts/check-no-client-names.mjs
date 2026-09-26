#!/usr/bin/env node
/**
 * Fails the build if client-identifying data leaks into the published output.
 *
 * Per client decision: client names and SPBU unit codes must NEVER be
 * published — only generic industry labels.
 *
 * Run after `astro build`:  node scripts/check-no-client-names.mjs
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const DIST = 'dist';

/** Names that must never appear. */
const BANNED_NAMES = ['Citra Buana', 'Indoloka'];

/**
 * SPBU unit codes look like 24.301.108 / 24-301.16.
 * DOMAIN is what follows the match: a unit code is always followed by a
 * non-word character, a capital letter, or end-of-string. That excludes the
 * false positives in Astro's font-metric CSS (`ascent-override:98.4556%`,
 * `size-adjust:97.9207%`, `size-adjust:92.0871%`).
 */
const SPBU_RE = /\b\d{2}[.\-]\d{3}[.\-]\d{1,3}\b(?![0-9]|%|em|px|rem|vh|vw|deg|s\b)/g;

/** Strip things that legitimately contain digits: <style>, <script>, inline style. */
function stripNonContent(html) {
  return html
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/\sstyle="[^"]*"/gi, ' ');
}

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

const files = walk(DIST).filter((f) => ['.html', '.xml', '.txt', '.json'].includes(extname(f)));
const violations = [];

for (const file of files) {
  const raw = readFileSync(file, 'utf8');
  const text = extname(file) === '.html' ? stripNonContent(raw) : raw;
  for (const name of BANNED_NAMES) {
    if (text.includes(name)) violations.push({ file, kind: 'client name', value: name });
  }
  for (const m of text.matchAll(SPBU_RE)) {
    violations.push({ file, kind: 'SPBU unit code', value: m[0] });
  }
}

console.log(`Scanned ${files.length} file(s) in ${DIST}/ for client identifiers.`);
if (violations.length) {
  console.error(`\n✗ ${violations.length} violation(s) found:`);
  for (const v of violations.slice(0, 30)) {
    console.error(`  ${v.file}  [${v.kind}]  "${v.value}"`);
  }
  process.exit(1);
}
console.log('✓ No client names or SPBU unit codes in published output.');
