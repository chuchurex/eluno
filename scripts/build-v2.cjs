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

// Cache buster: changes on each build so CDN serves fresh assets
const BUILD_HASH = Date.now().toString(36);

const CONFIG = {
  languages: ['en', 'es', 'pt'],
  baseLang: 'en',
  inputDir: path.join(__dirname, '../i18n'),
  outputDir: path.join(__dirname, '../dist'),
  provenanceDir: path.join(__dirname, '../i18n/provenance'),
  siteUrl: 'https://eluno.org',
  gaId: 'G-9LDPDW8V6E',

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
      notesEmpty: 'Click any <span style="color:var(--gold);border-bottom:1px dotted var(--gold-dim)">highlighted term</span> to see its definition.',
      about: 'About',
      skipToContent: 'Skip to content',
      closeMenu: 'Close menu'
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
      notesEmpty: 'Haz clic en cualquier <span style="color:var(--gold);border-bottom:1px dotted var(--gold-dim)">término destacado</span> para ver su definición.',
      about: 'Acerca de',
      skipToContent: 'Ir al contenido',
      closeMenu: 'Cerrar menú'
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
      notesEmpty: 'Clique em qualquer <span style="color:var(--gold);border-bottom:1px dotted var(--gold-dim)">termo destacado</span> para ver sua definição.',
      about: 'Sobre',
      skipToContent: 'Ir para o conteúdo',
      closeMenu: 'Fechar menu'
    }
  }
};

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
        html += `                    <button class="nav-chapter-toggle" onclick="toggleChapter('${ch.id}')" aria-label="${ui.ariaToggleSections}" aria-expanded="false">▾</button>\n`;
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
            <div class="nav-back" style="margin-top:1rem;border-top:1px solid rgba(255,255,255,0.1);padding-top:1rem;">
                <a href="/${lang}/about.html" class="nav-link">${ui.about}</a>
            </div>
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
    html += `                    <button class="ch-media-icon" onclick="toggleAudio('${chapterNum}')" title="${ui.listenAudio}" data-audio-btn="${chapterNum}">${MEDIA_SVG.audio}<span class="ch-media-label">MP3</span></button>\n`;
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
 * Generate external JS content for chapter/about pages
 */
function getElunoJsContent() {
  return `// Theme Management
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
        btn.innerHTML = theme === 'light' ? '\\u263E' : '\\u2600';
    });
}
initTheme();

// Navigation functions
function toggleNav(){
    var sidebar=document.getElementById('sidebar');
    var overlay=document.getElementById('overlay');
    var notes=document.getElementById('notes');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
    if(notes)notes.classList.remove('open');
    var navBtn=document.querySelector('.nav-toggle');
    var notesBtn=document.querySelector('.notes-toggle');
    var isOpen=sidebar.classList.contains('open');
    if(navBtn)navBtn.setAttribute('aria-expanded',isOpen);
    if(notesBtn)notesBtn.setAttribute('aria-expanded','false');
    if(isOpen){var first=sidebar.querySelector('a');if(first)first.focus();}
}
function toggleNotes(){
    var notes=document.getElementById('notes');
    var overlay=document.getElementById('overlay');
    var sidebar=document.getElementById('sidebar');
    notes.classList.toggle('open');
    overlay.classList.toggle('active');
    sidebar.classList.remove('open');
    var navBtn=document.querySelector('.nav-toggle');
    var notesBtn=document.querySelector('.notes-toggle');
    var isOpen=notes.classList.contains('open');
    if(notesBtn)notesBtn.setAttribute('aria-expanded',isOpen);
    if(navBtn)navBtn.setAttribute('aria-expanded','false');
    if(isOpen){var first=notes.querySelector('a, button');if(first)first.focus();}
}
function closeAll(){
    document.getElementById('sidebar').classList.remove('open');
    var notes=document.getElementById('notes');if(notes)notes.classList.remove('open');
    document.getElementById('overlay').classList.remove('active');
    var navBtn=document.querySelector('.nav-toggle');
    var notesBtn=document.querySelector('.notes-toggle');
    if(navBtn)navBtn.setAttribute('aria-expanded','false');
    if(notesBtn)notesBtn.setAttribute('aria-expanded','false');
}
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeAll();});
function toggleChapter(id){var g=document.getElementById('nav-group-'+id);if(!g)return;g.classList.toggle('expanded');var btn=g.querySelector('.nav-chapter-toggle');if(btn)btn.setAttribute('aria-expanded',g.classList.contains('expanded'));}

// Audio player toggle
function toggleAudio(num){
    var panel=document.getElementById('audio-panel-'+num);
    var btn=document.querySelector('[data-audio-btn="'+num+'"]');
    if(!panel)return;
    document.querySelectorAll('.ch-media-audio-panel').forEach(function(p){
        if(p.id!=='audio-panel-'+num){p.classList.remove('active');var a=p.querySelector('audio');if(a)a.pause()}
    });
    document.querySelectorAll('[data-audio-btn]').forEach(function(b){b.classList.remove('active')});
    panel.classList.toggle('active');
    if(panel.classList.contains('active')){
        if(btn)btn.classList.add('active');
        var audio=panel.querySelector('audio');
        if(audio&&audio.paused)audio.play().catch(function(){});
    } else {
        var audio=panel.querySelector('audio');
        if(audio)audio.pause();
    }
}

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
`;
}

/**
 * Generate external JS content for landing pages (theme only)
 */
function getThemeJsContent() {
  return `function initTheme() {
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
        btn.innerHTML = theme === 'light' ? '\\u263E' : '\\u2600';
    });
}
initTheme();
`;
}

/**
 * Write external JS files to dist/js/
 */
function writeExternalJs(jsDir) {
  fs.writeFileSync(path.join(jsDir, 'eluno.js'), getElunoJsContent());
  console.log('  ✓ js/eluno.js');
  fs.writeFileSync(path.join(jsDir, 'theme.js'), getThemeJsContent());
  console.log('  ✓ js/theme.js');
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
  const footer = generateFooter(ui);
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
    <link rel="dns-prefetch" href="https://www.googletagmanager.com">
    <link rel="preconnect" href="https://www.googletagmanager.com" crossorigin>

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

    <!-- Google tag (gtag.js) — deferred -->
    <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${CONFIG.gaId}');
    window.addEventListener('load',function(){var s=document.createElement('script');s.src='https://www.googletagmanager.com/gtag/js?id=${CONFIG.gaId}';s.async=true;document.head.appendChild(s)});</script>
</head>
<body>
    <a href="#main-content" class="skip-link">${ui.skipToContent}</a>
    <button class="toggle nav-toggle" onclick="toggleNav()" aria-expanded="false">☰ ${ui.home}</button>
    <button class="toggle notes-toggle" onclick="toggleNotes()" aria-expanded="false">${ui.glossary}</button>
    <button class="toggle theme-toggle" onclick="toggleTheme()" aria-label="${ui.ariaToggleTheme}">☀</button>
    <div class="overlay" id="overlay" onclick="closeAll()" role="button" tabindex="-1" aria-label="${ui.closeMenu}"></div>

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
  <title>${bookTitle} | eluno.org</title>
  <meta name="description" content="${ui.subtitle}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${CONFIG.siteUrl}/${lang}/">

  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="dns-prefetch" href="https://www.googletagmanager.com">
  <link rel="preconnect" href="https://www.googletagmanager.com" crossorigin>

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

  <!-- Google tag (gtag.js) — deferred -->
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${CONFIG.gaId}');
  window.addEventListener('load',function(){var s=document.createElement('script');s.src='https://www.googletagmanager.com/gtag/js?id=${CONFIG.gaId}';s.async=true;document.head.appendChild(s)});</script>
</head>
<body>
  <a href="#main-content" class="skip-link">${ui.skipToContent}</a>
  <button class="toggle theme-toggle" onclick="toggleTheme()" aria-label="${ui.ariaToggleTheme}">☀</button>

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
        <p>${ui.footerAttribution}</p>
        <p>${ui.footerSessions} <a href="https://www.llresearch.org" target="_blank" rel="noopener">llresearch.org</a></p>
        <p class="footer-copyright">&copy; ${ui.footerCopyright}</p>
      </footer>
    </main>
  </div>

  <script src="/js/theme.js?v=${BUILD_HASH}"></script>
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
            <div class="nav-back" style="margin-top:1rem;border-top:1px solid rgba(255,255,255,0.1);padding-top:1rem;">
                <a href="/${lang}/about.html" class="nav-link current">${ui.about}</a>
            </div>
        </nav>`;

  const footer = generateFooter(ui);
  const scripts = generateScripts();

  return `<!DOCTYPE html>
<html lang="${lang}" dir="ltr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${about.title} — ${bookTitle} | eluno.org</title>
    <meta name="description" content="${about.sections[0]?.content[0]?.text?.replace(/<[^>]*>/g, '').substring(0, 160) || ''}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${CONFIG.siteUrl}/${lang}/about.html">

    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="dns-prefetch" href="https://www.googletagmanager.com">
    <link rel="preconnect" href="https://www.googletagmanager.com" crossorigin>

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

    <!-- Google tag (gtag.js) — deferred -->
    <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${CONFIG.gaId}');
    window.addEventListener('load',function(){var s=document.createElement('script');s.src='https://www.googletagmanager.com/gtag/js?id=${CONFIG.gaId}';s.async=true;document.head.appendChild(s)});</script>
</head>
<body>
    <a href="#main-content" class="skip-link">${ui.skipToContent}</a>
    <button class="toggle nav-toggle" onclick="toggleNav()" aria-expanded="false">☰ ${ui.home}</button>
    <button class="toggle theme-toggle" onclick="toggleTheme()" aria-label="${ui.ariaToggleTheme}">☀</button>
    <div class="overlay" id="overlay" onclick="closeAll()" role="button" tabindex="-1" aria-label="${ui.closeMenu}"></div>

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

  // Ensure output directory
  ensureDir(CONFIG.outputDir);

  // Build each language
  languagesToBuild.forEach(lang => buildLanguage(lang, chapterSlugMap));

  // Create shared assets
  console.log('\n📦 Creating shared assets...');
  const jsDir = path.join(CONFIG.outputDir, 'js');
  ensureDir(jsDir);
  writeExternalJs(jsDir);
  createGlossaryScript();

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
