#!/usr/bin/env node

/**
 * Generate voice comparison samples for all candidate voices
 *
 * Uses the first ~2000 chars of chapter 1 in each language
 * to produce samples for A/B comparison.
 *
 * Usage:
 *   node scripts/audiobook/generate-samples.cjs
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const TEXT_DIR = path.join(PROJECT_ROOT, 'audiobook', 'text');
const VOICES_DIR = path.join(PROJECT_ROOT, 'audiobook', 'voices');

// Candidate voices per language
const CANDIDATES = {
  es: [
    { id: 'es-MX-JorgeNeural', label: 'jorge-mx', desc: 'Mexico, actual' },
    { id: 'es-ES-AlvaroNeural', label: 'alvaro-es', desc: 'España, profunda' },
    { id: 'es-CO-GonzaloNeural', label: 'gonzalo-co', desc: 'Colombia, neutral' },
    { id: 'es-AR-TomasNeural', label: 'tomas-ar', desc: 'Argentina, cálida' },
    { id: 'es-MX-DaliaNeural', label: 'dalia-mx', desc: 'México, femenina' },
  ],
  en: [
    { id: 'en-US-GuyNeural', label: 'guy-us', desc: 'US, current' },
    { id: 'en-US-ChristopherNeural', label: 'christopher-us', desc: 'US, deeper' },
    { id: 'en-US-RogerNeural', label: 'roger-us', desc: 'US, authoritative' },
    { id: 'en-GB-RyanNeural', label: 'ryan-gb', desc: 'British, philosophical' },
    { id: 'en-US-AriaNeural', label: 'aria-us', desc: 'US, warm female' },
  ],
  pt: [
    { id: 'pt-BR-AntonioNeural', label: 'antonio-br', desc: 'Brasil, actual' },
    { id: 'pt-BR-FranciscaNeural', label: 'francisca-br', desc: 'Brasil, femenina' },
    { id: 'pt-PT-DuarteNeural', label: 'duarte-pt', desc: 'Portugal, masculina' },
  ],
};

function extractSample(textPath, maxChars = 2000) {
  const text = fs.readFileSync(textPath, 'utf8');
  const paragraphs = text.split('\n\n');
  let sample = '';
  for (const p of paragraphs) {
    if ((sample + '\n\n' + p).length > maxChars) break;
    sample = sample ? sample + '\n\n' + p : p;
  }
  return sample.trim();
}

async function generateSample(EdgeTTS, voice, text, outputPath, rate) {
  const tts = new EdgeTTS({
    voice: voice.id,
    lang: voice.id.split('-').slice(0, 2).join('-'),
    outputFormat: 'audio-24khz-96kbitrate-mono-mp3',
    rate,
    pitch: '+0Hz',
    timeout: 60000,
  });

  await tts.ttsPromise(text, outputPath);
  const size = fs.statSync(outputPath).size;
  return (size / 1024).toFixed(0);
}

async function main() {
  const { EdgeTTS } = require('node-edge-tts');

  console.log('\n🎤 VOICE COMPARISON SAMPLES\n');

  const rates = ['-5%', '-10%'];

  for (const lang of ['es', 'en', 'pt']) {
    const textPath = path.join(TEXT_DIR, lang, 'ch01.txt');
    if (!fs.existsSync(textPath)) {
      console.log(`⚠️  No text for ${lang}, skipping`);
      continue;
    }

    const sample = extractSample(textPath);
    console.log(`\n🌐 ${lang.toUpperCase()} — ${sample.length} chars sample\n`);

    const outDir = path.join(VOICES_DIR, lang);
    fs.mkdirSync(outDir, { recursive: true });

    for (const voice of CANDIDATES[lang]) {
      for (const rate of rates) {
        const rateLabel = rate.replace('%', '').replace('-', 'minus');
        const filename = `${voice.label}_rate${rateLabel}.mp3`;
        const outputPath = path.join(outDir, filename);

        if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 5000) {
          console.log(`  ⏭️  ${filename} (exists)`);
          continue;
        }

        process.stdout.write(`  🔊 ${voice.label} [${rate}] (${voice.desc})...`);
        try {
          const sizeKB = await generateSample(EdgeTTS, voice, sample, outputPath, rate);
          console.log(` ✅ ${sizeKB} KB`);
        } catch (err) {
          console.log(` ❌ ${err.message || err}`);
        }

        // Pause between requests
        await new Promise(r => setTimeout(r, 1500));
      }
    }
  }

  console.log('\n📁 Samples saved to: audiobook/voices/');
  console.log('\n📋 File naming: {voice-label}_rate{speed}.mp3');
  console.log('   rate minus5 = -5% (slight slow)');
  console.log('   rate minus10 = -10% (contemplative)\n');
}

main().catch(err => {
  console.error('❌ Fatal:', err.message);
  process.exit(1);
});
