#!/usr/bin/env node
/**
 * update-project-docs.js
 *
 * Reads the real state of the project (enabledChapters, chapter files,
 * git history) and updates PROJECT_STATUS.md, ROADMAP.md, and TODO.md.
 *
 * Usage:
 *   node scripts/update-project-docs.js            # Update all docs
 *   node scripts/update-project-docs.js --dry-run   # Preview changes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

const LANGUAGES = ['en', 'es', 'pt'];
const dryRun = process.argv.includes('--dry-run');

// ─────────────────────────────────────────────────────────────
// Data collection
// ─────────────────────────────────────────────────────────────

function getEnabledChapters() {
  const src = fs.readFileSync(path.join(ROOT, 'scripts', 'build-v2.cjs'), 'utf8');
  const match = src.match(/enabledChapters:\s*\[([^\]]+)\]/);
  if (!match) throw new Error('Could not parse enabledChapters from build-v2.cjs');
  return match[1]
    .split(',')
    .map(s => parseInt(s.trim(), 10))
    .filter(Boolean);
}

function getChapterInfo(n) {
  const nn = String(n).padStart(2, '0');
  const enPath = path.join(ROOT, 'i18n', 'en', 'chapters', `${nn}.json`);
  if (!fs.existsSync(enPath)) return null;

  const chapter = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  const langs = LANGUAGES.filter(lang =>
    fs.existsSync(path.join(ROOT, 'i18n', lang, 'chapters', `${nn}.json`))
  );

  // Get last commit info for this chapter
  let date = null;
  let isV3 = false;
  try {
    const log = execSync(`git log --format="%ai|%s" -1 -- "i18n/en/chapters/${nn}.json"`, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: 'pipe'
    }).trim();
    if (log) {
      const [rawDate, msg] = log.split('|');
      date = rawDate.trim().slice(0, 10); // YYYY-MM-DD
      isV3 = /^content\(ch\d+\):/.test(msg.trim());
    }
  } catch {
    /* no git info */
  }

  return {
    number: n,
    nn,
    title: chapter.title,
    langs,
    date,
    isV3,
    langLabel: langs.map(l => l.toUpperCase()).join('/')
  };
}

function today() {
  const d = new Date();
  const months = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre'
  ];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

// ─────────────────────────────────────────────────────────────
// Update PROJECT_STATUS.md
// ─────────────────────────────────────────────────────────────

function updateProjectStatus(chapters, enabled) {
  const filePath = path.join(ROOT, 'docs', 'project', 'PROJECT_STATUS.md');
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Update date
  content = content.replace(/\*\*Actualizado:\*\*\s*.+/, `**Actualizado:** ${today()}`);

  // 2. Update "Capítulos publicados" line
  const v3Chapters = chapters.filter(c => c.isV3);
  const publishedList = v3Chapters.map(c => c.number).join(', ');
  content = content.replace(
    /\*\*Capítulos publicados:\*\*\s*.+/,
    `**Capítulos publicados:** ${publishedList} (reescritos v3)`
  );

  // 3. Update "Contenido v3" table
  const tableHeader =
    '| Capítulo | Título EN | Estado | Fecha |\n|----------|-----------|--------|-------|';
  const tableRows = [];

  for (let n = 1; n <= 16; n++) {
    const ch = chapters.find(c => c.number === n);
    if (ch && ch.isV3) {
      tableRows.push(`| ${n} | ${ch.title} | Publicado (${ch.langLabel}) | ${ch.date || '—'} |`);
    } else {
      const title = ch ? ch.title : '—';
      tableRows.push(`| ${n} | ${title} | Pendiente de reescritura v3 | — |`);
    }
  }

  const newTable = tableHeader + '\n' + tableRows.join('\n');
  content = content.replace(/\| Capítulo \| Título EN[\s\S]*?(?=\n\n)/, newTable);

  // 4. Remove legacy note if all chapters are v3
  if (v3Chapters.length === 16) {
    content = content.replace(/\nLos archivos `i18n[^\n]*\n/, '\n');
  } else {
    const pending = [];
    for (let n = 1; n <= 16; n++) {
      const ch = chapters.find(c => c.number === n);
      if (!ch || !ch.isV3) pending.push(String(n).padStart(2, '0'));
    }
    if (pending.length > 0) {
      content = content.replace(
        /Los archivos `i18n[^\n]*/,
        `Los archivos \`i18n/*/chapters/{${pending.join(',')}}.json\` contienen versiones legacy (v1/v2) que serán reescritas.`
      );
    }
  }

  // 5. Update enabledChapters line
  content = content.replace(
    /`build-v2\.cjs` tiene `enabledChapters`[^\n]*/,
    `\`build-v2.cjs\` tiene \`enabledChapters\` que controla qué capítulos se publican. Actualmente: \`[${enabled.join(', ')}]\`.`
  );

  return { filePath, content };
}

// ─────────────────────────────────────────────────────────────
// Update ROADMAP.md
// ─────────────────────────────────────────────────────────────

function updateRoadmap(chapters) {
  const filePath = path.join(ROOT, 'docs', 'project', 'ROADMAP.md');
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Update date
  content = content.replace(/> Actualizado:\s*.+/, `> Actualizado: ${today()}`);

  // 2. Update "Estado actual" section
  const v3Chapters = chapters.filter(c => c.isV3);
  const v3Count = v3Chapters.length;
  const langSummary = v3Chapters.some(c => c.langs.length === 3) ? 'EN/ES/PT' : 'EN/ES';

  content = content.replace(
    /## Estado actual[\s\S]*?(?=\n---)/,
    `## Estado actual\n\n` +
      `- **v3.eluno.org** live con ${v3Count} de 16 capítulos (${langSummary})\n` +
      `- Pipeline de escritura automatizado (6 fases, slash commands)\n` +
      `- Build con \`build-v2.cjs\`, deploy automático vía Cloudflare Pages\n`
  );

  // 3. Update chapter checklist
  const TITLES = {
    1: 'Cosmology and Genesis',
    2: 'The Creator and Creation',
    3: 'The Densities of Consciousness',
    4: "Earth's Spiritual History",
    5: 'Polarity — The Two Paths',
    6: 'Wanderers — Those Who Return',
    7: 'The Harvest',
    8: 'The Veil of Forgetting',
    9: 'Death and the Journey Between Lives',
    10: 'The Energy Centers',
    11: 'Catalyst and Experience',
    12: 'The Higher Self and Guidance',
    13: 'Free Will and the Law of Confusion',
    14: 'The Path of the Seeker',
    15: 'Balancing and Healing',
    16: 'The Mystery Remains'
  };

  for (let n = 1; n <= 16; n++) {
    const ch = chapters.find(c => c.number === n);
    const title = TITLES[n];
    const isV3 = ch && ch.isV3;

    // Match both [x] and [ ] variants
    const pattern = new RegExp(`- \\[[ x]\\] Capítulo ${n}:.*`);
    const replacement = isV3 ? `- [x] Capítulo ${n}: ${title}` : `- [ ] Capítulo ${n}: ${title}`;
    content = content.replace(pattern, replacement);
  }

  return { filePath, content };
}

// ─────────────────────────────────────────────────────────────
// Update TODO.md
// ─────────────────────────────────────────────────────────────

function updateTodo(chapters) {
  const filePath = path.join(ROOT, 'docs', 'project', 'TODO.md');
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Update date
  content = content.replace(/> Actualizado:\s*.+/, `> Actualizado: ${today()}`);

  // 2. Update chapter writing task
  const v3Chapters = chapters.filter(c => c.isV3);
  const pending = [];
  for (let n = 1; n <= 16; n++) {
    const ch = chapters.find(c => c.number === n);
    if (!ch || !ch.isV3) pending.push(n);
  }

  if (pending.length === 0) {
    content = content.replace(
      /- \[ \] \*\*Escribir capítulos.*\*\*[^\n]*/,
      '- [x] **Escribir capítulos 3-16 en v3** — Completado'
    );
  } else {
    content = content.replace(
      /- \[[ x]\] \*\*Escribir capítulos.*\*\*[^\n]*/,
      `- [ ] **Escribir capítulos ${pending.join(', ')} en v3** — ${v3Chapters.length}/16 completados`
    );
  }

  return { filePath, content };
}

// ─────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────

console.log('═══════════════════════════════════════════');
console.log(` Updating project docs${dryRun ? ' (DRY RUN)' : ''}`);
console.log('═══════════════════════════════════════════\n');

const enabled = getEnabledChapters();
const chapters = [];

for (let n = 1; n <= 16; n++) {
  const info = getChapterInfo(n);
  if (info) chapters.push(info);
}

const v3Count = chapters.filter(c => c.isV3).length;
console.log(`   Found ${chapters.length} chapters, ${v3Count} are v3 rewrites`);
console.log(`   enabledChapters: [${enabled.join(', ')}]\n`);

const updates = [
  updateProjectStatus(chapters, enabled),
  updateRoadmap(chapters),
  updateTodo(chapters)
];

for (const { filePath, content } of updates) {
  const rel = path.relative(ROOT, filePath);
  if (dryRun) {
    console.log(`   Would update: ${rel}`);
  } else {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`   ✅ Updated: ${rel}`);
  }
}

console.log('\n═══════════════════════════════════════════');
if (dryRun) {
  console.log('🔍 Dry run complete. No files were modified.');
} else {
  console.log(`✅ Project docs updated (${v3Count}/16 v3 chapters)`);
}
