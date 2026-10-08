#!/usr/bin/env node
/**
 * audit-provenance.cjs — Ra anchor audit dump
 *
 * For each provenance segment of a chapter, prints the EN paragraphs next to the
 * full Ra text (question and answer) of every anchor, so each anchor can be
 * checked against the corpus instead of the thematic index. Also runs structural
 * checks: missing sections, out-of-range paragraphs, unknown anchors, uncovered
 * paragraphs and EN/ES/PT paragraph-count alignment.
 *
 * Usage:
 *   node writing/tools/audit-provenance.cjs 10
 *   node writing/tools/audit-provenance.cjs 10 --out workspace/audit/ch10-dump.md
 *   node writing/tools/audit-provenance.cjs all --check     # structural checks only
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const SESSIONS = path.join(ROOT, 'writing', 'sources', 'ra', 'sessions');
const LANGS = ['en', 'es', 'pt'];

const sessionCache = new Map();

function raText(id) {
  const [s, q] = id.split('.');
  if (!sessionCache.has(s)) {
    const file = path.join(SESSIONS, `session-${s.padStart(3, '0')}.md`);
    sessionCache.set(s, fs.existsSync(file) ? fs.readFileSync(file, 'utf8').split('\n') : null);
  }
  const lines = sessionCache.get(s);
  if (!lines) return null;
  const out = [];
  let on = false;
  for (const line of lines) {
    const m = line.match(/^## \((\d+)\.(\d+)\)/);
    if (m) on = m[1] === s && m[2] === q;
    if (on && line.trim()) out.push(line.startsWith('## ') ? `**${line.slice(3)}**` : line);
  }
  return out.length ? out.join('\n') : null;
}

// Provenance ids sometimes use an unpadded prefix (ch2-*) while chapters use ch02-*.
function findSection(chapter, id) {
  return (
    chapter.sections.find(s => s.id === id) ||
    chapter.sections.find(s => s.id.replace(/^ch\d+-/, '') === id.replace(/^ch\d+-/, ''))
  );
}

function load(nn) {
  const prov = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'i18n', 'provenance', `ch${nn}_provenance.json`), 'utf8')
  );
  const chapters = {};
  for (const lang of LANGS) {
    chapters[lang] = JSON.parse(
      fs.readFileSync(path.join(ROOT, 'i18n', lang, 'chapters', `${nn}.json`), 'utf8')
    );
  }
  return { prov, chapters };
}

function check(nn) {
  const { prov, chapters } = load(nn);
  const issues = [];
  for (const sec of prov.provenance) {
    const s = findSection(chapters.en, sec.section_id);
    if (!s) {
      issues.push(`section not found: ${sec.section_id}`);
      continue;
    }
    if (s.id !== sec.section_id) issues.push(`section id mismatch: ${sec.section_id} -> ${s.id}`);
    const covered = new Set();
    for (const seg of sec.segments) {
      for (const p of seg.paragraphs) {
        covered.add(p);
        if (p > s.content.length) issues.push(`${s.id} P${p} out of range (${s.content.length})`);
      }
      for (const a of seg.sources) {
        if (a !== 'synthesis' && !raText(a)) issues.push(`${s.id}: unknown anchor ${a}`);
      }
    }
    for (let i = 1; i <= s.content.length; i++) {
      if (!covered.has(i)) issues.push(`${s.id} P${i} has no provenance`);
    }
    for (const lang of ['es', 'pt']) {
      const t = findSection(chapters[lang], s.id);
      if (!t || t.content.length !== s.content.length)
        issues.push(`${s.id}: ${lang} not aligned with en`);
    }
  }
  return issues;
}

function dump(nn) {
  const { prov, chapters } = load(nn);
  const out = [`# Audit dump ch${nn}: ${prov.title}`, ''];
  const issues = check(nn);
  out.push(
    '## Structural checks',
    '',
    issues.length ? issues.map(i => `- ${i}`).join('\n') : '- OK',
    ''
  );

  const anchors = new Set();
  out.push('## Segments', '');
  for (const sec of prov.provenance) {
    const s = findSection(chapters.en, sec.section_id);
    out.push(`### ${sec.section_id}: ${sec.section_title}`, '');
    if (!s) continue;
    for (const seg of sec.segments) {
      out.push(
        `#### P${seg.paragraphs.join(',')} [${seg.sources.join(', ')}]`,
        `_note: ${seg.note}_`,
        ''
      );
      for (const p of seg.paragraphs)
        out.push(`> P${p}: ${(s.content[p - 1] || {}).text || '(missing)'}`, '');
      seg.sources.filter(a => a !== 'synthesis').forEach(a => anchors.add(a));
    }
  }

  out.push('## Ra anchors (full text)', '');
  const sorted = [...anchors].sort((a, b) => {
    const [as, aq] = a.split('.').map(Number);
    const [bs, bq] = b.split('.').map(Number);
    return as - bs || aq - bq;
  });
  for (const a of sorted) out.push(`### ${a}`, '', raText(a) || '(not found in corpus)', '');
  return out.join('\n');
}

const args = process.argv.slice(2);
const target = args[0];
if (!target) {
  console.error('Usage: audit-provenance.cjs <NN|all> [--out file] [--check]');
  process.exit(1);
}
const chapters =
  target === 'all'
    ? Array.from({ length: 16 }, (_, i) => String(i + 1).padStart(2, '0'))
    : [target.padStart(2, '0')];

if (args.includes('--check')) {
  let total = 0;
  for (const nn of chapters) {
    const issues = check(nn);
    total += issues.length;
    console.log(`ch${nn}: ${issues.length ? issues.length + ' issue(s)' : 'OK'}`);
    issues.forEach(i => console.log(`  - ${i}`));
  }
  process.exit(total ? 1 : 0);
}

const outIdx = args.indexOf('--out');
for (const nn of chapters) {
  const text = dump(nn);
  if (outIdx > -1) {
    const file = chapters.length > 1 ? args[outIdx + 1].replace('NN', nn) : args[outIdx + 1];
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, text);
    console.log(`ch${nn} -> ${file}`);
  } else {
    console.log(text);
  }
}
