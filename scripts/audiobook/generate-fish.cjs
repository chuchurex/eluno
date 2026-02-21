#!/usr/bin/env node

/**
 * Generate audiobook MP3s using Fish Audio TTS API
 *
 * Reads: audiobook/text/{lang}/chNN.txt
 * Writes: audiobook/audio/{lang}/chNN.mp3
 *
 * Uses existing Fish Audio API key and voice ID from .env
 *
 * Usage:
 *   node scripts/audiobook/generate-fish.cjs --lang es           # All ES chapters
 *   node scripts/audiobook/generate-fish.cjs --lang en --only 1  # EN chapter 1
 *   node scripts/audiobook/generate-fish.cjs --lang es --dry-run # Preview only
 *   node scripts/audiobook/generate-fish.cjs --lang es --voice VOICE_ID  # Custom voice
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// ============================================================================
// LOAD .ENV
// ============================================================================

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const envPath = path.join(PROJECT_ROOT, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match && !process.env[match[1].trim()]) {
      process.env[match[1].trim()] = match[2].trim();
    }
  });
}

const TEXT_DIR = path.join(PROJECT_ROOT, 'audiobook', 'text');
const AUDIO_DIR = path.join(PROJECT_ROOT, 'audiobook', 'audio');
const MAX_CHUNK = 4000; // Fish Audio character limit per request

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
    voice: null
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--lang': options.lang = args[++i]; break;
      case '--only': {
        const val = args[++i];
        if (val.includes('-')) {
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
      case '--help':
      case '-h':
        console.log(`
Generate audiobook MP3s with Fish Audio TTS

Usage:
  node scripts/audiobook/generate-fish.cjs --lang <code> [options]

Options:
  --lang <code>      Language (en, es, pt) — REQUIRED
  --only <N|N-M>     Chapter number or range
  --voice <id>       Override voice ID from .env
  --dry-run          Preview without generating
  -h, --help         Show help

Environment (.env):
  FISH_API_KEY       API key (required)
  FISH_VOICE_ID      Default voice ID
  FISH_VOICE_ID_EN   Voice ID for English
  FISH_VOICE_ID_ES   Voice ID for Spanish
  FISH_VOICE_ID_PT   Voice ID for Portuguese
`);
        process.exit(0);
    }
  }

  if (!options.lang) {
    console.error('❌ --lang is required. Use --help for usage.');
    process.exit(1);
  }

  return options;
}

// ============================================================================
// FISH AUDIO API
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

async function generateChunk(text, voiceId, apiKey) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      text,
      reference_id: voiceId,
      format: 'mp3',
      normalize: true,
      latency: 'normal'
    });

    const req = https.request({
      hostname: 'api.fish.audio',
      port: 443,
      path: '/v1/tts',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(Buffer.concat(chunks));
        } else {
          reject(new Error(`API ${res.statusCode}: ${Buffer.concat(chunks).toString()}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function generateChapter(textPath, outputPath, voiceId, apiKey) {
  const text = fs.readFileSync(textPath, 'utf8');
  const chunks = splitIntoChunks(text);

  console.log(`   📄 ${text.length.toLocaleString()} chars, ${chunks.length} chunks`);

  const audioChunks = [];

  for (let i = 0; i < chunks.length; i++) {
    process.stdout.write(`   🔊 Chunk ${i + 1}/${chunks.length}...`);

    try {
      const audio = await generateChunk(chunks[i], voiceId, apiKey);
      audioChunks.push(audio);
      console.log(` ✅ (${(audio.length / 1024).toFixed(0)} KB)`);

      // Rate limiting between chunks
      if (i < chunks.length - 1) {
        await new Promise(r => setTimeout(r, 1000));
      }
    } catch (error) {
      console.log(` ❌`);
      throw error;
    }
  }

  const combined = Buffer.concat(audioChunks);
  fs.writeFileSync(outputPath, combined);

  const sizeMB = (combined.length / 1024 / 1024).toFixed(2);
  console.log(`   💾 Saved: ${sizeMB} MB`);

  return combined.length;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const options = parseArgs();

  console.log('\n🐟 FISH AUDIO TTS GENERATOR\n');

  // Resolve API key and voice
  const apiKey = process.env.FISH_API_KEY;
  if (!apiKey) {
    console.error('❌ FISH_API_KEY not set in .env');
    process.exit(1);
  }

  const voiceId = options.voice
    || process.env[`FISH_VOICE_ID_${options.lang.toUpperCase()}`]
    || process.env.FISH_VOICE_ID;

  if (!voiceId) {
    console.error(`❌ No voice ID found. Set FISH_VOICE_ID or FISH_VOICE_ID_${options.lang.toUpperCase()} in .env`);
    process.exit(1);
  }

  // Find text files
  const textDir = path.join(TEXT_DIR, options.lang);
  if (!fs.existsSync(textDir)) {
    console.error(`❌ No text files found at ${textDir}`);
    console.log('   Run: node scripts/audiobook/extract-text.cjs first');
    process.exit(1);
  }

  const outDir = path.join(AUDIO_DIR, options.lang);
  fs.mkdirSync(outDir, { recursive: true });

  const files = fs.readdirSync(textDir)
    .filter(f => f.match(/^ch\d{2}\.txt$/))
    .sort();

  console.log(`🎤 Voice: ${voiceId}`);
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
    if (fs.existsSync(outputPath) && !options.dryRun) {
      const size = fs.statSync(outputPath).size;
      if (size > 10000) { // > 10KB = probably valid
        console.log(`\n⏭️  ch${String(num).padStart(2, '0')} already exists (${(size / 1024 / 1024).toFixed(1)} MB), skipping`);
        continue;
      }
    }

    console.log(`\n📖 Chapter ${num}: ${file}`);

    if (options.dryRun) {
      const text = fs.readFileSync(textPath, 'utf8');
      const chunks = splitIntoChunks(text);
      console.log(`   📄 ${text.length.toLocaleString()} chars, ${chunks.length} chunks`);
      console.log(`   🔍 [DRY RUN] Would generate ${chunks.length} audio chunks`);
      success++;
      continue;
    }

    try {
      const size = await generateChapter(textPath, outputPath, voiceId, apiKey);
      totalSize += size;
      success++;
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      console.log('   Continuing with next chapter...');
    }

    // Pause between chapters
    if (!options.dryRun) {
      console.log('   ⏳ Waiting 2s...');
      await new Promise(r => setTimeout(r, 2000));
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
