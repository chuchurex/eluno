#!/usr/bin/env node

/**
 * Assemble final MP3s with intro + content + outro
 *
 * Structure per chapter:
 *   [intro: "El Uno. Capítulo 1: Cosmología y Génesis"]
 *   [1.5s silence]
 *   [chapter content]
 *   [2s silence]
 *   [outro: attribution to L/L Research]
 *
 * Structure for complete book:
 *   [intro: book name + tagline]
 *   [2s silence]
 *   [all chapters with their intros/outros]
 *
 * Usage:
 *   node scripts/audiobook/assemble-chapters.cjs --lang es
 *   node scripts/audiobook/assemble-chapters.cjs --lang en
 *   node scripts/audiobook/assemble-chapters.cjs --lang all
 *   node scripts/audiobook/assemble-chapters.cjs --lang es --only 1
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const I18N_DIR = path.join(PROJECT_ROOT, 'i18n');
const AUDIO_DIR = path.join(PROJECT_ROOT, 'audiobook', 'audio');
const CLIPS_DIR = path.join(PROJECT_ROOT, 'audiobook', 'clips');
const FINAL_DIR = path.join(PROJECT_ROOT, 'audiobook', 'final');

// ============================================================================
// TEXTS
// ============================================================================

const BOOK_NAMES = { es: 'El Uno', en: 'The One', pt: 'O Um' };
const CHAPTER_LABEL = { es: 'Capítulo', en: 'Chapter', pt: 'Capítulo' };

const TAGLINE = {
  es: 'Una reinterpretación filosófica del Material Ra, La Ley del Uno, como narrativa accesible. Explora la cosmología, el Creador, las densidades y el propósito de la existencia.',
  en: 'A philosophical reinterpretation of The Ra Material, The Law of One, as an accessible narrative. It explores cosmology, the Creator, the densities, and the purpose of existence.',
  pt: 'Uma reinterpretação filosófica do Material Ra, A Lei do Um, como narrativa acessível. Explora a cosmologia, o Criador, as densidades e o propósito da existência.',
};

const OUTRO = {
  es: 'Este trabajo es una interpretación filosófica del Material Ra, publicado originalmente por L. L. Research. Sesiones originales gratis en L. L. Research punto org',
  en: 'This work is a philosophical interpretation of The Ra Material, originally published by L. L. Research. Original sessions available free at L. L. Research dot org',
  pt: 'Este trabalho é uma interpretação filosófica do Material Ra, publicado originalmente por L. L. Research. Sessões originais gratuitas em L. L. Research ponto org',
};

const VOICES = {
  es: 'es-MX-JorgeNeural',
  en: 'en-US-GuyNeural',
  pt: 'pt-BR-AntonioNeural',
};

const BOOK_PREFIX = { es: 'el-uno', en: 'the-one', pt: 'o-um' };
const CH_LABEL = { es: 'cap', en: 'ch', pt: 'cap' };

const COMPLETE_AUDIO_NAME = {
  es: 'el-uno-audiolibro-completo',
  en: 'the-one-complete-audiobook',
  pt: 'o-um-audiolivro-completo',
};

// ============================================================================
// HELPERS
// ============================================================================

function slugify(text) {
  return text.toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function loadChapterTitles(lang) {
  const dir = path.join(I18N_DIR, lang, 'chapters');
  const titles = {};
  if (!fs.existsSync(dir)) return titles;
  for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
      const num = parseInt(file.replace('.json', ''), 10);
      if (!isNaN(num) && data.title) titles[num] = data.title;
    } catch {}
  }
  return titles;
}

async function generateClip(EdgeTTS, text, voice, outputPath, rate = '-5%') {
  const tts = new EdgeTTS({
    voice,
    lang: voice.split('-').slice(0, 2).join('-'),
    outputFormat: 'audio-24khz-96kbitrate-mono-mp3',
    rate,
    pitch: '+0Hz',
    timeout: 60000,
  });
  await tts.ttsPromise(text, outputPath);
}

function generateSilence(outputPath, durationSec) {
  execSync(`ffmpeg -f lavfi -i anullsrc=r=24000:cl=mono -t ${durationSec} -c:a libmp3lame -b:a 96k -y "${outputPath}" 2>/dev/null`);
}

function concatMp3s(files, outputPath) {
  const listPath = outputPath + '.list';
  const listContent = files.map(f => `file '${f}'`).join('\n');
  fs.writeFileSync(listPath, listContent);
  execSync(`ffmpeg -f concat -safe 0 -i "${listPath}" -c copy -y "${outputPath}" 2>/dev/null`);
  fs.unlinkSync(listPath);
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  let langs = ['es', 'en', 'pt'];
  let only = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--lang') {
      const val = args[++i];
      langs = val === 'all' ? ['es', 'en', 'pt'] : [val];
    }
    if (args[i] === '--only') only = parseInt(args[++i]);
  }

  const { EdgeTTS } = require('node-edge-tts');

  console.log('\n🎬 ASSEMBLE CHAPTERS WITH INTRO + OUTRO\n');

  // Generate silence clips
  fs.mkdirSync(CLIPS_DIR, { recursive: true });
  const silence15 = path.join(CLIPS_DIR, 'silence-1.5s.mp3');
  const silence2 = path.join(CLIPS_DIR, 'silence-2s.mp3');
  const silence3 = path.join(CLIPS_DIR, 'silence-3s.mp3');

  if (!fs.existsSync(silence15)) {
    process.stdout.write('  Generating silence clips...');
    generateSilence(silence15, 1.5);
    generateSilence(silence2, 2);
    generateSilence(silence3, 3);
    console.log(' ✅');
  }

  for (const lang of langs) {
    console.log(`\n🌐 ${lang.toUpperCase()} — ${BOOK_NAMES[lang]}\n`);

    const titles = loadChapterTitles(lang);
    const voice = VOICES[lang];
    const langClipsDir = path.join(CLIPS_DIR, lang);
    const langFinalDir = path.join(FINAL_DIR, lang);
    fs.mkdirSync(langClipsDir, { recursive: true });
    fs.mkdirSync(langFinalDir, { recursive: true });

    // Generate outro clip (shared across all chapters)
    const outroPath = path.join(langClipsDir, 'outro.mp3');
    if (!fs.existsSync(outroPath)) {
      process.stdout.write(`  🔊 Generating outro clip...`);
      await generateClip(EdgeTTS, OUTRO[lang], voice, outroPath);
      console.log(' ✅');
      await new Promise(r => setTimeout(r, 1500));
    }

    // Generate complete book intro clip
    const completeIntroPath = path.join(langClipsDir, 'intro-complete.mp3');
    if (!fs.existsSync(completeIntroPath)) {
      const completeIntroText = `${BOOK_NAMES[lang]}. ${TAGLINE[lang]}`;
      process.stdout.write(`  🔊 Generating complete book intro...`);
      await generateClip(EdgeTTS, completeIntroText, voice, completeIntroPath, '-10%');
      console.log(' ✅');
      await new Promise(r => setTimeout(r, 1500));
    }

    // Process each chapter
    const assembledChapters = [];

    for (let num = 1; num <= 16; num++) {
      if (only && num !== only) continue;

      const title = titles[num];
      if (!title) { console.log(`  ⚠️  No title for ch${num}`); continue; }

      const padded = String(num).padStart(2, '0');
      const slug = slugify(title);
      const seoName = `${BOOK_PREFIX[lang]}-${CH_LABEL[lang]}-${padded}-${slug}`;

      // Source content MP3 (the raw chapter without intro/outro)
      const srcMp3 = path.join(AUDIO_DIR, lang, `${seoName}.mp3`);
      if (!fs.existsSync(srcMp3)) {
        // Try old naming
        const oldSrc = path.join(AUDIO_DIR, lang, `ch${padded}.mp3`);
        if (!fs.existsSync(oldSrc)) {
          console.log(`  ⚠️  No source audio for ch${padded}`);
          continue;
        }
      }

      const finalPath = path.join(langFinalDir, `${seoName}.mp3`);

      // Assemble: content + silence + outro (no intro — content already starts with chapter title)
      process.stdout.write(`  🎬 Assembling ${seoName}...`);
      concatMp3s([srcMp3, silence2, outroPath], finalPath);
      const sizeMB = (fs.statSync(finalPath).size / 1024 / 1024).toFixed(1);
      console.log(` ✅ ${sizeMB} MB`);

      assembledChapters.push(finalPath);
    }

    // Assemble complete book
    if (!only && assembledChapters.length === 16) {
      const completeName = `${COMPLETE_AUDIO_NAME[lang]}.mp3`;
      const completePath = path.join(langFinalDir, completeName);

      process.stdout.write(`\n  📚 Assembling ${completeName}...`);
      const allParts = [completeIntroPath, silence3, ...assembledChapters];
      concatMp3s(allParts, completePath);
      const sizeMB = (fs.statSync(completePath).size / 1024 / 1024).toFixed(1);
      console.log(` ✅ ${sizeMB} MB`);
    }

    console.log(`\n  📁 Output: ${langFinalDir}`);
  }

  console.log('\n✅ Done! Final MP3s in audiobook/final/\n');
}

main().catch(err => {
  console.error('❌ Fatal:', err.message);
  process.exit(1);
});
