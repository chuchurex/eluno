#!/usr/bin/env node
/**
 * validate-alignment.js — Cross-language structural validation
 *
 * Validates that EN/ES/PT chapter files have identical structure:
 * same sections, same paragraph counts, same {term:} and {ref:} marks.
 *
 * Usage:
 *   node scripts/validate-alignment.js 02          # Validate chapter 2
 *   node scripts/validate-alignment.js all         # Validate all chapters
 *   node scripts/validate-alignment.js 01 02 03    # Validate specific chapters
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const I18N_DIR = path.join(__dirname, '../i18n');
const LANGUAGES = ['en', 'es', 'pt'];
const TRANSLATION_TERMS_PATH = path.join(I18N_DIR, 'translation-terms.json');
const TRANSLATION_TERMS = fs.existsSync(TRANSLATION_TERMS_PATH)
  ? JSON.parse(fs.readFileSync(TRANSLATION_TERMS_PATH, 'utf8')).terms || []
  : [];

// ─────────────────────────────────────────────────────────────
// Lookup tables
// ─────────────────────────────────────────────────────────────

const META = {
  es: {
    numberText: {
      1: 'Capítulo Uno',
      2: 'Capítulo Dos',
      3: 'Capítulo Tres',
      4: 'Capítulo Cuatro',
      5: 'Capítulo Cinco',
      6: 'Capítulo Seis',
      7: 'Capítulo Siete',
      8: 'Capítulo Ocho',
      9: 'Capítulo Nueve',
      10: 'Capítulo Diez',
      11: 'Capítulo Once',
      12: 'Capítulo Doce',
      13: 'Capítulo Trece',
      14: 'Capítulo Catorce',
      15: 'Capítulo Quince',
      16: 'Capítulo Dieciséis'
    },
    titles: {
      1: 'Cosmología y Génesis',
      2: 'El Creador y la Creación',
      3: 'Las Densidades de Conciencia',
      4: 'Historia Espiritual de la Tierra',
      5: 'Polaridad — Los Dos Caminos',
      6: 'Errantes — Los que Regresan',
      7: 'La Cosecha',
      8: 'El Velo del Olvido',
      9: 'La Muerte y el Viaje Entre Vidas',
      10: 'Los Centros de Energía',
      11: 'Catalizador y Experiencia',
      12: 'El Yo Superior y la Guía',
      13: 'El Libre Albedrío y la Ley de la Confusión',
      14: 'El Camino del Buscador',
      15: 'Equilibrio y Sanación',
      16: 'El Misterio Permanece'
    },
    forbidden: ['consciencia', 'Logoi'],
    label: 'ES'
  },
  pt: {
    numberText: {
      1: 'Capítulo Um',
      2: 'Capítulo Dois',
      3: 'Capítulo Três',
      4: 'Capítulo Quatro',
      5: 'Capítulo Cinco',
      6: 'Capítulo Seis',
      7: 'Capítulo Sete',
      8: 'Capítulo Oito',
      9: 'Capítulo Nove',
      10: 'Capítulo Dez',
      11: 'Capítulo Onze',
      12: 'Capítulo Doze',
      13: 'Capítulo Treze',
      14: 'Capítulo Catorze',
      15: 'Capítulo Quinze',
      16: 'Capítulo Dezesseis'
    },
    titles: {
      1: 'Cosmologia e Gênese',
      2: 'O Criador e a Criação',
      3: 'As Densidades de Consciência',
      4: 'História Espiritual da Terra',
      5: 'Polaridade — Os Dois Caminhos',
      6: 'Errantes — Os que Retornam',
      7: 'A Colheita',
      8: 'O Véu do Esquecimento',
      9: 'A Morte e a Jornada Entre Vidas',
      10: 'Os Centros de Energia',
      11: 'Catalisador e Experiência',
      12: 'O Eu Superior e a Orientação',
      13: 'O Livre Arbítrio e a Lei da Confusão',
      14: 'O Caminho do Buscador',
      15: 'Equilíbrio e Cura',
      16: 'O Mistério Permanece'
    },
    forbidden: ['Logoi'],
    label: 'PT'
  }
};

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function loadJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function extractMarks(chapter, pattern) {
  const text = JSON.stringify(chapter);
  return (text.match(pattern) || []).sort();
}

function pad(n) {
  return String(n).padStart(2, '0');
}

// ─────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────

function validateChapter(chapterNum) {
  const nn = pad(chapterNum);
  const enPath = path.join(I18N_DIR, 'en', 'chapters', `${nn}.json`);
  const en = loadJSON(enPath);

  if (!en) {
    console.log(`\n📖 Chapter ${chapterNum}: SKIP — EN file not found`);
    return { passed: true, skipped: true };
  }

  const num = en.number;
  let totalFails = 0;
  let totalWarns = 0;

  console.log(`\n📖 Chapter ${chapterNum}: ${en.title}`);

  // EN self-checks
  const enText = JSON.stringify(en);
  if (enText.includes('{src:')) {
    console.log(`   EN: FAIL ❌ {src:} residual found`);
    totalFails++;
  }

  for (const lang of ['es', 'pt']) {
    const filePath = path.join(I18N_DIR, lang, 'chapters', `${nn}.json`);
    const tr = loadJSON(filePath);
    const meta = META[lang];
    const label = meta.label;

    if (!tr) {
      console.log(`   ${label}: SKIP — file not found`);
      continue;
    }

    const fails = [];
    const warns = [];
    const trText = JSON.stringify(tr);

    // Section count
    if (en.sections.length !== tr.sections.length) {
      fails.push(`sections: ${en.sections.length} EN vs ${tr.sections.length} ${label}`);
    }

    // Per-section checks
    for (let i = 0; i < en.sections.length; i++) {
      const sEn = en.sections[i];
      const sTr = tr.sections[i];
      if (!sTr) {
        fails.push(`missing section ${i}`);
        continue;
      }
      if (sEn.id !== sTr.id) fails.push(`section id: ${sEn.id} vs ${sTr.id}`);
      if (sEn.content.length !== sTr.content.length) {
        fails.push(
          `blocks in ${sEn.id}: ${sEn.content.length} EN vs ${sTr.content.length} ${label}`
        );
      }
      for (let j = 0; j < Math.min(sEn.content.length, sTr.content?.length || 0); j++) {
        if (sEn.content[j].type !== sTr.content[j]?.type) {
          fails.push(
            `type in ${sEn.id}[${j}]: ${sEn.content[j].type} vs ${sTr.content[j]?.type || 'missing'}`
          );
        }
      }
    }

    // Metadata: numberText
    const expectedNt = meta.numberText[num];
    if (expectedNt && tr.numberText !== expectedNt) {
      fails.push(`numberText: "${tr.numberText}" should be "${expectedNt}"`);
    }

    // Metadata: title
    const expectedTitle = meta.titles[num];
    if (expectedTitle && tr.title !== expectedTitle) {
      fails.push(`title: "${tr.title}" should be "${expectedTitle}"`);
    }

    // Title not still in English
    if (tr.title === en.title) {
      fails.push(`title still in English: "${tr.title}"`);
    }

    // {term:} marks match (translation-only terms are allowed in ES/PT but not EN)
    const enTerms = extractMarks(en, /\{term:[^}]+\}/g);
    const trTermsRaw = extractMarks(tr, /\{term:[^}]+\}/g);
    const isTranslationTerm = m => TRANSLATION_TERMS.some(t => m === `{term:${t}}`);
    const trTerms = trTermsRaw.filter(t => !isTranslationTerm(t));
    if (JSON.stringify(enTerms) !== JSON.stringify(trTerms)) {
      const enSet = new Set(enTerms);
      const trSet = new Set(trTerms);
      const phantom = [...trSet].filter(t => !enSet.has(t));
      const missing = [...enSet].filter(t => !trSet.has(t));
      if (phantom.length) warns.push(`phantom {term:} in ${label}: ${phantom.join(', ')}`);
      if (missing.length) warns.push(`missing {term:} in ${label}: ${missing.join(', ')}`);
      if (!phantom.length && !missing.length) {
        warns.push(`{term:} count mismatch: EN ${enTerms.length} vs ${label} ${trTerms.length}`);
      }
    }

    // {ref:} marks match
    const enRefs = extractMarks(en, /\{ref:[^}]+\}/g);
    const trRefs = extractMarks(tr, /\{ref:[^}]+\}/g);
    if (JSON.stringify(enRefs) !== JSON.stringify(trRefs)) {
      warns.push(`{ref:} mismatch: EN ${enRefs.length} vs ${label} ${trRefs.length}`);
    }

    // No {src:} residuals
    if (trText.includes('{src:')) {
      fails.push('{src:} residual found');
    }

    // Forbidden strings
    for (const f of meta.forbidden) {
      if (trText.toLowerCase().includes(f.toLowerCase())) {
        fails.push(`forbidden string: "${f}"`);
      }
    }

    // Report
    if (fails.length === 0 && warns.length === 0) {
      console.log(`   ${label}: PASS ✅`);
    } else {
      for (const f of fails) console.log(`   ${label}: FAIL ❌ ${f}`);
      for (const w of warns) console.log(`   ${label}: WARN ⚠️  ${w}`);
    }

    totalFails += fails.length;
    totalWarns += warns.length;
  }

  return { passed: totalFails === 0, warns: totalWarns };
}

// ─────────────────────────────────────────────────────────────
// Exports for testing
// ─────────────────────────────────────────────────────────────

export { extractMarks, validateChapter, META };

// ─────────────────────────────────────────────────────────────
// CLI (only when run directly)
// ─────────────────────────────────────────────────────────────

const isMainModule =
  process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (!isMainModule) {
  // Imported as module — skip CLI execution
} else {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node scripts/validate-alignment.js <chapter|all>');
    console.log('  node scripts/validate-alignment.js 02');
    console.log('  node scripts/validate-alignment.js all');
    console.log('  node scripts/validate-alignment.js 01 02 03');
    process.exit(0);
  }

  console.log('═══════════════════════════════════════════');
  console.log(' Cross-language alignment validation');
  console.log('═══════════════════════════════════════════');

  let chapters;
  if (args.includes('all')) {
    chapters = Array.from({ length: 16 }, (_, i) => i + 1);
  } else {
    chapters = args.map(a => parseInt(a, 10)).filter(n => !isNaN(n));
  }

  let allPassed = true;
  let totalWarns = 0;

  for (const ch of chapters) {
    const result = validateChapter(ch);
    if (!result.passed) allPassed = false;
    if (result.warns) totalWarns += result.warns;
  }

  console.log('\n═══════════════════════════════════════════');
  if (!allPassed) {
    console.log('❌ Alignment validation FAILED');
    process.exit(1);
  } else if (totalWarns > 0) {
    console.log(`✅ Aligned with ${totalWarns} warning(s)`);
  } else {
    console.log('✅ All chapters aligned!');
  }
} // end isMainModule
