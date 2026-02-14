#!/usr/bin/env node
/**
 * validate-chapter.cjs — El Uno Chapter Validator
 *
 * Validates a chapter JSON file against the writing system rules.
 *
 * Usage:
 *   node writing/tools/validate-chapter.cjs i18n/en/chapters/02.json
 *   node writing/tools/validate-chapter.cjs i18n/en/chapters/02.json --references writing/protocol/references.json
 */

const fs = require('fs');
const path = require('path');

const PROHIBITED_TERMS = [
  { pattern: /\bdimension\b/gi, correct: 'density' },
  { pattern: /\bchakra\b/gi, correct: 'ray / energy center' },
  { pattern: /\bstarseed\b/gi, correct: 'wanderer' },
  { pattern: /\b(?<!sub-)God\b/g, correct: 'Logos / Creator / Infinite Creator' },
  { pattern: /\bchallenge\b/gi, correct: 'catalyst' },
  { pattern: /\bjudgment\b/gi, correct: 'harvest' },
  { pattern: /\brapture\b/gi, correct: 'harvest' },
];

const PROHIBITED_ATTRIBUTIONS = [
  /\bRa\b(?!\w)/,
  /\bQ'uo\b/i,
  /\bDon Elkins\b/i,
  /\bCarla Rueckert\b/i,
  /\bJim McCarty\b/i,
  /\bchanneled material\b/i,
  /\bthe sessions\b/i,
  /\bLaw of One\b/i,
  /\bthe instrument\b/i,
];

const MOJIBAKE_PATTERNS = [
  { pattern: /â€"/g, replacement: '\u2014' },
  { pattern: /â€™/g, replacement: '\u2019' },
  { pattern: /â€œ/g, replacement: '\u201C' },
  { pattern: /â€[^"]/g, replacement: '\u201D' },
  { pattern: /Ã¡/g, replacement: '\u00E1' },
  { pattern: /Ã©/g, replacement: '\u00E9' },
  { pattern: /Ã­/g, replacement: '\u00ED' },
  { pattern: /Ã³/g, replacement: '\u00F3' },
  { pattern: /Ãº/g, replacement: '\u00FA' },
];

function extractText(chapter) {
  const texts = [];
  if (!chapter.sections) return texts;
  for (const section of chapter.sections) {
    if (!section.content) continue;
    for (const block of section.content) {
      if (block.text) {
        texts.push({ text: block.text, sectionId: section.id, type: block.type });
      }
    }
  }
  return texts;
}

function validateSchema(chapter) {
  const errors = [];
  if (!chapter.id) errors.push('Missing field: id');
  if (chapter.number === undefined) errors.push('Missing field: number');
  if (!chapter.title) errors.push('Missing field: title');
  if (!Array.isArray(chapter.sections)) {
    errors.push('Missing or invalid field: sections (must be array)');
    return { pass: false, errors };
  }
  for (let i = 0; i < chapter.sections.length; i++) {
    const s = chapter.sections[i];
    if (!s.id) errors.push(`Section ${i}: missing id`);
    if (!s.title) errors.push(`Section ${i}: missing title`);
    if (!Array.isArray(s.content)) {
      errors.push(`Section ${i} (${s.id || '?'}): missing or invalid content array`);
    } else {
      for (let j = 0; j < s.content.length; j++) {
        const c = s.content[j];
        if (!c.type) errors.push(`Section ${s.id}, block ${j}: missing type`);
      }
    }
  }
  return { pass: errors.length === 0, errors };
}

function validateRefs(texts, referencesPath) {
  let references = null;
  if (referencesPath && fs.existsSync(referencesPath)) {
    const raw = JSON.parse(fs.readFileSync(referencesPath, 'utf8'));
    references = Array.isArray(raw) ? raw : (raw.references || []);
  }

  const refPattern = /\{ref:([^}]+)\}/g;
  const found = [];
  const phantoms = [];

  for (const { text, sectionId } of texts) {
    let match;
    while ((match = refPattern.exec(text)) !== null) {
      const refKey = match[1];
      found.push({ key: refKey, section: sectionId });
      if (references) {
        const exists = references.some(r => r.key === refKey);
        if (!exists) {
          phantoms.push({ key: refKey, section: sectionId });
        }
      }
    }
  }

  return {
    pass: phantoms.length === 0,
    total: found.length,
    phantoms,
    note: references ? null : 'No references.json provided — skipped validation',
  };
}

function validateTerms(texts) {
  const termPattern = /\{term:([^}]+)\}/g;
  const termCounts = {};

  for (const { text, sectionId } of texts) {
    let match;
    while ((match = termPattern.exec(text)) !== null) {
      const keyword = match[1];
      if (!termCounts[keyword]) termCounts[keyword] = [];
      termCounts[keyword].push(sectionId);
    }
  }

  const duplicates = [];
  for (const [keyword, sections] of Object.entries(termCounts)) {
    if (sections.length > 1) {
      duplicates.push({ keyword, occurrences: sections.length, sections });
    }
  }

  return {
    pass: duplicates.length === 0,
    total: Object.keys(termCounts).length,
    duplicates,
  };
}

function validateTerminology(texts) {
  const issues = [];
  for (const { text, sectionId } of texts) {
    for (const { pattern, correct } of PROHIBITED_TERMS) {
      pattern.lastIndex = 0;
      const match = pattern.exec(text);
      if (match) {
        issues.push({
          found: match[0],
          correct,
          section: sectionId,
          context: text.substring(Math.max(0, match.index - 30), match.index + match[0].length + 30),
        });
      }
    }
  }
  return { pass: issues.length === 0, issues };
}

function validateAttributions(texts) {
  const issues = [];
  for (const { text, sectionId } of texts) {
    for (const pattern of PROHIBITED_ATTRIBUTIONS) {
      const match = pattern.exec(text);
      if (match) {
        issues.push({
          found: match[0],
          section: sectionId,
          context: text.substring(Math.max(0, match.index - 30), match.index + match[0].length + 30),
        });
      }
    }
  }
  return { pass: issues.length === 0, issues };
}

function validateEncoding(texts) {
  const issues = [];
  for (const { text, sectionId } of texts) {
    for (const { pattern } of MOJIBAKE_PATTERNS) {
      pattern.lastIndex = 0;
      const match = pattern.exec(text);
      if (match) {
        issues.push({
          found: match[0],
          section: sectionId,
          position: match.index,
        });
      }
    }
  }
  return { pass: issues.length === 0, issues };
}

function countWords(texts) {
  let total = 0;
  const bySectionId = {};
  for (const { text, sectionId } of texts) {
    const cleaned = text.replace(/\{[^}]+\}/g, '').replace(/<[^>]+>/g, '');
    const words = cleaned.split(/\s+/).filter(w => w.length > 0).length;
    total += words;
    bySectionId[sectionId] = (bySectionId[sectionId] || 0) + words;
  }
  return { total, bySection: bySectionId };
}

function validateResidualSrc(texts) {
  const srcPattern = /\{src:[^}]+\}/g;
  const found = [];
  for (const { text, sectionId } of texts) {
    let match;
    while ((match = srcPattern.exec(text)) !== null) {
      found.push({ mark: match[0], section: sectionId });
    }
  }
  return { pass: found.length === 0, found };
}

// ─── Main ──────────────────────────────────────────────────────────

const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: node validate-chapter.cjs <chapter.json> [--references <references.json>]');
  process.exit(0);
}

const chapterPath = args[0];
let referencesPath = null;

for (let i = 1; i < args.length; i++) {
  if (args[i] === '--references' && args[i + 1]) {
    referencesPath = args[i + 1];
    i++;
  }
}

// Auto-detect references.json
if (!referencesPath) {
  const candidates = [
    path.join(process.cwd(), 'writing', 'protocol', 'references.json'),
    path.join(path.dirname(chapterPath), '..', '..', 'writing', 'protocol', 'references.json'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      referencesPath = c;
      break;
    }
  }
}

if (!fs.existsSync(chapterPath)) {
  console.error(`File not found: ${chapterPath}`);
  process.exit(1);
}

const chapter = JSON.parse(fs.readFileSync(chapterPath, 'utf8'));
const texts = extractText(chapter);

const results = {
  file: chapterPath,
  chapter: chapter.id || '?',
  schema: validateSchema(chapter),
  refs: validateRefs(texts, referencesPath),
  terms: validateTerms(texts),
  terminology: validateTerminology(texts),
  attributions: validateAttributions(texts),
  encoding: validateEncoding(texts),
  residualSrc: validateResidualSrc(texts),
  wordcount: countWords(texts),
};

// ─── Output ────────────────────────────────────────────────────────

const allPass = results.schema.pass
  && results.refs.pass
  && results.terms.pass
  && results.terminology.pass
  && results.attributions.pass
  && results.encoding.pass
  && results.residualSrc.pass;

console.log(`\n  Validating: ${chapterPath}`);
console.log(`  Chapter: ${results.chapter} — "${chapter.title || '?'}"\n`);

const icon = (pass) => pass ? '\x1b[32m  PASS\x1b[0m' : '\x1b[31m  FAIL\x1b[0m';

console.log(`${icon(results.schema.pass)}  Schema`);
if (!results.schema.pass) results.schema.errors.forEach(e => console.log(`         - ${e}`));

console.log(`${icon(results.refs.pass)}  References (${results.refs.total} found${results.refs.note ? ', ' + results.refs.note : ''})`);
if (!results.refs.pass) results.refs.phantoms.forEach(p => console.log(`         - {ref:${p.key}} in ${p.section}`));

console.log(`${icon(results.terms.pass)}  Terms (${results.terms.total} unique)`);
if (!results.terms.pass) results.terms.duplicates.forEach(d => console.log(`         - {term:${d.keyword}} appears ${d.occurrences}x in: ${d.sections.join(', ')}`));

console.log(`${icon(results.terminology.pass)}  Terminology`);
if (!results.terminology.pass) results.terminology.issues.forEach(i => console.log(`         - "${i.found}" → use "${i.correct}" (${i.section})`));

console.log(`${icon(results.attributions.pass)}  Attributions`);
if (!results.attributions.pass) results.attributions.issues.forEach(i => console.log(`         - "${i.found}" found in ${i.section}`));

console.log(`${icon(results.encoding.pass)}  Encoding`);
if (!results.encoding.pass) results.encoding.issues.forEach(i => console.log(`         - Mojibake "${i.found}" in ${i.section}`));

console.log(`${icon(results.residualSrc.pass)}  No residual {src:}`);
if (!results.residualSrc.pass) results.residualSrc.found.forEach(f => console.log(`         - ${f.mark} in ${f.section}`));

console.log(`\n  Words: ${results.wordcount.total}`);
for (const [sid, count] of Object.entries(results.wordcount.bySection)) {
  console.log(`    ${sid}: ${count}`);
}

console.log(`\n  ${allPass ? '\x1b[32mALL CHECKS PASSED\x1b[0m' : '\x1b[31mSOME CHECKS FAILED\x1b[0m'}\n`);

process.exit(allPass ? 0 : 1);
