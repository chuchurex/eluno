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
  enabledChapters: [1, 2, 3, 4, 5, 6, 7, 8],

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
 * Returns HTML with term span that links to notes sidebar
 */
function parseTerms(text, glossary) {
  return text.replace(/\{term:([a-z0-9-]+)\}/gi, (match, keyword) => {
    const term = glossary[keyword];
    if (!term) {
      console.warn(`  ⚠ Term not found in glossary: ${keyword}`);
      return match; // Leave as-is if not found
    }
    return `<span class="term" data-term="${keyword}">${term.title}</span>`;
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
 * Generate navigation sidebar HTML
 */
function generateNavSidebar(chapter, allChapters, lang, ui) {
  const bookTitle = CONFIG.bookTitles[lang];

  // Language selector
  const langSelector = CONFIG.languages
    .map((l, i) => {
      const active = l === lang ? ' class="active"' : '';
      const prefix = i > 0 ? ' | ' : '';
      return `${prefix}<a href="/${l}/ch${chapter.number}/"${active}>${l.toUpperCase()}</a>`;
    })
    .join('');

  // Chapter links
  const chapterLinks = allChapters
    .map(ch => {
      const isActive = ch.id === chapter.id;
      const slug = slugify(ch.title);

      let html = `            <div class="nav-chapter-group${isActive ? ' active' : ''}" id="nav-group-${ch.id}">\n`;
      html += `                <div class="nav-chapter-header">\n`;
      html += `                    <a href="/${lang}/chapters/${slug}.html" class="nav-link${isActive ? ' current' : ''}">${ch.number}. ${ch.title}</a>\n`;

      if (isActive) {
        html += `                    <button class="nav-chapter-toggle" onclick="toggleChapter('${ch.id}')" aria-label="Toggle sections">▾</button>\n`;
        html += `                </div>\n`;
        html += `                <div class="nav-sections-list">\n`;
        ch.sections.forEach(sec => {
          html += `                    <a href="#${sec.id}" class="nav-link sub" onclick="if(window.innerWidth<=1100)closeAll()">${sec.title}</a>\n`;
        });
        html += `                </div>\n`;
      } else {
        html += `                </div>\n`;
      }

      html += `            </div>\n`;
      return html;
    })
    .join('');

  return `        <nav class="nav" id="sidebar">
            <div class="nav-lang-selector">${langSelector}</div>
            <div class="nav-back">
                <a href="/${lang}/" class="nav-link">← ${ui.home}</a>
            </div>
            <div class="nav-section">
${chapterLinks}            </div>
        </nav>`;
}

/**
 * Generate notes sidebar HTML
 */
function generateNotesSidebar(glossary, ui) {
  const notesLabel = ui.notesPanel || 'Notes & Definitions';
  const emptyMsg = ui.notesEmpty || 'Click any <span style="color:var(--gold);border-bottom:1px dotted var(--gold-dim)">highlighted term</span> to see its definition.';

  // Generate note items for each glossary term
  const noteItems = Object.entries(glossary)
    .map(([id, term]) => {
      const contentHtml = Array.isArray(term.content)
        ? term.content.map(p => {
            let processed = p.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
            processed = processed.replace(/\*([^*]+)\*/g, '<em>$1</em>');
            return `                    <p>${processed}</p>`;
          }).join('\n')
        : `                    <p>${term.content}</p>`;

      return `            <div class="note" id="note-${id}">
                <div class="note-title">${term.title}</div>
                <div class="note-content">
${contentHtml}
                </div>
            </div>`;
    })
    .join('\n');

  return `        <aside class="notes" id="notes">
            <div class="notes-head">${notesLabel}</div>
            <div class="notes-empty" id="notes-empty">${emptyMsg}</div>

${noteItems}
        </aside>`;
}

/**
 * Generate chapter navigation (prev/next)
 */
function generateChapterPrevNext(chapter, allChapters, lang, ui) {
  const chapterIndex = allChapters.findIndex(c => c.id === chapter.id);
  const prevChapter = allChapters[chapterIndex - 1];
  const nextChapter = allChapters[chapterIndex + 1];
  const bookTitle = CONFIG.bookTitles[lang];

  let html = `            <nav class="chapter-nav" aria-label="Chapter navigation">\n`;

  if (prevChapter) {
    const prevSlug = slugify(prevChapter.title);
    html += `                <a href="/${lang}/chapters/${prevSlug}.html" class="chapter-nav-link prev">\n`;
    html += `                    <span class="chapter-nav-label">← ${ui.previous}</span>\n`;
    html += `                    <span class="chapter-nav-title">${prevChapter.title}</span>\n`;
    html += `                </a>\n`;
  } else {
    html += `                <a href="/${lang}/" class="chapter-nav-link prev">\n`;
    html += `                    <span class="chapter-nav-label">← ${ui.home}</span>\n`;
    html += `                    <span class="chapter-nav-title">${bookTitle}</span>\n`;
    html += `                </a>\n`;
  }

  if (nextChapter) {
    const nextSlug = slugify(nextChapter.title);
    html += `                <a href="/${lang}/chapters/${nextSlug}.html" class="chapter-nav-link next">\n`;
    html += `                    <span class="chapter-nav-label">${ui.next} →</span>\n`;
    html += `                    <span class="chapter-nav-title">${nextChapter.title}</span>\n`;
    html += `                </a>\n`;
  } else {
    html += `                <span class="chapter-nav-link next disabled"></span>\n`;
  }

  html += `            </nav>\n`;
  return html;
}

/**
 * Generate footer HTML
 */
function generateFooter(ui) {
  return `            <footer class="footer">
                <div class="footer-attribution">
                    <p>${ui.footerAttribution || 'This work is a philosophical interpretation of the Ra Material, originally published by L/L Research.'}</p>
                    <p>${ui.footerSessions || 'Original sessions free at'} <a href="https://www.llresearch.org" target="_blank" rel="noopener">llresearch.org</a></p>
                    <p class="footer-copyright">© ${ui.footerCopyright || 'Content derived from L/L Research material'}</p>
                </div>
            </footer>`;
}

/**
 * Generate common scripts
 */
function generateScripts() {
  return `    <script>
        // Theme Management
        function initTheme() {
            const savedTheme = localStorage.getItem('theme');
            let currentTheme = 'dark';
            if (savedTheme) currentTheme = savedTheme;
            if (currentTheme === 'light') {
                document.documentElement.setAttribute('data-theme', 'light');
                updateThemeButton('light');
            } else {
                document.documentElement.removeAttribute('data-theme');
                updateThemeButton('dark');
            }
        }
        function toggleTheme() {
            const current = document.documentElement.getAttribute('data-theme');
            const newTheme = current === 'light' ? 'dark' : 'light';
            if (newTheme === 'light') {
                document.documentElement.setAttribute('data-theme', 'light');
            } else {
                document.documentElement.removeAttribute('data-theme');
            }
            localStorage.setItem('theme', newTheme);
            updateThemeButton(newTheme);
        }
        function updateThemeButton(theme) {
            const btns = document.querySelectorAll('.theme-toggle');
            btns.forEach(btn => {
                btn.innerHTML = theme === 'light' ? '☾' : '☀';
            });
        }
        initTheme();

        // Navigation functions
        function toggleNav(){document.getElementById('sidebar').classList.toggle('open');document.getElementById('overlay').classList.toggle('active');document.getElementById('notes')?.classList.remove('open')}
        function toggleNotes(){document.getElementById('notes').classList.toggle('open');document.getElementById('overlay').classList.toggle('active');document.getElementById('sidebar').classList.remove('open')}
        function closeAll(){document.getElementById('sidebar').classList.remove('open');document.getElementById('notes')?.classList.remove('open');document.getElementById('overlay').classList.remove('active')}
        function toggleChapter(id){const g=document.getElementById('nav-group-'+id);if(g)g.classList.toggle('expanded')}

        // Terms and notes functionality
        document.addEventListener('DOMContentLoaded', function() {
            document.querySelectorAll('.term').forEach(t=>t.addEventListener('click',function(e){
                e.preventDefault();
                const noteId='note-'+this.dataset.term;
                const note=document.getElementById(noteId);
                if(!note)return;
                document.querySelectorAll('.term').forEach(x=>x.classList.remove('active'));
                document.querySelectorAll('.note').forEach(n=>n.classList.remove('active'));
                const ne=document.getElementById('notes-empty');
                if(ne)ne.style.display='none';
                this.classList.add('active');
                note.classList.add('active');
                if(window.innerWidth<=1100){
                    document.getElementById('notes').classList.add('open');
                    document.getElementById('overlay').classList.add('active');
                }
                note.scrollIntoView({behavior:'smooth',block:'nearest'});
            }));
        });
    </script>`;
}

/**
 * Generate full chapter HTML
 */
function generateChapterHtml(chapter, lang, glossary, references, provenance, allChapters) {
  const ui = CONFIG.ui[lang] || CONFIG.ui.en;
  const bookTitle = CONFIG.bookTitles[lang];
  const slug = slugify(chapter.title);

  // Sections
  const sectionsHtml = chapter.sections
    .map(section => renderSection(section, glossary, references, provenance, lang))
    .join('\n');

  // First paragraph for meta description
  const firstParagraph = chapter.sections[0]?.content[0]?.text || '';
  const metaDescription = firstParagraph
    .replace(/\{[^}]+\}/g, '') // Remove markup
    .substring(0, 160);

  // Generate components
  const navSidebar = generateNavSidebar(chapter, allChapters, lang, ui);
  const notesSidebar = generateNotesSidebar(glossary, ui);
  const chapterPrevNext = generateChapterPrevNext(chapter, allChapters, lang, ui);
  const footer = generateFooter(ui);
  const scripts = generateScripts();

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
      .join('\n    ')}

    <link rel="preload" href="/fonts/cormorant-garamond-400.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="/fonts/spectral-400.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="stylesheet" href="/fonts/fonts.css">
    <link rel="stylesheet" href="/css/main.css">
</head>
<body>
    <button class="toggle nav-toggle" onclick="toggleNav()">☰ ${ui.home}</button>
    <button class="toggle notes-toggle" onclick="toggleNotes()">${ui.glossary}</button>
    <button class="toggle theme-toggle" onclick="toggleTheme()" aria-label="Toggle Theme">☀</button>
    <div class="overlay" id="overlay" onclick="closeAll()"></div>

    <div class="layout">
        <main class="main">
            <article class="chapter" id="${chapter.id}">
                <header class="ch-head">
                    <div class="ch-head-top">
                        <div class="ch-num">${chapter.numberText}</div>
                    </div>
                    <h1 class="ch-title">${chapter.title}</h1>
                </header>

${sectionsHtml}
            </article>

${chapterPrevNext}
${footer}
        </main>

${navSidebar}

${notesSidebar}
    </div>

${scripts}
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
