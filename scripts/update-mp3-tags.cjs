#!/usr/bin/env node

/**
 * MP3 ID3 Tag Update Script for eluno.org
 *
 * Updates ID3 tags on audiobook MP3 files with proper attribution
 * to L/L Research as required by licensing agreement.
 *
 * Usage:
 *   node scripts/update-mp3-tags.js [language]
 *   node scripts/update-mp3-tags.js          # Updates Spanish (default)
 *   node scripts/update-mp3-tags.js es       # Updates Spanish
 *   node scripts/update-mp3-tags.js en       # Updates English (when available)
 *
 * Requirements:
 *   npm install node-id3
 */

const NodeID3 = require('node-id3');
const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURATION
// ============================================================================

const AUDIO_BASE_DIR = path.join(__dirname, '..', 'audiobook', 'audio');
const I18N_DIR = path.join(__dirname, '..', 'i18n');

// Book titles by language
const BOOK_TITLES = {
  es: 'El Uno',
  en: 'The One',
  pt: 'O Um'
};

// Attribution text by language
const ATTRIBUTION = {
  es: {
    comment: 'Basado en el Material Ra © L/L Research. Original: llresearch.org',
    copyright: '© L/L Research (fuente) / eluno.org (interpretación)',
    completeComment:
      'Interpretación del Material Ra (La Ley del Uno) © L/L Research. Material original disponible gratis en llresearch.org. Interpretación: eluno.org',
    completeCopyright: 'Material original © L/L Research / Interpretación © eluno.org',
    genre: 'Audiolibro',
    chapterPrefix: 'Cap.'
  },
  en: {
    comment: 'Based on The Ra Material © L/L Research. Original: llresearch.org',
    copyright: '© L/L Research (source) / eluno.org (interpretation)',
    completeComment:
      'Interpretation of The Ra Material (The Law of One) © L/L Research. Original material available free at llresearch.org. Interpretation: eluno.org',
    completeCopyright: 'Original material © L/L Research / Interpretation © eluno.org',
    genre: 'Audiobook',
    chapterPrefix: 'Ch.'
  },
  pt: {
    comment: 'Baseado no Material Ra © L/L Research. Original: llresearch.org',
    copyright: '© L/L Research (fonte) / eluno.org (interpretação)',
    completeComment:
      'Interpretação do Material Ra (A Lei do Um) © L/L Research. Material original disponível gratuitamente em llresearch.org. Interpretação: eluno.org',
    completeCopyright: 'Material original © L/L Research / Interpretação © eluno.org',
    genre: 'Audiolivro',
    chapterPrefix: 'Cap.'
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function loadChapterTitles(lang) {
  const chaptersDir = path.join(I18N_DIR, lang, 'chapters');
  const titles = {};

  if (!fs.existsSync(chaptersDir)) {
    console.warn(`Warning: Chapters directory not found for ${lang}`);
    return titles;
  }

  const files = fs.readdirSync(chaptersDir).filter(f => f.endsWith('.json'));

  files.forEach(file => {
    try {
      const content = JSON.parse(fs.readFileSync(path.join(chaptersDir, file), 'utf8'));
      const num = parseInt(file.replace('.json', ''), 10);
      if (!isNaN(num) && content.title) {
        titles[num] = content.title;
      }
    } catch (e) {
      console.warn(`Warning: Could not load ${file}`);
    }
  });

  return titles;
}

function getChapterNumberFromFilename(filename) {
  // Match patterns like: 01-title.mp3, chapter-01.mp3, etc.
  const match = filename.match(/(\d{2})/);
  return match ? parseInt(match[1], 10) : null;
}

function isCompleteAudiobook(filename) {
  const lower = filename.toLowerCase();
  return lower.includes('completo') || lower.includes('complete') || lower.includes('full');
}

function isChapterFile(filename) {
  // Match: ch01.mp3, 01-title.mp3, el-uno-cap-01-*.mp3, the-one-ch-01-*.mp3
  return /^ch\d{2}\.mp3$/.test(filename) || /^\d{2}-/.test(filename) || /^(el-uno|the-one|o-um)-(cap|ch)-\d{2}-/.test(filename);
}

// ============================================================================
// TAG UPDATE FUNCTIONS
// ============================================================================

function updateChapterTags(filePath, chapterNum, chapterTitle, lang, totalChapters) {
  const bookTitle = BOOK_TITLES[lang];
  const attr = ATTRIBUTION[lang];

  const tags = {
    title: `${bookTitle} - ${attr.chapterPrefix}${chapterNum}: ${chapterTitle}`,
    artist: 'eluno.org',
    album: bookTitle,
    performerInfo: 'eluno.org', // Album Artist (TPE2)
    year: '2025',
    genre: attr.genre,
    trackNumber: `${chapterNum}/${totalChapters}`,
    comment: {
      language: lang === 'es' ? 'spa' : lang === 'pt' ? 'por' : 'eng',
      text: attr.comment
    },
    copyright: attr.copyright,
    userDefinedUrl: [
      {
        description: 'Website',
        url: `https://eluno.org${lang === 'en' ? '' : '/' + lang}`
      }
    ],
    publisher: 'eluno.org'
  };

  return NodeID3.update(tags, filePath);
}

function updateCompleteAudiobookTags(filePath, lang) {
  const bookTitle = BOOK_TITLES[lang];
  const attr = ATTRIBUTION[lang];

  const completeTitle =
    lang === 'es'
      ? 'Audiolibro Completo'
      : lang === 'pt'
        ? 'Audiolivro Completo'
        : 'Complete Audiobook';

  const tags = {
    title: `${bookTitle} - ${completeTitle}`,
    artist: 'eluno.org',
    album: bookTitle,
    performerInfo: 'eluno.org',
    year: '2025',
    genre: attr.genre,
    comment: {
      language: lang === 'es' ? 'spa' : lang === 'pt' ? 'por' : 'eng',
      text: attr.completeComment
    },
    copyright: attr.completeCopyright,
    userDefinedUrl: [
      {
        description: 'Website',
        url: `https://eluno.org${lang === 'en' ? '' : '/' + lang}`
      }
    ],
    publisher: 'eluno.org'
  };

  return NodeID3.update(tags, filePath);
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

async function main() {
  const lang = process.argv[2] || 'es';

  if (!BOOK_TITLES[lang]) {
    console.error(`Error: Unsupported language "${lang}". Use: es, en, pt`);
    process.exit(1);
  }

  const audioDir = path.join(AUDIO_BASE_DIR, lang);

  if (!fs.existsSync(audioDir)) {
    console.error(`Error: Audio directory not found: ${audioDir}`);
    process.exit(1);
  }

  console.log(`\n🎵 Updating MP3 ID3 tags for ${BOOK_TITLES[lang]} (${lang.toUpperCase()})\n`);
  console.log(`Directory: ${audioDir}\n`);

  // Load chapter titles
  const chapterTitles = loadChapterTitles(lang);
  const totalChapters = Object.keys(chapterTitles).length || 16;

  console.log(`Found ${Object.keys(chapterTitles).length} chapter titles\n`);

  // Get MP3 files
  const files = fs
    .readdirSync(audioDir)
    .filter(f => f.endsWith('.mp3'))
    .sort();

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  console.log('Processing files:\n');

  for (const file of files) {
    const filePath = path.join(audioDir, file);

    if (isCompleteAudiobook(file)) {
      // Complete audiobook file
      const success = updateCompleteAudiobookTags(filePath, lang);
      if (success) {
        console.log(`  ✅ ${file} (complete audiobook)`);
        updated++;
      } else {
        console.log(`  ❌ ${file} (failed)`);
        errors++;
      }
    } else if (isChapterFile(file)) {
      // Individual chapter file
      const chapterNum = getChapterNumberFromFilename(file);

      if (chapterNum && chapterTitles[chapterNum]) {
        const success = updateChapterTags(
          filePath,
          chapterNum,
          chapterTitles[chapterNum],
          lang,
          totalChapters
        );

        if (success) {
          console.log(`  ✅ ${file} → Cap.${chapterNum}: ${chapterTitles[chapterNum]}`);
          updated++;
        } else {
          console.log(`  ❌ ${file} (failed)`);
          errors++;
        }
      } else {
        console.log(`  ⚠️  ${file} (chapter title not found)`);
        skipped++;
      }
    } else {
      // Skip non-standard files (demos, versions, etc.)
      console.log(`  ⏭️  ${file} (skipped - non-standard filename)`);
      skipped++;
    }
  }

  console.log(`\n────────────────────────────────────────`);
  console.log(`Summary:`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Errors:  ${errors}`);
  console.log(`────────────────────────────────────────\n`);

  if (updated > 0) {
    console.log(`✨ Done! ${updated} files updated with L/L Research attribution.\n`);
  }
}

// ============================================================================
// RUN
// ============================================================================

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
