#!/usr/bin/env node

/**
 * Concatenate individual chapter MP3s into a complete audiobook
 *
 * Reads: audiobook/audio/{lang}/ch01.mp3 ... ch16.mp3
 * Writes: audiobook/audio/{lang}/complete-book.mp3
 *
 * Also copies final MP3s to dist/audiobook/{lang}/ for web serving
 *
 * Usage:
 *   node scripts/audiobook/concat.cjs --lang es
 *   node scripts/audiobook/concat.cjs --lang all
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const AUDIO_DIR = path.join(PROJECT_ROOT, 'audiobook', 'audio');
const DIST_DIR = path.join(PROJECT_ROOT, 'dist', 'audiobook');
const LANGUAGES = ['en', 'es', 'pt'];

function parseArgs() {
  const args = process.argv.slice(2);
  const options = { langs: LANGUAGES, noCopy: false };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--lang': {
        const val = args[++i];
        options.langs = val === 'all' ? LANGUAGES : [val];
        break;
      }
      case '--no-copy':
        options.noCopy = true;
        break;
      case '--help':
      case '-h':
        console.log(`
Concatenate chapter MP3s into complete audiobook

Usage:
  node scripts/audiobook/concat.cjs --lang <code|all> [options]

Options:
  --lang <code|all>  Language (en, es, pt, or all)
  --no-copy          Don't copy to dist/
  -h, --help         Show help
`);
        process.exit(0);
    }
  }

  return options;
}

function concatMp3s(inputFiles, outputPath) {
  // Simple binary concatenation of MP3 files (works for same-format MP3s)
  const buffers = inputFiles.map(f => fs.readFileSync(f));
  const combined = Buffer.concat(buffers);
  fs.writeFileSync(outputPath, combined);
  return combined.length;
}

function main() {
  const options = parseArgs();

  console.log('\n📚 CONCATENATE AUDIOBOOK\n');

  for (const lang of options.langs) {
    const langDir = path.join(AUDIO_DIR, lang);
    if (!fs.existsSync(langDir)) {
      console.log(`  ⚠ No audio dir for ${lang}, skipping`);
      continue;
    }

    const files = fs.readdirSync(langDir)
      .filter(f => f.match(/^ch\d{2}\.mp3$/))
      .sort()
      .map(f => path.join(langDir, f));

    if (files.length === 0) {
      console.log(`  ⚠ No chapter MP3s for ${lang}`);
      continue;
    }

    console.log(`📖 ${lang.toUpperCase()} — ${files.length} chapters`);

    const outputPath = path.join(langDir, 'complete-book.mp3');
    const size = concatMp3s(files, outputPath);
    const sizeMB = (size / 1024 / 1024).toFixed(2);

    console.log(`  ✅ complete-book.mp3 — ${sizeMB} MB`);

    // Copy to dist for web serving
    if (!options.noCopy) {
      const distLangDir = path.join(DIST_DIR, lang);
      fs.mkdirSync(distLangDir, { recursive: true });

      // Copy individual chapters
      for (const file of files) {
        const dest = path.join(distLangDir, path.basename(file));
        fs.copyFileSync(file, dest);
      }

      // Copy complete book
      fs.copyFileSync(outputPath, path.join(distLangDir, 'complete-book.mp3'));
      console.log(`  📦 Copied to dist/audiobook/${lang}/`);
    }
  }

  console.log('\n✅ Done\n');
}

main();
