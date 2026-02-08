#!/usr/bin/env node

/**
 * =============================================================================
 * LINK CHECKER SCRIPT FOR ELUNO.ORG
 * =============================================================================
 *
 * IMPORTANT FOR AI AGENTS:
 * -------------------------
 * This script ALREADY EXISTS. Do NOT recreate it. Use this existing script
 * when the user asks to check links, verify URLs, find broken links, or
 * analyze the site for 404 errors.
 *
 * LOCATION: scripts/check-links.js
 *
 * USAGE:
 *   node scripts/check-links.js
 *
 * WHAT IT DOES:
 * - Scans all HTML files in /dist
 * - Checks internal links (pages, anchors)
 * - Checks external links (HTTP status)
 * - Verifies media files exist (PDFs, images, fonts)
 * - Validates redirects in /_redirects
 * - Checks glossary terms used in chapters vs defined in glossary.json
 * - Checks references used vs defined in references.json
 * - Detects duplicate HTML IDs
 *
 * OUTPUT:
 * - Colored console output with progress indicators
 * - Summary report with all issues categorized
 * - Statistics on files and links analyzed
 *
 * NOTES:
 * - External links to Wikipedia may show 403 (anti-bot protection) but work in browsers
 * - Run time: ~2-3 minutes due to external link checking with rate limiting
 * - For quick internal-only check, comment out the external links section
 *
 * LAST UPDATED: 2026-01-16
 * =============================================================================
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const DIST_DIR = path.join(__dirname, '..', 'dist');
const I18N_DIR = path.join(__dirname, '..', 'i18n');
const BASE_URL = 'https://eluno.org';
const STATIC_URL = 'https://static.eluno.org';

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Results storage
const results = {
  htmlFiles: [],
  internalLinks: [],
  externalLinks: [],
  mediaFiles: [],
  brokenInternal: [],
  brokenExternal: [],
  brokenMedia: [],
  redirectIssues: [],
  glossaryTerms: [],
  missingGlossaryTerms: [],
  duplicateIds: [],
  warnings: []
};

// Helper to get all files recursively
function getAllFiles(dir, extension, files = []) {
  if (!fs.existsSync(dir)) return files;

  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, extension, files);
    } else if (item.endsWith(extension)) {
      files.push(fullPath);
    }
  }
  return files;
}

// Extract links from HTML content
function extractLinksFromHtml(content, filePath) {
  const links = {
    internal: [],
    external: [],
    anchors: [],
    media: []
  };

  // Extract href links
  const hrefRegex = /href=["']([^"']+)["']/g;
  let match;
  while ((match = hrefRegex.exec(content)) !== null) {
    const url = match[1];
    if (url.startsWith('#')) {
      links.anchors.push({ url, file: filePath });
    } else if (url.startsWith('http://') || url.startsWith('https://')) {
      links.external.push({ url, file: filePath });
    } else if (url.startsWith('mailto:') || url.startsWith('tel:')) {
      // Skip mailto and tel links
    } else {
      links.internal.push({ url, file: filePath });
    }
  }

  // Extract src links (images, scripts, etc.)
  const srcRegex = /src=["']([^"']+)["']/g;
  while ((match = srcRegex.exec(content)) !== null) {
    const url = match[1];
    if (url.startsWith('http://') || url.startsWith('https://')) {
      links.external.push({ url, file: filePath });
    } else if (!url.startsWith('data:')) {
      links.media.push({ url, file: filePath });
    }
  }

  // Extract CSS links
  const cssRegex = /url\(["']?([^"')]+)["']?\)/g;
  while ((match = cssRegex.exec(content)) !== null) {
    const url = match[1];
    if (!url.startsWith('data:') && !url.startsWith('#')) {
      links.media.push({ url, file: filePath });
    }
  }

  return links;
}

// Check if local file exists
function checkLocalFile(url, sourceFile) {
  // Normalize the URL
  let normalizedUrl = url.split('?')[0].split('#')[0];

  // Handle root-relative URLs
  if (normalizedUrl.startsWith('/')) {
    normalizedUrl = path.join(DIST_DIR, normalizedUrl);
  } else {
    // Handle relative URLs
    const sourceDir = path.dirname(sourceFile);
    normalizedUrl = path.join(sourceDir, normalizedUrl);
  }

  // Check if it's a directory (look for index.html)
  if (fs.existsSync(normalizedUrl) && fs.statSync(normalizedUrl).isDirectory()) {
    normalizedUrl = path.join(normalizedUrl, 'index.html');
  }

  return fs.existsSync(normalizedUrl);
}

// Check external URL (with rate limiting)
async function checkExternalUrl(url, timeout = 10000) {
  return new Promise(resolve => {
    try {
      const urlObj = new URL(url);
      const protocol = urlObj.protocol === 'https:' ? https : http;

      const req = protocol.request(url, { method: 'HEAD', timeout }, res => {
        resolve({
          status: res.statusCode,
          ok: res.statusCode >= 200 && res.statusCode < 400,
          redirected: res.statusCode >= 300 && res.statusCode < 400,
          location: res.headers.location
        });
      });

      req.on('error', err => {
        resolve({ status: 0, ok: false, error: err.message });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({ status: 0, ok: false, error: 'Timeout' });
      });

      req.end();
    } catch (err) {
      resolve({ status: 0, ok: false, error: err.message });
    }
  });
}

// Parse redirects file
function parseRedirects() {
  const redirectsFile = path.join(DIST_DIR, '_redirects');
  const redirects = {};

  if (fs.existsSync(redirectsFile)) {
    const content = fs.readFileSync(redirectsFile, 'utf-8');
    const lines = content.split('\n').filter(l => l.trim() && !l.startsWith('#'));

    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 2) {
        redirects[parts[0]] = parts[1];
      }
    }
  }

  return redirects;
}

// Check glossary terms in JSON content
function checkGlossaryTerms(lang) {
  const glossaryFile = path.join(I18N_DIR, lang, 'glossary.json');
  const chaptersDir = path.join(I18N_DIR, lang, 'chapters');

  if (!fs.existsSync(glossaryFile)) {
    results.warnings.push(`Glossary file not found: ${glossaryFile}`);
    return;
  }

  const glossary = JSON.parse(fs.readFileSync(glossaryFile, 'utf-8'));
  const glossaryTerms = new Set(Object.keys(glossary));
  const usedTerms = new Set();

  // Check all chapter files
  const chapterFiles = getAllFiles(chaptersDir, '.json');
  for (const chapterFile of chapterFiles) {
    const content = fs.readFileSync(chapterFile, 'utf-8');

    // Find {term:xxx} patterns
    const termRegex = /\{term:([^}]+)\}/g;
    let match;
    while ((match = termRegex.exec(content)) !== null) {
      const term = match[1];
      usedTerms.add(term);

      if (!glossaryTerms.has(term)) {
        results.missingGlossaryTerms.push({
          term,
          file: chapterFile,
          lang
        });
      }
    }
  }

  // Check for unused glossary terms
  for (const term of glossaryTerms) {
    if (!usedTerms.has(term)) {
      results.warnings.push(`Unused glossary term in ${lang}: ${term}`);
    }
  }
}

// Check reference IDs
function checkReferences(lang) {
  const referencesFile = path.join(I18N_DIR, lang, 'references.json');
  const chaptersDir = path.join(I18N_DIR, lang, 'chapters');

  if (!fs.existsSync(referencesFile)) {
    results.warnings.push(`References file not found: ${referencesFile}`);
    return;
  }

  const references = JSON.parse(fs.readFileSync(referencesFile, 'utf-8'));
  const refIds = new Set(Object.keys(references));
  const usedRefs = new Set();

  // Check all chapter files
  const chapterFiles = getAllFiles(chaptersDir, '.json');
  for (const chapterFile of chapterFiles) {
    const content = fs.readFileSync(chapterFile, 'utf-8');

    // Find {ref:xxx} patterns
    const refRegex = /\{ref:([^}]+)\}/g;
    let match;
    while ((match = refRegex.exec(content)) !== null) {
      const ref = match[1];
      usedRefs.add(ref);

      if (!refIds.has(ref)) {
        results.warnings.push(
          `Missing reference in ${lang}: ${ref} (used in ${path.basename(chapterFile)})`
        );
      }
    }
  }
}

// Check for duplicate IDs in HTML
function checkDuplicateIds(content, filePath) {
  const idRegex = /id=["']([^"']+)["']/g;
  const ids = new Map();
  let match;

  while ((match = idRegex.exec(content)) !== null) {
    const id = match[1];
    if (ids.has(id)) {
      results.duplicateIds.push({
        id,
        file: filePath,
        count: (ids.get(id) || 0) + 1
      });
    }
    ids.set(id, (ids.get(id) || 0) + 1);
  }
}

// Main analysis function
async function analyze() {
  console.log(
    `${colors.bold}${colors.blue}========================================${colors.reset}`
  );
  console.log(`${colors.bold}${colors.blue}  eluno.org Link & Content Checker${colors.reset}`);
  console.log(
    `${colors.bold}${colors.blue}========================================${colors.reset}\n`
  );

  // 1. Get all HTML files
  console.log(`${colors.yellow}[1/7] Scanning HTML files...${colors.reset}`);
  const htmlFiles = getAllFiles(DIST_DIR, '.html');
  results.htmlFiles = htmlFiles;
  console.log(`  Found ${htmlFiles.length} HTML files\n`);

  // 2. Extract all links
  console.log(`${colors.yellow}[2/7] Extracting links from HTML...${colors.reset}`);
  const allInternalLinks = new Set();
  const allExternalLinks = new Set();
  const allMediaLinks = new Set();

  for (const file of htmlFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const links = extractLinksFromHtml(content, file);

    links.internal.forEach(l => {
      allInternalLinks.add(JSON.stringify(l));
      results.internalLinks.push(l);
    });

    links.external.forEach(l => {
      allExternalLinks.add(JSON.stringify(l));
      results.externalLinks.push(l);
    });

    links.media.forEach(l => {
      allMediaLinks.add(JSON.stringify(l));
      results.mediaFiles.push(l);
    });

    // Check for duplicate IDs
    checkDuplicateIds(content, file);
  }

  console.log(`  Internal links: ${allInternalLinks.size}`);
  console.log(`  External links: ${allExternalLinks.size}`);
  console.log(`  Media references: ${allMediaLinks.size}\n`);

  // 3. Check internal links
  console.log(`${colors.yellow}[3/7] Checking internal links...${colors.reset}`);
  const uniqueInternal = [...new Set(results.internalLinks.map(l => l.url))];
  let brokenCount = 0;

  for (const link of results.internalLinks) {
    if (!checkLocalFile(link.url, link.file)) {
      results.brokenInternal.push(link);
      brokenCount++;
    }
  }

  if (brokenCount > 0) {
    console.log(`  ${colors.red}✗ Found ${brokenCount} broken internal links${colors.reset}\n`);
  } else {
    console.log(`  ${colors.green}✓ All internal links OK${colors.reset}\n`);
  }

  // 4. Check media files
  console.log(`${colors.yellow}[4/7] Checking media files...${colors.reset}`);
  brokenCount = 0;

  for (const media of results.mediaFiles) {
    if (!checkLocalFile(media.url, media.file)) {
      results.brokenMedia.push(media);
      brokenCount++;
    }
  }

  if (brokenCount > 0) {
    console.log(`  ${colors.red}✗ Found ${brokenCount} missing media files${colors.reset}\n`);
  } else {
    console.log(`  ${colors.green}✓ All media files OK${colors.reset}\n`);
  }

  // 5. Check redirects
  console.log(`${colors.yellow}[5/7] Checking redirects configuration...${colors.reset}`);
  const redirects = parseRedirects();
  const redirectCount = Object.keys(redirects).length;

  for (const [from, to] of Object.entries(redirects)) {
    // Check if target exists
    const targetPath = path.join(DIST_DIR, to);
    if (!fs.existsSync(targetPath) && !fs.existsSync(path.join(targetPath, 'index.html'))) {
      results.redirectIssues.push({ from, to, issue: 'Target does not exist' });
    }
  }

  if (results.redirectIssues.length > 0) {
    console.log(
      `  ${colors.red}✗ Found ${results.redirectIssues.length} redirect issues${colors.reset}\n`
    );
  } else {
    console.log(`  ${colors.green}✓ All ${redirectCount} redirects OK${colors.reset}\n`);
  }

  // 6. Check glossary and references
  console.log(`${colors.yellow}[6/7] Checking glossary terms and references...${colors.reset}`);
  for (const lang of ['en', 'es', 'pt']) {
    checkGlossaryTerms(lang);
    checkReferences(lang);
  }

  if (results.missingGlossaryTerms.length > 0) {
    console.log(
      `  ${colors.red}✗ Found ${results.missingGlossaryTerms.length} missing glossary terms${colors.reset}\n`
    );
  } else {
    console.log(`  ${colors.green}✓ All glossary terms defined${colors.reset}\n`);
  }

  // 7. Check external links (sample)
  console.log(
    `${colors.yellow}[7/7] Checking external links (this may take a while)...${colors.reset}`
  );
  const uniqueExternal = [...new Set(results.externalLinks.map(l => l.url))];
  console.log(`  Checking ${uniqueExternal.length} unique external URLs...\n`);

  let checkedCount = 0;
  for (const url of uniqueExternal) {
    const result = await checkExternalUrl(url);
    checkedCount++;

    if (!result.ok) {
      const sourceFiles = results.externalLinks.filter(l => l.url === url).map(l => l.file);

      results.brokenExternal.push({
        url,
        status: result.status,
        error: result.error,
        files: sourceFiles
      });

      process.stdout.write(`  ${colors.red}✗${colors.reset}`);
    } else if (result.redirected) {
      process.stdout.write(`  ${colors.yellow}→${colors.reset}`);
    } else {
      process.stdout.write(`  ${colors.green}✓${colors.reset}`);
    }

    // Print progress every 20 URLs
    if (checkedCount % 20 === 0) {
      process.stdout.write(` (${checkedCount}/${uniqueExternal.length})\n`);
    }

    // Rate limiting
    await new Promise(r => setTimeout(r, 100));
  }

  console.log('\n');

  // Print summary
  printSummary();
}

function printSummary() {
  console.log(
    `${colors.bold}${colors.blue}========================================${colors.reset}`
  );
  console.log(`${colors.bold}${colors.blue}            SUMMARY REPORT${colors.reset}`);
  console.log(
    `${colors.bold}${colors.blue}========================================${colors.reset}\n`
  );

  // Broken internal links
  if (results.brokenInternal.length > 0) {
    console.log(
      `${colors.bold}${colors.red}BROKEN INTERNAL LINKS (${results.brokenInternal.length}):${colors.reset}`
    );
    const unique = [...new Map(results.brokenInternal.map(l => [l.url, l])).values()];
    for (const link of unique) {
      const relativePath = path.relative(DIST_DIR, link.file);
      console.log(`  ${colors.red}✗${colors.reset} ${link.url}`);
      console.log(`    ${colors.yellow}in: ${relativePath}${colors.reset}`);
    }
    console.log();
  }

  // Broken media
  if (results.brokenMedia.length > 0) {
    console.log(
      `${colors.bold}${colors.red}MISSING MEDIA FILES (${results.brokenMedia.length}):${colors.reset}`
    );
    const unique = [...new Map(results.brokenMedia.map(l => [l.url, l])).values()];
    for (const media of unique) {
      const relativePath = path.relative(DIST_DIR, media.file);
      console.log(`  ${colors.red}✗${colors.reset} ${media.url}`);
      console.log(`    ${colors.yellow}in: ${relativePath}${colors.reset}`);
    }
    console.log();
  }

  // Broken external links
  if (results.brokenExternal.length > 0) {
    console.log(
      `${colors.bold}${colors.red}BROKEN EXTERNAL LINKS (${results.brokenExternal.length}):${colors.reset}`
    );
    for (const link of results.brokenExternal) {
      console.log(`  ${colors.red}✗${colors.reset} ${link.url}`);
      console.log(`    ${colors.yellow}Status: ${link.status || link.error}${colors.reset}`);
      console.log(
        `    ${colors.yellow}Files: ${link.files.map(f => path.relative(DIST_DIR, f)).join(', ')}${colors.reset}`
      );
    }
    console.log();
  }

  // Redirect issues
  if (results.redirectIssues.length > 0) {
    console.log(
      `${colors.bold}${colors.red}REDIRECT ISSUES (${results.redirectIssues.length}):${colors.reset}`
    );
    for (const issue of results.redirectIssues) {
      console.log(`  ${colors.red}✗${colors.reset} ${issue.from} → ${issue.to}`);
      console.log(`    ${colors.yellow}${issue.issue}${colors.reset}`);
    }
    console.log();
  }

  // Missing glossary terms
  if (results.missingGlossaryTerms.length > 0) {
    console.log(
      `${colors.bold}${colors.red}MISSING GLOSSARY TERMS (${results.missingGlossaryTerms.length}):${colors.reset}`
    );
    for (const term of results.missingGlossaryTerms) {
      const relativePath = path.relative(I18N_DIR, term.file);
      console.log(`  ${colors.red}✗${colors.reset} {term:${term.term}} (${term.lang})`);
      console.log(`    ${colors.yellow}in: ${relativePath}${colors.reset}`);
    }
    console.log();
  }

  // Duplicate IDs
  if (results.duplicateIds.length > 0) {
    console.log(
      `${colors.bold}${colors.yellow}DUPLICATE IDS (${results.duplicateIds.length}):${colors.reset}`
    );
    for (const dup of results.duplicateIds) {
      const relativePath = path.relative(DIST_DIR, dup.file);
      console.log(`  ${colors.yellow}!${colors.reset} id="${dup.id}" appears ${dup.count}x`);
      console.log(`    ${colors.yellow}in: ${relativePath}${colors.reset}`);
    }
    console.log();
  }

  // Warnings
  if (results.warnings.length > 0) {
    console.log(
      `${colors.bold}${colors.yellow}WARNINGS (${results.warnings.length}):${colors.reset}`
    );
    for (const warning of results.warnings) {
      console.log(`  ${colors.yellow}!${colors.reset} ${warning}`);
    }
    console.log();
  }

  // Final stats
  const totalIssues =
    results.brokenInternal.length +
    results.brokenMedia.length +
    results.brokenExternal.length +
    results.redirectIssues.length +
    results.missingGlossaryTerms.length;

  console.log(
    `${colors.bold}${colors.blue}========================================${colors.reset}`
  );
  if (totalIssues === 0) {
    console.log(`${colors.bold}${colors.green}  ✓ NO CRITICAL ISSUES FOUND!${colors.reset}`);
  } else {
    console.log(`${colors.bold}${colors.red}  ✗ ${totalIssues} ISSUES FOUND${colors.reset}`);
  }
  console.log(
    `${colors.bold}${colors.blue}========================================${colors.reset}`
  );

  console.log(`\n${colors.bold}Statistics:${colors.reset}`);
  console.log(`  HTML files scanned: ${results.htmlFiles.length}`);
  console.log(`  Internal links: ${results.internalLinks.length}`);
  console.log(`  External links: ${results.externalLinks.length}`);
  console.log(`  Media references: ${results.mediaFiles.length}`);
  console.log(`  Warnings: ${results.warnings.length}`);
}

// Run the analyzer
analyze().catch(console.error);
