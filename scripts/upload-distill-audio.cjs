#!/usr/bin/env node
/**
 * Sube distill/audiobook/final/{en,es} a static.eluno.org vía rsync + ssh.
 * Requiere: UPLOAD_HOST, UPLOAD_PORT, UPLOAD_USER, UPLOAD_PASS, UPLOAD_DIR en .env
 * y sshpass en PATH (brew install sshpass).
 *
 * Destino remoto: {UPLOAD_DIR}/audiobook/distill/{en,es}/
 */

const path = require('path');
const { execSync } = require('child_process');

function sleepSync(sec) {
  execSync(`sleep ${sec}`);
}

const ROOT = path.join(__dirname, '..');
const DISTILL = path.join(ROOT, 'distill');

require('dotenv').config({ path: path.join(ROOT, '.env') });

const host = process.env.UPLOAD_HOST;
const port = process.env.UPLOAD_PORT || '22';
const user = process.env.UPLOAD_USER;
const pass = process.env.UPLOAD_PASS;
const baseDir = process.env.UPLOAD_DIR;

if (!host || !user || !pass || !baseDir) {
  console.error('Faltan UPLOAD_HOST, UPLOAD_USER, UPLOAD_PASS o UPLOAD_DIR en .env');
  process.exit(1);
}

const remoteBase = `${user}@${host}:${baseDir.replace(/\/$/, '')}/audiobook/distill`;

const env = { ...process.env, SSHPASS: pass };
// accept-new: trust on first connect, reject if key changes (TOFU model)
const ssh = `ssh -p ${port} -o StrictHostKeyChecking=accept-new`;

const langs = process.argv[2] ? [process.argv[2]] : ['en', 'es'];

for (let i = 0; i < langs.length; i++) {
  const lang = langs[i];
  if (i > 0) sleepSync(5);
  const local = path.join(DISTILL, 'audiobook', 'final', lang);
  const fs = require('fs');
  if (!fs.existsSync(local)) {
    console.warn(`Saltando ${lang}: no existe ${local} (genera audio antes).`);
    continue;
  }
  const files = fs.readdirSync(local).filter(f => f.endsWith('.mp3'));
  if (files.length === 0) {
    console.warn(`Saltando ${lang}: no hay .mp3 en ${local}`);
    continue;
  }

  const dest = `${remoteBase}/${lang}/`;
  const remoteDir = `${baseDir.replace(/\/$/, '')}/audiobook/distill/${lang}`;
  console.log(`\nSubiendo ${lang} → ${dest}`);
  execSync(
    `sshpass -e ssh -p ${port} -o StrictHostKeyChecking=accept-new ${user}@${host} mkdir -p '${remoteDir.replace(/'/g, "'\\''")}'`,
    {
      stdio: 'inherit',
      env
    }
  );
  execSync(`sshpass -e rsync -avz -e "${ssh}" "${local}/" "${dest}"`, {
    stdio: 'inherit',
    env
  });
}

console.log('\n✅ Subida completada (audiobook/distill/en|es en static).');
