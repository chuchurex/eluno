#!/usr/bin/env node
/**
 * One-shot TTS: convierte un archivo .md/.txt a un único MP3
 * usando la misma config que el audiobook del proyecto (Edge TTS).
 *
 * Uso: node scripts/tts-one-shot.mjs <input> <output> [--voice X] [--rate Y]
 */

import { readFileSync, writeFileSync, statSync, unlinkSync } from 'fs';
import { createRequire } from 'module';
import { resolve, dirname } from 'path';
import { mkdirSync } from 'fs';

const require = createRequire(import.meta.url);
const { EdgeTTS } = require('node-edge-tts');

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Uso: node scripts/tts-one-shot.mjs <input> <output> [--voice X] [--rate Y]');
  process.exit(1);
}

const inputPath = resolve(args[0]);
const outputPath = resolve(args[1]);
const getFlag = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : def;
};
const voice = getFlag('--voice', 'es-MX-JorgeNeural');
const rate = getFlag('--rate', '-5%');
const pitch = getFlag('--pitch', '+0Hz');

const MAX_CHUNK = 3000;

function stripMarkdown(md) {
  return md
    .split('\n')
    .map(line => {
      line = line
        .replace(/^#{1,6}\s+/, '') // títulos
        .replace(/^>\s?/, '') // citas (blockquote): quita el '>' para que no se lea
        .replace(/^[-*]\s+/, ''); // viñetas de lista
      // salto de línea duro de markdown (\ al final): convertir en pausa
      // si no, el TTS pronuncia literalmente "barra inversa"
      if (/\\\s*$/.test(line)) {
        line = line.replace(/\\\s*$/, '').trimEnd();
        if (line && !/[.,;:!?]$/.test(line)) line += ',';
      }
      return line;
    })
    .join('\n')
    .replace(/(?<=\p{L})\/(?=\p{L})/gu, ' ') // "amor/luz" -> "amor luz": la barra no se pronuncia
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links: deja solo el texto
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1');
}

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

const raw = readFileSync(inputPath, 'utf8');
const text = stripMarkdown(raw);
const chunks = splitIntoChunks(text);

mkdirSync(dirname(outputPath), { recursive: true });

console.log(`Input: ${inputPath}`);
console.log(`Output: ${outputPath}`);
console.log(`Voice: ${voice} | Rate: ${rate} | Pitch: ${pitch}`);
console.log(`${text.length.toLocaleString()} chars, ${chunks.length} chunks\n`);

const tempFiles = [];
for (let i = 0; i < chunks.length; i++) {
  process.stdout.write(`  Chunk ${i + 1}/${chunks.length}...`);
  const tempPath = outputPath.replace(/\.mp3$/, `.chunk${i}.mp3`);

  let ok = false;
  for (let attempt = 1; attempt <= 3 && !ok; attempt++) {
    try {
      const tts = new EdgeTTS({
        voice,
        lang: voice.split('-').slice(0, 2).join('-'),
        outputFormat: 'audio-24khz-96kbitrate-mono-mp3',
        rate,
        pitch,
        timeout: 60000,
      });
      const start = Date.now();
      await tts.ttsPromise(chunks[i], tempPath);
      const elapsed = ((Date.now() - start) / 1000).toFixed(1);
      const size = statSync(tempPath).size;
      console.log(` ok (${(size / 1024).toFixed(0)} KB, ${elapsed}s)`);
      tempFiles.push(tempPath);
      ok = true;
    } catch (err) {
      if (attempt < 3) {
        process.stdout.write(` retry ${attempt + 1}/3...`);
        await new Promise(r => setTimeout(r, 2000 * attempt));
      } else {
        console.log(` FAILED: ${err?.message || err}`);
        process.exit(1);
      }
    }
  }
  if (i < chunks.length - 1) await new Promise(r => setTimeout(r, 1000));
}

const buffers = tempFiles.map(f => readFileSync(f));
const combined = Buffer.concat(buffers);
writeFileSync(outputPath, combined);
tempFiles.forEach(f => { try { unlinkSync(f); } catch {} });

const sizeMB = (combined.length / 1024 / 1024).toFixed(2);
console.log(`\nSaved: ${outputPath} (${sizeMB} MB)`);
