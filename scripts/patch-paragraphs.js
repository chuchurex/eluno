#!/usr/bin/env node
/**
 * patch-paragraphs.js — Targeted paragraph corrections
 *
 * Replaces specific paragraphs of a chapter in EN/ES/PT (and optionally
 * provenance segments) from a reviewed patch file, leaving the rest of the
 * chapter untouched. Used for Ra-fidelity corrections, where re-translating the
 * whole chapter would change already-reviewed text.
 *
 * Usage:
 *   node scripts/patch-paragraphs.js workspace/audit/ch10-patch.json
 *   node scripts/patch-paragraphs.js workspace/audit/ch10-patch.json --dry-run
 *
 * Patch file:
 *   {
 *     "chapter": "10",
 *     "paragraphs": [
 *       { "section": "ch10-red-ray", "paragraph": 3, "expect": "This center concerns survival",
 *         "en": "...", "es": "...", "pt": "..." }
 *     ],
 *     "provenance": [
 *       { "section": "ch10-red-ray", "paragraphs": [3], "sources": ["50.2", "31.4"], "note": "..." }
 *     ]
 *   }
 *
 * `expect` is the start of the current EN text; the patch aborts if it does not
 * match, so a stale patch never overwrites the wrong paragraph.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');
const LANGS = ['en', 'es', 'pt'];

const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');

const termsOf = text => [...text.matchAll(/\{term:([^}]+)\}/g)].map(m => m[1]).sort();

function fail(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

const args = process.argv.slice(2);
const patchFile = args.find(a => !a.startsWith('--'));
const dryRun = args.includes('--dry-run');
if (!patchFile) {
  fail('Usage: patch-paragraphs.js <patch.json> [--dry-run]');
}

const patch = readJson(path.resolve(patchFile));
const nn = String(patch.chapter).padStart(2, '0');

const chapters = {};
const glossaries = {};
for (const lang of LANGS) {
  chapters[lang] = readJson(path.join(ROOT, 'i18n', lang, 'chapters', `${nn}.json`));
  glossaries[lang] = readJson(path.join(ROOT, 'i18n', lang, 'glossary.json'));
}

for (const p of patch.paragraphs || []) {
  const label = `${p.section} P${p.paragraph}`;
  const enTerms = termsOf(p.en || '');
  for (const lang of LANGS) {
    if (!p[lang]) {
      fail(`${label}: missing ${lang} text`);
    }
    if (/—/.test(p[lang])) {
      fail(`${label} (${lang}): em dash not allowed`);
    }
    const section = chapters[lang].sections.find(s => s.id === p.section);
    if (!section) {
      fail(`${label}: section not found in ${lang}`);
    }
    const item = section.content[p.paragraph - 1];
    if (!item || item.type !== 'paragraph') {
      fail(`${label}: not a paragraph in ${lang}`);
    }
    if (lang === 'en' && p.expect && !item.text.startsWith(p.expect)) {
      fail(`${label}: current EN text does not start with "${p.expect}"`);
    }
    const terms = termsOf(p[lang]);
    if (terms.join() !== enTerms.join()) {
      fail(`${label} (${lang}): {term:} set differs from en`);
    }
    for (const t of terms) {
      if (!glossaries[lang][t]) {
        fail(`${label} (${lang}): term "${t}" not in glossary`);
      }
    }
    item.text = p[lang];
  }
  console.log(`✓ ${label}`);
}

const provFile = path.join(ROOT, 'i18n', 'provenance', `ch${nn}_provenance.json`);
const prov = readJson(provFile);
for (const seg of patch.provenance || []) {
  const section = prov.provenance.find(s => s.section_id === seg.section);
  if (!section) {
    fail(`provenance: section ${seg.section} not found`);
  }
  const target = section.segments.find(s => s.paragraphs.join() === seg.paragraphs.join());
  if (!target) {
    fail(`provenance: ${seg.section} P${seg.paragraphs} has no matching segment`);
  }
  target.sources = seg.sources;
  target.urls = seg.sources
    .filter(s => s !== 'synthesis')
    .map(s => {
      const [session, q] = s.split('.');
      return `${prov.base_url}${session}#${q}`;
    });
  if (seg.note) {
    target.note = seg.note;
  }
  console.log(`✓ provenance ${seg.section} P${seg.paragraphs}: ${seg.sources.join(', ')}`);
}

if (dryRun) {
  console.log('\n(dry run, nothing written)');
} else {
  const written = LANGS.map(lang => path.join(ROOT, 'i18n', lang, 'chapters', `${nn}.json`));
  LANGS.forEach((lang, i) => writeJson(written[i], chapters[lang]));
  writeJson(provFile, prov);
  // Keep the repo's Prettier formatting so the diff shows only the patched text.
  execFileSync('pnpm', ['exec', 'prettier', '--write', ...written, provFile], {
    cwd: ROOT,
    stdio: 'ignore'
  });
  console.log(`\nPatched ch${nn}. Run: pnpm run test:json && pnpm run test:alignment`);
}
