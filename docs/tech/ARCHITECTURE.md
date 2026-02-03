# Complete Architecture - eluno.org

> **Version:** 1.0
> **Date:** January 4, 2026
> **Purpose:** Reference document for replicating this architecture in other projects

---

## 1. Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DEPLOY FLOW                                    │
└─────────────────────────────────────────────────────────────────────────────┘

  Developer        GitHub           GitHub Actions      Cloudflare Pages
     │                │                   │                    │
     │   git push     │                   │                    │
     ├───────────────►│   trigger         │                    │
     │                ├──────────────────►│                    │
     │                │                   │  npm run build     │
     │                │                   │  wrangler deploy   │
     │                │                   ├───────────────────►│
     │                │                   │                    │
     │                │                   │              ┌─────┴─────┐
     │                │                   │              │  LIVE!    │
     │                │                   │              │  eluno    │
     │                │                   │              │   .org    │
     │                │                   │              └───────────┘
```

---

## 2. Technology Stack

### Frontend
| Technology | Version | Use |
|------------|---------|-----|
| HTML5 | - | Semantic structure |
| SCSS/SASS | 1.69.0 | Modular styles |
| JavaScript | ES6+ | Interactivity (vanilla) |
| Google Fonts | Self-hosted | Typography (woff2) |

### Build System
| Technology | Version | Use |
|------------|---------|-----|
| Node.js | 20.x | Runtime |
| npm | 10.x | Package manager |
| dotenv | 17.x | Environment variables |
| SASS | 1.69.0 | CSS compiler |
| Puppeteer | 24.x | PDF generation |
| live-server | 1.2.2 | Dev server |
| concurrently | 8.2.0 | Multiple processes |

### Hosting & CDN
| Service | Use |
|----------|-----|
| Cloudflare Pages | Frontend + Functions |
| Hostinger | Static assets (audio/pdf) |
| GitHub | Repository + CI/CD |

### External APIs
| Service | Use |
|----------|-----|
| Fish Audio | Text-to-Speech |
| Cartesia | Alternative TTS |
| Google Analytics | Metrics |

---

## 3. Directory Structure

```
eluno.org/
├── .env                    # Environment variables (NOT in git)
├── .env.example            # Variables template
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions CI/CD
├── .gitignore
├── _headers.template       # CF headers template (with {{DOMAIN}})
├── wrangler.toml           # Cloudflare Workers/Pages config
├── package.json
│
├── src/
│   ├── scss/
│   │   ├── main.scss       # SCSS entry point
│   │   ├── _variables.scss
│   │   ├── _typography.scss
│   │   ├── _layout.scss
│   │   ├── _sidebar.scss
│   │   ├── _notes.scss
│   │   └── _responsive.scss
│   ├── fonts/
│   │   ├── fonts.css       # @font-face definitions
│   │   ├── cormorant-garamond-400.woff2
│   │   ├── spectral-400.woff2
│   │   └── ...
│   └── templates/          # (future) HTML templates
│
├── scripts/
│   ├── build.js            # Main HTML generator
│   ├── translate.js        # Translation with Claude API
│   ├── translate-chapter.js
│   ├── build-pdf.js        # PDF generation
│   └── publish-media.js    # Upload to Hostinger
│
├── functions/
│   └── api/
│       └── send-feedback.js  # Cloudflare Function
│
├── i18n/
│   ├── en/
│   │   ├── ui.json         # Interface strings
│   │   ├── glossary.json   # Glossary terms
│   │   ├── references.json # Bibliographic references
│   │   ├── media.json      # Media URLs
│   │   ├── about.json      # About page
│   │   └── chapters/
│   │       ├── 01.json
│   │       ├── 02.json
│   │       └── ...
│   ├── es/
│   │   └── ... (same structure)
│   └── pt/
│       └── ... (same structure)
│
├── dist/                   # Output (generated, in .gitignore in production)
│   ├── index.html
│   ├── css/main.css
│   ├── fonts/
│   ├── _headers
│   ├── ch1/index.html
│   ├── ch2/index.html
│   ├── ...
│   ├── es/
│   │   ├── index.html
│   │   ├── ch1/index.html
│   │   └── ...
│   └── pt/
│       └── ...
│
├── docs/                   # Documentation
│   ├── ARCHITECTURE.md     # This file
│   ├── CLAUDE.md
│   └── ...
│
└── private-context.md      # Private context (NOT in git)
```

---

## 4. Variables Configuration

### `.env` (local, never in git)

```bash
# DOMAIN CONFIGURATION
DOMAIN=eluno.org
STATIC_SUBDOMAIN=static

# HOSTINGER - Static Assets
UPLOAD_HOST=xxx.xxx.xxx.xxx
UPLOAD_PORT=xxxxx
UPLOAD_USER=username
UPLOAD_PASS=password
UPLOAD_DIR=domains/eluno.org/public_html/static

# CLOUDFLARE
CF_API_KEY=your-api-key
CF_EMAIL=your-email
CF_ZONE_ID=your-zone-id

# OPTIONAL APIs
FISH_API_KEY=your-fish-key
CARTESIA_API_KEY=your-cartesia-key
```

### `wrangler.toml` (in git)

```toml
name = "eluno"
compatibility_date = "2024-01-01"

[site]
bucket = "./dist"

[vars]
DOMAIN = "eluno.org"
```

### GitHub Secrets

| Secret | Use |
|--------|-----|
| `CF_API_KEY` | Cloudflare API Key |
| `CF_EMAIL` | Cloudflare email |
| `CF_ACCOUNT_ID` | Cloudflare Account ID |

---

## 5. CI/CD Pipeline

### `.github/workflows/deploy.yml`

```yaml
name: Build and Deploy to Cloudflare Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout repository
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build SASS
      run: npm run sass:build

    - name: Build HTML from JSON
      run: npm run build

    - name: Remove large files (go to Hostinger)
      run: |
        rm -rf dist/audio dist/audiobook dist/books
        find dist -name "*.mp3" -delete
        find dist -name "*.pdf" -delete

    - name: Deploy to Cloudflare Pages
      env:
        CLOUDFLARE_API_KEY: ${{ secrets.CF_API_KEY }}
        CLOUDFLARE_EMAIL: ${{ secrets.CF_EMAIL }}
        CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CF_ACCOUNT_ID }}
      run: npx wrangler pages deploy dist --project-name=eluno
```

---

## 6. Security Headers

### `_headers.template`

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline'; img-src 'self' https://static.{{DOMAIN}} https://www.google-analytics.com data:; font-src 'self'; connect-src 'self' https://www.google-analytics.com https://static.{{DOMAIN}}; media-src 'self' https://static.{{DOMAIN}}; frame-ancestors 'none'

/css/*
  Cache-Control: public, max-age=31536000, immutable

/fonts/*
  Cache-Control: public, max-age=31536000, immutable

/i18n/*
  Cache-Control: public, max-age=3600
```

The `{{DOMAIN}}` placeholder is replaced during build.

---

## 7. Cloudflare Function (API)

### `functions/api/send-feedback.js`

```javascript
// In-memory rate limiting
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 3;   // 3 req/min per IP

function isRateLimited(ip) { /* ... */ }

// Dynamic CORS from env.DOMAIN
function getAllowedOrigins(env) {
  const domain = env.DOMAIN || 'eluno.org';
  return [
    `https://${domain}`,
    `https://www.${domain}`
  ];
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const allowedOrigins = getAllowedOrigins(env);

  // Rate limiting
  const clientIP = request.headers.get('CF-Connecting-IP');
  if (isRateLimited(clientIP)) {
    return new Response(JSON.stringify({ error: 'Too many requests' }), { status: 429 });
  }

  // Validation and processing
  const data = await request.json();
  // ...
}

export async function onRequestOptions(context) {
  // CORS preflight
}
```

---

## 8. Build Process

### `scripts/build.js` (simplified)

```javascript
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Domain from .env
const DOMAIN = process.env.DOMAIN || 'eluno.org';
const STATIC_SUBDOMAIN = process.env.STATIC_SUBDOMAIN || 'static';
const SITE_URL = `https://${DOMAIN}`;
const STATIC_BASE_URL = `https://${STATIC_SUBDOMAIN}.${DOMAIN}`;

function build() {
  // 1. Load JSON content
  // 2. Generate HTML for each language
  // 3. Copy assets
  // 4. Generate _headers from template

  let headersContent = fs.readFileSync('_headers.template', 'utf8');
  headersContent = headersContent.replace(/\{\{DOMAIN\}\}/g, DOMAIN);
  fs.writeFileSync('dist/_headers', headersContent);
}
```

---

## 9. Hybrid Hosting Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CLOUDFLARE PAGES                                    │
│                         (eluno.org)                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  ✓ Static HTML (48 pages = 16 chapters × 3 languages)                      │
│  ✓ Minified CSS                                                             │
│  ✓ Fonts (self-hosted woff2)                                               │
│  ✓ JavaScript                                                               │
│  ✓ i18n JSON                                                                │
│  ✓ Small images                                                             │
│  ✓ Cloudflare Function (/api/send-feedback)                                │
│                                                                             │
│  CDN: Automatic, global edge caching                                       │
│  Compression: Automatic Brotli                                             │
│  SSL: Automatic                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ references to static.eluno.org
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          HOSTINGER                                          │
│                    (static.eluno.org)                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  ✓ MP3 audio (16 chapters × 3 languages = 48 files)                        │
│  ✓ PDFs (16 chapters × 3 languages = 48 files)                             │
│  ✓ Complete audiobooks                                                      │
│                                                                             │
│  Reason: Large files exceeding CF Pages limits                             │
│  Upload: Via SFTP with scripts/publish-media.js                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 10. npm Scripts

```json
{
  "scripts": {
    "sass:watch": "sass --watch src/scss/main.scss:dist/css/main.css",
    "sass:build": "sass src/scss/main.scss:dist/css/main.css --style=compressed",
    "serve": "live-server dist --port=3002",
    "dev": "concurrently \"npm run sass:watch\" \"npm run serve\"",
    "build": "npm run sass:build && node scripts/build.js",
    "translate": "node scripts/translate.js",
    "translate:chapter": "node scripts/translate-chapter.js",
    "build:pdf": "node scripts/build-pdf.js",
    "publish:media": "node scripts/publish-media.js"
  }
}
```

---

## 11. Domain Migration

When a domain change is needed:

### 1. Update `.env`
```bash
DOMAIN=newdomain.com
STATIC_SUBDOMAIN=static
```

### 2. Update `wrangler.toml`
```toml
[vars]
DOMAIN = "newdomain.com"
```

### 3. Rebuild and deploy
```bash
npm run build
git add . && git commit -m "chore: migrate to newdomain.com"
git push
```

### 4. Configure in Cloudflare
- Add custom domain in Pages
- Configure DNS (CNAME to *.pages.dev)

### 5. Verify
- [ ] CSP headers correct
- [ ] CORS allows new domain
- [ ] Canonical URLs updated
- [ ] Static subdomain working

---

## 12. Security Checklist

| Item | Status | Implementation |
|------|--------|----------------|
| HTTPS | ✅ | Automatic CF |
| CSP Header | ✅ | `_headers.template` |
| X-Frame-Options | ✅ | DENY |
| X-Content-Type-Options | ✅ | nosniff |
| Restricted CORS | ✅ | Own domain only |
| Rate limiting | ✅ | 3 req/min per IP |
| Secrets in .env | ✅ | Not in git |
| Input validation | ✅ | In CF Function |
| noindex (temporary) | ✅ | Until launch |

---

## 13. Monitoring

### Cloudflare Dashboard
- **Analytics** → Traffic and requests
- **Pages > Functions > Logs** → Real-time feedback logs

### GitHub Actions
```bash
gh run list --limit 5
gh run watch <run-id>
```

### Verify headers in production
```bash
curl -sI https://eluno.org | head -20
```

---

## 14. Useful Commands

```bash
# Local development
npm run dev                     # Server + SCSS watch

# Complete build
npm run build                   # Generate dist/

# Translate chapter
npm run translate:chapter -- --chapter=08 --lang=es

# Generate PDFs
npm run build:pdf

# Publish media to Hostinger
npm run publish:media

# Manual deploy (if CI fails)
npx wrangler pages deploy dist --project-name=eluno

# Purge Cloudflare cache
curl -X POST "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/purge_cache" \
  -H "Authorization: Bearer ${CF_API_KEY}" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

---

## 15. Replicate in New Project

1. **Copy base structure:**
   - `package.json`
   - `.github/workflows/deploy.yml`
   - `wrangler.toml`
   - `_headers.template`
   - `.gitignore`
   - `.env.example`

2. **Create project in Cloudflare Pages:**
   ```bash
   npx wrangler pages project create project-name
   ```

3. **Configure GitHub Secrets:**
   - `CF_API_KEY`
   - `CF_EMAIL`
   - `CF_ACCOUNT_ID`

4. **Configure domain:**
   - Add domain in CF Pages
   - Configure DNS

5. **Adapt `build.js`** according to project needs

---


*Document generated: January 4, 2026*
*Last updated: January 13, 2026*
*Project: eluno.org*
