# Deployment Guide

This guide details the deployment processes for **The One (eluno.org)** to production.

## Deployment Architecture

| Component | Service | Deployment Method |
|-----------|---------|-------------------|
| **Frontend** (HTML/JS/CSS/PDF) | **Cloudflare Pages** | Automatic via GitHub push to `main` |
| **Audiobooks** (MP3) | **static.eluno.org** | Manual upload (files exceed CF Pages 25MB limit) |

---

## 1. Frontend Deployment (Cloudflare Pages)

The frontend includes the website, styles, scripts, and PDF files. PDFs are stored in `static/pdf/` in the repo and copied to `dist/pdf/` during build.

### Option A: Automatic Deployment (Recommended)
Every push to `main` triggers a Cloudflare Pages build and deploy.

```bash
git add .
git commit -m "feat: content update"
git push origin main
```

Check status in the [Cloudflare Pages Dashboard](https://dash.cloudflare.com).

### Option B: Manual Deployment (Wrangler)
For quick deploys without going through git:

```bash
npm run build
npx wrangler pages deploy dist --project-name=eluno
```

**Note:** Manual deploys get overridden by the next git push. Use git push for persistent changes.

---

## 2. Audiobook Hosting (static.eluno.org)

MP3 audiobook files exceed Cloudflare Pages' 25MB file limit and are hosted separately on `static.eluno.org`.

---

## 3. PDF Hosting

PDFs are stored in `static/pdf/{en,es,pt}/` in the repository. The build script copies them to `dist/pdf/` automatically, so they deploy with every git push. No separate hosting needed.

To regenerate PDFs (requires Puppeteer):
```bash
node scripts/build-pdf.cjs
```
Then copy the output to `static/pdf/` and commit.

---

## 4. Environment Variables

### Local (`.env`)
Copy `.env.example` to `.env`. The site builds without external credentials, but translation and deploy functions require them.

### Cloudflare (for CI/CD)
Configure in Cloudflare Pages Dashboard:
- Build command: `node scripts/build-v2.cjs && npm run sass:build`
- Output directory: `dist`

---

## 5. Troubleshooting

**Site doesn't show changes**
- Cloudflare caches aggressively. Wait 1-2 minutes after deploy, or purge cache from Cloudflare Dashboard.

**PDFs return HTML instead of PDF**
- The PDFs in `static/pdf/` may not have been committed to git. Check with `git status static/pdf/`.
- Ensure `.gitignore` has the exception: `!static/pdf/**/*.pdf`

**Build fails**
- Run `npm install` to ensure dependencies are current.
- Verify Node.js v20+: `node -v`
