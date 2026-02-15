#!/usr/bin/env node
/**
 * DEPRECATED — Use `npx eluno-build` instead (from @eluno/core)
 * This script is kept for reference only. The `npm run build` command
 * now uses `npx eluno-build` directly. Will be removed in a future PR.
 *
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
  languages: ['en', 'es', 'pt'],
  baseLang: 'en',
  inputDir: path.join(__dirname, '../i18n'),
  outputDir: path.join(__dirname, '../dist'),
  provenanceDir: path.join(__dirname, '../i18n/provenance'),

  // v3 beta: only build these chapters (add more as they're reviewed)
  enabledChapters: [1, 2, 3, 4, 5, 6],

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
      listenAudio: 'Listen',
      subtitle: 'A philosophical rewrite of the Ra Material',
      intro: 'Teachings received by Don, Carla, and Jim in the early 80s, transformed into accessible philosophical narrative. Rewritten with AI assistance.',
      disclaimerTitle: 'About This Interpretation',
      disclaimer: [
        'The Ra Material was delivered in a precise question-and-answer format, with Ra choosing each word intentionally. This project transforms that format into narrative prose—a process that necessarily involves interpretation through the author\'s understanding.',
        'This work was created with AI assistance, which may introduce inaccuracies or inconsistencies. It should be used only as a supplementary tool, not as a primary study of the material.',
        'We encourage all seekers to read the original sessions at <a href="https://www.llresearch.org" target="_blank" rel="noopener">llresearch.org</a> and form their own relationship with Ra\'s actual words.'
      ],
      tableOfContents: 'Table of Contents',
      footerAttribution: 'This work is a philosophical interpretation of the Ra Material, originally published by L/L Research.',
      footerSessions: 'Original sessions free at',
      noSources: 'No source citations for this section.'
    },
    es: {
      chapter: 'Capítulo',
      sources: 'Fuentes',
      glossary: 'Glosario',
      previous: 'Anterior',
      next: 'Siguiente',
      home: 'Inicio',
      downloadPdf: 'Descargar PDF',
      listenAudio: 'Escuchar',
      subtitle: 'Una reescritura filosófica del Material Ra',
      intro: 'Enseñanzas recibidas por Don, Carla y Jim a principios de los 80, transformadas en narrativa filosófica accesible. Reescrito con asistencia de IA.',
      disclaimerTitle: 'Sobre Esta Interpretación',
      disclaimer: [
        'El Material Ra fue entregado en un formato preciso de preguntas y respuestas, con Ra eligiendo cada palabra intencionalmente. Este proyecto transforma ese formato en prosa narrativa—un proceso que necesariamente involucra interpretación a través del entendimiento del autor.',
        'Este trabajo fue creado con asistencia de IA, lo cual puede introducir inexactitudes o inconsistencias. Debe usarse solo como herramienta complementaria, no como estudio primario del material.',
        'Animamos a todos los buscadores a leer las sesiones originales en <a href="https://www.llresearch.org" target="_blank" rel="noopener">llresearch.org</a> y formar su propia relación con las palabras reales de Ra.'
      ],
      tableOfContents: 'Índice',
      footerAttribution: 'Este trabajo es una interpretación filosófica del Material Ra, publicado originalmente por L/L Research.',
      footerSessions: 'Sesiones originales gratis en',
      noSources: 'Sin citas de fuentes para esta sección.'
    },
    pt: {
      chapter: 'Capítulo',
      sources: 'Fontes',
      glossary: 'Glossário',
      previous: 'Anterior',
      next: 'Próximo',
      home: 'Início',
      downloadPdf: 'Baixar PDF',
      listenAudio: 'Ouvir',
      subtitle: 'Uma reescrita filosófica do Material Ra',
      intro: 'Ensinamentos recebidos por Don, Carla e Jim no início dos anos 80, transformados em narrativa filosófica acessível. Reescrito com assistência de IA.',
      disclaimerTitle: 'Sobre Esta Interpretação',
      disclaimer: [
        'O Material Ra foi entregue em um formato preciso de perguntas e respostas, com Ra escolhendo cada palavra intencionalmente. Este projeto transforma esse formato em prosa narrativa — um processo que necessariamente envolve interpretação através do entendimento do autor.',
        'Este trabalho foi criado com assistência de IA, o que pode introduzir imprecisões ou inconsistências. Deve ser usado apenas como ferramenta complementar, não como estudo primário do material.',
        'Encorajamos todos os buscadores a ler as sessões originais em <a href="https://www.llresearch.org" target="_blank" rel="noopener">llresearch.org</a> e formar sua própria relação com as palavras reais de Ra.'
      ],
      tableOfContents: 'Índice',
      footerAttribution: 'Este trabalho é uma interpretação filosófica do Material Ra, publicado originalmente por L/L Research.',
      footerSessions: 'Sessões originais grátis em',
      noSources: 'Sem citações de fontes para esta seção.'
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

  const links = Array.from(allSources)
    .filter(src => /^\d+\.\d+$/.test(src))
    .map(src => {
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
function renderSection(section, glossary, references, provenance, lang, chapterNum, sectionIdx) {
  const ui = CONFIG.ui[lang] || CONFIG.ui.en;
  const sectionNumber = `${chapterNum}.${sectionIdx}`;
  const contentHtml = section.content
    .map(block => renderContentBlock(block, glossary, references))
    .join('\n        ');

  const infoIcon = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.2"/><path d="M8 4v1M8 7v5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`;

  return `
      <section class="section" id="${section.id}" data-section-title="${section.title}" data-section-number="${sectionNumber}">
        <h3 class="sec-title">
          <span class="sec-title-text">${section.title}</span>
          <button class="sec-context-btn" data-target="${section.id}" aria-label="${ui.sources}" title="${ui.sources}">${infoIcon}</button>
        </h3>
        ${contentHtml}
      </section>
  `;
}

/**
 * Generate navigation sidebar HTML
 */
function generateNavSidebar(chapter, allChapters, lang, ui, chapterSlugMap) {
  const bookTitle = CONFIG.bookTitles[lang];

  // Language selector — link to the correct slug for each language
  const langSelector = CONFIG.languages
    .filter(l => chapterSlugMap[l] && chapterSlugMap[l][chapter.number])
    .map((l, i) => {
      const active = l === lang ? ' class="active"' : '';
      const prefix = i > 0 ? ' | ' : '';
      const targetSlug = chapterSlugMap[l][chapter.number];
      return `${prefix}<a href="/${l}/chapters/${targetSlug}.html"${active}>${l.toUpperCase()}</a>`;
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
function generateContextSidebar(chapter, glossary, provenance, lang, ui) {
  const emptyMsg = ui.notesEmpty || 'Click any <span style="color:var(--gold);border-bottom:1px dotted var(--gold-dim)">highlighted term</span> to see its definition.';
  const sourcesLabel = ui.sources || 'Sources';
  const noSourcesMsg = ui.noSources || 'No source citations for this section.';

  // Generate note items for each glossary term (same as before)
  const noteItems = Object.entries(glossary)
    .map(([id, term]) => {
      const contentHtml = Array.isArray(term.content)
        ? term.content.map(p => {
            let processed = p.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
            processed = processed.replace(/\*([^*]+)\*/g, '<em>$1</em>');
            return `                        <p>${processed}</p>`;
          }).join('\n')
        : `                        <p>${term.content}</p>`;

      return `                <div class="note" id="note-${id}">
                    <div class="note-title">${term.title}</div>
                    <div class="note-content">
${contentHtml}
                    </div>
                </div>`;
    })
    .join('\n');

  // Generate per-section source blocks
  const baseUrl = CONFIG.lawOfOneUrls[lang] || CONFIG.lawOfOneUrls.en;
  const sourceBlocks = chapter.sections
    .map(section => {
      if (!provenance) return '';

      const secProv = provenance.provenance.find(p => p.section_id === section.id);
      if (!secProv || !secProv.segments || secProv.segments.length === 0) return '';

      const allSources = new Set();
      secProv.segments.forEach(seg => {
        seg.sources.forEach(src => allSources.add(src));
      });

      if (allSources.size === 0) return '';

      const links = Array.from(allSources)
        .filter(src => /^\d+\.\d+$/.test(src))
        .map(src => {
          const [session, question] = src.split('.');
          const url = `${baseUrl}${session}#${question}`;
          return `<a href="${url}" target="_blank" rel="noopener">${src}</a>`;
        });

      return `                <div class="notes-sources" data-section="${section.id}">${links.join(', ')}</div>`;
    })
    .filter(Boolean)
    .join('\n');

  return `        <aside class="notes" id="notes">
            <div class="notes-context" id="notes-context">
                <div class="notes-context-label" id="notes-context-label">${chapter.number}. ${chapter.title}</div>
                <div class="notes-context-title" id="notes-context-title"></div>
            </div>

            <div class="notes-term-area" id="notes-term-area">
                <div class="notes-term-empty" id="notes-term-empty">${emptyMsg}</div>
${noteItems}
            </div>

            <div class="notes-sources-area" id="notes-sources-area">
                <div class="notes-sources-head">${sourcesLabel}</div>
                <div class="notes-sources-empty" id="notes-sources-empty">${noSourcesMsg}</div>
${sourceBlocks}
            </div>
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
                const ne=document.getElementById('notes-term-empty');
                if(ne)ne.style.display='none';
                this.classList.add('active');
                note.classList.add('active');
                if(window.innerWidth<=1100){
                    document.getElementById('notes').classList.add('open');
                    document.getElementById('overlay').classList.add('active');
                }
                note.scrollIntoView({behavior:'smooth',block:'nearest'});
            }));

            // === Scroll-Spy & Contextual Sidebar ===
            (function() {
                var sections = document.querySelectorAll('.section[id]');
                var contextTitle = document.getElementById('notes-context-title');
                var sourcesEmpty = document.getElementById('notes-sources-empty');
                var allSourceBlocks = document.querySelectorAll('.notes-sources[data-section]');
                var currentSectionId = null;

                function updateSidebarContext(sectionId) {
                    if (sectionId === currentSectionId) return;
                    currentSectionId = sectionId;
                    var sectionEl = document.getElementById(sectionId);
                    if (!sectionEl) return;
                    var title = sectionEl.getAttribute('data-section-title') || '';
                    var sectionNum = sectionEl.getAttribute('data-section-number') || '';

                    // Fade transition
                    contextTitle.style.opacity = '0';
                    setTimeout(function() {
                        contextTitle.textContent = sectionNum + ' ' + title;
                        contextTitle.style.opacity = '1';
                    }, 150);

                    // Show/hide matching sources
                    var hasSource = false;
                    allSourceBlocks.forEach(function(block) {
                        if (block.getAttribute('data-section') === sectionId) {
                            block.style.display = 'block';
                            hasSource = true;
                        } else {
                            block.style.display = 'none';
                        }
                    });
                    if (sourcesEmpty) {
                        sourcesEmpty.style.display = hasSource ? 'none' : 'block';
                    }

                    // Highlight active section in left nav
                    document.querySelectorAll('.nav-link.sub').forEach(function(link) {
                        link.classList.toggle('current', link.getAttribute('href') === '#' + sectionId);
                    });
                }

                // IntersectionObserver for scroll-spy
                if ('IntersectionObserver' in window && sections.length > 0) {
                    var observer = new IntersectionObserver(function(entries) {
                        var topEntry = null;
                        entries.forEach(function(entry) {
                            if (entry.isIntersecting) {
                                if (!topEntry || entry.boundingClientRect.top < topEntry.boundingClientRect.top) {
                                    topEntry = entry;
                                }
                            }
                        });
                        if (topEntry) {
                            updateSidebarContext(topEntry.target.id);
                        }
                    }, {
                        rootMargin: '-10% 0px -60% 0px',
                        threshold: 0
                    });
                    sections.forEach(function(section) { observer.observe(section); });
                }

                // Section info button click handler
                document.querySelectorAll('.sec-context-btn').forEach(function(btn) {
                    btn.addEventListener('click', function(e) {
                        e.preventDefault();
                        var targetId = this.getAttribute('data-target');
                        updateSidebarContext(targetId);
                        if (window.innerWidth <= 1100) {
                            document.getElementById('notes').classList.add('open');
                            document.getElementById('overlay').classList.add('active');
                            document.getElementById('sidebar').classList.remove('open');
                        }
                    });
                });
            })();
        });
    </script>`;
}

/**
 * Generate full chapter HTML
 */
function generateChapterHtml(chapter, lang, glossary, references, provenance, allChapters, chapterSlugMap) {
  const ui = CONFIG.ui[lang] || CONFIG.ui.en;
  const bookTitle = CONFIG.bookTitles[lang];
  const slug = slugify(chapter.title);

  // Sections
  const sectionsHtml = chapter.sections
    .map((section, idx) => renderSection(section, glossary, references, provenance, lang, chapter.number, idx + 1))
    .join('\n');

  // First paragraph for meta description
  const firstParagraph = chapter.sections[0]?.content[0]?.text || '';
  const metaDescription = firstParagraph
    .replace(/\{[^}]+\}/g, '') // Remove markup
    .substring(0, 160);

  // Generate components
  const navSidebar = generateNavSidebar(chapter, allChapters, lang, ui, chapterSlugMap);
  const notesSidebar = generateContextSidebar(chapter, glossary, provenance, lang, ui);
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
      .filter(l => chapterSlugMap[l] && chapterSlugMap[l][chapter.number])
      .map(l => `<link rel="alternate" hreflang="${l}" href="/${l}/chapters/${chapterSlugMap[l][chapter.number]}.html">`)
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

  // Chapter cards
  const tocHtml = chapters
    .map(ch => {
      const slug = slugify(ch.title);
      return `          <a href="chapters/${slug}.html" class="toc-chapter">
            <span class="toc-chapter-num">${ch.numberText}</span>
            <span class="toc-chapter-title">${ch.title}</span>
            <span class="toc-chapter-arrow">→</span>
          </a>`;
    })
    .join('\n');

  // Language selector
  const langSwitcher = CONFIG.languages
    .map(l => {
      const isActive = l === lang ? ' class="active"' : '';
      const langName = { en: 'EN', es: 'ES', pt: 'PT' }[l];
      return `<a href="/${l}/"${isActive}>${langName}</a>`;
    })
    .join(' | ');

  // Disclaimer paragraphs
  const disclaimerHtml = ui.disclaimer
    .map(p => `          <p>${p}</p>`)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="${lang}" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${bookTitle} | eluno.org</title>
  <meta name="description" content="${ui.subtitle}">

  <!-- OpenGraph -->
  <meta property="og:title" content="${bookTitle}">
  <meta property="og:description" content="${ui.subtitle}">
  <meta property="og:type" content="book">
  <meta property="og:locale" content="${lang}">

  <!-- Alternate languages -->
  ${CONFIG.languages.map(l => `<link rel="alternate" hreflang="${l}" href="/${l}/">`).join('\n  ')}

  <link rel="preload" href="/fonts/cormorant-garamond-400.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/spectral-400.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/fonts/fonts.css">
  <link rel="stylesheet" href="/css/main.css">
</head>
<body>
  <button class="toggle theme-toggle" onclick="toggleTheme()" aria-label="Toggle Theme">☀</button>

  <div class="layout index-layout">
    <main class="main">
      <header class="toc-header">
        <div class="toc-lang-selector">${langSwitcher}</div>
        <h1 class="toc-title">${bookTitle}</h1>
        <p class="toc-subtitle">${ui.subtitle}</p>
      </header>

      <section class="introduction">
        <p class="intro-text">${ui.intro}</p>
      </section>

      <section class="disclaimer-banner">
        <h3 class="disclaimer-title">${ui.disclaimerTitle}</h3>
${disclaimerHtml}
      </section>

      <section class="toc-section">
        <h2 class="toc-section-title">${ui.tableOfContents}</h2>
        <div class="toc-chapters">
${tocHtml}
        </div>
      </section>

      <footer class="footer-attribution">
        <p>${ui.footerAttribution}</p>
        <p>${ui.footerSessions} <a href="https://www.llresearch.org" target="_blank" rel="noopener">llresearch.org</a></p>
      </footer>
    </main>
  </div>

  <script>
    function initTheme() {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        updateThemeButton('light');
      } else {
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
      document.querySelectorAll('.theme-toggle').forEach(btn => {
        btn.innerHTML = theme === 'light' ? '☾' : '☀';
      });
    }
    initTheme();
  </script>
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
function buildLanguage(lang, chapterSlugMap) {
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
    const html = generateChapterHtml(chapter, lang, glossary, references, provenance, chapters, chapterSlugMap);

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
 * Build a map of chapter slugs per language for cross-language linking.
 * Returns { en: { 1: 'cosmology-and-genesis' }, es: { 1: 'cosmologia-y-genesis' }, ... }
 */
function buildChapterSlugMap() {
  const slugMap = {};
  for (const lang of CONFIG.languages) {
    slugMap[lang] = {};
    const chapters = loadChapters(lang);
    for (const ch of chapters) {
      slugMap[lang][ch.number] = slugify(ch.title);
    }
  }
  return slugMap;
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

  // Pre-build cross-language slug map (always for all languages)
  const chapterSlugMap = buildChapterSlugMap();

  // Ensure output directory
  ensureDir(CONFIG.outputDir);

  // Build each language
  languagesToBuild.forEach(lang => buildLanguage(lang, chapterSlugMap));

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
