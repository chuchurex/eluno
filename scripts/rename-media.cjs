#!/usr/bin/env node

/**
 * Rename MP3s and PDFs with SEO-friendly names
 *
 * Convention:
 *   ES: el-uno-cap-01-cosmologia-y-genesis.mp3
 *   EN: the-one-ch-01-cosmology-and-genesis.mp3
 *   PT: o-um-cap-01-cosmologia-e-genese.mp3
 *
 * Complete book:
 *   ES: el-uno-audiolibro-completo.mp3 / el-uno-libro-completo.pdf
 *   EN: the-one-complete-audiobook.mp3 / the-one-complete-book.pdf
 *   PT: o-um-audiolivro-completo.mp3 / o-um-livro-completo.pdf
 *
 * Usage:
 *   node scripts/rename-media.cjs           # Rename all
 *   node scripts/rename-media.cjs --dry-run  # Preview only
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const I18N_DIR = path.join(PROJECT_ROOT, 'i18n');
const AUDIO_DIR = path.join(PROJECT_ROOT, 'audiobook', 'audio');
const PDF_DIR = path.join(PROJECT_ROOT, 'dist', 'pdf');

const dryRun = process.argv.includes('--dry-run');

// ============================================================================
// NAMING CONVENTIONS
// ============================================================================

const BOOK_PREFIX = {
  es: 'el-uno',
  en: 'the-one',
  pt: 'o-um',
};

const CHAPTER_LABEL = {
  es: 'cap',
  en: 'ch',
  pt: 'cap',
};

const COMPLETE_AUDIO = {
  es: 'el-uno-audiolibro-completo',
  en: 'the-one-complete-audiobook',
  pt: 'o-um-audiolivro-completo',
};

const COMPLETE_PDF = {
  es: 'el-uno-libro-completo',
  en: 'the-one-complete-book',
  pt: 'o-um-livro-completo',
};

// ============================================================================
// HELPERS
// ============================================================================

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function loadChapterSlugs(lang) {
  const chaptersDir = path.join(I18N_DIR, lang, 'chapters');
  const slugs = {};

  if (!fs.existsSync(chaptersDir)) return slugs;

  const files = fs.readdirSync(chaptersDir).filter(f => f.endsWith('.json'));
  for (const file of files) {
    try {
      const content = JSON.parse(fs.readFileSync(path.join(chaptersDir, file), 'utf8'));
      const num = parseInt(file.replace('.json', ''), 10);
      if (!isNaN(num) && content.title) {
        slugs[num] = slugify(content.title);
      }
    } catch (e) {
      console.warn(`  Warning: Could not load ${file}`);
    }
  }

  return slugs;
}

function buildFilename(lang, num, slug) {
  const prefix = BOOK_PREFIX[lang];
  const label = CHAPTER_LABEL[lang];
  const padded = String(num).padStart(2, '0');
  return `${prefix}-${label}-${padded}-${slug}`;
}

function renameFile(dir, oldName, newName) {
  const oldPath = path.join(dir, oldName);
  const newPath = path.join(dir, newName);

  if (!fs.existsSync(oldPath)) return null;
  if (oldName === newName) return 'skip';

  if (dryRun) {
    console.log(`    ${oldName} → ${newName}`);
    return 'dry';
  }

  fs.renameSync(oldPath, newPath);
  console.log(`    ${oldName} → ${newName}`);
  return 'ok';
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
  console.log(`\n📁 RENAME MEDIA FILES (SEO-friendly names)\n`);
  if (dryRun) console.log('⚠️  DRY RUN — no files will be renamed\n');

  const mediaJsonUpdates = {};

  for (const lang of ['es', 'en', 'pt']) {
    console.log(`\n🌐 ${lang.toUpperCase()}`);
    const slugs = loadChapterSlugs(lang);
    const totalChapters = Object.keys(slugs).length;
    console.log(`  Found ${totalChapters} chapter slugs`);

    const audioDir = path.join(AUDIO_DIR, lang);
    const pdfDir = path.join(PDF_DIR, lang);

    const mediaEntries = {};

    // Rename chapters
    for (let num = 1; num <= 16; num++) {
      const slug = slugs[num];
      if (!slug) {
        console.log(`  ⚠️  No slug for chapter ${num}`);
        continue;
      }

      const seoBase = buildFilename(lang, num, slug);

      // Audio
      if (fs.existsSync(audioDir)) {
        const oldMp3 = `ch${String(num).padStart(2, '0')}.mp3`;
        renameFile(audioDir, oldMp3, `${seoBase}.mp3`);
      }

      // PDF
      if (fs.existsSync(pdfDir)) {
        const oldPdf = `ch${String(num).padStart(2, '0')}.pdf`;
        renameFile(pdfDir, oldPdf, `${seoBase}.pdf`);
      }

      // Build media.json entry
      const entry = {};
      entry.pdf = `https://eluno.org/pdf/${lang}/${seoBase}.pdf`;
      if (fs.existsSync(audioDir)) {
        entry.audio = `https://static.eluno.org/audiobook/${lang}/${seoBase}.mp3`;
      }
      mediaEntries[String(num)] = entry;
    }

    // Rename complete book
    if (fs.existsSync(audioDir)) {
      renameFile(audioDir, 'complete-book.mp3', `${COMPLETE_AUDIO[lang]}.mp3`);
    }
    if (fs.existsSync(pdfDir)) {
      renameFile(pdfDir, 'complete-book.pdf', `${COMPLETE_PDF[lang]}.pdf`);
    }

    // Build "all" entry
    const allEntry = {};
    allEntry.pdf = `https://eluno.org/pdf/${lang}/${COMPLETE_PDF[lang]}.pdf`;
    if (fs.existsSync(audioDir)) {
      allEntry.audio = `https://static.eluno.org/audiobook/${lang}/${COMPLETE_AUDIO[lang]}.mp3`;
    }

    mediaEntries.all = allEntry;
    mediaJsonUpdates[lang] = mediaEntries;
  }

  // Write media.json files
  if (!dryRun) {
    console.log('\n📝 Updating media.json files...');
    for (const lang of ['es', 'en', 'pt']) {
      const mediaPath = path.join(I18N_DIR, lang, 'media.json');
      const ordered = { all: mediaJsonUpdates[lang].all };
      for (let i = 1; i <= 16; i++) {
        if (mediaJsonUpdates[lang][String(i)]) {
          ordered[String(i)] = mediaJsonUpdates[lang][String(i)];
        }
      }
      fs.writeFileSync(mediaPath, JSON.stringify(ordered, null, 2) + '\n');
      console.log(`  ✅ ${mediaPath}`);
    }
  } else {
    console.log('\n📝 media.json preview:');
    for (const lang of ['es', 'en', 'pt']) {
      console.log(`\n  ${lang}/media.json:`);
      console.log(`    all.pdf: ${mediaJsonUpdates[lang].all.pdf}`);
      if (mediaJsonUpdates[lang].all.audio) {
        console.log(`    all.audio: ${mediaJsonUpdates[lang].all.audio}`);
      }
      console.log(`    1.pdf: ${mediaJsonUpdates[lang]['1'].pdf}`);
      if (mediaJsonUpdates[lang]['1'].audio) {
        console.log(`    1.audio: ${mediaJsonUpdates[lang]['1'].audio}`);
      }
      console.log(`    ...`);
    }
  }

  console.log('\n✅ Done!\n');
}

main();
