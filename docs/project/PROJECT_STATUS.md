# 📊 Project Status - eluno.org

> **Last Updated:** January 13, 2026
> **Production URL:** https://eluno.org
> **Repository:** https://github.com/chuchurex/eluno.org
> **Branch:** main
> **Last Deploy:** Commit `ae45fb7` - January 13, 2026

---

## 🌐 Production Status

### Live Site
- **URL:** https://eluno.org
- **Status:** ✅ Active
- **CDN:** Cloudflare Pages
- **SSL:** Active (Automatic)
- **Languages:** English (EN), Spanish (ES), Portuguese (PT)

### Current Chapter Titles
Based on `v03_package/instructions/TITULOS_CAPITULOS.json`:
- **Chapter 1:** "The One" (EN) / "El Uno" (ES) / "O Um" (PT)
- URL: https://eluno.org/the-one/

### Build System
- **Build Method:** Node.js static site generator (`scripts/build.js`)
- **Content Source:** JSON files in `i18n/{lang}/chapters/*.json`
- **Title Source:** `TITULOS_CAPITULOS.json` (used in build.js since commit `69b305e`)
- **Output:** Static HTML in `dist/` folder

---

## 📁 Content Version Information

### Chapter 1 (English) - Latest Version

**File:** `i18n/en/chapters/01.json`
**Last Modified:** January 8, 2026 at 15:59:32
**File Size:** 17,250 bytes
**Git Commit:** `57192bb` (2026-01-08 02:49:09)
**Commit Message:** "feat: actualización capítulos EN, glosarios y scripts"

**Content Structure:**
```json
{
  "id": "ch1",
  "number": 1,
  "numberText": "Chapter One",
  "title": "Cosmology and Genesis",
  "sections": [
    {
      "id": "ch1-infinite",
      "title": "The Infinite and the Awakening of Consciousness",
      "content": [
        {
          "type": "paragraph",
          "text": "The first known thing in creation is the {term:infinite}. The Infinite is creation itself."
        },
        ...
      ]
    },
    ...
  ]
}
```

**Important Notes:**
- The JSON field `"title": "Cosmology and Genesis"` is the internal content title
- The H1 displayed on the website comes from `TITULOS_CAPITULOS.json`: `"title": "The One"`
- This was changed in commit `69b305e` to centralize chapter titles

---

## 🔄 Recent Changes (Last 5 Commits)

```
ae45fb7 (HEAD -> main, origin/main) docs: translate all documentation to English
f5729e4 docs: remove YouTube video generation references from ARQUITECTURA.md
ac3ddf4 security: add CREDENTIALS_BACKUP.md to .gitignore
2f51476 revert: change chapter 1 title from 'One' back to 'The One'
69b305e feat: use chapter titles from TITULOS_CAPITULOS.json in build
```

### Key Architectural Change (Commit `69b305e`)
Modified `scripts/build.js` to use chapter titles from `TITULOS_CAPITULOS.json` instead of the JSON chapter files. This affects:
- H1 tags in chapter pages
- Navigation sidebar
- Table of contents
- Previous/Next chapter links
- SEO metadata

---

## 📚 Content Files Overview

### Chapter Files (16 total per language)
```
i18n/
├── en/chapters/
│   ├── 01.json - 17,250 bytes (Jan 8, 2026)
│   ├── 02.json - Chapter content
│   └── ... (16 total)
├── es/chapters/
│   └── ... (16 total)
└── pt/chapters/
    └── ... (16 total)
```

### Configuration Files
```
v03_package/instructions/
└── TITULOS_CAPITULOS.json - Chapter titles for all languages
    Last Modified: Jan 12, 2026
    Used by: scripts/build.js (since commit 69b305e)
```

### UI Translations
```
i18n/en/ui.json - 2,535 bytes (Jan 11, 2026)
i18n/es/ui.json - UI strings in Spanish
i18n/pt/ui.json - UI strings in Portuguese
```

---

## 🏗️ Build Process

### How Content Becomes HTML

1. **Source Data:**
   - Chapter content: `i18n/{lang}/chapters/*.json`
   - Chapter titles: `v03_package/instructions/TITULOS_CAPITULOS.json`
   - UI strings: `i18n/{lang}/ui.json`
   - Glossary: `i18n/{lang}/glossary.json`

2. **Build Command:**
   ```bash
   npm run build
   # Runs: sass + node scripts/build.js
   ```

3. **Output:**
   ```
   dist/
   ├── index.html (EN homepage)
   ├── the-one/index.html (Chapter 1 EN)
   ├── es/
   │   ├── index.html (ES homepage)
   │   └── el-uno/index.html (Chapter 1 ES)
   └── pt/
       ├── index.html (PT homepage)
       └── o-um/index.html (Chapter 1 PT)
   ```

4. **Deploy:**
   ```bash
   npx wrangler pages deploy dist --project-name=eluno
   ```

---

## 🎨 Current H1 Title System

### Example: Chapter 1

**What you see in the browser:**
```html
<h1 class="ch-title">The One</h1>
```

**Where it comes from:**
```json
// File: v03_package/instructions/TITULOS_CAPITULOS.json
{
  "chapters": [
    {
      "number": 1,
      "en": {
        "title": "The One",  // ← This is what appears in H1
        "subtitle": "Infinity and the Creator",
        "filename": "01-the-one"
      }
    }
  ]
}
```

**NOT from:**
```json
// File: i18n/en/chapters/01.json
{
  "title": "Cosmology and Genesis"  // ← This is NOT used in H1 anymore
}
```

**Implementation:**
```javascript
// In scripts/build.js (since commit 69b305e)
function generateChapterContent(chapter, glossary, references, media, ui, lang) {
  // Get title from TITULOS_CAPITULOS.json instead of chapter JSON
  const chapterTitleData = CHAPTER_TITLES.chapters.find(ch => ch.number === chapter.number);
  const chapterTitle = chapterTitleData?.[lang]?.title || chapter.title;

  html += `<h1 class="ch-title">${chapterTitle}</h1>\n`;
}
```

---

## 🔒 Protected Files (Not in Git)

These files exist locally but are protected by `.gitignore`:

```
CREDENTIALS_BACKUP.md - Contains all project credentials
YOUTUBE_BACKUP.md - Backup of discontinued YouTube video generation docs
.env - Environment variables (API keys, server credentials)
```

---

## 📖 Documentation Files

### English (Public - in Git)
- `README.md` - Project overview
- `docs/ARCHITECTURE.md` - Complete technical architecture
- `docs/DEVELOPMENT.md` - Local development guide
- `docs/DEPLOY.md` - Deployment guide

### Spanish (Internal - in Git)
- `docs/ARQUITECTURA.md` - Original Spanish architecture doc
- `docs/CLAUDE.md` - Claude AI integration guide
- `docs/ESTRATEGIA_SEO_LANZAMIENTO.md` - SEO strategy
- `docs/ESTRUCTURA_LIBRO_16_CAPITULOS.md` - Book structure

---

## 🚀 Quick Commands

```bash
# Development
npm run dev              # Start dev server with hot reload

# Build
npm run build            # Generate static site

# Deploy to production
npx wrangler pages deploy dist --project-name=eluno

# Purge Cloudflare cache
source .env && curl -X POST "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/purge_cache" \
  -H "X-Auth-Email: ${CF_EMAIL}" \
  -H "X-Auth-Key: ${CF_API_KEY}" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

---

## 🎯 To Update Chapter Titles

**To change the H1 title of a chapter:**

1. Edit `v03_package/instructions/TITULOS_CAPITULOS.json`
2. Run `npm run build`
3. Deploy: `npx wrangler pages deploy dist --project-name=eluno`
4. Purge cache (command above)

**Example:**
```json
{
  "number": 1,
  "en": {
    "title": "New Title Here",  // ← Change this
    "subtitle": "New Subtitle",
    "filename": "01-the-one"
  }
}
```

---

## 📊 Project Statistics

- **Total Chapters:** 16
- **Languages:** 3 (EN, ES, PT)
- **Total Pages Generated:** ~54 (16 chapters × 3 languages + extras)
- **Repository Size:** Public, clean, no credentials
- **Last Content Update:** January 8, 2026
- **Last Code Update:** January 13, 2026
- **Production Status:** Live and stable

---

## 🔍 How to Identify Content Version

When working with this project, you can identify content versions by:

1. **Git commit hash:** Check `git log i18n/en/chapters/01.json`
2. **File modification date:** `stat i18n/en/chapters/01.json`
3. **File size:** Content changes = size changes
4. **Chapter title source:** Always check `TITULOS_CAPITULOS.json` for H1 titles
5. **Production verification:** `curl -s https://eluno.org/the-one/ | grep '<h1'`

---

## 🤖 For Claude Desktop

When you clone this project or start a new session:

1. **Read this file first** to understand current state
2. **Check `CREDENTIALS_BACKUP.md`** for credentials (if you have access)
3. **Review recent commits:** `git log --oneline -10`
4. **Verify title system:** Titles come from `TITULOS_CAPITULOS.json`, not chapter JSON files
5. **Test locally:** `npm run dev` before deploying

**Important Context:**
- Chapter titles were centralized in commit `69b305e` (Jan 12, 2026)
- YouTube video generation was removed (see `YOUTUBE_BACKUP.md` for reference)
- All public documentation is now in English
- Repository is clean with no sensitive data

---

*This document provides a snapshot of the project state for AI assistants and developers.*
*Always verify production state with: `git log -1` and `curl https://eluno.org`*
