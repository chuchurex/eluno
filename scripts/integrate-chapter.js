#!/usr/bin/env node
/**
 * integrate-chapter.js — Phase 6 automation
 *
 * Copies the EN chapter from operador/output/ into i18n/en/,
 * converts and merges the glossary, and copies provenance.
 *
 * Usage:
 *   node scripts/integrate-chapter.js 02
 *   node scripts/integrate-chapter.js 02 --force      # Overwrite existing
 *   node scripts/integrate-chapter.js 02 --dry-run    # Preview only
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

// ─────────────────────────────────────────────────────────────
// Paths
// ─────────────────────────────────────────────────────────────

function getPaths(nn) {
  return {
    // Source (operador output)
    srcChapter: path.join(ROOT, 'operador', 'output', `ch${nn}`, `ch${nn}_EN.json`),
    srcGlossary: path.join(ROOT, 'operador', 'output', `ch${nn}`, `ch${nn}_glossary.json`),
    srcProvenance: path.join(ROOT, 'operador', 'output', `ch${nn}`, `ch${nn}_provenance.json`),
    // Destination
    destChapter: path.join(ROOT, 'i18n', 'en', 'chapters', `${nn}.json`),
    destGlossary: path.join(ROOT, 'i18n', 'en', 'glossary.json'),
    destProvenance: path.join(ROOT, 'i18n', 'provenance', `ch${nn}_provenance.json`)
  };
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function loadJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJSON(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function sortObjectKeys(obj) {
  const sorted = {};
  for (const key of Object.keys(obj).sort()) {
    sorted[key] = obj[key];
  }
  return sorted;
}

// ─────────────────────────────────────────────────────────────
// Core operations
// ─────────────────────────────────────────────────────────────

function copyChapter(paths, dryRun, force) {
  // Validate source
  const chapter = loadJSON(paths.srcChapter);

  // Check for {src:} residuals
  const text = JSON.stringify(chapter);
  const srcMarks = text.match(/\{src:[^}]+\}/g);
  if (srcMarks) {
    console.error(
      `❌ Found ${srcMarks.length} {src:} residuals in EN chapter. Run /write:qa first.`
    );
    process.exit(1);
  }

  // Check required fields
  for (const field of ['id', 'number', 'title', 'sections']) {
    if (!(field in chapter)) {
      console.error(`❌ Missing required field: ${field}`);
      process.exit(1);
    }
  }

  // Check if destination exists
  if (fs.existsSync(paths.destChapter) && !force) {
    const existing = fs.readFileSync(paths.destChapter, 'utf8');
    const incoming = JSON.stringify(chapter, null, 2) + '\n';
    if (existing === incoming) {
      console.log('   📄 Chapter already integrated (identical) — skipping');
      return { skipped: true };
    }
    console.error(`❌ ${paths.destChapter} already exists. Use --force to overwrite.`);
    process.exit(2);
  }

  if (dryRun) {
    console.log(`   📄 Would copy chapter → ${path.relative(ROOT, paths.destChapter)}`);
    return { sections: chapter.sections.length, paragraphs: 0 };
  }

  writeJSON(paths.destChapter, chapter);
  const paragraphs = chapter.sections.reduce((sum, s) => sum + s.content.length, 0);
  console.log(`   📄 Chapter copied → ${path.relative(ROOT, paths.destChapter)}`);
  console.log(`      ${chapter.sections.length} sections, ${paragraphs} paragraphs`);
  return { sections: chapter.sections.length, paragraphs };
}

function mergeGlossary(paths, dryRun) {
  // Load source glossary (array format)
  const newTerms = loadJSON(paths.srcGlossary);

  if (!Array.isArray(newTerms) || newTerms.length === 0) {
    console.log('   📚 No new glossary terms to merge');
    return { added: 0, existing: 0 };
  }

  // Load destination glossary (object format)
  const glossary = loadJSON(paths.destGlossary);

  let added = 0;
  let existing = 0;

  for (const term of newTerms) {
    const { keyword, title, definition } = term;
    if (!keyword || !title) {
      console.warn(`   ⚠️  Skipping malformed term: ${JSON.stringify(term)}`);
      continue;
    }

    if (keyword in glossary) {
      existing++;
      continue;
    }

    // Convert array format → object format
    const content = Array.isArray(definition) ? definition : [definition];
    glossary[keyword] = { title, content };
    added++;
  }

  if (dryRun) {
    console.log(`   📚 Would add ${added} terms, ${existing} already exist`);
    return { added, existing };
  }

  // Backup and write
  const backupPath = paths.destGlossary + '.bak';
  fs.copyFileSync(paths.destGlossary, backupPath);

  const sorted = sortObjectKeys(glossary);
  writeJSON(paths.destGlossary, sorted);

  console.log(`   📚 Glossary merged → ${added} new terms, ${existing} existing`);
  if (added > 0) {
    for (const term of newTerms) {
      if (!(term.keyword in loadJSON(paths.srcGlossary).reduce ? {} : glossary)) {
        // Already added above, just list the new ones
      }
    }
    const addedTerms = newTerms.filter(
      t => !Object.keys(loadJSON(paths.destGlossary)).includes(t.keyword) === false
    );
    for (const term of newTerms) {
      console.log(`      + ${term.keyword}: "${term.title}"`);
    }
  }

  return { added, existing };
}

function copyProvenance(paths, dryRun, force) {
  if (!fs.existsSync(paths.srcProvenance)) {
    console.log('   📍 No provenance file found — skipping');
    return { skipped: true };
  }

  const provenance = loadJSON(paths.srcProvenance);

  if (fs.existsSync(paths.destProvenance) && !force) {
    const existing = fs.readFileSync(paths.destProvenance, 'utf8');
    const incoming = JSON.stringify(provenance, null, 2) + '\n';
    if (existing === incoming) {
      console.log('   📍 Provenance already integrated (identical) — skipping');
      return { skipped: true };
    }
  }

  if (dryRun) {
    console.log(`   📍 Would copy provenance → ${path.relative(ROOT, paths.destProvenance)}`);
    return {};
  }

  fs.mkdirSync(path.dirname(paths.destProvenance), { recursive: true });
  writeJSON(paths.destProvenance, provenance);

  const sections = provenance.provenance?.length || 0;
  const sources = new Set();
  for (const sec of provenance.provenance || []) {
    for (const seg of sec.segments || []) {
      for (const src of seg.sources || []) {
        sources.add(src);
      }
    }
  }

  console.log(`   📍 Provenance copied → ${sections} sections, ${sources.size} unique sources`);
  return { sections, sources: sources.size };
}

function runValidation(paths) {
  try {
    const result = execSync(`node scripts/validate-json.js "${paths.destChapter}"`, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: 'pipe'
    });
    console.log(`   ✅ JSON validation passed`);
    return true;
  } catch (e) {
    console.error(`   ❌ JSON validation failed:`);
    console.error(e.stdout || e.message);
    return false;
  }
}

// ─────────────────────────────────────────────────────────────
// CLI
// ─────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const flags = new Set(args.filter(a => a.startsWith('--')));
const positional = args.filter(a => !a.startsWith('--'));

const dryRun = flags.has('--dry-run');
const force = flags.has('--force');

if (positional.length === 0) {
  console.log('Usage: node scripts/integrate-chapter.js <chapter> [--force] [--dry-run]');
  console.log('  node scripts/integrate-chapter.js 02');
  console.log('  node scripts/integrate-chapter.js 02 --force');
  console.log('  node scripts/integrate-chapter.js 02 --dry-run');
  process.exit(0);
}

const chapterNum = positional[0].padStart(2, '0');
const paths = getPaths(chapterNum);

console.log('═══════════════════════════════════════════');
console.log(` Integrating Chapter ${parseInt(chapterNum, 10)}${dryRun ? ' (DRY RUN)' : ''}`);
console.log('═══════════════════════════════════════════\n');

// Validate inputs exist
const missing = [];
if (!fs.existsSync(paths.srcChapter)) missing.push(path.relative(ROOT, paths.srcChapter));
if (!fs.existsSync(paths.srcGlossary)) missing.push(path.relative(ROOT, paths.srcGlossary));

if (missing.length > 0) {
  console.error('❌ Missing required input files:');
  for (const m of missing) console.error(`   • ${m}`);
  console.error('\nRun the pipeline first: /write:qa → /write:glossary');
  process.exit(2);
}

// Execute
copyChapter(paths, dryRun, force);
mergeGlossary(paths, dryRun);
copyProvenance(paths, dryRun, force);

if (!dryRun) {
  runValidation(paths);
}

console.log('\n═══════════════════════════════════════════');
if (dryRun) {
  console.log('🔍 Dry run complete. No files were modified.');
} else {
  console.log('✅ Integration complete!');
  console.log(`\nNext: node scripts/translate-chapter.js ${chapterNum}`);
}
