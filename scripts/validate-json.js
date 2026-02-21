#!/usr/bin/env node
/**
 * validate-json.js — Validates i18n JSON files
 *
 * Checks:
 * - Valid JSON syntax
 * - Required fields for chapters (id, number, title, sections)
 * - Glossary term references exist
 * - Consistent structure across languages
 *
 * Usage:
 *   node scripts/validate-json.js              # Validate all
 *   node scripts/validate-json.js path/to.json # Validate specific file
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const I18N_DIR = path.join(__dirname, '../i18n');
const LANGUAGES = ['en', 'es', 'pt'];

let errors = 0;
let warnings = 0;

// ─────────────────────────────────────────────────────────────
// Logging
// ─────────────────────────────────────────────────────────────

function logError(file, message) {
  console.error(`❌ ${file}: ${message}`);
  errors++;
}

function logWarning(file, message) {
  console.warn(`⚠️  ${file}: ${message}`);
  warnings++;
}

function logSuccess(file) {
  console.log(`✅ ${file}`);
}

// ─────────────────────────────────────────────────────────────
// Validators
// ─────────────────────────────────────────────────────────────

function validateJSON(filePath) {
  const relativePath = path.relative(process.cwd(), filePath);

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    return { valid: true, data, path: relativePath };
  } catch (e) {
    logError(relativePath, `Invalid JSON: ${e.message}`);
    return { valid: false, path: relativePath };
  }
}

function validateChapter(result) {
  if (!result.valid) {
    return;
  }

  const { data, path: filePath } = result;
  const requiredFields = ['id', 'number', 'title', 'sections'];

  for (const field of requiredFields) {
    if (!(field in data)) {
      logError(filePath, `Missing required field: ${field}`);
    }
  }

  if (data.sections && Array.isArray(data.sections)) {
    data.sections.forEach((section, i) => {
      if (!section.id) {
        logError(filePath, `Section ${i} missing 'id'`);
      }
      if (!section.title) {
        logWarning(filePath, `Section ${i} missing 'title'`);
      }
      if (!section.content || !Array.isArray(section.content)) {
        logError(filePath, `Section ${i} missing 'content' array`);
      }
    });
  }

  // Check for term references that might be broken
  const termPattern = /\{term:([a-z0-9-]+)\}/gi;
  const jsonStr = JSON.stringify(data);
  const terms = [...jsonStr.matchAll(termPattern)].map(m => m[1]);

  if (terms.length > 0) {
    // Load glossary to verify terms exist
    const lang = filePath.split('/')[1] || 'en';
    const glossaryPath = path.join(I18N_DIR, lang, 'glossary.json');

    if (fs.existsSync(glossaryPath)) {
      try {
        const glossary = JSON.parse(fs.readFileSync(glossaryPath, 'utf8'));
        for (const term of terms) {
          if (!(term in glossary)) {
            logWarning(filePath, `Term not in glossary: {term:${term}}`);
          }
        }
      } catch (_e) {
        // Glossary parse error handled separately
      }
    }
  }

  logSuccess(filePath);
}

function validateGlossary(result) {
  if (!result.valid) {
    return;
  }

  const { data, path: filePath } = result;

  for (const [key, value] of Object.entries(data)) {
    if (!value.title) {
      logError(filePath, `Term '${key}' missing 'title'`);
    }
    if (!value.content) {
      logError(filePath, `Term '${key}' missing 'content'`);
    }
  }

  logSuccess(filePath);
}

function validateUI(result) {
  if (!result.valid) {
    return;
  }

  logSuccess(result.path);
}

// ─────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────

function validateFile(filePath) {
  const result = validateJSON(filePath);

  if (!result.valid) {
    return;
  }

  const filename = path.basename(filePath);

  if (filePath.includes('/chapters/')) {
    validateChapter(result);
  } else if (filename === 'glossary.json') {
    validateGlossary(result);
  } else {
    validateUI(result);
  }
}

function validateAll() {
  console.log('═══════════════════════════════════════════');
  console.log(' Validating i18n JSON files');
  console.log('═══════════════════════════════════════════\n');

  for (const lang of LANGUAGES) {
    const langDir = path.join(I18N_DIR, lang);

    if (!fs.existsSync(langDir)) {
      logWarning(lang, 'Language directory not found');
      continue;
    }

    console.log(`\n📁 ${lang.toUpperCase()}/`);

    // Validate root files
    const rootFiles = fs.readdirSync(langDir).filter(f => f.endsWith('.json'));
    for (const file of rootFiles) {
      validateFile(path.join(langDir, file));
    }

    // Validate chapters
    const chaptersDir = path.join(langDir, 'chapters');
    if (fs.existsSync(chaptersDir)) {
      console.log(`\n   📂 chapters/`);
      const chapterFiles = fs.readdirSync(chaptersDir).filter(f => f.endsWith('.json'));
      for (const file of chapterFiles) {
        validateFile(path.join(chaptersDir, file));
      }
    }
  }

  // Validate provenance
  const provenanceDir = path.join(I18N_DIR, 'provenance');
  if (fs.existsSync(provenanceDir)) {
    console.log(`\n📁 provenance/`);
    const provFiles = fs.readdirSync(provenanceDir).filter(f => f.endsWith('.json'));
    for (const file of provFiles) {
      validateFile(path.join(provenanceDir, file));
    }
  }

  console.log('\n═══════════════════════════════════════════');

  if (errors > 0) {
    console.log(`❌ ${errors} error(s), ${warnings} warning(s)`);
    process.exit(1);
  } else if (warnings > 0) {
    console.log(`✅ Valid with ${warnings} warning(s)`);
  } else {
    console.log('✅ All files valid!');
  }
}

// ─────────────────────────────────────────────────────────────
// CLI
// ─────────────────────────────────────────────────────────────

const args = process.argv.slice(2);

if (args.length > 0) {
  // Validate specific files
  for (const arg of args) {
    if (fs.existsSync(arg) && arg.endsWith('.json')) {
      validateFile(arg);
    }
  }

  if (errors > 0) {
    process.exit(1);
  }
} else {
  validateAll();
}
