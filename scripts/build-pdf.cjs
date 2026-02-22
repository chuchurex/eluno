#!/usr/bin/env node

/**
 * PDF Generation Script for eluno.org
 *
 * Generates PDF files from chapter JSON content using Puppeteer.
 * Features:
 *   - Header with site name and book title
 *   - Chapter structure matching HTML output
 *   - Glossary terms rendered as footnotes at page bottom
 *   - Letter size (carta) format
 *   - Support for EN, ES, PT languages
 *
 * Usage:
 *   node scripts/build-pdf.js <chapter-number> [language]
 *   node scripts/build-pdf.js 01           # Generates EN, ES, PT
 *   node scripts/build-pdf.js 01 es        # Generates only ES
 *   node scripts/build-pdf.js all          # Generates all chapters
 *   node scripts/build-pdf.js complete     # Generates complete book PDF for all langs
 *
 * Output:
 *   dist/pdf/en/ch01.pdf
 *   dist/pdf/es/ch01.pdf
 *   dist/pdf/pt/ch01.pdf
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// ============================================================================
// CONFIGURATION
// ============================================================================

const LANGUAGES = ['en', 'es', 'pt'];
const BASE_LANG = 'en';
const PROJECT_ROOT = process.cwd();
const I18N_DIR = path.join(PROJECT_ROOT, 'i18n');
const DIST_DIR = path.join(PROJECT_ROOT, 'dist');
const PDF_DIR = path.join(DIST_DIR, 'pdf');

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function loadJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.warn(`Warning: Could not load ${filePath}`);
    return null;
  }
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadProvenance(chapterNum) {
  const chNum = String(chapterNum).padStart(2, '0');
  const filePath = path.join(I18N_DIR, 'provenance', `ch${chNum}_provenance.json`);
  return loadJSON(filePath);
}

const PDF_LABELS = {
  en: {
    glossary: 'Glossary',
    sources: 'Sources',
    crossRefs: 'Cross-References',
    raSources: 'Ra Material Sources',
    paragraphs: 'Paragraphs',
    paragraph: 'Paragraph',
    session: 'Session',
  },
  es: {
    glossary: 'Glosario',
    sources: 'Fuentes',
    crossRefs: 'Referencias Cruzadas',
    raSources: 'Fuentes del Material Ra',
    paragraphs: 'Párrafos',
    paragraph: 'Párrafo',
    session: 'Sesión',
  },
  pt: {
    glossary: 'Glossário',
    sources: 'Fontes',
    crossRefs: 'Referências Cruzadas',
    raSources: 'Fontes do Material Ra',
    paragraphs: 'Parágrafos',
    paragraph: 'Parágrafo',
    session: 'Sessão',
  },
};

const TAGLINE = {
  en: 'A philosophical reinterpretation of The Ra Material, The Law of One, as an accessible narrative. It explores cosmology, the Creator, the densities, and the purpose of existence.',
  es: 'Una reinterpretación filosófica del Material Ra, La Ley del Uno, como narrativa accesible. Explora la cosmología, el Creador, las densidades y el propósito de la existencia.',
  pt: 'Uma reinterpretação filosófica do Material Ra, A Lei do Um, como narrativa acessível. Explora a cosmologia, o Criador, as densidades e o propósito da existência.',
};

const OUTRO = {
  en: 'This work is a philosophical interpretation of The Ra Material, originally published by L/L Research. Original sessions available free at llresearch.org',
  es: 'Este trabajo es una interpretación filosófica del Material Ra, publicado originalmente por L/L Research. Sesiones originales disponibles en llresearch.org',
  pt: 'Este trabalho é uma interpretação filosófica do Material Ra, publicado originalmente por L/L Research. Sessões originais disponíveis em llresearch.org',
};

// ============================================================================
// TEXT PROCESSING WITH FOOTNOTES
// ============================================================================

/**
 * Process text and collect footnotes for glossary terms and references
 * @param {string} text - Source text with {term:} and {ref:} markers
 * @param {object} glossary - Glossary entries
 * @param {object} references - References entries
 * @param {Map} collectedFootnotes - Footnotes map (mutated)
 * @param {Array} collectedRefs - Refs array (mutated), or null to strip refs
 * @param {object} opts - { chapterNum, isBook } for numbering
 * Returns processed HTML string
 */
function processTextWithFootnotes(text, glossary, references, collectedFootnotes, collectedRefs, opts) {
  const chapterNum = opts && opts.chapterNum || null;
  const isBook = opts && opts.isBook || false;

  // Replace optional preceding article + {term:id} or {term:id|text} with superscript number
  const articleRe = /(?:\b(el|la|los|las|del|al|the|o|a|os|as|do|da|dos|das)\s+)?\{term:([^}|]+)(?:\|([^}]+))?\}/gi;

  let processed = text.replace(articleRe, (match, precedingArt, termId, customText) => {
    const term = glossary[termId];
    if (!term) return (precedingArt ? precedingArt + ' ' : '') + (customText || termId);

    const displayText = customText || term.title.replace(/\s*\([^)]+\)\s*/g, '').trim();

    if (!collectedFootnotes.has(termId)) {
      collectedFootnotes.set(termId, { ...term, type: 'term' });
    }

    const localIndex = Array.from(collectedFootnotes.keys()).indexOf(termId) + 1;
    const footnoteLabel = isBook && chapterNum ? `${chapterNum}.${localIndex}` : String(localIndex);
    const makeSpan = (title) => `<span class="term">${title}<sup class="fn-ref">${footnoteLabel}</sup></span>`;

    if (!precedingArt) return makeSpan(displayText);

    const al = precedingArt.toLowerCase();
    const titleWords = displayText.split(/\s+/);
    const firstWord = titleWords[0].toLowerCase();
    const stripped = titleWords.slice(1).join(' ');

    if (al === firstWord) return makeSpan(displayText);
    if ((al === 'del' || al === 'al') && firstWord === 'el')
      return precedingArt + ' ' + makeSpan(stripped);
    if (al === 'do' && firstWord === 'os') return 'dos ' + makeSpan(stripped);
    if (al === 'do' && firstWord === 'as') return 'das ' + makeSpan(stripped);
    if (al === 'da' && firstWord === 'a') return 'da ' + makeSpan(stripped);
    if (['do', 'da', 'dos', 'das'].includes(al) && ['o', 'a', 'os', 'as'].includes(firstWord))
      return precedingArt + ' ' + makeSpan(stripped);

    return precedingArt + ' ' + makeSpan(displayText);
  });

  // Fix trailing duplicates: "<span>Véu do Esquecimento...</span> do esquecimento"
  processed = processed.replace(/(<\/span>)\s+((?:del|do|da|of|dos|das)\s+\w+)(?=[\s.,;:!?]|$)/gi, (match, closeTag, trailing) => {
    const spanMatch = match.match(/>([^<]+)<\/span>/);
    if (!spanMatch) return match;
    const spanText = spanMatch[1].replace(/<[^>]+>/g, '');
    if (spanText.toLowerCase().endsWith(trailing.toLowerCase())) return closeTag;
    return match;
  });

  // Handle {ref:id} — replace with superscript letter or strip if no collectedRefs
  const REF_LETTERS = 'abcdefghijklmnopqrstuvwxyz';
  const SUPERSCRIPT_LETTERS = { a:'ᵃ', b:'ᵇ', c:'ᶜ', d:'ᵈ', e:'ᵉ', f:'ᶠ', g:'ᵍ', h:'ʰ', i:'ⁱ', j:'ʲ', k:'ᵏ', l:'ˡ', m:'ᵐ', n:'ⁿ', o:'ᵒ', p:'ᵖ', q:'q', r:'ʳ', s:'ˢ', t:'ᵗ', u:'ᵘ', v:'ᵛ', w:'ʷ', x:'ˣ', y:'ʸ', z:'ᶻ' };

  processed = processed.replace(/\{ref:([^}]+)\}/g, (match, refId) => {
    if (!collectedRefs || !references) return '';

    const ref = references[refId];
    if (!ref) return ''; // missing ref entry — strip silently

    // Avoid duplicates
    const existing = collectedRefs.findIndex(r => r.id === refId);
    let idx = existing >= 0 ? existing : collectedRefs.length;
    if (existing < 0) {
      collectedRefs.push({ id: refId, ...ref });
    }

    const letter = REF_LETTERS[idx] || String(idx + 1);
    const sup = SUPERSCRIPT_LETTERS[letter] || `(${letter})`;
    return `<sup class="ref-marker">${sup}</sup>`;
  });

  // Replace **text** with <strong>
  let html = processed.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Replace *text* with <em>
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  return html;
}

// ============================================================================
// RENDER HELPERS — Glossary & Sources
// ============================================================================

/**
 * Render glossary footnotes HTML for a chapter.
 * @param {Map} footnotes - collected footnotes map
 * @param {string} lang - language code
 * @param {number|null} chapterNum - chapter number (for book numbering)
 * @param {boolean} isBook - true if rendering inside complete book
 */
function renderGlossaryHtml(footnotes, lang, chapterNum, isBook) {
  const labels = PDF_LABELS[lang] || PDF_LABELS.en;
  const entries = Array.from(footnotes.entries()).filter(([, item]) => item.type !== 'ref');
  if (entries.length === 0) return '';

  const items = entries.map(([, item], index) => {
    const num = isBook && chapterNum ? `${chapterNum}.${index + 1}` : String(index + 1);
    const content = item.content.map(p =>
      p.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    ).join(' ');
    return `<div class="footnote"><sup>${num}</sup> <strong>${item.title}:</strong> ${content}</div>`;
  }).join('\n');

  return `
    <div class="footnotes">
      <div class="footnotes-title">${labels.glossary}</div>
      ${items}
    </div>
  `;
}

/**
 * Render sources HTML — cross-references + Ra Material provenance.
 * @param {Array} collectedRefs - collected inline references
 * @param {object|null} provenance - provenance data for this chapter
 * @param {string} lang - language code
 */
function renderSourcesHtml(collectedRefs, provenance, lang) {
  const labels = PDF_LABELS[lang] || PDF_LABELS.en;
  const REF_LETTERS = 'abcdefghijklmnopqrstuvwxyz';
  const SUPERSCRIPT_LETTERS = { a:'ᵃ', b:'ᵇ', c:'ᶜ', d:'ᵈ', e:'ᵉ', f:'ᶠ', g:'ᵍ', h:'ʰ', i:'ⁱ', j:'ʲ', k:'ᵏ', l:'ˡ', m:'ᵐ', n:'ⁿ', o:'ᵒ', p:'ᵖ', q:'q', r:'ʳ', s:'ˢ', t:'ᵗ', u:'ᵘ', v:'ᵛ', w:'ʷ', x:'ˣ', y:'ʸ', z:'ᶻ' };

  const hasRefs = collectedRefs && collectedRefs.length > 0;
  const hasProv = provenance && provenance.provenance && provenance.provenance.length > 0;
  if (!hasRefs && !hasProv) return '';

  let html = '<div class="sources">';
  html += `<div class="sources-title">${labels.sources}</div>`;

  // Cross-references
  if (hasRefs) {
    html += `<div class="sources-subtitle">${labels.crossRefs}</div>`;
    collectedRefs.forEach((ref, idx) => {
      const letter = REF_LETTERS[idx] || String(idx + 1);
      const sup = SUPERSCRIPT_LETTERS[letter] || `(${letter})`;
      html += `<div class="source-item">`;
      html += `<span class="ref-marker">${sup}</span> <strong>${ref.title}</strong>`;
      if (ref.summary) html += ` — ${ref.summary}`;
      if (ref.learnMore) html += `<br><span class="source-url">${ref.learnMore}</span>`;
      html += `</div>`;
    });
  }

  // Ra Material provenance
  if (hasProv) {
    html += `<div class="sources-subtitle">${labels.raSources}</div>`;
    provenance.provenance.forEach(section => {
      html += `<div class="provenance-section">`;
      html += `<div class="provenance-section-title">§ ${section.section_title}</div>`;
      section.segments.forEach(seg => {
        if (!seg.sources || seg.sources.length === 0) return;
        const pLabel = seg.paragraphs.length === 1
          ? `${labels.paragraph} ${seg.paragraphs[0]}`
          : `${labels.paragraphs} ${seg.paragraphs[0]}-${seg.paragraphs[seg.paragraphs.length - 1]}`;
        const sessionsHtml = seg.sources.map((src, i) => {
          const url = seg.urls && seg.urls[i] ? seg.urls[i] : '';
          return url
            ? `${labels.session} ${src} — <span class="source-url">${url}</span>`
            : `${labels.session} ${src}`;
        }).join('; ');
        html += `<div class="provenance-segment">${pLabel} → ${sessionsHtml}</div>`;
      });
      html += `</div>`;
    });
  }

  html += '</div>';
  return html;
}

// ============================================================================
// HTML TEMPLATE GENERATION
// ============================================================================

function generatePdfHtml(chapter, glossary, references, lang, ui, provenance) {
  const collectedFootnotes = new Map();
  const collectedRefs = [];
  const chapterNum = chapter.number || parseInt(String(chapter.numberText || '').replace(/\D/g, '')) || null;

  // Process all sections and collect footnotes
  const sectionsHtml = chapter.sections.map((section, index) => {
    const contentHtml = section.content.map(block => {
      if (block.type === 'separator') {
        return '<div class="divider">· · ·</div>';
      }
      const processedText = processTextWithFootnotes(
        block.text, glossary, references, collectedFootnotes, collectedRefs,
        { chapterNum, isBook: false }
      );
      if (block.type === 'paragraph') {
        return `<p>${processedText}</p>`;
      } else if (block.type === 'quote') {
        return `<div class="quote">${processedText}</div>`;
      }
      return '';
    }).join('\n');

    return `
      <section class="section">
        <h2>${section.title}</h2>
        ${contentHtml}
      </section>
      ${index < chapter.sections.length - 1 ? '<div class="divider">· · ·</div>' : ''}
    `;
  }).join('\n');

  const glossaryHtml = renderGlossaryHtml(collectedFootnotes, lang, chapterNum, false);
  const sourcesHtml = renderSourcesHtml(collectedRefs, provenance, lang);

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Spectral:ital,wght@0,300;0,400;0,500;1,400&display=swap');

    :root {
      --font-heading: 'Cormorant Garamond', Georgia, serif;
      --font-body: 'Spectral', Georgia, serif;
      --gold: #c9a227;
      --text: #1a1a1a;
      --muted: #666;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: var(--font-body);
      font-size: 11pt;
      line-height: 1.7;
      color: var(--text);
      padding: 0;
    }

    .cover-page { min-height: 85vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; page-break-after: always; }
    .cover-title { font-family: var(--font-heading); font-size: 36pt; color: var(--gold); margin-bottom: 1.5rem; }
    .cover-tagline { font-family: var(--font-body); font-size: 11pt; color: var(--muted); max-width: 80%; line-height: 1.6; font-style: italic; }
    .cover-divider { color: var(--gold); font-size: 14pt; margin: 2rem 0; letter-spacing: 0.5em; }
    .cover-chapter-num { font-family: var(--font-heading); font-size: 12pt; color: var(--muted); text-transform: uppercase; letter-spacing: 0.15em; }
    .cover-chapter-title { font-family: var(--font-heading); font-size: 24pt; font-weight: 600; }

    .chapter-header { text-align: center; margin-bottom: 2.5rem; page-break-after: avoid; }
    .chapter-num { font-family: var(--font-heading); font-size: 12pt; color: var(--muted); text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 0.5rem; }
    .chapter-title { font-family: var(--font-heading); font-size: 24pt; font-weight: 600; color: var(--text); line-height: 1.2; }

    .section { margin-bottom: 2rem; page-break-inside: avoid; }
    .section h2 { font-family: var(--font-heading); font-size: 14pt; font-weight: 600; color: var(--text); margin-bottom: 1rem; page-break-after: avoid; }
    .section p { margin-bottom: 1rem; text-align: justify; text-indent: 1.5em; }
    .section p:first-of-type { text-indent: 0; }

    .quote { margin: 1.5rem 2rem; padding: 1rem 1.5rem; border-left: 3px solid var(--gold); font-style: italic; color: var(--muted); background: #fafafa; }
    .divider { text-align: center; color: var(--gold); font-size: 14pt; margin: 2rem 0; letter-spacing: 0.5em; }

    .term { }
    .fn-ref { font-size: 8pt; color: var(--gold); margin-left: 1px; }
    .ref-marker { font-size: 9pt; color: var(--gold); margin-left: 1px; }

    .footnotes { margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #ddd; }
    .footnotes-title { font-family: var(--font-heading); font-size: 11pt; font-weight: 600; color: var(--muted); margin-bottom: 0.75rem; }
    .footnote { font-size: 9pt; line-height: 1.5; margin-bottom: 0.5rem; color: var(--muted); }
    .footnote sup { color: var(--gold); font-weight: 600; margin-right: 0.25rem; }

    /* Sources section */
    .sources { margin-top: 2.5rem; padding-top: 1rem; border-top: 1px solid #ddd; }
    .sources-title { font-family: var(--font-heading); font-size: 11pt; font-weight: 600; color: var(--muted); margin-bottom: 0.75rem; }
    .sources-subtitle { font-family: var(--font-heading); font-size: 10pt; font-weight: 600; color: var(--text); margin: 1rem 0 0.5rem 0; }
    .source-item { font-size: 8.5pt; line-height: 1.5; margin-bottom: 0.5rem; color: var(--muted); }
    .source-url { color: var(--gold); word-break: break-all; font-size: 8pt; }
    .provenance-section { margin-bottom: 0.75rem; }
    .provenance-section-title { font-size: 9pt; font-weight: 600; color: var(--text); margin-bottom: 0.25rem; }
    .provenance-segment { font-size: 8pt; line-height: 1.4; margin-left: 1em; color: var(--muted); margin-bottom: 0.15rem; }

    .outro { margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid #ddd; text-align: center; }
    .outro-divider { color: var(--gold); font-size: 14pt; letter-spacing: 0.5em; margin-bottom: 1.5rem; }
    .outro-text { font-size: 9pt; color: var(--muted); font-style: italic; line-height: 1.6; max-width: 80%; margin: 0 auto; }

    h2 { page-break-after: avoid; }
  </style>
</head>
<body>
  <div class="cover-page">
    <div class="cover-title">${ui.bookTitle}</div>
    <div class="cover-tagline">${TAGLINE[lang]}</div>
    <div class="cover-divider">· · ·</div>
    <div class="cover-chapter-num">${chapter.numberText}</div>
    <div class="cover-chapter-title">${chapter.title}</div>
  </div>

  <article>
    ${sectionsHtml}
  </article>

  ${glossaryHtml}
  ${sourcesHtml}

  <div class="outro">
    <div class="outro-divider">· · ·</div>
    <p class="outro-text">${OUTRO[lang]}</p>
  </div>
</body>
</html>`;
}

// ============================================================================
// PDF GENERATION
// ============================================================================

async function generatePdf(chapter, glossary, references, lang, ui, outputPath, provenance) {
  const html = generatePdfHtml(chapter, glossary, references, lang, ui, provenance);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    await page.pdf({
      path: outputPath,
      format: 'Letter', // Carta size
      margin: {
        top: '1in',
        bottom: '1in',
        left: '1in',
        right: '1in'
      },
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `
        <div style="width:100%;text-align:center;font-size:9pt;font-family:Georgia,serif;color:#999;">
          <span class="pageNumber"></span>
        </div>
      `
    });

    console.log(`   ✅ ${outputPath}`);
  } finally {
    await browser.close();
  }
}

// ============================================================================
// MAIN BUILD FUNCTION
// ============================================================================

function loadUI(lang) {
  const uiPath = path.join(I18N_DIR, lang, 'ui.json');
  const ui = loadJSON(uiPath);
  if (!ui) {
      // Fallback to English if not found, but we expect it to exist
      return loadJSON(path.join(I18N_DIR, BASE_LANG, 'ui.json')) || {};
  }
  return ui;
}

async function buildPdf(chapterNum, targetLang = null) {
  const chNum = String(chapterNum).padStart(2, '0');
  const langs = targetLang ? [targetLang] : LANGUAGES;

  console.log(`\n📄 Generating PDFs for Chapter ${chNum}...\n`);

  for (const lang of langs) {
    // Ensure output directory exists
    const langPdfDir = path.join(PDF_DIR, lang);
    ensureDir(langPdfDir);

    // Load UI strings
    const ui = loadUI(lang);

    // Load chapter
    const chapterPath = path.join(I18N_DIR, lang, 'chapters', `${chNum}.json`);
    const chapter = loadJSON(chapterPath);

    if (!chapter) {
      console.log(`   ⚠️  Skipping ${lang.toUpperCase()} - chapter not found`);
      continue;
    }

    // Load glossary
    const glossaryPath = path.join(I18N_DIR, lang, 'glossary.json');
    let glossary = loadJSON(glossaryPath);
    if (!glossary) {
      glossary = loadJSON(path.join(I18N_DIR, BASE_LANG, 'glossary.json')) || {};
    }

    // Load references
    const referencesPath = path.join(I18N_DIR, lang, 'references.json');
    let references = loadJSON(referencesPath);
    if (!references) {
      references = loadJSON(path.join(I18N_DIR, BASE_LANG, 'references.json')) || {};
    }

    // Load provenance
    const provenance = loadProvenance(chapterNum);

    // Generate PDF
    const outputPath = path.join(langPdfDir, `ch${chNum}.pdf`);
    await generatePdf(chapter, glossary, references, lang, ui, outputPath, provenance);
  }
}

async function buildAllPdfs(targetLang = null) {
  console.log('\n📚 Generating all PDFs...\n');

  // Get all chapter files
  const chaptersDir = path.join(I18N_DIR, BASE_LANG, 'chapters');
  const chapterFiles = fs.readdirSync(chaptersDir)
    .filter(f => f.endsWith('.json'))
    .sort();

  for (const file of chapterFiles) {
    const chNum = file.replace('.json', '');
    await buildPdf(chNum, targetLang);
  }

  console.log('\n✨ All PDFs generated!\n');
}

async function buildCompleteBookPdf(targetLang = null) {
  const langs = targetLang ? [targetLang] : LANGUAGES;
  console.log(`\n📚 Generating Complete Book PDF...\n`);

  for (const lang of langs) {
    const langPdfDir = path.join(PDF_DIR, lang);
    ensureDir(langPdfDir);

    const ui = loadUI(lang);

    // Load all chapters
    const chaptersDir = path.join(I18N_DIR, lang, 'chapters');
    if (!fs.existsSync(chaptersDir)) {
      console.log(`   ⚠️  Skipping ${lang.toUpperCase()} - chapters directory not found`);
      continue;
    }

    const chapterFiles = fs.readdirSync(chaptersDir)
      .filter(f => f.endsWith('.json'))
      .sort();

    const chapters = chapterFiles.map(f => loadJSON(path.join(chaptersDir, f))).filter(Boolean);

    if (chapters.length === 0) {
      console.log(`   ⚠️  Skipping ${lang.toUpperCase()} - no chapters found`);
      continue;
    }

    // Load glossary
    const glossaryPath = path.join(I18N_DIR, lang, 'glossary.json');
    let glossary = loadJSON(glossaryPath);
    if (!glossary) {
      glossary = loadJSON(path.join(I18N_DIR, BASE_LANG, 'glossary.json')) || {};
    }

    // Load references
    const referencesPath = path.join(I18N_DIR, lang, 'references.json');
    let references = loadJSON(referencesPath);
    if (!references) {
      references = loadJSON(path.join(I18N_DIR, BASE_LANG, 'references.json')) || {};
    }

    // Compile sections from all chapters — each chapter gets its own glossary + sources
    const chaptersHtml = chapters.map((chapter, chIdx) => {
      const chapterNum = chapter.number || (chIdx + 1);
      const collectedFootnotes = new Map();
      const collectedRefs = [];
      const provenance = loadProvenance(chapterNum);

      const sectionsHtml = chapter.sections.map((section) => {
        const contentHtml = section.content.map(block => {
          if (block.type === 'separator') {
            return '<div class="divider">· · ·</div>';
          }
          const processedText = processTextWithFootnotes(
            block.text, glossary, references, collectedFootnotes, collectedRefs,
            { chapterNum, isBook: true }
          );
          if (block.type === 'paragraph') {
            return `<p>${processedText}</p>`;
          } else if (block.type === 'quote') {
            return `<div class="quote">${processedText}</div>`;
          }
          return '';
        }).join('\n');

        return `
          <section class="section">
            <h2>${section.title}</h2>
            ${contentHtml}
          </section>
        `;
      }).join('\n');

      const chGlossaryHtml = renderGlossaryHtml(collectedFootnotes, lang, chapterNum, true);
      const chSourcesHtml = renderSourcesHtml(collectedRefs, provenance, lang);

      return `
        <div class="chapter-wrapper" style="page-break-before: always;">
          <header class="chapter-header">
            <div class="chapter-num">${chapter.numberText}</div>
            <h1 class="chapter-title">${chapter.title}</h1>
          </header>
          ${sectionsHtml}
          ${chGlossaryHtml}
          ${chSourcesHtml}
        </div>
      `;
    }).join('\n');

    const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Spectral:ital,wght@0,300;0,400;0,500;1,400&display=swap');

    :root {
      --font-heading: 'Cormorant Garamond', Georgia, serif;
      --font-body: 'Spectral', Georgia, serif;
      --gold: #c9a227;
      --text: #1a1a1a;
      --muted: #666;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: var(--font-body); font-size: 11pt; line-height: 1.7; color: var(--text); }
    .cover-page { min-height: 85vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; page-break-after: always; }
    .cover-title { font-family: var(--font-heading); font-size: 48pt; color: var(--gold); margin-bottom: 1.5rem; }
    .cover-tagline { font-family: var(--font-body); font-size: 12pt; color: var(--muted); max-width: 80%; line-height: 1.6; font-style: italic; }
    .chapter-header { text-align: center; margin-bottom: 2.5rem; }
    .chapter-num { font-family: var(--font-heading); font-size: 12pt; color: var(--muted); text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 0.5rem; }
    .chapter-title { font-family: var(--font-heading); font-size: 24pt; font-weight: 600; color: var(--text); line-height: 1.2; }
    .outro { margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid #ddd; text-align: center; }
    .outro-divider { color: var(--gold); font-size: 14pt; letter-spacing: 0.5em; margin-bottom: 1.5rem; }
    .outro-text { font-size: 9pt; color: var(--muted); font-style: italic; line-height: 1.6; max-width: 80%; margin: 0 auto; }
    .section { margin-bottom: 2rem; page-break-inside: avoid; }
    .section h2 { font-family: var(--font-heading); font-size: 14pt; font-weight: 600; color: var(--text); margin-bottom: 1rem; page-break-after: avoid; }
    .section p { margin-bottom: 1rem; text-align: justify; text-indent: 1.5em; }
    .section p:first-of-type { text-indent: 0; }
    .quote { margin: 1.5rem 2rem; padding: 1rem 1.5rem; border-left: 3px solid var(--gold); font-style: italic; color: var(--muted); background: #fafafa; }
    .divider { text-align: center; color: var(--gold); font-size: 14pt; margin: 2rem 0; letter-spacing: 0.5em; }
    .term { }
    .fn-ref { font-size: 8pt; color: var(--gold); margin-left: 1px; }
    .ref-marker { font-size: 9pt; color: var(--gold); margin-left: 1px; }
    .footnotes { margin-top: 2.5rem; padding-top: 1rem; border-top: 1px solid #ddd; }
    .footnotes-title { font-family: var(--font-heading); font-size: 11pt; font-weight: 600; color: var(--muted); margin-bottom: 0.75rem; }
    .footnote { font-size: 9pt; line-height: 1.5; margin-bottom: 0.5rem; color: var(--muted); }
    .footnote sup { color: var(--gold); font-weight: 600; margin-right: 0.25rem; }
    .sources { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #ddd; }
    .sources-title { font-family: var(--font-heading); font-size: 11pt; font-weight: 600; color: var(--muted); margin-bottom: 0.75rem; }
    .sources-subtitle { font-family: var(--font-heading); font-size: 10pt; font-weight: 600; color: var(--text); margin: 1rem 0 0.5rem 0; }
    .source-item { font-size: 8.5pt; line-height: 1.5; margin-bottom: 0.5rem; color: var(--muted); }
    .source-url { color: var(--gold); word-break: break-all; font-size: 8pt; }
    .provenance-section { margin-bottom: 0.75rem; }
    .provenance-section-title { font-size: 9pt; font-weight: 600; color: var(--text); margin-bottom: 0.25rem; }
    .provenance-segment { font-size: 8pt; line-height: 1.4; margin-left: 1em; color: var(--muted); margin-bottom: 0.15rem; }
  </style>
</head>
<body>
  <div class="cover-page">
    <div class="cover-title">${ui.bookTitle}</div>
    <div class="cover-tagline">${TAGLINE[lang]}</div>
  </div>
  ${chaptersHtml}
  <div class="outro" style="page-break-before: always; min-height: 40vh; display: flex; flex-direction: column; justify-content: center;">
    <div class="outro-divider">· · ·</div>
    <p class="outro-text">${OUTRO[lang]}</p>
  </div>
</body>
</html>`;

    const outputPath = path.join(langPdfDir, `complete-book.pdf`);

    // Launch browser separately for complete book to handle potentially larger document
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      await page.pdf({
        path: outputPath,
        format: 'Letter',
        margin: { top: '1in', bottom: '1in', left: '1in', right: '1in' },
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: '<div></div>',
        footerTemplate: `
          <div style="width:100%;text-align:center;font-size:9pt;font-family:Georgia,serif;color:#999;">
            <span class="pageNumber"></span> / <span class="totalPages"></span>
          </div>
        `
      });

      console.log(`   ✅ ${outputPath}`);
    } finally {
      await browser.close();
    }
  }

  console.log('\n✨ Complete book PDFs generated!\n');
}

// ============================================================================
// CLI
// ============================================================================

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
📄 PDF Generation Script for eluno.org

Usage:
  node scripts/build-pdf.js <chapter-number> [language]
  node scripts/build-pdf.js all [language]
  node scripts/build-pdf.js complete [language]

Examples:
  node scripts/build-pdf.js 01           # Generate ch01 in EN, ES, PT
  node scripts/build-pdf.js 01 es        # Generate ch01 only in ES
  node scripts/build-pdf.js all          # Generate all chapters in all languages
  node scripts/build-pdf.js complete     # Generate complete book in all languages
  node scripts/build-pdf.js complete es  # Generate complete book only in ES
  node scripts/build-pdf.js all pt       # Generate all chapters only in PT

Output:
  dist/pdf/{lang}/ch{XX}.pdf
`);
    process.exit(0);
  }

  const chapterArg = args[0];
  const langArg = args[1] || null;

  // Validate language if provided
  if (langArg && !LANGUAGES.includes(langArg)) {
    console.error(`❌ Invalid language: ${langArg}. Use: ${LANGUAGES.join(', ')}`);
    process.exit(1);
  }

  if (chapterArg === 'all') {
    await buildAllPdfs(langArg);
  } else if (chapterArg === 'complete') {
    await buildCompleteBookPdf(langArg);
  } else {
    const chapterNum = parseInt(chapterArg);
    if (isNaN(chapterNum) || chapterNum < 1 || chapterNum > 99) {
      console.error('❌ Invalid chapter number. Use 1-99 or "all"');
      process.exit(1);
    }
    await buildPdf(chapterNum, langArg);
  }
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
