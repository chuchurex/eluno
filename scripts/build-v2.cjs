#!/usr/bin/env node
/**
 * Build Script v2 — eluno.org
 *
 * Generates static HTML from JSON chapters with:
 * - Glossary term resolution ({term:keyword})
 * - Reference resolution ({ref:category:id})
 * - Provenance injection (lawofone.info citations)
 * - Multi-language support (EN, ES, PT)
 *
 * Usage:
 *   node scripts/build-v2.js              # Build all languages
 *   node scripts/build-v2.js --lang es    # Build only Spanish
 *   node scripts/build-v2.js --chapter 1  # Build only chapter 1
 */

const fs = require('fs');
const path = require('path');

// ─────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────

const CONFIG = {
  languages: ['en', 'es'], // PT added later
  baseLang: 'en',
  inputDir: path.join(__dirname, '../i18n'),
  outputDir: path.join(__dirname, '../dist'),
  provenanceDir: path.join(__dirname, '../i18n/provenance'),

  // v2 beta: only build these chapters (add more as they're reviewed)
  enabledChapters: [1, 2, 3, 4, 5, 6, 7],

  // lawofone.info URL patterns by language
  // Note: ES uses subdomain (es.lawofone.info), PT not available (falls back to EN)
  lawOfOneUrls: {
    en: 'https://www.lawofone.info/s/',
    es: 'https://es.lawofone.info/s/',
    pt: 'https://www.lawofone.info/s/'
  },

  // Book titles by language
  bookTitles: {
    en: 'The One',
    es: 'El Uno',
    pt: 'O Um'
  },

  // UI strings
  ui: {
    en: {
      chapter: 'Chapter',
      sources: 'Sources',
      glossary: 'Glossary',
      previous: 'Previous',
      next: 'Next',
      home: 'Home',
      downloadPdf: 'Download PDF',
      listenAudio: 'Listen'
    },
    es: {
      chapter: 'Capítulo',
      sources: 'Fuentes',
      glossary: 'Glosario',
      previous: 'Anterior',
      next: 'Siguiente',
      home: 'Inicio',
      downloadPdf: 'Descargar PDF',
      listenAudio: 'Escuchar'
    }
  }
};

// ─────────────────────────────────────────────────────────────
// Markup Parser
// ─────────────────────────────────────────────────────────────

/**
 * Parse {term:keyword} markup
 * Returns HTML with tooltip span
 */
function parseTerms(text, glossary) {
  return text.replace(/\{term:([a-z0-9-]+)\}/gi, (match, keyword) => {
    const term = glossary[keyword];
    if (!term) {
      console.warn(`  ⚠ Term not found in glossary: ${keyword}`);
      return match; // Leave as-is if not found
    }
    const definition = Array.isArray(term.content) ? term.content[0] : term.content;
    const escapedDef = definition.replace(/"/g, '&quot;');
    return `<span class="term" data-term="${keyword}" data-definition="${escapedDef}" tabindex="0">${term.title}</span>`;
  });
}

/**
 * Parse {ref:category:id} markup
 * Returns HTML with reference indicator
 */
function parseRefs(text, references) {
  return text.replace(/\{ref:([a-z]+):([a-z0-9-]+)\}/gi, (match, category, id) => {
    const refKey = `${category}:${id}`;
    // For now, just create a subtle indicator
    // Full implementation would look up references.json
    return `<span class="ref" data-ref="${refKey}"></span>`;
  });
}

/**
 * Generate slug from title
 */
function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// ─────────────────────────────────────────────────────────────
// Provenance System
// ─────────────────────────────────────────────────────────────

/**
 * Load provenance data for a chapter
 */
function loadProvenance(chapterNum) {
  const padded = String(chapterNum).padStart(2, '0');
  const filePath = path.join(CONFIG.provenanceDir, `ch${padded}_provenance.json`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

/**
 * Generate provenance HTML for a section
 */
function renderProvenanceLinks(sectionId, provenance, lang) {
  if (!provenance) return '';

  const section = provenance.provenance.find(p => p.section_id === sectionId);
  if (!section || !section.segments || section.segments.length === 0) return '';

  // Collect all unique sources from all segments
  const allSources = new Set();
  section.segments.forEach(seg => {
    seg.sources.forEach(src => allSources.add(src));
  });

  if (allSources.size === 0) return '';

  const baseUrl = CONFIG.lawOfOneUrls[lang] || CONFIG.lawOfOneUrls.en;
  const ui = CONFIG.ui[lang] || CONFIG.ui.en;

  const links = Array.from(allSources).map(src => {
    const [session, question] = src.split('.');
    const url = `${baseUrl}${session}#${question}`;
    return `<a href="${url}" target="_blank" rel="noopener">${src}</a>`;
  });

  return `
    <aside class="provenance">
      <span class="provenance-label">${ui.sources}:</span>
      ${links.join(', ')}
    </aside>
  `;
}

// ─────────────────────────────────────────────────────────────
// HTML Generation
// ─────────────────────────────────────────────────────────────

/**
 * Render a single content block (paragraph, quote, separator)
 */
function renderContentBlock(block, glossary, references) {
  let html = '';

  switch (block.type) {
    case 'paragraph':
      let text = parseTerms(block.text, glossary);
      text = parseRefs(text, references);
      html = `<p>${text}</p>`;
      break;

    case 'quote':
      html = `<blockquote>${block.text}</blockquote>`;
      break;

    case 'separator':
      html = `<div class="separator">${block.text || '· · ·'}</div>`;
      break;

    default:
      console.warn(`  ⚠ Unknown content type: ${block.type}`);
  }

  return html;
}

/**
 * Render a section
 */
function renderSection(section, glossary, references, provenance, lang) {
  const contentHtml = section.content
    .map(block => renderContentBlock(block, glossary, references))
    .join('\n        ');

  const provenanceHtml = renderProvenanceLinks(section.id, provenance, lang);

  return `
      <section id="${section.id}">
        <h3>${section.title}</h3>
        ${contentHtml}
        ${provenanceHtml}
      </section>
  `;
}

/**
 * Generate full chapter HTML
 */
function generateChapterHtml(chapter, lang, glossary, references, provenance, allChapters) {
  const ui = CONFIG.ui[lang] || CONFIG.ui.en;
  const bookTitle = CONFIG.bookTitles[lang];
  const slug = slugify(chapter.title);

  // Navigation
  const chapterIndex = allChapters.findIndex(c => c.id === chapter.id);
  const prevChapter = allChapters[chapterIndex - 1];
  const nextChapter = allChapters[chapterIndex + 1];

  const prevLink = prevChapter
    ? `<a href="${slugify(prevChapter.title)}.html" class="nav-prev">← ${ui.previous}</a>`
    : '<span class="nav-prev disabled"></span>';

  const nextLink = nextChapter
    ? `<a href="${slugify(nextChapter.title)}.html" class="nav-next">${ui.next} →</a>`
    : '<span class="nav-next disabled"></span>';

  // Sections
  const sectionsHtml = chapter.sections
    .map(section => renderSection(section, glossary, references, provenance, lang))
    .join('\n');

  // First paragraph for meta description
  const firstParagraph = chapter.sections[0]?.content[0]?.text || '';
  const metaDescription = firstParagraph
    .replace(/\{[^}]+\}/g, '') // Remove markup
    .substring(0, 160);

  // Language switcher
  const langSwitcher = CONFIG.languages
    .map(l => {
      const isActive = l === lang ? ' class="active"' : '';
      const langName = { en: 'EN', es: 'ES', pt: 'PT' }[l];
      return `<a href="/${l}/chapters/${slug}.html"${isActive}>${langName}</a>`;
    })
    .join('\n          ');

  return `<!DOCTYPE html>
<html lang="${lang}" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${chapter.title} — ${bookTitle}</title>
  <meta name="description" content="${metaDescription}">

  <!-- OpenGraph -->
  <meta property="og:title" content="${chapter.title} — ${bookTitle}">
  <meta property="og:description" content="${metaDescription}">
  <meta property="og:type" content="article">
  <meta property="og:locale" content="${lang}">

  <!-- Alternate languages -->
  ${CONFIG.languages
    .map(l => `<link rel="alternate" hreflang="${l}" href="/${l}/chapters/${slug}.html">`)
    .join('\n  ')}

  <link rel="stylesheet" href="/css/main.css">
</head>
<body class="chapter-page">
  <header class="site-header">
    <nav class="lang-switcher">
      ${langSwitcher}
    </nav>
    <nav class="chapter-nav">
      ${prevLink}
      <a href="/${lang}/" class="nav-home">${bookTitle}</a>
      ${nextLink}
    </nav>
  </header>

  <main>
    <article class="chapter" data-chapter="${chapter.id}">
      <header class="chapter-header">
        <p class="chapter-number">${chapter.numberText}</p>
        <h1 class="chapter-title">${chapter.title}</h1>
      </header>

      ${sectionsHtml}
    </article>
  </main>

  <footer class="site-footer">
    <p>© L/L Research — Philosophical reinterpretation under authorization</p>
    <p>${ui.sources}: <a href="https://www.lawofone.info" target="_blank" rel="noopener">lawofone.info</a></p>
  </footer>

  <script src="/js/glossary-tooltips.js" defer></script>
</body>
</html>`;
}

/**
 * Generate index page for a language
 */
function generateIndexHtml(lang, chapters) {
  const ui = CONFIG.ui[lang] || CONFIG.ui.en;
  const bookTitle = CONFIG.bookTitles[lang];

  const tocHtml = chapters
    .map(ch => {
      const slug = slugify(ch.title);
      return `<li><a href="chapters/${slug}.html"><span class="toc-number">${ch.numberText}</span> ${ch.title}</a></li>`;
    })
    .join('\n        ');

  const langSwitcher = CONFIG.languages
    .map(l => {
      const isActive = l === lang ? ' class="active"' : '';
      const langName = { en: 'EN', es: 'ES', pt: 'PT' }[l];
      return `<a href="/${l}/"${isActive}>${langName}</a>`;
    })
    .join('\n          ');

  return `<!DOCTYPE html>
<html lang="${lang}" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${bookTitle}</title>
  <meta name="description" content="${bookTitle} — The Law of One in a philosophical lens">

  <!-- Alternate languages -->
  ${CONFIG.languages.map(l => `<link rel="alternate" hreflang="${l}" href="/${l}/">`).join('\n  ')}

  <link rel="stylesheet" href="/css/main.css">
</head>
<body class="index-page">
  <header class="site-header">
    <nav class="lang-switcher">
      ${langSwitcher}
    </nav>
  </header>

  <main>
    <h1 class="book-title">${bookTitle}</h1>

    <nav class="toc">
      <h2>Table of Contents</h2>
      <ol class="toc-list">
        ${tocHtml}
      </ol>
    </nav>
  </main>

  <footer class="site-footer">
    <p>© L/L Research — Philosophical reinterpretation under authorization</p>
  </footer>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────
// Build Process
// ─────────────────────────────────────────────────────────────

/**
 * Load all chapters for a language
 * Only loads chapters listed in CONFIG.enabledChapters
 */
function loadChapters(lang) {
  const chaptersDir = path.join(CONFIG.inputDir, lang, 'chapters');

  // Filter to only enabled chapters
  const enabledSet = new Set(CONFIG.enabledChapters);
  const files = fs
    .readdirSync(chaptersDir)
    .filter(f => f.match(/^\d+\.json$/))
    .filter(f => enabledSet.has(parseInt(f)))
    .sort((a, b) => parseInt(a) - parseInt(b));

  return files.map(file => {
    const content = fs.readFileSync(path.join(chaptersDir, file), 'utf8');
    return JSON.parse(content);
  });
}

/**
 * Load glossary for a language
 */
function loadGlossary(lang) {
  const filePath = path.join(CONFIG.inputDir, lang, 'glossary.json');
  if (!fs.existsSync(filePath)) {
    console.warn(`  ⚠ Glossary not found for ${lang}`);
    return {};
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

/**
 * Load references for a language
 */
function loadReferences(lang) {
  const filePath = path.join(CONFIG.inputDir, lang, 'references.json');
  if (!fs.existsSync(filePath)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

/**
 * Ensure directory exists
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Copy directory recursively
 */
function copyDirRecursive(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      ensureDir(destPath);
      copyDirRecursive(srcPath, destPath);
      console.log(`  ✓ ${entry.name}/`);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log(`  ✓ ${entry.name}`);
    }
  }
}

/**
 * Build a single language
 */
function buildLanguage(lang) {
  console.log(`\n📖 Building ${lang.toUpperCase()}...`);

  const chapters = loadChapters(lang);
  const glossary = loadGlossary(lang);
  const references = loadReferences(lang);

  console.log(`  Found ${chapters.length} chapters`);
  console.log(`  Found ${Object.keys(glossary).length} glossary terms`);

  // Create output directories
  const langDir = path.join(CONFIG.outputDir, lang);
  const chaptersDir = path.join(langDir, 'chapters');
  ensureDir(chaptersDir);

  // Build each chapter
  chapters.forEach(chapter => {
    const provenance = loadProvenance(chapter.number);
    const html = generateChapterHtml(chapter, lang, glossary, references, provenance, chapters);

    const slug = slugify(chapter.title);
    const outputPath = path.join(chaptersDir, `${slug}.html`);
    fs.writeFileSync(outputPath, html);

    const provenanceStatus = provenance ? '✓' : '○';
    console.log(`  ${provenanceStatus} Chapter ${chapter.number}: ${slug}.html`);
  });

  // Build index page
  const indexHtml = generateIndexHtml(lang, chapters);
  fs.writeFileSync(path.join(langDir, 'index.html'), indexHtml);
  console.log(`  ✓ index.html`);
}

/**
 * Create JS file for glossary tooltips
 */
function createGlossaryScript() {
  const jsDir = path.join(CONFIG.outputDir, 'js');
  ensureDir(jsDir);

  const script = `/**
 * Glossary Tooltips - eluno.org
 */
(function() {
  const terms = document.querySelectorAll('.term[data-definition]');

  terms.forEach(term => {
    term.addEventListener('mouseenter', showTooltip);
    term.addEventListener('mouseleave', hideTooltip);
    term.addEventListener('focus', showTooltip);
    term.addEventListener('blur', hideTooltip);
  });

  function showTooltip(e) {
    const term = e.target;
    const definition = term.getAttribute('data-definition');

    let tooltip = document.getElementById('glossary-tooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'glossary-tooltip';
      tooltip.className = 'glossary-tooltip';
      document.body.appendChild(tooltip);
    }

    tooltip.textContent = definition;
    tooltip.style.display = 'block';

    const rect = term.getBoundingClientRect();
    tooltip.style.left = rect.left + 'px';
    tooltip.style.top = (rect.bottom + 8) + 'px';
  }

  function hideTooltip() {
    const tooltip = document.getElementById('glossary-tooltip');
    if (tooltip) {
      tooltip.style.display = 'none';
    }
  }
})();
`;

  fs.writeFileSync(path.join(jsDir, 'glossary-tooltips.js'), script);
  console.log('  ✓ js/glossary-tooltips.js');
}

/**
 * Main build function
 */
function build() {
  console.log('═══════════════════════════════════════════');
  console.log(' eluno.org — Build v2');
  console.log('═══════════════════════════════════════════');

  // Parse CLI args
  const args = process.argv.slice(2);
  const langArg = args.find(a => a.startsWith('--lang='))?.split('=')[1];

  const languagesToBuild = langArg ? [langArg] : CONFIG.languages;

  // Ensure output directory
  ensureDir(CONFIG.outputDir);

  // Build each language
  languagesToBuild.forEach(buildLanguage);

  // Create shared assets
  console.log('\n📦 Creating shared assets...');
  createGlossaryScript();

  // Copy static files (redirects, etc) - recursive
  const staticDir = path.join(__dirname, '../static');
  if (fs.existsSync(staticDir)) {
    copyDirRecursive(staticDir, CONFIG.outputDir);
  }

  console.log('\n═══════════════════════════════════════════');
  console.log(' ✅ Build complete!');
  console.log(`    Output: ${CONFIG.outputDir}`);
  console.log('═══════════════════════════════════════════\n');
}

// Run build
build();
