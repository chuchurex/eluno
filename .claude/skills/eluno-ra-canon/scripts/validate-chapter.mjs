#!/usr/bin/env node
/**
 * validate-chapter.mjs — El Uno Chapter Validator (skill version)
 *
 * Valida un capítulo JSON contra las reglas duras del skill eluno-ra-canon.
 * Detecta:
 *   - Términos prohibidos (vocabulario que no encaja con la cosmología Ra).
 *   - Atribuciones prohibidas (Ra, Q'uo, nombres de canalizadores, etc.).
 *   - Marcado mal formado: {term:X}, {ref:cat:id}, {src:N.M}.
 *   - Schema básico: id, number, title, sections[].
 *
 * Las reglas se cargan desde:
 *   ../reglas/terminos-prohibidos.json
 *   ../reglas/atribuciones-prohibidas.json
 *
 * Uso:
 *   node validate-chapter.mjs <ruta-al-json> [--lang en|es|pt] [--json]
 *
 * Por defecto el output es human-readable. Con --json devuelve estructura
 * que el modelo puede leer directamente.
 *
 * Exit codes:
 *   0 — pass (sin errores; warnings permitidos)
 *   1 — fail (al menos un error)
 *   2 — uso incorrecto / archivo no encontrado
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REGLAS_DIR = path.resolve(__dirname, '..', 'reglas');

// ─────────────────────────────────────────────────────────────
// Args
// ─────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = { file: null, lang: null, json: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--json') args.json = true;
    else if (a === '--lang') args.lang = argv[++i];
    else if (!args.file) args.file = a;
  }
  return args;
}

function detectLang(filePath) {
  const m = filePath.match(/i18n\/([a-z]{2})\//);
  return m ? m[1] : 'en';
}

// ─────────────────────────────────────────────────────────────
// Load rules
// ─────────────────────────────────────────────────────────────

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function loadRules() {
  return {
    terms: loadJson(path.join(REGLAS_DIR, 'terminos-prohibidos.json')),
    attributions: loadJson(path.join(REGLAS_DIR, 'atribuciones-prohibidas.json')),
  };
}

// ─────────────────────────────────────────────────────────────
// Extract text from chapter
// ─────────────────────────────────────────────────────────────

function extractTextBlocks(chapter) {
  const out = [];
  if (!Array.isArray(chapter.sections)) return out;
  for (const section of chapter.sections) {
    if (!Array.isArray(section.content)) continue;
    for (let i = 0; i < section.content.length; i++) {
      const block = section.content[i];
      if (typeof block.text === 'string') {
        out.push({
          sectionId: section.id || '?',
          paragraphIndex: i,
          type: block.type || 'paragraph',
          text: block.text,
        });
      }
    }
  }
  return out;
}

// ─────────────────────────────────────────────────────────────
// Schema check
// ─────────────────────────────────────────────────────────────

function validateSchema(chapter) {
  const errors = [];
  if (!chapter.id) errors.push('Missing field: id');
  if (chapter.number === undefined || chapter.number === null) errors.push('Missing field: number');
  if (!chapter.title) errors.push('Missing field: title');
  if (!Array.isArray(chapter.sections)) {
    errors.push('Missing or invalid field: sections (must be array)');
    return errors;
  }
  for (let i = 0; i < chapter.sections.length; i++) {
    const s = chapter.sections[i];
    if (!s.id) errors.push(`Section ${i}: missing id`);
    if (!s.title) errors.push(`Section ${i}: missing title`);
    if (!Array.isArray(s.content)) {
      errors.push(`Section ${i} (${s.id || '?'}): missing content[]`);
    }
  }
  return errors;
}

// ─────────────────────────────────────────────────────────────
// Markup check
// ─────────────────────────────────────────────────────────────

const MARKUP_PATTERNS = {
  term: /\{term:([^}]+)\}/g,
  ref: /\{ref:([^}]+)\}/g,
  src: /\{src:([^}]+)\}/g,
};

function validateMarkup(blocks) {
  const issues = [];
  for (const block of blocks) {
    // term: kebab-case strict
    let m;
    const termRe = /\{term:([^}]+)\}/g;
    while ((m = termRe.exec(block.text)) !== null) {
      const slug = m[1];
      if (!/^[a-z0-9-]+$/.test(slug)) {
        issues.push({
          severity: 'error',
          kind: 'malformed_term',
          location: `${block.sectionId} p${block.paragraphIndex}`,
          detail: `{term:${slug}} no es kebab-case [a-z0-9-]+`,
        });
      }
    }
    // ref: cat:id format
    const refRe = /\{ref:([^}]+)\}/g;
    while ((m = refRe.exec(block.text)) !== null) {
      const inner = m[1];
      if (!/^[a-z]+:[a-z0-9-]+$/.test(inner)) {
        issues.push({
          severity: 'error',
          kind: 'malformed_ref',
          location: `${block.sectionId} p${block.paragraphIndex}`,
          detail: `{ref:${inner}} no tiene formato cat:id (categorias permitidas: phys, astro, phil, trad, text, math)`,
        });
      }
    }
    // src: N.M format
    const srcRe = /\{src:([^}]+)\}/g;
    while ((m = srcRe.exec(block.text)) !== null) {
      const ref = m[1];
      if (!/^\d+\.\d+$/.test(ref)) {
        issues.push({
          severity: 'error',
          kind: 'malformed_src',
          location: `${block.sectionId} p${block.paragraphIndex}`,
          detail: `{src:${ref}} no tiene formato N.M (sesion.pregunta del Material Ra)`,
        });
      }
    }
  }
  return issues;
}

// ─────────────────────────────────────────────────────────────
// Prohibited terms check
// ─────────────────────────────────────────────────────────────

function stripMarkup(text) {
  return text
    .replace(/\{term:[^}]+\}/g, '')
    .replace(/\{ref:[^}]+\}/g, '')
    .replace(/\{src:[^}]+\}/g, '');
}

function checkProhibitedTerms(blocks, termsRules, lang) {
  const issues = [];
  const langTerms = termsRules.terms[lang] || [];
  for (const rule of langTerms) {
    const re = new RegExp(rule.pattern, rule.flags || '');
    for (const block of blocks) {
      const stripped = stripMarkup(block.text);
      const matches = stripped.match(re);
      if (matches) {
        issues.push({
          severity: rule.severity || 'error',
          kind: 'prohibited_term',
          rule: rule.id,
          location: `${block.sectionId} p${block.paragraphIndex}`,
          detail: `Found "${matches[0]}" — should be "${rule.correct}". ${rule.rationale}`,
          count: matches.length,
        });
      }
    }
  }
  return issues;
}

// ─────────────────────────────────────────────────────────────
// Prohibited attributions check
// ─────────────────────────────────────────────────────────────

function checkProhibitedAttributions(blocks, attrRules) {
  const issues = [];
  for (const rule of attrRules.attributions) {
    const re = new RegExp(rule.pattern, rule.flags || '');
    for (const block of blocks) {
      const stripped = stripMarkup(block.text);
      const matches = stripped.match(re);
      if (matches) {
        issues.push({
          severity: rule.severity || 'error',
          kind: 'prohibited_attribution',
          rule: rule.id,
          location: `${block.sectionId} p${block.paragraphIndex}`,
          detail: `Found "${matches[0]}". ${rule.rationale}`,
          count: matches.length,
        });
      }
    }
  }
  return issues;
}

// ─────────────────────────────────────────────────────────────
// Render
// ─────────────────────────────────────────────────────────────

function renderHuman(report) {
  const lines = [];
  const status = report.errors > 0 ? '❌ FAIL' : report.warnings > 0 ? '⚠️  PASS (with warnings)' : '✅ PASS';
  lines.push(`\n${status} — ${report.file}`);
  lines.push(`  errors: ${report.errors}, warnings: ${report.warnings}`);
  lines.push(`  language: ${report.lang}`);
  lines.push('');

  if (report.schemaErrors.length) {
    lines.push('Schema errors:');
    for (const e of report.schemaErrors) lines.push(`  - ${e}`);
    lines.push('');
  }

  const groups = {
    error: report.issues.filter(i => i.severity === 'error'),
    warning: report.issues.filter(i => i.severity === 'warning'),
  };
  for (const [sev, items] of Object.entries(groups)) {
    if (items.length === 0) continue;
    lines.push(`${sev.toUpperCase()}S (${items.length}):`);
    for (const i of items) {
      const prefix = i.kind ? `[${i.kind}]` : '';
      lines.push(`  ${prefix} ${i.location}: ${i.detail}${i.count > 1 ? ` (×${i.count})` : ''}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

// ─────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────

function main() {
  const args = parseArgs(process.argv);
  if (!args.file) {
    console.error('Usage: validate-chapter.mjs <chapter.json> [--lang en|es|pt] [--json]');
    process.exit(2);
  }
  if (!fs.existsSync(args.file)) {
    console.error(`File not found: ${args.file}`);
    process.exit(2);
  }

  const lang = args.lang || detectLang(args.file);
  const chapter = loadJson(args.file);
  const rules = loadRules();
  const blocks = extractTextBlocks(chapter);
  const schemaErrors = validateSchema(chapter);
  const issues = [
    ...validateMarkup(blocks),
    ...checkProhibitedTerms(blocks, rules.terms, lang),
    ...checkProhibitedAttributions(blocks, rules.attributions),
  ];

  const errors = schemaErrors.length + issues.filter(i => i.severity === 'error').length;
  const warnings = issues.filter(i => i.severity === 'warning').length;

  const report = {
    file: args.file,
    lang,
    pass: errors === 0,
    errors,
    warnings,
    schemaErrors,
    issues,
    blocksScanned: blocks.length,
  };

  if (args.json) {
    process.stdout.write(JSON.stringify(report, null, 2) + '\n');
  } else {
    process.stdout.write(renderHuman(report));
  }
  process.exit(errors > 0 ? 1 : 0);
}

main();
