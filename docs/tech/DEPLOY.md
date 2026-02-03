# Deployment Guide

This guide details the deployment processes for **The One (eluno.org)** to production. The project uses a hybrid architecture to optimize costs and performance.

## 🏗 Deployment Architecture

| Component | Service | Deployment Method |
|-----------|---------|-------------------|
| **Frontend** (HTML/JS/CSS) | **Cloudflare Pages** | Automatic via GitHub (or manual with Wrangler) |
| **Static Assets** (PDF/Audio) | **Hostinger** | Manual via `npm run publish:media` script |

---

## 1. Frontend Deployment (Cloudflare Pages)

The frontend includes the entire website, logic, styles, and text content.

### Option A: Automatic Deployment (Recommended)
Every time you **push** to the `main` branch on GitHub, an automatic action is triggered that builds and deploys the site.

1. Make your changes locally.
2. Commit and push:
   ```bash
   git add .
   git commit -m "feat: content update"
   git push origin main
   ```
3. Check the status in [GitHub Actions](https://github.com/chuchurex/eluno.org/actions) or in the Cloudflare Pages Dashboard.

### Option B: Manual Deployment (From IDE/Terminal)
If you need to deploy without going through git (e.g., quick hotfix or testing) or if CI/CD fails, you can use **Wrangler** (Cloudflare CLI).

**Requirements:**
- Have a Cloudflare account.
- Be logged in: `npx wrangler login`

**Command:**
```bash
# Build the project
npm run build

# Deploy to production
npx wrangler pages deploy dist --project-name=eluno
```

---

## 2. Media Deployment (Hostinger)

Heavy files (generated PDFs and MP3 audiobooks) are hosted on a traditional server (Hostinger) under the subdomain `static.eluno.org` to avoid Cloudflare Pages size limits.

**This process is MANUAL and should be executed when new audio or PDFs are generated.**

### Requirements
Make sure you have SSH/SFTP credentials configured in your `.env` file:
```bash
UPLOAD_HOST=x.x.x.x
UPLOAD_PORT=xxxxx
UPLOAD_USER=username
UPLOAD_PASS=password
UPLOAD_DIR=domains/eluno.org/public_html/static
```

### Commands

**Publish all media content:**
```bash
npm run publish:media
```

This script:
1. Connects via SFTP to the server.
2. Uploads content from local audio and books folders.
3. Maintains correct directory structure.

---

## 3. Secrets Configuration (Environment Variables)

For deployments to work (both local and CI/CD), certain variables are required.

### Local (`.env`)
Copy `.env.example` to `.env` and fill in:
- `DOMAIN`: Main domain (eluno.org).
- Hostinger credentials (`UPLOAD_*`) for uploading media.

### GitHub (Secrets)
For CI/CD to work, configure in the repository (Settings > Secrets and variables > Actions):

- `CF_API_KEY`: Cloudflare API Key.
- `CF_EMAIL`: Your Cloudflare account email.
- `CF_ACCOUNT_ID`: Cloudflare account ID.

---

## 4. Troubleshooting

**Error: "Quota Exceeded" on Cloudflare**
- Cause: You've uploaded too many files or files that are too large to the Frontend.
- Solution: Make sure MP3 and PDF files are not in the `dist` folder that gets uploaded to Cloudflare. The build script should automatically remove them from `dist`, but verify this.

**Error: SFTP Connection Failure**
- Verification: Check that your IP is not blocked by Hostinger's firewall and that the port (usually non-standard, see `.env`) is correct in `.env`.

**Site doesn't show changes**
- Cloudflare has aggressive caching. Purge cache:
  - From Cloudflare Dashboard > Caching > Configuration > Purge Everything.
  - Or use the purge cache script with your `.env` credentials.

---

## 5. QA Verification

After any deployment (Frontend or Media), it is critical to verify that the ecosystem is healthy and resources are accessible.

We have an automated script to check the status of all domains and critical assets (PDFs, MP3s).

### Running the QA Routine

Run the following command from the project root:

```bash
./packages/core/scripts/qa-verify.sh
```

### What it checks:
1. **Main Domains**: HTTP 200 OK for `eluno.org`, `todo.eluno.org`, `sanacion.eluno.org`, `jesus.eluno.org`.
2. **Static Server**: Availability of `static.eluno.org`.
3. **Critical Assets**: 
   - Samples a Chapter 1 MP3 for each book.
   - Samples a complete PDF for TODO.
   - Ensures correct routing and file existence.

**If any check fails (Red/FAIL), do not announce the release.**
