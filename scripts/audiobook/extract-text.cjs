#!/usr/bin/env node

/**
 * Extract chapter text from i18n JSON → TTS-ready plain text files
 *
 * Reads: i18n/{lang}/chapters/NN.json
 * Writes: audiobook/text/{lang}/chNN.txt
 *
 * Usage:
 *   node scripts/audiobook/extract-text.cjs                # All languages, all chapters
 *   node scripts/audiobook/extract-text.cjs --lang es       # Spanish only
 *   node scripts/audiobook/extract-text.cjs --only 3        # Chapter 3 only
 *   node scripts/audiobook/extract-text.cjs --lang en --only 1-5  # EN chapters 1-5
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const I18N_DIR = path.join(PROJECT_ROOT, 'i18n');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'audiobook', 'text');
const LANGUAGES = ['en', 'es', 'pt'];

// ============================================================================
// PARSE ARGUMENTS
// ============================================================================

function parseArgs() {
  const args = process.argv.slice(2);
  const options = { langs: LANGUAGES, only: null, start: 1, end: 16 };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--lang':
        options.langs = [args[++i]];
        break;
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
      case '--help':
      case '-h':
        console.log(`
Extract chapter text for TTS

Usage:
  node scripts/audiobook/extract-text.cjs [options]

Options:
  --lang <code>    Language (en, es, pt). Default: all
  --only <N|N-M>   Chapter number or range. Default: all
  -h, --help       Show help
`);
        process.exit(0);
    }
  }

  return options;
}

// ============================================================================
// TEXT PROCESSING
// ============================================================================

/**
 * Load glossary for a language
 */
function loadGlossary(lang) {
  const glossaryPath = path.join(I18N_DIR, lang, 'glossary.json');
  try {
    return JSON.parse(fs.readFileSync(glossaryPath, 'utf8'));
  } catch {
    return {};
  }
}

/**
 * Clean text for TTS narration:
 * - Replace {term:xxx} with glossary title (translated term name)
 * - Remove {ref:xxx} markers entirely
 */
function cleanForTTS(text, glossary) {
  // {term:xxx} → use glossary title (e.g. {term:infinite} → "El Infinito" in ES)
  // Strip parenthetical descriptions like "(Primera Distorsión)" for TTS
  text = text.replace(/\{term:([^}]+)\}/g, (_, id) => {
    const term = glossary[id];
    if (term && term.title) return term.title.replace(/\s*\([^)]+\)\s*/g, '').trim();
    // Fallback: humanize the ID
    return id.replace(/-/g, ' ');
  });

  // {ref:xxx} → remove entirely (source references, not read aloud)
  text = text.replace(/\{ref:[^}]+\}/g, '');

  // Fix duplicate articles from glossary term insertion
  // ES: "el El Infinito" → "El Infinito", "El El Llamado" → "El Llamado"
  // EN: "the The Infinite" → "The Infinite", "The The Calling" → "The Calling"
  // PT: "o O Infinito" → "O Infinito", "do os Logos" → "dos Logos"
  const articlePattern =
    /\b(el|la|los|las|del|al|the|o|a|os|as|do|da|dos|das)\s+(el|la|los|las|the|o|a|os|as)\s/gi;
  text = text.replace(articlePattern, (match, art, termArt) => {
    const al = art.toLowerCase();
    const tl = termArt.toLowerCase();
    // Same article: "el El" → "El", "the The" → "The", "o O" → "O"
    if (al === tl) return termArt + ' ';
    // Spanish contractions: "del El" → "del ", "al El" → "al "
    if ((al === 'del' || al === 'al') && tl === 'el') return art + ' ';
    // Portuguese contractions: "do O" → "do ", "da A" → "da ", "do os" → "dos "
    if (al === 'do' && tl === 'os') return 'dos ';
    if (al === 'do' && tl === 'as') return 'das ';
    if (al === 'da' && tl === 'a') return 'da ';
    if (
      (al === 'do' || al === 'da' || al === 'dos' || al === 'das') &&
      (tl === 'o' || tl === 'a' || tl === 'os' || tl === 'as')
    )
      return art + ' ';
    return match; // Don't modify if no rule matches
  });

  // Fix trailing duplicate from multi-word glossary terms
  // The JSON may say "{term:veil} del olvido" but glossary returns "Velo del Olvido"
  // resulting in "Velo del Olvido del olvido". Detect and remove the trailing duplicate.
  text = text.replace(/((?:del|do|da|of|dos|das)\s+\w+)\s+\1/gi, '$1');

  // Clean up double spaces
  text = text.replace(/  +/g, ' ');

  return text.trim();
}

/**
 * Convert chapter JSON to TTS-ready plain text
 */
function chapterToText(chapter, glossary) {
  const lines = [];

  // Chapter title as opening
  lines.push(chapter.title);
  lines.push('');

  for (const section of chapter.sections) {
    // Section title with pause
    lines.push(section.title);
    lines.push('');

    for (const block of section.content) {
      if (block.type === 'separator') {
        lines.push('');
        continue;
      }

      if ((block.type === 'paragraph' || block.type === 'quote') && block.text) {
        lines.push(cleanForTTS(block.text, glossary));
        lines.push('');
      }
    }
  }

  return lines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
  const options = parseArgs();

  console.log('\n📝 EXTRACT CHAPTER TEXT FOR TTS\n');

  let totalFiles = 0;

  for (const lang of options.langs) {
    const chaptersDir = path.join(I18N_DIR, lang, 'chapters');
    if (!fs.existsSync(chaptersDir)) {
      console.log(`  ⚠ No chapters dir for ${lang}, skipping`);
      continue;
    }

    const glossary = loadGlossary(lang);
    const termCount = Object.keys(glossary).length;

    const outDir = path.join(OUTPUT_DIR, lang);
    fs.mkdirSync(outDir, { recursive: true });

    // Find chapter files
    const files = fs
      .readdirSync(chaptersDir)
      .filter(f => f.match(/^\d{2}\.json$/))
      .sort();

    console.log(`📖 ${lang.toUpperCase()} — ${files.length} chapters, ${termCount} glossary terms`);

    for (const file of files) {
      const num = parseInt(file.replace('.json', ''));

      // Filter by options
      if (options.only && num !== options.only) continue;
      if (num < options.start || num > options.end) continue;

      const chapter = JSON.parse(fs.readFileSync(path.join(chaptersDir, file), 'utf8'));
      const text = chapterToText(chapter, glossary);
      const outPath = path.join(outDir, `ch${String(num).padStart(2, '0')}.txt`);

      fs.writeFileSync(outPath, text, 'utf8');

      const wordCount = text.split(/\s+/).length;
      const estMinutes = Math.round(wordCount / 150); // ~150 wpm narration
      console.log(
        `  ✓ ch${String(num).padStart(2, '0')}.txt — ${wordCount.toLocaleString()} words (~${estMinutes} min)`
      );
      totalFiles++;
    }
  }

  console.log(`\n✅ ${totalFiles} text files extracted to audiobook/text/\n`);
}

try {
  main();
} catch (err) {
  console.error(err);
  process.exit(1);
}
