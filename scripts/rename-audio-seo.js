#!/usr/bin/env node

/**
 * Rename Audio Files with SEO-friendly names
 *
 * Renames MP3 files to include book title:
 *   01-cosmologia-y-genesis.mp3 → el-uno-cap-01-cosmologia-y-genesis.mp3
 *   el-uno-audiolibro-completo.mp3 (complete audiobook)
 *
 * Usage:
 *   node scripts/rename-audio-seo.js [language]
 *   node scripts/rename-audio-seo.js es    # Rename Spanish files
 */

const fs = require('fs');
const path = require('path');

const AUDIO_BASE_DIR = path.join(__dirname, '..', 'audiobook', 'audio');
const I18N_DIR = path.join(__dirname, '..', 'i18n');

const BOOK_TITLES = {
  es: 'el-uno',
  en: 'the-one',
  pt: 'o-um'
};

const CHAPTER_PREFIX = {
  es: 'cap',
  en: 'ch',
  pt: 'cap'
};

const COMPLETE_AUDIOBOOK = {
  es: 'audiolibro-completo',
  en: 'complete-audiobook',
  pt: 'audiolivro-completo'
};

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function loadChapterTitles(lang) {
  const chaptersDir = path.join(I18N_DIR, lang, 'chapters');
  const titles = {};

  if (!fs.existsSync(chaptersDir)) return titles;

  const files = fs.readdirSync(chaptersDir).filter(f => f.endsWith('.json'));
  files.forEach(file => {
    try {
      const content = JSON.parse(fs.readFileSync(path.join(chaptersDir, file), 'utf8'));
      const num = parseInt(file.replace('.json', ''), 10);
      if (!isNaN(num) && content.title) {
        titles[num] = content.title;
      }
    } catch (e) {}
  });

  return titles;
}

function generateChapterAudioFilename(chapterNum, chapterTitle, lang) {
  const bookTitle = BOOK_TITLES[lang];
  const prefix = CHAPTER_PREFIX[lang];
  const num = String(chapterNum).padStart(2, '0');
  const titleSlug = slugify(chapterTitle);
  return `${bookTitle}-${prefix}-${num}-${titleSlug}.mp3`;
}

function generateCompleteAudiobookFilename(lang) {
  const bookTitle = BOOK_TITLES[lang];
  const suffix = COMPLETE_AUDIOBOOK[lang];
  return `${bookTitle}-${suffix}.mp3`;
}

function isCompleteAudiobook(filename) {
  const lower = filename.toLowerCase();
  return lower.includes('completo') || lower.includes('complete') || lower.includes('full');
}

function isChapterFile(filename) {
  return /^\d{2}-/.test(filename);
}

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

  console.log(`\n🎵 Renaming MP3 files with SEO names (${lang.toUpperCase()})\n`);
  console.log(`Directory: ${audioDir}\n`);

  const chapterTitles = loadChapterTitles(lang);
  const files = fs.readdirSync(audioDir).filter(f => f.endsWith('.mp3')).sort();

  const renames = [];
  let renamed = 0;
  let skipped = 0;

  for (const file of files) {
    const oldPath = path.join(audioDir, file);

    if (isCompleteAudiobook(file) && !file.startsWith(BOOK_TITLES[lang])) {
      // Complete audiobook - only rename if not already renamed
      const newFilename = generateCompleteAudiobookFilename(lang);
      const newPath = path.join(audioDir, newFilename);

      if (file !== newFilename) {
        renames.push({ old: file, new: newFilename, oldPath, newPath });
        console.log(`  📄 ${file}`);
        console.log(`     → ${newFilename}`);
        renamed++;
      } else {
        console.log(`  ⏭️  ${file} (already renamed)`);
        skipped++;
      }
    } else if (isChapterFile(file)) {
      // Chapter file
      const match = file.match(/^(\d{2})/);
      if (match) {
        const chapterNum = parseInt(match[1], 10);
        const chapterTitle = chapterTitles[chapterNum];

        if (chapterTitle) {
          const newFilename = generateChapterAudioFilename(chapterNum, chapterTitle, lang);
          const newPath = path.join(audioDir, newFilename);

          if (file !== newFilename) {
            renames.push({ old: file, new: newFilename, oldPath, newPath });
            console.log(`  📄 ${file}`);
            console.log(`     → ${newFilename}`);
            renamed++;
          } else {
            console.log(`  ⏭️  ${file} (already renamed)`);
            skipped++;
          }
        } else {
          console.log(`  ⚠️  ${file} (chapter title not found)`);
          skipped++;
        }
      }
    } else {
      console.log(`  ⏭️  ${file} (non-standard, skipped)`);
      skipped++;
    }
  }

  console.log(`\n────────────────────────────────────────`);
  console.log(`Preview: ${renamed} files to rename, ${skipped} skipped`);
  console.log(`────────────────────────────────────────\n`);

  if (renames.length === 0) {
    console.log('Nothing to rename.\n');
    return;
  }

  // Perform the renames
  console.log('Performing renames...\n');

  for (const r of renames) {
    try {
      fs.renameSync(r.oldPath, r.newPath);
      console.log(`  ✅ ${r.new}`);
    } catch (e) {
      console.log(`  ❌ ${r.old} - Error: ${e.message}`);
    }
  }

  console.log(`\n✨ Done! ${renames.length} files renamed.\n`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
