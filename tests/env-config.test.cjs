const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const ENV_PATH = path.join(ROOT, '.env');
const ENV_BACKUP = path.join(ROOT, '.env.test-backup');

function build() {
  execSync('node scripts/build-v2.cjs', { cwd: ROOT, stdio: 'pipe' });
}

function readPage(relPath) {
  return fs.readFileSync(path.join(DIST, relPath), 'utf8');
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

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
// Tests
// ─────────────────────────────────────────────────────────────

describe('ENV: SITE_URL', () => {
  before(() => backupEnv());
  after(() => restoreEnv());

  it('uses SITE_URL for canonical URLs', () => {
    writeEnv({ SITE_URL: 'https://example.com', GA_ID: '', GITHUB_REPO: '' });
    build();
    const html = readPage('en/index.html');
    assert.ok(html.includes('href="https://example.com/en/"'), 'canonical should use SITE_URL');
  });

  it('uses SITE_URL hostname in <title>', () => {
    writeEnv({ SITE_URL: 'https://example.com', GA_ID: '', GITHUB_REPO: '' });
    build();
    const html = readPage('en/index.html');
    assert.ok(html.includes('| example.com</title>'), 'title should include domain');
  });

  it('uses SITE_URL in hreflang alternates', () => {
    writeEnv({ SITE_URL: 'https://example.com', GA_ID: '', GITHUB_REPO: '' });
    build();
    const html = readPage('en/index.html');
    assert.ok(html.includes('href="https://example.com/es/"'), 'hreflang should use SITE_URL');
  });

  it('defaults to eluno.org when SITE_URL is absent', () => {
    writeEnv({ GA_ID: '', GITHUB_REPO: '' });
    build();
    const html = readPage('en/index.html');
    assert.ok(html.includes('href="https://eluno.org/en/"'), 'should default to eluno.org');
  });
});

describe('ENV: GA_ID', () => {
  before(() => backupEnv());
  after(() => restoreEnv());

  it('injects GA scripts when GA_ID is set', () => {
    writeEnv({ SITE_URL: 'https://eluno.org', GA_ID: 'G-TEST123', GITHUB_REPO: '' });
    build();
    const pages = [
      'en/index.html',
      'en/chapters/cosmology-and-genesis.html',
      'en/about.html',
      'en/glossary.html',
    ];
    for (const p of pages) {
      const html = readPage(p);
      assert.ok(html.includes('G-TEST123'), `${p} should contain GA ID`);
      assert.ok(html.includes('googletagmanager'), `${p} should contain GA script`);
    }
  });

  it('omits GA scripts when GA_ID is empty', () => {
    writeEnv({ SITE_URL: 'https://eluno.org', GA_ID: '', GITHUB_REPO: '' });
    build();
    const pages = [
      'en/index.html',
      'en/chapters/cosmology-and-genesis.html',
      'en/about.html',
      'en/glossary.html',
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
    writeEnv({
      SITE_URL: 'https://eluno.org',
      GA_ID: '',
      GITHUB_REPO: 'https://github.com/test/repo',
    });
    build();
    const html = readPage('en/index.html');
    assert.ok(html.includes('https://github.com/test/repo'), 'footer should have GitHub link');
  });

  it('hides GitHub link when empty', () => {
    writeEnv({ SITE_URL: 'https://eluno.org', GA_ID: '', GITHUB_REPO: '' });
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
    build(); // should not throw
    const html = readPage('en/index.html');
    assert.ok(html.includes('https://eluno.org'), 'should default to eluno.org');
    assert.ok(!html.includes('googletagmanager'), 'should not have GA without .env');
  });
});
