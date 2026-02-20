#!/usr/bin/env node
/**
 * alpha-postbuild.js — Post-build script for alpha.eluno.org
 *
 * Run after `npm run build` on the main branch to:
 * 1. Remove noindex meta tags
 * 2. Inject disclaimer banner with link to V3 equivalent
 * 3. Replace canonical URLs to point to V3 (eluno.org)
 */

const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, '../dist');
const V3_BASE = 'https://eluno.org';

// V1 chapter number → V3 slug mapping (all 16 chapters)
const SLUG_MAP = {
  en: {
    1: 'cosmology-and-genesis',
    2: 'the-creator-and-creation',
    3: 'the-densities-of-consciousness',
    4: 'earth-s-spiritual-history',
    5: 'polarity-the-two-paths',
    6: 'wanderers-those-who-return',
    7: 'the-harvest',
    8: 'the-veil-of-forgetting',
    9: 'death-and-the-journey-between-lives',
    10: 'the-energy-centers',
    11: 'catalyst-and-experience',
    12: 'the-higher-self-and-guidance',
    13: 'free-will-and-the-law-of-confusion',
    14: 'the-path-of-the-seeker',
    15: 'balancing-and-healing',
    16: 'the-mystery-remains',
  },
  es: {
    1: 'cosmologia-y-genesis',
    2: 'el-creador-y-la-creacion',
    3: 'las-densidades-de-conciencia',
    4: 'historia-espiritual-de-la-tierra',
    5: 'polaridad-los-dos-caminos',
    6: 'errantes-los-que-regresan',
    7: 'la-cosecha',
    8: 'el-velo-del-olvido',
    9: 'la-muerte-y-el-viaje-entre-vidas',
    10: 'los-centros-de-energia',
    11: 'catalizador-y-experiencia',
    12: 'el-yo-superior-y-la-guia',
    13: 'el-libre-albedrio-y-la-ley-de-la-confusion',
    14: 'el-camino-del-buscador',
    15: 'equilibrio-y-sanacion',
    16: 'el-misterio-permanece',
  },
  pt: {
    1: 'cosmologia-e-genese',
    2: 'o-criador-e-a-criacao',
    3: 'as-densidades-de-consciencia',
    4: 'historia-espiritual-da-terra',
    5: 'polaridade-os-dois-caminhos',
    6: 'errantes-os-que-retornam',
    7: 'a-colheita',
    8: 'o-veu-do-esquecimento',
    9: 'a-morte-e-a-jornada-entre-vidas',
    10: 'os-centros-de-energia',
    11: 'catalisador-e-experiencia',
    12: 'o-eu-superior-e-a-orientacao',
    13: 'o-livre-arbitrio-e-a-lei-da-confusao',
    14: 'a-colheita-e-a-transicao',
    15: 'equilibrio-e-cura',
    16: 'o-misterio-permanece',
  },
};

// Disclaimer messages by language
const DISCLAIMERS = {
  en: (v3Url) =>
    `<div style="background:#1a1a2e;border:1px solid #e6c200;border-radius:8px;padding:16px 20px;margin:16px auto;max-width:720px;font-family:system-ui,sans-serif;font-size:14px;line-height:1.6;color:#e0d9c8;text-align:center;">` +
    `<strong style="color:#e6c200;">Alpha Version</strong><br>` +
    `This is the alpha version of The One, written on December 25, 2025.<br>` +
    `We recommend reading the latest revised edition at: <a href="${v3Url}" style="color:#7eb8da;text-decoration:underline;">${v3Url}</a>` +
    `</div>`,
  es: (v3Url) =>
    `<div style="background:#1a1a2e;border:1px solid #e6c200;border-radius:8px;padding:16px 20px;margin:16px auto;max-width:720px;font-family:system-ui,sans-serif;font-size:14px;line-height:1.6;color:#e0d9c8;text-align:center;">` +
    `<strong style="color:#e6c200;">Versión Alpha</strong><br>` +
    `Esta es la versión alpha de El Uno, escrita el 25 de diciembre de 2025.<br>` +
    `Se recomienda leer la última versión revisada en: <a href="${v3Url}" style="color:#7eb8da;text-decoration:underline;">${v3Url}</a>` +
    `</div>`,
  pt: (v3Url) =>
    `<div style="background:#1a1a2e;border:1px solid #e6c200;border-radius:8px;padding:16px 20px;margin:16px auto;max-width:720px;font-family:system-ui,sans-serif;font-size:14px;line-height:1.6;color:#e0d9c8;text-align:center;">` +
    `<strong style="color:#e6c200;">Versão Alpha</strong><br>` +
    `Esta é a versão alpha de O Um, escrita em 25 de dezembro de 2025.<br>` +
    `Recomendamos ler a última versão revisada em: <a href="${v3Url}" style="color:#7eb8da;text-decoration:underline;">${v3Url}</a>` +
    `</div>`,
};

/**
 * Detect language and page type from file path relative to dist/
 * Returns { lang, type, chapterNum } or null
 */
function detectPage(relPath) {
  // Normalize: remove trailing index.html
  const normalized = relPath.replace(/index\.html$/, '').replace(/\/$/, '');

  // EN root: "" or "index.html"
  if (normalized === '') {
    return { lang: 'en', type: 'index' };
  }

  // EN chapter: "ch5"
  const enChMatch = normalized.match(/^ch(\d+)$/);
  if (enChMatch) {
    return { lang: 'en', type: 'chapter', chapterNum: parseInt(enChMatch[1]) };
  }

  // EN about: "about"
  if (normalized === 'about') {
    return { lang: 'en', type: 'about' };
  }

  // Other languages: "es", "pt"
  const langMatch = normalized.match(/^(es|pt)$/);
  if (langMatch) {
    return { lang: langMatch[1], type: 'index' };
  }

  // Other language chapters: "es/ch5", "pt/ch12"
  const langChMatch = normalized.match(/^(es|pt)\/ch(\d+)$/);
  if (langChMatch) {
    return { lang: langChMatch[1], type: 'chapter', chapterNum: parseInt(langChMatch[2]) };
  }

  // Other language about: "es/about", "pt/about"
  const langAboutMatch = normalized.match(/^(es|pt)\/about$/);
  if (langAboutMatch) {
    return { lang: langAboutMatch[1], type: 'about' };
  }

  return null;
}

/**
 * Get V3 URL for a given page
 */
function getV3Url(page) {
  if (page.type === 'index' || page.type === 'about') {
    return `${V3_BASE}/${page.lang}/`;
  }

  if (page.type === 'chapter') {
    const slug = SLUG_MAP[page.lang]?.[page.chapterNum];
    if (slug) {
      return `${V3_BASE}/${page.lang}/chapters/${slug}.html`;
    }
  }

  return `${V3_BASE}/${page.lang}/`;
}

/**
 * Walk directory recursively and find all HTML files
 */
function findHtmlFiles(dir, base = dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findHtmlFiles(fullPath, base));
    } else if (entry.name.endsWith('.html')) {
      results.push({
        fullPath,
        relPath: path.relative(base, fullPath),
      });
    }
  }

  return results;
}

/**
 * Process a single HTML file
 */
function processFile(filePath, relPath) {
  const page = detectPage(relPath);
  if (!page) {
    console.log(`  ⏭  Skipping (unknown page): ${relPath}`);
    return;
  }

  let html = fs.readFileSync(filePath, 'utf-8');
  const v3Url = getV3Url(page);

  // 1. Remove noindex
  html = html.replace(
    /<meta\s+name="robots"\s+content="noindex,\s*nofollow"\s*\/?>/gi,
    '<meta name="robots" content="index, follow">',
  );

  // 2. Replace canonical URL to point to V3
  html = html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/gi,
    `<link rel="canonical" href="${v3Url}">`,
  );

  // 3. Inject disclaimer banner after <body> tag (before any content)
  const disclaimer = DISCLAIMERS[page.lang](v3Url);
  html = html.replace(/(<body[^>]*>)/, `$1\n${disclaimer}`);

  fs.writeFileSync(filePath, html, 'utf-8');
  console.log(`  ✅ ${relPath} → ${v3Url}`);
}

// Main
console.log('═══════════════════════════════════════════');
console.log(' alpha.eluno.org — Post-build processing');
console.log('═══════════════════════════════════════════\n');

if (!fs.existsSync(DIST_DIR)) {
  console.error('❌ dist/ directory not found. Run build first.');
  process.exit(1);
}

const htmlFiles = findHtmlFiles(DIST_DIR);
console.log(`Found ${htmlFiles.length} HTML files\n`);

let processed = 0;
for (const { fullPath, relPath } of htmlFiles) {
  processFile(fullPath, relPath);
  processed++;
}

console.log(`\n═══════════════════════════════════════════`);
console.log(` ✅ Processed ${processed} files`);
console.log('═══════════════════════════════════════════\n');
