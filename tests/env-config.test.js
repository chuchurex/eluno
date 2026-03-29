import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const ENV_PATH = path.join(ROOT, '.env');
const ENV_BACKUP = path.join(ROOT, '.env.test-backup');

function build() {
  execSync('npx eluno-build', { cwd: ROOT, stdio: 'pipe' });
}

function readPage(relPath) {
  return fs.readFileSync(path.join(DIST, relPath), 'utf8');
}

function backupEnv() {
  if (fs.existsSync(ENV_PATH)) {
    fs.copyFileSync(ENV_PATH, ENV_BACKUP);
  }
}

function restoreEnv() {
  if (fs.existsSync(ENV_BACKUP)) {
    fs.copyFileSync(ENV_BACKUP, ENV_PATH);
    fs.unlinkSync(ENV_BACKUP);
  }
}

function writeEnv(vars) {
  const lines = Object.entries(vars).map(([k, v]) => `${k}=${v}`);
  fs.writeFileSync(ENV_PATH, lines.join('\n') + '\n');
}

function removeEnv() {
  if (fs.existsSync(ENV_PATH)) fs.unlinkSync(ENV_PATH);
}

// ─────────────────────────────────────────────────────────────
// siteUrl comes from eluno.config.js (not env vars in v2)
// ─────────────────────────────────────────────────────────────

describe('CONFIG: siteUrl', () => {
  before(() => backupEnv());
  after(() => restoreEnv());

  it('uses siteUrl from eluno.config.js for canonical URLs', () => {
    writeEnv({ GA_ID: '', GITHUB_REPO: '' });
    build();
    const html = readPage('en/index.html');
    assert.ok(
      html.includes('href="https://eluno.org/en/"'),
      'canonical should use siteUrl from config'
    );
  });

  it('uses siteUrl hostname in <title>', () => {
    writeEnv({ GA_ID: '', GITHUB_REPO: '' });
    build();
    const html = readPage('en/index.html');
    assert.ok(html.includes('| eluno.org</title>'), 'title should include config domain');
  });

  it('uses siteUrl in hreflang alternates', () => {
    writeEnv({ GA_ID: '', GITHUB_REPO: '' });
    build();
    const html = readPage('en/index.html');
    assert.ok(
      html.includes('href="https://eluno.org/es/"'),
      'hreflang should use siteUrl from config'
    );
  });
});

describe('ENV: GA_ID', () => {
  before(() => backupEnv());
  after(() => restoreEnv());

  it('injects GA scripts when GA_ID is set', () => {
    writeEnv({ GA_ID: 'G-TEST123', GITHUB_REPO: '' });
    build();
    const pages = [
      'en/index.html',
      'en/chapters/cosmology-and-genesis.html',
      'en/about.html',
      'en/glossary.html'
    ];
    for (const p of pages) {
      const html = readPage(p);
      assert.ok(html.includes('G-TEST123'), `${p} should contain GA ID`);
      assert.ok(html.includes('googletagmanager'), `${p} should contain GA script`);
    }
  });

  it('omits GA scripts when GA_ID is empty', () => {
    writeEnv({ GA_ID: '', GITHUB_REPO: '' });
    build();
    const pages = [
      'en/index.html',
      'en/chapters/cosmology-and-genesis.html',
      'en/about.html',
      'en/glossary.html'
    ];
    for (const p of pages) {
      const html = readPage(p);
      assert.ok(!html.includes('googletagmanager'), `${p} should NOT contain GA script`);
    }
  });
});

describe('ENV: GITHUB_REPO', () => {
  before(() => backupEnv());
  after(() => restoreEnv());

  it('shows GitHub link in footer when set', () => {
    writeEnv({ GA_ID: '', GITHUB_REPO: 'https://github.com/test/repo' });
    build();
    const html = readPage('en/index.html');
    assert.ok(html.includes('https://github.com/test/repo'), 'footer should have GitHub link');
  });

  it('hides GitHub link when empty', () => {
    writeEnv({ GA_ID: '', GITHUB_REPO: '' });
    build();
    const index = readPage('en/index.html');
    const chapter = readPage('en/chapters/cosmology-and-genesis.html');
    assert.ok(!index.includes('github.com'), 'index footer should not have GitHub link');
    assert.ok(!chapter.includes('github.com'), 'chapter footer should not have GitHub link');
  });
});

describe('ENV: no .env file', () => {
  before(() => backupEnv());
  after(() => restoreEnv());

  it('builds successfully with defaults when .env is missing', () => {
    removeEnv();
    build();
    const html = readPage('en/index.html');
    assert.ok(html.includes('https://eluno.org'), 'should use siteUrl from config');
    assert.ok(!html.includes('googletagmanager'), 'should not have GA without .env');
  });
});
