#!/usr/bin/env node

/**
 * =============================================================================
 * COVER IMAGE GENERATOR FOR ELUNO.ORG
 * =============================================================================
 *
 * IMPORTANT FOR AI AGENTS:
 * -------------------------
 * This script ALREADY EXISTS. Do NOT recreate it. Use this existing script
 * when the user asks to generate cover images, OG images, or album artwork.
 *
 * LOCATION: scripts/generate-covers.js
 *
 * USAGE:
 *   node scripts/generate-covers.js
 *
 * WHAT IT DOES:
 *   - Generates OG images (1200x630) for all 3 languages (ES, EN, PT)
 *   - Generates MP3 album covers (3000x3000) for complete audiobook + 16 chapters
 *
 * OUTPUT:
 *   /assets/covers/og/og-image-{lang}.png
 *   /assets/covers/mp3/cover-complete-es.png
 *   /assets/covers/mp3/cover-{01-16}-es.png
 *
 * REQUIREMENTS:
 *   npm install puppeteer
 *
 * =============================================================================
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const OUTPUT_DIR = path.join(__dirname, '..', 'assets', 'covers');
const HTML_FILE = path.join(__dirname, 'cover-generator.html');

// Crear directorios si no existen
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function generateCovers() {
  console.log('🚀 Iniciando generación de portadas...\n');

  // Crear directorios
  ensureDir(path.join(OUTPUT_DIR, 'og'));
  ensureDir(path.join(OUTPUT_DIR, 'mp3'));

  // Iniciar Puppeteer
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Cargar el HTML
  await page.goto(`file://${HTML_FILE}`, { waitUntil: 'networkidle0' });

  // Esperar a que cargue la fuente
  await page.waitForFunction(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 2000)); // Extra wait for fonts

  const languages = ['es', 'en', 'pt'];
  let total = 0;

  // ==================
  // 1. Generar OG Images (1200x630)
  // ==================
  console.log('📸 Generando OG Images (1200x630)...');

  for (const lang of languages) {
    await page.evaluate((l) => window.renderOG(l), lang);
    await new Promise(r => setTimeout(r, 500));

    const element = await page.$('#render-target');
    const outputPath = path.join(OUTPUT_DIR, 'og', `og-image-${lang}.png`);

    await element.screenshot({
      path: outputPath,
      type: 'png'
    });

    console.log(`  ✓ og-image-${lang}.png`);
    total++;
  }

  // ==================
  // 2. Generar Album Covers (3000x3000)
  // ==================
  console.log('\n📀 Generando Album Covers (3000x3000)...');

  // Solo español por ahora (los MP3 están en español)
  const lang = 'es';

  // 2.1 Versión completa
  await page.evaluate((l) => window.renderAlbumComplete(l), lang);
  await new Promise(r => setTimeout(r, 500));

  let element = await page.$('#render-target');
  let outputPath = path.join(OUTPUT_DIR, 'mp3', `cover-complete-${lang}.png`);

  await element.screenshot({
    path: outputPath,
    type: 'png'
  });

  console.log(`  ✓ cover-complete-${lang}.png`);
  total++;

  // 2.2 Capítulos individuales
  for (let i = 1; i <= 16; i++) {
    await page.evaluate((l, ch) => window.renderAlbumChapter(l, ch), lang, i);
    await new Promise(r => setTimeout(r, 300));

    element = await page.$('#render-target');
    const chapterNum = i.toString().padStart(2, '0');
    outputPath = path.join(OUTPUT_DIR, 'mp3', `cover-${chapterNum}-${lang}.png`);

    await element.screenshot({
      path: outputPath,
      type: 'png'
    });

    console.log(`  ✓ cover-${chapterNum}-${lang}.png`);
    total++;
  }

  await browser.close();

  console.log(`\n✅ ¡Completado! ${total} imágenes generadas en ${OUTPUT_DIR}`);
}

// Ejecutar
generateCovers().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
