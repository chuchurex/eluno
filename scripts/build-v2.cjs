#!/usr/bin/env node
/**
 * Build Script — eluno.org
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
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// ─────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────

// Cache buster: changes on each build so CDN serves fresh assets
const BUILD_HASH = Date.now().toString(36);

const CONFIG = {
  languages: ['en', 'es', 'pt'],
  baseLang: 'en',
  inputDir: path.join(__dirname, '../i18n'),
  outputDir: path.join(__dirname, '../dist'),
  provenanceDir: path.join(__dirname, '../i18n/provenance'),
  siteUrl: process.env.SITE_URL || 'https://eluno.org',
  get siteDomain() { try { return new URL(this.siteUrl).hostname; } catch { return 'eluno.org'; } },
  gaId: process.env.GA_ID || '',
  githubRepo: process.env.GITHUB_REPO || '',

  // v3 beta: only build these chapters (add more as they're reviewed)
  enabledChapters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],

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
      ariaToggleTheme: 'Toggle Theme',
      ariaChapterNav: 'Chapter navigation',
      ariaToggleSections: 'Toggle sections',
      next: 'Next',
      home: 'Home',
      downloadPdf: 'Download PDF',
      listenAudio: 'Listen',
      subtitle: 'A philosophical reinterpretation of the Ra Material (The Law of One) as accessible narrative. Explore cosmology, the Creator, the densities, and the purpose of existence.',
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
      footerCopyright: 'Content derived from L/L Research material',
      noSources: 'No source citations for this section.',
      notesEmpty: 'Click any <span class="term-example">highlighted term</span> to see its definition.',
      about: 'About',
      glossaryPage: 'Glossary',
      glossaryPageSubtitle: 'All terms and concepts',
      searchPlaceholder: 'Search chapters and glossary...',
      searchNoResults: 'No results found',
      skipToContent: 'Skip to content',
      closeMenu: 'Close menu',
      glossaryCategories: 'Categories',
      glossaryAlphabetical: 'A\u2013Z',
      glossaryUncategorized: 'Other'
    },
    es: {
      chapter: 'Capítulo',
      sources: 'Fuentes',
      glossary: 'Glosario',
      previous: 'Anterior',
      ariaToggleTheme: 'Cambiar tema',
      ariaChapterNav: 'Navegación de capítulos',
      ariaToggleSections: 'Mostrar secciones',
      next: 'Siguiente',
      home: 'Inicio',
      downloadPdf: 'Descargar PDF',
      listenAudio: 'Escuchar',
      subtitle: 'Una reinterpretación filosófica del Material Ra (La Ley del Uno) como narrativa accesible. Explora la cosmología, el Creador, las densidades y el propósito de la existencia.',
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
      footerCopyright: 'Contenido derivado del material de L/L Research',
      noSources: 'Sin citas de fuentes para esta sección.',
      notesEmpty: 'Haz clic en cualquier <span class="term-example">término destacado</span> para ver su definición.',
      about: 'Acerca de',
      glossaryPage: 'Glosario',
      glossaryPageSubtitle: 'Todos los términos y conceptos',
      searchPlaceholder: 'Buscar capítulos y glosario...',
      searchNoResults: 'Sin resultados',
      skipToContent: 'Ir al contenido',
      closeMenu: 'Cerrar menú',
      glossaryCategories: 'Categorías',
      glossaryAlphabetical: 'A\u2013Z',
      glossaryUncategorized: 'Otros'
    },
    pt: {
      chapter: 'Capítulo',
      sources: 'Fontes',
      glossary: 'Glossário',
      previous: 'Anterior',
      ariaToggleTheme: 'Alternar tema',
      ariaChapterNav: 'Navegação de capítulos',
      ariaToggleSections: 'Mostrar seções',
      next: 'Próximo',
      home: 'Início',
      downloadPdf: 'Baixar PDF',
      listenAudio: 'Ouvir',
      subtitle: 'Uma reinterpretação filosófica do Material Ra (A Lei do Um) como narrativa acessível. Explore a cosmologia, o Criador, as densidades e o propósito da existência.',
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
      footerCopyright: 'Conteúdo derivado do material de L/L Research',
      noSources: 'Sem citações de fontes para esta seção.',
      notesEmpty: 'Clique em qualquer <span class="term-example">termo destacado</span> para ver sua definição.',
      about: 'Sobre',
      glossaryPage: 'Glossário',
      glossaryPageSubtitle: 'Todos os termos e conceitos',
      searchPlaceholder: 'Buscar capítulos e glossário...',
      searchNoResults: 'Sem resultados',
      skipToContent: 'Ir para o conteúdo',
      closeMenu: 'Fechar menu',
      glossaryCategories: 'Categorias',
      glossaryAlphabetical: 'A\u2013Z',
      glossaryUncategorized: 'Outros'
    }
  }
};

// ─────────────────────────────────────────────────────────────
// Analytics helpers
// ─────────────────────────────────────────────────────────────

function gaPreconnect() {
  if (!CONFIG.gaId) return '';
  return `<link rel="dns-prefetch" href="https://www.googletagmanager.com">
    <link rel="preconnect" href="https://www.googletagmanager.com" crossorigin>`;
}

function gaScript() {
  if (!CONFIG.gaId) return '';
  return `<!-- Google tag (gtag.js) — deferred -->
    <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${CONFIG.gaId}');
    window.addEventListener('load',function(){var s=document.createElement('script');s.src='https://www.googletagmanager.com/gtag/js?id=${CONFIG.gaId}';s.async=true;document.head.appendChild(s)});</script>`;
}

// ─────────────────────────────────────────────────────────────
// Markup Parser
// ─────────────────────────────────────────────────────────────

/**
 * Parse {term:keyword} markup
 * Returns HTML with term span that links to notes sidebar
 * Handles duplicate articles (e.g. "el {term:infinite}" → "el El Infinito" → "El Infinito")
 * and strips parenthetical descriptions from inline display
 */
function parseTerms(text, glossary) {
  const articleRe = /(?:\b(el|la|los|las|del|al|the|o|a|os|as|do|da|dos|das)\s+)?\{term:([a-z0-9-]+)\}/gi;

  text = text.replace(articleRe, (match, precedingArt, keyword) => {
    const term = glossary[keyword];
    if (!term) {
      console.warn(`  ⚠ Term not found in glossary: ${keyword}`);
      return match;
    }

    // Strip parenthetical descriptions for inline display
    const displayTitle = term.title.replace(/\s*\([^)]+\)\s*/g, '').trim();
    const makeSpan = (title) => `<span class="term" data-term="${keyword}">${title}</span>`;

    if (!precedingArt) return makeSpan(displayTitle);

    const al = precedingArt.toLowerCase();
    const titleWords = displayTitle.split(/\s+/);
    const firstWord = titleWords[0].toLowerCase();
    const stripped = titleWords.slice(1).join(' ');

    // Same article duplicated: "el El Infinito" → "El Infinito"
    if (al === firstWord) return makeSpan(displayTitle);

    // Spanish contractions: "del El Infinito" → "del Infinito"
    if ((al === 'del' || al === 'al') && firstWord === 'el')
      return precedingArt + ' ' + makeSpan(stripped);

    // Portuguese contractions
    if (al === 'do' && firstWord === 'os') return 'dos ' + makeSpan(stripped);
    if (al === 'do' && firstWord === 'as') return 'das ' + makeSpan(stripped);
    if (al === 'da' && firstWord === 'a') return 'da ' + makeSpan(stripped);
    if (['do', 'da', 'dos', 'das'].includes(al) && ['o', 'a', 'os', 'as'].includes(firstWord))
      return precedingArt + ' ' + makeSpan(stripped);

    // No duplicate → keep both
    return precedingArt + ' ' + makeSpan(displayTitle);
  });

  // Fix trailing duplicates: "<span>Véu do Esquecimento</span> do esquecimento"
  text = text.replace(/(<\/span>)\s+((?:del|do|da|of|dos|das)\s+\w+)(?=[\s.,;:!?]|$)/gi, (match, closeTag, trailing) => {
    // Check if the span content ends with the same trailing text
    const spanMatch = match.match(/>([^<]+)<\/span>/);
    if (!spanMatch) return match;
    const spanText = spanMatch[1];
    if (spanText.toLowerCase().endsWith(trailing.toLowerCase())) return closeTag;
    return match;
  });

  return text;
}

/**
 * Resolve terms to plain text for meta descriptions (no HTML spans)
 * Applies same article deduplication and parenthetical stripping
 */
function cleanTextForMeta(text, glossary) {
  const articleRe = /(?:\b(el|la|los|las|del|al|the|o|a|os|as|do|da|dos|das)\s+)?\{term:([a-z0-9-]+)\}/gi;

  text = text.replace(articleRe, (match, precedingArt, keyword) => {
    const term = glossary[keyword];
    if (!term) return precedingArt ? precedingArt + ' ' + keyword : keyword;

    const displayTitle = term.title.replace(/\s*\([^)]+\)\s*/g, '').trim();

    if (!precedingArt) return displayTitle;

    const al = precedingArt.toLowerCase();
    const titleWords = displayTitle.split(/\s+/);
    const firstWord = titleWords[0].toLowerCase();
    const stripped = titleWords.slice(1).join(' ');

    if (al === firstWord) return displayTitle;
    if ((al === 'del' || al === 'al') && firstWord === 'el') return precedingArt + ' ' + stripped;
    if (al === 'do' && firstWord === 'os') return 'dos ' + stripped;
    if (al === 'do' && firstWord === 'as') return 'das ' + stripped;
    if (al === 'da' && firstWord === 'a') return 'da ' + stripped;
    if (['do', 'da', 'dos', 'das'].includes(al) && ['o', 'a', 'os', 'as'].includes(firstWord))
      return precedingArt + ' ' + stripped;

    return precedingArt + ' ' + displayTitle;
  });

  // Remove {ref:xxx} markers
  text = text.replace(/\{ref:[^}]+\}/g, '');

  // Fix trailing duplicates
  text = text.replace(/((?:del|do|da|of|dos|das)\s+\w+)\s+\1/gi, '$1');

  return text.replace(/  +/g, ' ').trim();
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

  const infoIcon = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.2"/><path d="M8 4v1M8 7v5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`;

  return `
      <section class="section" id="${section.id}" data-section-title="${section.title}" data-section-number="${sectionNumber}">
        <h2 class="sec-title">
          <span class="sec-title-text">${section.title}</span>
          <button class="sec-context-btn" data-target="${section.id}" aria-label="${ui.sources}" title="${ui.sources}">${infoIcon}</button>
        </h2>
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
      const ariaLabel = { en: 'English', es: 'Español', pt: 'Português' }[l];
      return `${prefix}<a href="/${l}/chapters/${targetSlug}.html"${active} onclick="localStorage.setItem('lang','${l}')" aria-label="${ariaLabel}">${l.toUpperCase()}</a>`;
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
        html += `                    <button class="nav-chapter-toggle" data-action="toggle-chapter" data-chapter="${ch.id}" aria-label="${ui.ariaToggleSections}" aria-expanded="false">▾</button>\n`;
        html += `                </div>\n`;
        html += `                <div class="nav-sections-list">\n`;
        ch.sections.forEach(sec => {
          html += `                    <a href="#${sec.id}" class="nav-link sub" data-action="nav-link-close">${sec.title}</a>\n`;
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
            <div class="nav-back nav-back--footer">
                <a href="/${lang}/glossary.html" class="nav-link">${ui.glossaryPage}</a>
                <a href="/${lang}/about.html" class="nav-link">${ui.about}</a>
            </div>
        </nav>`;
}

/**
 * Generate notes sidebar HTML
 */
function generateContextSidebar(chapter, glossary, provenance, lang, ui) {
  const emptyMsg = ui.notesEmpty || 'Click any <span class="term-example">highlighted term</span> to see its definition.';
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
 * SVG icons for media toolbar (22px, same as alpha)
 */
const MEDIA_SVG = {
  pdf: '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 2l5 5h-5V4zm-2 14l-4-4h2.5v-4h3v4H15l-4 4z"/></svg>',
  audio: '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>',
  youtube: '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z"/></svg>'
};

/**
 * Load media.json for a language (returns null if not found)
 */
function loadMedia(lang) {
  const mediaPath = path.join(CONFIG.inputDir, lang, 'media.json');
  try {
    return JSON.parse(fs.readFileSync(mediaPath, 'utf8'));
  } catch {
    return null;
  }
}

/**
 * Generate media toolbar for chapter page (MP3 with accordion, PDF download, YouTube link)
 */
function generateMediaToolbar(chapterNum, media, ui) {
  if (!media) return '';
  const chapterMedia = media[String(chapterNum)];
  if (!chapterMedia) return '';

  const hasPdf = !!chapterMedia.pdf;
  const hasAudio = !!chapterMedia.audio;
  const hasYoutube = !!chapterMedia.youtube;
  if (!hasPdf && !hasAudio && !hasYoutube) return '';

  let html = `                <div class="ch-media-bar">\n`;

  if (hasAudio) {
    html += `                    <div class="ch-media-audio-panel" id="audio-panel-${chapterNum}">\n`;
    html += `                        <audio src="${chapterMedia.audio}" controls preload="none"></audio>\n`;
    html += `                    </div>\n`;
    html += `                    <button class="ch-media-icon" data-action="toggle-audio" data-audio="${chapterNum}" title="${ui.listenAudio}" data-audio-btn="${chapterNum}">${MEDIA_SVG.audio}<span class="ch-media-label">MP3</span></button>\n`;
  }

  if (hasPdf) {
    html += `                    <a href="${chapterMedia.pdf}" class="ch-media-icon" title="${ui.downloadPdf}" download>${MEDIA_SVG.pdf}<span class="ch-media-label">PDF</span></a>\n`;
  }

  if (hasYoutube) {
    html += `                    <a href="${chapterMedia.youtube}" class="ch-media-icon" target="_blank" rel="noopener" title="YouTube">${MEDIA_SVG.youtube}<span class="ch-media-label">YouTube</span></a>\n`;
  }

  html += `                </div>\n`;
  return html;
}

/**
 * Generate media toolbar for homepage (direct download links)
 */
function generateHomepageMediaToolbar(media, ui) {
  if (!media || !media.all) return '';
  const allMedia = media.all;

  const hasPdf = !!allMedia.pdf;
  const hasAudio = !!allMedia.audio;
  const hasYoutube = !!allMedia.youtube;
  if (!hasPdf && !hasAudio && !hasYoutube) return '';

  let html = `        <div class="ch-media-bar homepage-media">\n`;

  if (hasAudio) {
    html += `          <a href="${allMedia.audio}" class="ch-media-icon" title="${ui.listenAudio}" download>${MEDIA_SVG.audio}<span class="ch-media-label">MP3</span></a>\n`;
  }

  if (hasPdf) {
    html += `          <a href="${allMedia.pdf}" class="ch-media-icon" title="${ui.downloadPdf}" download>${MEDIA_SVG.pdf}<span class="ch-media-label">PDF</span></a>\n`;
  }

  if (hasYoutube) {
    html += `          <a href="${allMedia.youtube}" class="ch-media-icon" target="_blank" rel="noopener" title="YouTube">${MEDIA_SVG.youtube}<span class="ch-media-label">YouTube</span></a>\n`;
  }

  html += `        </div>\n`;
  return html;
}

/**
 * Generate chapter navigation (prev/next)
 */
function generateChapterPrevNext(chapter, allChapters, lang, ui) {
  const chapterIndex = allChapters.findIndex(c => c.id === chapter.id);
  const prevChapter = allChapters[chapterIndex - 1];
  const nextChapter = allChapters[chapterIndex + 1];
  const bookTitle = CONFIG.bookTitles[lang];

  let html = `            <nav class="chapter-nav" aria-label="${ui.ariaChapterNav}">\n`;

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
function generateFooter(ui, lang) {
  const githubLink = CONFIG.githubRepo
    ? `\n                    <span>·</span>\n                    <a href="${CONFIG.githubRepo}" target="_blank" rel="noopener">GitHub</a>`
    : '';
  return `            <footer class="footer">
                <div class="footer-links">
                    <a href="/${lang}/about.html">${ui.about}</a>
                    <span>·</span>
                    <a href="/${lang}/glossary.html">${ui.glossaryPage}</a>${githubLink}
                </div>
                <div class="footer-attribution">
                    <p>${ui.footerAttribution || 'This work is a philosophical interpretation of the Ra Material, originally published by L/L Research.'}</p>
                    <p>${ui.footerSessions || 'Original sessions free at'} <a href="https://www.llresearch.org" target="_blank" rel="noopener">llresearch.org</a></p>
                    <p class="footer-copyright">© ${ui.footerCopyright || 'Content derived from L/L Research material'}</p>
                </div>
            </footer>`;
}

/**
 * Generate external JS content for chapter/about pages
 */
/**
 * Copy JS source files to dist/js/
 * Source of truth: src/js/
 */
function copyJsFiles(jsDir) {
  const srcDir = path.join(__dirname, '..', 'src', 'js');
  const files = ['theme.js', 'eluno.js', 'search.js', 'glossary-page.js'];
  files.forEach(file => {
    fs.copyFileSync(path.join(srcDir, file), path.join(jsDir, file));
    console.log(`  ✓ js/${file}`);
  });
}

/**
 * Generate script tags for chapter/about pages
 */
function generateScripts() {
  return `    <script src="/js/eluno.js?v=${BUILD_HASH}"></script>`;
}

/**
 * Generate full chapter HTML
 */
function generateChapterHtml(chapter, lang, glossary, references, provenance, allChapters, chapterSlugMap, media) {
  const ui = CONFIG.ui[lang] || CONFIG.ui.en;
  const bookTitle = CONFIG.bookTitles[lang];
  const slug = slugify(chapter.title);

  // Sections
  const sectionsHtml = chapter.sections
    .map((section, idx) => renderSection(section, glossary, references, provenance, lang, chapter.number, idx + 1))
    .join('\n');

  // First paragraph for meta description (resolve terms to plain text)
  const firstParagraph = chapter.sections[0]?.content[0]?.text || '';
  const metaDescription = cleanTextForMeta(firstParagraph, glossary)
    .substring(0, 160);

  // Generate components
  const navSidebar = generateNavSidebar(chapter, allChapters, lang, ui, chapterSlugMap);
  const notesSidebar = generateContextSidebar(chapter, glossary, provenance, lang, ui);
  const chapterPrevNext = generateChapterPrevNext(chapter, allChapters, lang, ui);
  const footer = generateFooter(ui, lang);
  const scripts = generateScripts();

  return `<!DOCTYPE html>
<html lang="${lang}" dir="ltr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${chapter.title} — ${bookTitle}</title>
    <meta name="description" content="${metaDescription}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${CONFIG.siteUrl}/${lang}/chapters/${slug}.html">

    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    ${gaPreconnect()}

    <!-- OpenGraph -->
    <meta property="og:title" content="${chapter.title} — ${bookTitle}">
    <meta property="og:description" content="${metaDescription}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="${CONFIG.siteUrl}/${lang}/chapters/${slug}.html">
    <meta property="og:locale" content="${lang}">

    <!-- Alternate languages -->
    ${CONFIG.languages
      .filter(l => chapterSlugMap[l] && chapterSlugMap[l][chapter.number])
      .map(l => `<link rel="alternate" hreflang="${l}" href="${CONFIG.siteUrl}/${l}/chapters/${chapterSlugMap[l][chapter.number]}.html">`)
      .join('\n    ')}

    <link rel="preload" href="/fonts/cormorant-garamond-400.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="/fonts/spectral-400.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="stylesheet" href="/fonts/fonts.css?v=${BUILD_HASH}">
    <link rel="stylesheet" href="/css/main.css?v=${BUILD_HASH}">

    ${gaScript()}
    <script src="/js/theme.js?v=${BUILD_HASH}"></script>
</head>
<body>
    <a href="#main-content" class="skip-link">${ui.skipToContent}</a>
    <button class="toggle nav-toggle" data-action="toggle-nav" aria-expanded="false">☰ ${ui.home}</button>
    <button class="toggle notes-toggle" data-action="toggle-notes" aria-expanded="false">${ui.glossary}</button>
    <button class="toggle theme-toggle" data-action="toggle-theme" aria-label="${ui.ariaToggleTheme}">☀</button>
    <div class="overlay" id="overlay" data-action="close-all" role="button" tabindex="-1" aria-label="${ui.closeMenu}"></div>

    <div class="layout">
        <main class="main" id="main-content">
            <article class="chapter" id="${chapter.id}">
                <header class="ch-head">
                    <div class="ch-head-top">
                        <div class="ch-num">${chapter.numberText}</div>
${generateMediaToolbar(chapter.number, media, ui)}
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
function generateIndexHtml(lang, chapters, media) {
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
      const ariaLabel = { en: 'English', es: 'Español', pt: 'Português' }[l];
      return `<a href="/${l}/"${isActive} onclick="localStorage.setItem('lang','${l}')" aria-label="${ariaLabel}">${langName}</a>`;
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
  <title>${bookTitle} | ${CONFIG.siteDomain}</title>
  <meta name="description" content="${ui.subtitle}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${CONFIG.siteUrl}/${lang}/">

  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  ${gaPreconnect()}

  <!-- OpenGraph -->
  <meta property="og:title" content="${bookTitle}">
  <meta property="og:description" content="${ui.subtitle}">
  <meta property="og:type" content="book">
  <meta property="og:url" content="${CONFIG.siteUrl}/${lang}/">
  <meta property="og:locale" content="${lang}">

  <!-- Alternate languages -->
  ${CONFIG.languages.map(l => `<link rel="alternate" hreflang="${l}" href="${CONFIG.siteUrl}/${l}/">`).join('\n  ')}

  <link rel="preload" href="/fonts/cormorant-garamond-400.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/spectral-400.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/fonts/fonts.css?v=${BUILD_HASH}">
  <link rel="stylesheet" href="/css/main.css?v=${BUILD_HASH}">

  ${gaScript()}
  <script src="/js/theme.js?v=${BUILD_HASH}"></script>
</head>
<body>
  <a href="#main-content" class="skip-link">${ui.skipToContent}</a>
  <button class="toggle theme-toggle" data-action="toggle-theme" aria-label="${ui.ariaToggleTheme}">☀</button>

  <div class="layout index-layout">
    <main class="main" id="main-content">
      <header class="toc-header">
        <div class="toc-lang-selector">${langSwitcher}</div>
        <h1 class="toc-title">${bookTitle}</h1>
        <p class="toc-subtitle">${ui.subtitle}</p>
      </header>

      <section class="introduction">
        <p class="intro-text">${ui.intro}</p>
${generateHomepageMediaToolbar(media, ui)}
      </section>

      <div class="search-box" id="search-wrap" data-no-results="${ui.searchNoResults}" data-label-chapter="${ui.chapter}" data-label-glossary="${ui.glossary}">
        <input type="text" class="search-input" placeholder="${ui.searchPlaceholder}" id="site-search" autocomplete="off">
        <div class="search-results" id="search-results" hidden></div>
      </div>

      <section class="disclaimer-banner">
        <h2 class="disclaimer-title">${ui.disclaimerTitle}</h2>
${disclaimerHtml}
      </section>

      <section class="toc-section">
        <h2 class="toc-section-title">${ui.tableOfContents}</h2>
        <div class="toc-chapters">
${tocHtml}
        </div>
      </section>

      <footer class="footer-attribution">
        <div class="footer-links">
          <a href="/${lang}/about.html">${ui.about}</a>
          <span>·</span>
          <a href="/${lang}/glossary.html">${ui.glossaryPage}</a>${CONFIG.githubRepo ? `
          <span>·</span>
          <a href="${CONFIG.githubRepo}" target="_blank" rel="noopener">GitHub</a>` : ''}
        </div>
        <p>${ui.footerAttribution}</p>
        <p>${ui.footerSessions} <a href="https://www.llresearch.org" target="_blank" rel="noopener">llresearch.org</a></p>
        <p class="footer-copyright">&copy; ${ui.footerCopyright}</p>
      </footer>
    </main>
  </div>

  <script src="/js/eluno.js?v=${BUILD_HASH}" defer></script>
  <script src="/js/search.js?v=${BUILD_HASH}" defer></script>
</body>
</html>`;
}

/**
 * Generate about page for a language
 */
function generateAboutHtml(lang, about, allChapters, chapterSlugMap) {
  const ui = CONFIG.ui[lang] || CONFIG.ui.en;
  const bookTitle = CONFIG.bookTitles[lang];

  // Sections with dividers between them (same structure as V1)
  const sectionsHtml = about.sections
    .map((section, idx) => {
      let html = `                <section class="section" id="${section.id}">\n`;
      html += `                    <h2 class="sec-title">${section.title || ''}</h2>\n`;
      section.content.forEach(block => {
        if (block.type === 'paragraph') {
          html += `                    <p>${block.text}</p>\n`;
        }
      });
      html += `                </section>`;
      if (idx < about.sections.length - 1) {
        html += `\n\n                <div class="divider">· · ·</div>\n`;
      }
      return html;
    })
    .join('\n');

  // Nav sidebar (reuse chapter nav with about highlighted)
  const langSelector = CONFIG.languages
    .map((l, i) => {
      const active = l === lang ? ' class="active"' : '';
      const prefix = i > 0 ? ' | ' : '';
      const ariaLabel = { en: 'English', es: 'Español', pt: 'Português' }[l];
      return `${prefix}<a href="/${l}/about.html"${active} onclick="localStorage.setItem('lang','${l}')" aria-label="${ariaLabel}">${l.toUpperCase()}</a>`;
    })
    .join('');

  const chapterLinks = allChapters
    .map(ch => {
      const slug = slugify(ch.title);
      return `            <div class="nav-chapter-group" id="nav-group-${ch.id}">
                <div class="nav-chapter-header">
                    <a href="/${lang}/chapters/${slug}.html" class="nav-link">${ch.number}. ${ch.title}</a>
                </div>
            </div>\n`;
    })
    .join('');

  const navSidebar = `        <nav class="nav" id="sidebar">
            <div class="nav-lang-selector">${langSelector}</div>
            <div class="nav-back">
                <a href="/${lang}/" class="nav-link">← ${ui.home}</a>
            </div>
            <div class="nav-section">
${chapterLinks}            </div>
            <div class="nav-back nav-back--footer">
                <a href="/${lang}/glossary.html" class="nav-link">${ui.glossaryPage}</a>
                <a href="/${lang}/about.html" class="nav-link current">${ui.about}</a>
            </div>
        </nav>`;

  const footer = generateFooter(ui, lang);
  const scripts = generateScripts();

  return `<!DOCTYPE html>
<html lang="${lang}" dir="ltr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${about.title} — ${bookTitle} | ${CONFIG.siteDomain}</title>
    <meta name="description" content="${about.sections[0]?.content[0]?.text?.replace(/<[^>]*>/g, '').substring(0, 160) || ''}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${CONFIG.siteUrl}/${lang}/about.html">

    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    ${gaPreconnect()}

    <!-- OpenGraph -->
    <meta property="og:title" content="${about.title} — ${bookTitle}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${CONFIG.siteUrl}/${lang}/about.html">
    <meta property="og:locale" content="${lang}">

    <!-- Alternate languages -->
    ${CONFIG.languages.map(l => `<link rel="alternate" hreflang="${l}" href="${CONFIG.siteUrl}/${l}/about.html">`).join('\n    ')}

    <link rel="preload" href="/fonts/cormorant-garamond-400.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="/fonts/spectral-400.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="stylesheet" href="/fonts/fonts.css?v=${BUILD_HASH}">
    <link rel="stylesheet" href="/css/main.css?v=${BUILD_HASH}">

    ${gaScript()}
    <script src="/js/theme.js?v=${BUILD_HASH}"></script>
</head>
<body>
    <a href="#main-content" class="skip-link">${ui.skipToContent}</a>
    <button class="toggle nav-toggle" data-action="toggle-nav" aria-expanded="false">☰ ${ui.home}</button>
    <button class="toggle theme-toggle" data-action="toggle-theme" aria-label="${ui.ariaToggleTheme}">☀</button>
    <div class="overlay" id="overlay" data-action="close-all" role="button" tabindex="-1" aria-label="${ui.closeMenu}"></div>

    <div class="layout">
        <main class="main" id="main-content">
            <article class="chapter about-page">
                <header class="ch-head">
                    <h1 class="ch-title">${about.title}</h1>
                </header>

${sectionsHtml}
            </article>

${footer}
        </main>

${navSidebar}
    </div>

${scripts}
</body>
</html>`;
}

/**
 * Generate glossary page for a language
 */
function generateGlossaryHtml(lang, glossary, glossaryMeta, allChapters, chapterSlugMap) {
  const ui = CONFIG.ui[lang] || CONFIG.ui.en;
  const bookTitle = CONFIG.bookTitles[lang];
  const categories = glossaryMeta.categories || {};
  const termCategories = glossaryMeta.terms || {};

  // Sort terms alphabetically by title
  const sortedTerms = Object.entries(glossary)
    .sort(([, a], [, b]) => a.title.localeCompare(b.title, lang));

  // Group by first letter and assign sequential numbers
  const grouped = {};
  const termNumberMap = {};
  for (const [key, term] of sortedTerms) {
    const letter = term.title.charAt(0).toUpperCase();
    if (!grouped[letter]) grouped[letter] = [];
    const num = grouped[letter].length + 1;
    const numberId = `${letter.toLowerCase()}-${num}`;
    const catKey = termCategories[key] || 'uncategorized';
    termNumberMap[key] = { letter, num, id: numberId, category: catKey };
    grouped[letter].push({ key, ...term, numberLabel: `${letter}.${num}`, numberId, category: catKey });
  }

  // Build category groups
  const categoryGroups = {};
  for (const [key, term] of sortedTerms) {
    const catKey = termCategories[key] || 'uncategorized';
    if (!categoryGroups[catKey]) categoryGroups[catKey] = [];
    const info = termNumberMap[key];
    categoryGroups[catKey].push({ key, ...term, numberLabel: `${info.letter}.${info.num}`, numberId: info.id, category: catKey });
  }
  const catOrder = Object.keys(categories);
  const sortedCatKeys = [
    ...catOrder.filter(k => categoryGroups[k]),
    ...(categoryGroups['uncategorized'] ? ['uncategorized'] : [])
  ];

  // Helper: get category label for current language
  function catLabel(catKey) {
    const def = categories[catKey];
    return def ? (def[lang] || def.en) : ui.glossaryUncategorized;
  }

  // Helper: render content paragraphs
  function renderContent(content) {
    if (Array.isArray(content)) {
      return content.map(p => {
        let processed = p.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        processed = processed.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        return `                        <p>${processed}</p>`;
      }).join('\n');
    }
    return `                        <p>${content}</p>`;
  }

  // Helper: render a single term entry (used in both views)
  // useId: true for A-Z view (assigns id attributes), false for category view (uses data-* only)
  function renderTermEntry(term, useId) {
    const idAttr = useId ? ` id="${term.numberId}"` : '';
    const titleIdAttr = useId ? ` id="term-${term.key}"` : '';
    return `                    <div class="glossary-entry"${idAttr} data-term="${term.key}" data-category="${term.category}">
                        <div class="glossary-entry-header">
                            <span class="glossary-number" aria-label="Reference ${term.numberLabel}">${term.numberLabel}</span>
                            <h3 class="glossary-term-title"${titleIdAttr}>${term.title}</h3>
                            <span class="glossary-cat-tag" role="button" tabindex="0" data-cat="${term.category}">${catLabel(term.category)}</span>
                        </div>
${renderContent(term.content)}
                    </div>`;
  }

  // Build A-Z letter index
  const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const letterIndex = allLetters.map(l => {
    if (grouped[l]) {
      return `<a href="#letter-${l.toLowerCase()}" class="glossary-index-letter">${l}</a>`;
    }
    return `<span class="glossary-index-letter disabled">${l}</span>`;
  }).join('');

  // Build A-Z entries
  const azEntriesHtml = Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([letter, terms]) => {
      const termsHtml = terms.map(t => renderTermEntry(t, true)).join('\n');
      return `                <section class="glossary-letter" id="letter-${letter.toLowerCase()}">
                    <h2 class="glossary-letter-heading">${letter}</h2>
${termsHtml}
                </section>`;
    })
    .join('\n\n');

  // Build category nav buttons
  const catNavButtons = sortedCatKeys.map(ck =>
    `<a href="#cat-${ck}" class="glossary-cat-nav-btn">${catLabel(ck)}</a>`
  ).join('');

  // Build category entries
  const catEntriesHtml = sortedCatKeys.map(ck => {
    const termsHtml = categoryGroups[ck].map(t => renderTermEntry(t, false)).join('\n');
    return `                <section class="glossary-category" id="cat-${ck}">
                    <h2 class="glossary-letter-heading">${catLabel(ck)}</h2>
${termsHtml}
                </section>`;
  }).join('\n\n');

  // Language selector
  const langSelector = CONFIG.languages
    .map((l, i) => {
      const active = l === lang ? ' class="active"' : '';
      const prefix = i > 0 ? ' | ' : '';
      const ariaLabel = { en: 'English', es: 'Español', pt: 'Português' }[l];
      return `${prefix}<a href="/${l}/glossary.html"${active} onclick="localStorage.setItem('lang','${l}')" aria-label="${ariaLabel}">${l.toUpperCase()}</a>`;
    })
    .join('');

  // Chapter links for nav
  const chapterLinks = allChapters
    .map(ch => {
      const slug = slugify(ch.title);
      return `            <div class="nav-chapter-group" id="nav-group-${ch.id}">
                <div class="nav-chapter-header">
                    <a href="/${lang}/chapters/${slug}.html" class="nav-link">${ch.number}. ${ch.title}</a>
                </div>
            </div>\n`;
    })
    .join('');

  const navSidebar = `        <nav class="nav" id="sidebar">
            <div class="nav-lang-selector">${langSelector}</div>
            <div class="nav-back">
                <a href="/${lang}/" class="nav-link">\u2190 ${ui.home}</a>
            </div>
            <div class="nav-section">
${chapterLinks}            </div>
            <div class="nav-back nav-back--footer">
                <a href="/${lang}/glossary.html" class="nav-link current">${ui.glossaryPage}</a>
                <a href="/${lang}/about.html" class="nav-link">${ui.about}</a>
            </div>
        </nav>`;

  const footer = generateFooter(ui, lang);
  const scripts = generateScripts();

  const filterJs = `\n    <script src="/js/glossary-page.js?v=${BUILD_HASH}" defer></script>`;

  return `<!DOCTYPE html>
<html lang="${lang}" dir="ltr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${ui.glossaryPage} \u2014 ${bookTitle} | ${CONFIG.siteDomain}</title>
    <meta name="description" content="${ui.glossaryPageSubtitle}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${CONFIG.siteUrl}/${lang}/glossary.html">

    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    ${gaPreconnect()}

    <!-- OpenGraph -->
    <meta property="og:title" content="${ui.glossaryPage} \u2014 ${bookTitle}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${CONFIG.siteUrl}/${lang}/glossary.html">
    <meta property="og:locale" content="${lang}">

    <!-- Alternate languages -->
    ${CONFIG.languages.map(l => `<link rel="alternate" hreflang="${l}" href="${CONFIG.siteUrl}/${l}/glossary.html">`).join('\n    ')}

    <link rel="preload" href="/fonts/cormorant-garamond-400.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="/fonts/spectral-400.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="stylesheet" href="/fonts/fonts.css?v=${BUILD_HASH}">
    <link rel="stylesheet" href="/css/main.css?v=${BUILD_HASH}">

    ${gaScript()}
    <script src="/js/theme.js?v=${BUILD_HASH}"></script>

</head>
<body>
    <a href="#main-content" class="skip-link">${ui.skipToContent}</a>
    <button class="toggle nav-toggle" data-action="toggle-nav" aria-expanded="false">\u2630 ${ui.home}</button>
    <button class="toggle theme-toggle" data-action="toggle-theme" aria-label="${ui.ariaToggleTheme}">\u2600</button>
    <div class="overlay" id="overlay" data-action="close-all" role="button" tabindex="-1" aria-label="${ui.closeMenu}"></div>

    <div class="layout">
        <main class="main" id="main-content">
            <article class="chapter glossary-page">
                <header class="ch-head">
                    <h1 class="ch-title">${ui.glossaryPage}</h1>
                    <p class="glossary-subtitle">${ui.glossaryPageSubtitle} (${sortedTerms.length})</p>
                    <input type="text" class="glossary-filter" placeholder="${ui.searchPlaceholder}" id="glossary-filter">
                </header>

                <div class="glossary-view-toggle" role="tablist" aria-label="View mode">
                    <button class="glossary-view-btn active" role="tab" aria-selected="true" data-view="az">${ui.glossaryAlphabetical}</button>
                    <button class="glossary-view-btn" role="tab" aria-selected="false" data-view="categories">${ui.glossaryCategories}</button>
                </div>

                <div class="glossary-view glossary-view-az">
                <nav class="glossary-index" aria-label="Alphabetical index">${letterIndex}</nav>

${azEntriesHtml}
                </div>

                <div class="glossary-view glossary-view-cat">
                <nav class="glossary-index glossary-cat-nav" aria-label="Category navigation">${catNavButtons}</nav>

${catEntriesHtml}
                </div>
            </article>

${footer}
        </main>

${navSidebar}
    </div>

${scripts}
${filterJs}
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
 * Load glossary metadata (categories, term→category mapping)
 */
function loadGlossaryMeta() {
  const filePath = path.join(CONFIG.inputDir, 'glossary-meta.json');
  if (!fs.existsSync(filePath)) {
    console.warn('  ⚠ glossary-meta.json not found, categories disabled');
    return { categories: {}, terms: {} };
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
function buildLanguage(lang, chapterSlugMap, glossaryMeta) {
  console.log(`\n📖 Building ${lang.toUpperCase()}...`);

  const chapters = loadChapters(lang);
  const glossary = loadGlossary(lang);
  const references = loadReferences(lang);
  const media = loadMedia(lang);

  console.log(`  Found ${chapters.length} chapters`);
  console.log(`  Found ${Object.keys(glossary).length} glossary terms`);
  console.log(`  Media: ${media ? 'found' : 'none'}`);

  // Create output directories
  const langDir = path.join(CONFIG.outputDir, lang);
  const chaptersDir = path.join(langDir, 'chapters');
  ensureDir(chaptersDir);

  // Build each chapter
  chapters.forEach(chapter => {
    const provenance = loadProvenance(chapter.number);
    const html = generateChapterHtml(chapter, lang, glossary, references, provenance, chapters, chapterSlugMap, media);

    const slug = slugify(chapter.title);
    const outputPath = path.join(chaptersDir, `${slug}.html`);
    fs.writeFileSync(outputPath, html);

    const provenanceStatus = provenance ? '✓' : '○';
    console.log(`  ${provenanceStatus} Chapter ${chapter.number}: ${slug}.html`);
  });

  // Build index page
  const indexHtml = generateIndexHtml(lang, chapters, media);
  fs.writeFileSync(path.join(langDir, 'index.html'), indexHtml);
  console.log(`  ✓ index.html`);

  // Build about page
  const aboutPath = path.join(CONFIG.inputDir, lang, 'about.json');
  if (fs.existsSync(aboutPath)) {
    const about = JSON.parse(fs.readFileSync(aboutPath, 'utf-8'));
    const aboutHtml = generateAboutHtml(lang, about, chapters, chapterSlugMap);
    fs.writeFileSync(path.join(langDir, 'about.html'), aboutHtml);
    console.log(`  ✓ about.html`);
  }

  // Build glossary page
  const glossaryHtml = generateGlossaryHtml(lang, glossary, glossaryMeta, chapters, chapterSlugMap);
  fs.writeFileSync(path.join(langDir, 'glossary.html'), glossaryHtml);
  console.log(`  ✓ glossary.html (${Object.keys(glossary).length} terms)`);
}

/**
 * Generate search index JSON for a language
 */
function generateSearchIndex(lang, chapters, glossary, glossaryMeta) {
  const ui = CONFIG.ui[lang] || CONFIG.ui.en;
  const index = [];

  // Index chapters by section
  for (const chapter of chapters) {
    const slug = slugify(chapter.title);
    // Add chapter-level entry
    const firstText = chapter.sections[0]?.content[0]?.text || '';
    const cleanFirst = firstText.replace(/<[^>]*>/g, '').replace(/\{[^}]+\}/g, '').substring(0, 200);
    index.push({
      type: 'chapter',
      title: `${chapter.numberText}: ${chapter.title}`,
      text: cleanFirst,
      url: `/${lang}/chapters/${slug}.html`
    });

    // Add each section
    for (const section of chapter.sections) {
      const sectionText = section.content
        .filter(b => b.type === 'paragraph')
        .map(b => b.text.replace(/<[^>]*>/g, '').replace(/\{[^}]+\}/g, ''))
        .join(' ')
        .substring(0, 200);
      index.push({
        type: 'section',
        title: `${chapter.numberText} — ${section.title}`,
        text: sectionText,
        url: `/${lang}/chapters/${slug}.html#${section.id}`
      });
    }
  }

  // Index glossary terms with numbered anchors
  // Build numbering map (same logic as generateGlossaryHtml)
  const sorted = Object.entries(glossary).sort((a, b) =>
    a[1].title.localeCompare(b[1].title, lang)
  );
  const numberMap = {};
  const letterCount = {};
  for (const [key, term] of sorted) {
    const letter = term.title.charAt(0).toUpperCase();
    letterCount[letter] = (letterCount[letter] || 0) + 1;
    numberMap[key] = `${letter}.${letterCount[letter]}`;
  }

  const termCategories = glossaryMeta ? glossaryMeta.terms || {} : {};
  const categoryDefs = glossaryMeta ? glossaryMeta.categories || {} : {};

  for (const [key, term] of sorted) {
    const contentText = Array.isArray(term.content)
      ? term.content.join(' ').substring(0, 200)
      : String(term.content).substring(0, 200);
    const num = numberMap[key];
    const anchor = num.toLowerCase().replace('.', '-');
    const catKey = termCategories[key];
    const category = catKey && categoryDefs[catKey] ? categoryDefs[catKey][lang] || categoryDefs[catKey].en || '' : '';
    index.push({
      type: 'glossary',
      title: `${num} ${term.title}`,
      text: contentText,
      url: `/${lang}/glossary.html#${anchor}`,
      category
    });
  }

  return index;
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
 * Generate sitemap.xml with hreflang alternates
 */
function generateSitemap(chapterSlugMap) {
  const today = new Date().toISOString().split('T')[0];

  let urls = '';

  // Index pages
  for (const lang of CONFIG.languages) {
    const loc = `${CONFIG.siteUrl}/${lang}/`;
    const alternates = CONFIG.languages
      .map(l => `    <xhtml:link rel="alternate" hreflang="${l}" href="${CONFIG.siteUrl}/${l}/"/>`)
      .join('\n');
    urls += `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>1.0</priority>\n${alternates}\n  </url>\n`;
  }

  // About pages
  for (const lang of CONFIG.languages) {
    const loc = `${CONFIG.siteUrl}/${lang}/about.html`;
    const alternates = CONFIG.languages
      .map(l => `    <xhtml:link rel="alternate" hreflang="${l}" href="${CONFIG.siteUrl}/${l}/about.html"/>`)
      .join('\n');
    urls += `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.5</priority>\n${alternates}\n  </url>\n`;
  }

  // Glossary pages
  for (const lang of CONFIG.languages) {
    const loc = `${CONFIG.siteUrl}/${lang}/glossary.html`;
    const alternates = CONFIG.languages
      .map(l => `    <xhtml:link rel="alternate" hreflang="${l}" href="${CONFIG.siteUrl}/${l}/glossary.html"/>`)
      .join('\n');
    urls += `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n${alternates}\n  </url>\n`;
  }

  // Chapter pages
  for (const chNum of CONFIG.enabledChapters) {
    for (const lang of CONFIG.languages) {
      const slug = chapterSlugMap[lang]?.[chNum];
      if (!slug) continue;
      const loc = `${CONFIG.siteUrl}/${lang}/chapters/${slug}.html`;
      const alternates = CONFIG.languages
        .filter(l => chapterSlugMap[l]?.[chNum])
        .map(l => `    <xhtml:link rel="alternate" hreflang="${l}" href="${CONFIG.siteUrl}/${l}/chapters/${chapterSlugMap[l][chNum]}.html"/>`)
        .join('\n');
      urls += `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n${alternates}\n  </url>\n`;
    }
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}</urlset>`;

  const outPath = path.join(CONFIG.outputDir, 'sitemap.xml');
  fs.writeFileSync(outPath, sitemap, 'utf-8');
  const urlCount = (sitemap.match(/<url>/g) || []).length;
  console.log(`  ✅ sitemap.xml (${urlCount} URLs)`);
}

/**
 * Generate robots.txt
 */
function generateRobotsTxt() {
  const content = `User-agent: *
Allow: /

Sitemap: ${CONFIG.siteUrl}/sitemap.xml
`;
  const outPath = path.join(CONFIG.outputDir, 'robots.txt');
  fs.writeFileSync(outPath, content, 'utf-8');
  console.log('  ✅ robots.txt');
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
  const glossaryMeta = loadGlossaryMeta();

  // Ensure output directory
  ensureDir(CONFIG.outputDir);

  // Build each language
  languagesToBuild.forEach(lang => buildLanguage(lang, chapterSlugMap, glossaryMeta));

  // Create shared assets
  console.log('\n📦 Creating shared assets...');
  const jsDir = path.join(CONFIG.outputDir, 'js');
  ensureDir(jsDir);
  copyJsFiles(jsDir);

  // Generate search indices per language
  console.log('\n🔍 Generating search indices...');
  for (const lang of languagesToBuild) {
    const chapters = loadChapters(lang);
    const glossary = loadGlossary(lang);
    const searchIndex = generateSearchIndex(lang, chapters, glossary, glossaryMeta);
    const langDir = path.join(CONFIG.outputDir, lang);
    ensureDir(langDir);
    fs.writeFileSync(path.join(langDir, 'search-index.json'), JSON.stringify(searchIndex));
    console.log(`  ✓ ${lang}/search-index.json (${searchIndex.length} entries)`);
  }

  // Copy fonts from @eluno/core
  const coreFontsDir = path.join(__dirname, '../node_modules/@eluno/core/fonts');
  const distFontsDir = path.join(CONFIG.outputDir, 'fonts');
  if (fs.existsSync(coreFontsDir)) {
    ensureDir(distFontsDir);
    fs.readdirSync(coreFontsDir).forEach(file => {
      fs.copyFileSync(path.join(coreFontsDir, file), path.join(distFontsDir, file));
    });
    console.log('  ✅ fonts/ (from @eluno/core)');
  }

  // Generate root index.html with language detection
  const rootIndexPath = path.join(CONFIG.outputDir, 'index.html');
  const enIndexPath = path.join(CONFIG.outputDir, 'en', 'index.html');
  if (fs.existsSync(enIndexPath)) {
    let rootHtml = fs.readFileSync(enIndexPath, 'utf8');
    // Inject language detection script right after <head> — runs before paint
    const langDetectScript = `<script>(function(){var s=localStorage.getItem('lang');if(s&&s!=='en'&&['es','pt'].indexOf(s)!==-1){location.replace('/'+s+'/');return}if(!s){var l=(navigator.languages||[navigator.language]);for(var i=0;i<l.length;i++){var c=l[i].substring(0,2).toLowerCase();if(c==='es'||c==='pt'){localStorage.setItem('lang',c);location.replace('/'+c+'/');return}if(c==='en')break}localStorage.setItem('lang','en')}})()</script>`;
    rootHtml = rootHtml.replace('<head>', '<head>\n' + langDetectScript);
    fs.writeFileSync(rootIndexPath, rootHtml);
    console.log('  ✅ index.html (root, EN + lang detection)');
  }

  // Generate SEO files
  generateSitemap(chapterSlugMap);
  generateRobotsTxt();

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

// Run build (only when executed directly, not when required for testing)
if (require.main === module) {
  build();
}

// Exports for testing
module.exports = { parseTerms, parseRefs, slugify, cleanTextForMeta };
