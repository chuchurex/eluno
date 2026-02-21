#!/usr/bin/env node

/**
 * Generate audiobook MP3s using Microsoft Edge TTS (100% free, no API key)
 *
 * Reads: audiobook/text/{lang}/chNN.txt
 * Writes: audiobook/audio/{lang}/chNN.mp3
 *
 * Usage:
 *   node scripts/audiobook/generate-edge.cjs --lang es           # All ES chapters
 *   node scripts/audiobook/generate-edge.cjs --lang en --only 1  # EN chapter 1
 *   node scripts/audiobook/generate-edge.cjs --lang es --voice es-MX-JorgeNeural
 *   node scripts/audiobook/generate-edge.cjs --lang en --dry-run
 *   node scripts/audiobook/generate-edge.cjs --lang es --rate -10%  # Slower narration
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const TEXT_DIR = path.join(PROJECT_ROOT, 'audiobook', 'text');
const AUDIO_DIR = path.join(PROJECT_ROOT, 'audiobook', 'audio');

// Default voices per language (warm, clear narration voices)
const DEFAULT_VOICES = {
  en: 'en-US-GuyNeural',        // Male, warm, good for narration
  es: 'es-MX-JorgeNeural',      // Male, Mexican Spanish, clear
  pt: 'pt-BR-AntonioNeural',    // Male, Brazilian Portuguese
};

// Alternative voices for comparison
const ALT_VOICES = {
  en: ['en-US-ChristopherNeural', 'en-US-RogerNeural', 'en-GB-RyanNeural'],
  es: ['es-ES-AlvaroNeural', 'es-MX-JorgeNeural', 'es-AR-TomasNeural'],
  pt: ['pt-BR-AntonioNeural', 'pt-PT-DuarteNeural'],
};

const MAX_CHUNK = 3000; // Edge TTS works well with moderate chunks

// ============================================================================
// PARSE ARGUMENTS
// ============================================================================

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    lang: null,
    only: null,
    start: 1,
    end: 16,
    dryRun: false,
    voice: null,
    rate: '-5%',   // Slightly slower for audiobook narration
    pitch: '+0Hz',
    listVoices: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--lang': options.lang = args[++i]; break;
      case '--only': {
        const val = args[++i];
        if (val.includes('-') && !val.startsWith('-')) {
          const [s, e] = val.split('-').map(Number);
          options.start = s;
          options.end = e;
        } else {
          options.only = parseInt(val);
        }
        break;
      }
      case '--dry-run': options.dryRun = true; break;
      case '--voice': options.voice = args[++i]; break;
      case '--rate': options.rate = args[++i]; break;
      case '--pitch': options.pitch = args[++i]; break;
      case '--list-voices': options.listVoices = true; break;
      case '--help':
      case '-h':
        console.log(`
Generate audiobook MP3s with Microsoft Edge TTS (free, no API key)

Usage:
  node scripts/audiobook/generate-edge.cjs --lang <code> [options]

Options:
  --lang <code>      Language (en, es, pt) — REQUIRED
  --only <N|N-M>     Chapter number or range
  --voice <name>     Override default voice (e.g. es-ES-AlvaroNeural)
  --rate <value>     Speech rate (e.g. -10%, +20%). Default: -5%
  --pitch <value>    Pitch adjustment (e.g. +5Hz, -2Hz)
  --dry-run          Preview without generating
  --list-voices      Show available voices for language
  -h, --help         Show help

Default voices:
  en: ${DEFAULT_VOICES.en}
  es: ${DEFAULT_VOICES.es}
  pt: ${DEFAULT_VOICES.pt}

Alternative voices for comparison:
  en: ${ALT_VOICES.en.join(', ')}
  es: ${ALT_VOICES.es.join(', ')}
  pt: ${ALT_VOICES.pt.join(', ')}
`);
        process.exit(0);
    }
  }

  if (!options.lang && !options.listVoices) {
    console.error('❌ --lang is required. Use --help for usage.');
    process.exit(1);
  }

  return options;
}

// ============================================================================
// TEXT CHUNKING
// ============================================================================

function splitIntoChunks(text) {
  const paragraphs = text.split('\n\n');
  const chunks = [];
  let current = '';

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    if ((current + '\n\n' + trimmed).length > MAX_CHUNK) {
      if (current) chunks.push(current.trim());
      current = trimmed;
    } else {
      current = current ? current + '\n\n' + trimmed : trimmed;
    }
  }

  if (current) chunks.push(current.trim());
  return chunks;
}

// ============================================================================
// EDGE TTS GENERATION
// ============================================================================

async function generateChapter(EdgeTTS, textPath, outputPath, voice, rate, pitch) {
  const text = fs.readFileSync(textPath, 'utf8');
  const chunks = splitIntoChunks(text);

  console.log(`   📄 ${text.length.toLocaleString()} chars, ${chunks.length} chunks`);

  const tempFiles = [];

  for (let i = 0; i < chunks.length; i++) {
    process.stdout.write(`   🔊 Chunk ${i + 1}/${chunks.length}...`);

    const tempPath = outputPath.replace('.mp3', `.chunk${i}.mp3`);

    try {
      let success = false;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const tts = new EdgeTTS({
            voice,
            lang: voice.split('-').slice(0, 2).join('-'),
            outputFormat: 'audio-24khz-96kbitrate-mono-mp3',
            rate,
            pitch,
            timeout: 60000, // 60s timeout
          });

          const start = Date.now();
          await tts.ttsPromise(chunks[i], tempPath);
          const elapsed = ((Date.now() - start) / 1000).toFixed(1);

          const size = fs.statSync(tempPath).size;
          console.log(` ✅ (${(size / 1024).toFixed(0)} KB, ${elapsed}s)`);

          tempFiles.push(tempPath);
          success = true;
          break;
        } catch (retryErr) {
          if (attempt < 3) {
            process.stdout.write(` ⏳ retry ${attempt + 1}/3...`);
            await new Promise(r => setTimeout(r, 2000 * attempt));
          } else {
            const msg = retryErr?.message || retryErr?.toString?.() || 'Unknown error';
            console.log(` ❌ ${msg}`);
            throw new Error(`Chunk ${i + 1} failed after 3 attempts: ${msg}`);
          }
        }
      }

      // Pause between chunks
      if (i < chunks.length - 1) {
        await new Promise(r => setTimeout(r, 1000));
      }
    } catch (error) {
      console.log(`   ❌ ${error.message}`);
      throw error;
    }
  }

  // Concatenate all chunks
  const buffers = tempFiles.map(f => fs.readFileSync(f));
  const combined = Buffer.concat(buffers);
  fs.writeFileSync(outputPath, combined);

  // Cleanup temp files
  tempFiles.forEach(f => { try { fs.unlinkSync(f); } catch {} });

  const sizeMB = (combined.length / 1024 / 1024).toFixed(2);
  console.log(`   💾 Saved: ${sizeMB} MB`);

  return combined.length;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const options = parseArgs();
  const { EdgeTTS } = require('node-edge-tts');

  console.log('\n🌐 EDGE TTS GENERATOR (free, no API key)\n');

  const voice = options.voice || DEFAULT_VOICES[options.lang] || DEFAULT_VOICES.en;

  // Find text files
  const textDir = path.join(TEXT_DIR, options.lang);
  if (!fs.existsSync(textDir)) {
    console.error(`❌ No text files at ${textDir}`);
    console.log('   Run: node scripts/audiobook/extract-text.cjs first');
    process.exit(1);
  }

  const outDir = path.join(AUDIO_DIR, options.lang);
  fs.mkdirSync(outDir, { recursive: true });

  const files = fs.readdirSync(textDir)
    .filter(f => f.match(/^ch\d{2}\.txt$/))
    .sort();

  console.log(`🎤 Voice: ${voice}`);
  console.log(`⚡ Rate: ${options.rate} | Pitch: ${options.pitch}`);
  console.log(`📂 Input: ${textDir}`);
  console.log(`📂 Output: ${outDir}`);

  if (options.dryRun) {
    console.log('\n⚠️  DRY RUN — no audio will be generated\n');
  }

  let totalSize = 0;
  let success = 0;
  const startTime = Date.now();

  for (const file of files) {
    const num = parseInt(file.replace('ch', '').replace('.txt', ''));
    if (options.only && num !== options.only) continue;
    if (num < options.start || num > options.end) continue;

    const textPath = path.join(textDir, file);
    const outputPath = path.join(outDir, file.replace('.txt', '.mp3'));

    // Skip if already exists
    if (fs.existsSync(outputPath)) {
      const size = fs.statSync(outputPath).size;
      if (size > 10000) {
        console.log(`\n⏭️  ch${String(num).padStart(2, '0')} already exists (${(size / 1024 / 1024).toFixed(1)} MB), skipping`);
        continue;
      }
    }

    console.log(`\n📖 Chapter ${num}: ${file}`);

    if (options.dryRun) {
      const text = fs.readFileSync(textPath, 'utf8');
      const chunks = splitIntoChunks(text);
      const estMin = Math.round(text.split(/\s+/).length / 150);
      console.log(`   📄 ${text.length.toLocaleString()} chars, ${chunks.length} chunks (~${estMin} min)`);
      success++;
      continue;
    }

    try {
      const size = await generateChapter(EdgeTTS, textPath, outputPath, voice, options.rate, options.pitch);
      totalSize += size;
      success++;
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      console.log('   Continuing with next chapter...');
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);

  console.log('\n' + '='.repeat(50));
  console.log(`✅ ${success} chapters processed`);
  if (!options.dryRun && totalSize > 0) {
    console.log(`📦 Total: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`⏱️  Time: ${elapsed} min`);
  }
  console.log(`📁 Output: ${outDir}\n`);
}

main().catch(err => {
  console.error('\n❌ Fatal:', err.message);
  process.exit(1);
});
