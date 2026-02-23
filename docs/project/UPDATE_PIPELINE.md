# Pipeline de Actualización — El Uno

> **Actualizado:** Febrero 22, 2026
> **Propósito:** Cuando algo cambia en el libro, este documento define exactamente qué pasos seguir para que TODOS los formatos queden actualizados (web, PDF, audiobook).

---

## Resumen visual

```
Contenido (JSON)
    │
    ├──→ HTML (web)         → build-v2.cjs + sass:build → push → Cloudflare
    ├──→ PDF (por capítulo) → build-pdf.cjs N → rename-media.cjs → rsync
    ├──→ PDF (libro)        → build-pdf.cjs complete → rename-media.cjs → rsync
    ├──→ Audio (capítulo)   → extract-text → generate-edge → assemble → tag → rsync
    └──→ Audio (libro)      → assemble-chapters (complete) → tag → rsync
```

---

## Cascada de cambios

### Si cambias... un capítulo (`i18n/{lang}/chapters/NN.json`)

| Paso | Comando | Output |
|------|---------|--------|
| 1. Build HTML | `node scripts/build-v2.cjs && npm run sass:build` | `dist/` |
| 2. PDF individual | `node scripts/build-pdf.cjs NN` | `dist/pdf/{lang}/chNN.pdf` |
| 3. PDF libro completo | `node scripts/build-pdf.cjs complete` | `dist/pdf/{lang}/complete-book.pdf` |
| 4. Renombrar PDFs | `node scripts/rename-media.cjs` | SEO names + media.json |
| 5. Cache-bust PDFs | Incrementar `?v=N` en PDF URLs de media.json | media.json |
| 6. Rebuild HTML | `node scripts/build-v2.cjs && npm run sass:build` | `dist/` (con nuevo media.json) |
| 7. Upload PDFs | `sshpass -p $UPLOAD_PASS rsync -avz -e "ssh -p $UPLOAD_PORT" --include='*/' --include='*.pdf' --exclude='ch*.pdf' --exclude='complete-book.pdf' dist/pdf/ $UPLOAD_USER@$UPLOAD_HOST:$UPLOAD_DIR/pdf/` | static.eluno.org |
| 8. Audio capítulo | `node scripts/audiobook/extract-text.cjs NN {lang}` | `audiobook/text/{lang}/chNN.txt` |
| 9. Generar audio | `node scripts/audiobook/generate-edge.cjs NN {lang}` | `audiobook/audio/{lang}/chNN.mp3` |
| 10. Ensamblar audio | `node scripts/audiobook/assemble-chapters.cjs NN {lang}` | `audiobook/final/{lang}/{seo-name}.mp3` |
| 11. Audio libro completo | `node scripts/audiobook/assemble-chapters.cjs complete {lang}` | `audiobook/final/{lang}/{complete}.mp3` |
| 12. ID3 tags | `node scripts/update-mp3-tags.cjs {lang}` (con `--final`) | Tags en MP3s |
| 13. Upload audio | rsync `audiobook/final/{lang}/` a `$UPLOAD_DIR/audiobook/{lang}/` | static.eluno.org |
| 14. Cache-bust audio | Incrementar `?v=N` en audio URLs de media.json | media.json |
| 15. Rebuild final | `node scripts/build-v2.cjs && npm run sass:build` | `dist/` |
| 16. Commit + push | `git add ... && git commit && git push origin main` | Cloudflare deploy |

> **Atajo si solo cambia texto menor** (sin nuevos términos ni refs): pasos 1-7, 15-16. Audio puede omitirse si el cambio es menor.

---

### Si cambias... el glosario (`i18n/{lang}/glossary.json`)

| Paso | Comando | Afecta |
|------|---------|--------|
| 1. Build HTML | `node scripts/build-v2.cjs && npm run sass:build` | Tooltips en web |
| 2. PDFs todos | `node scripts/build-pdf.cjs all` | Notas de glosario en cada PDF |
| 3. PDF libro completo | `node scripts/build-pdf.cjs complete` | Glosario per-chapter |
| 4. Renombrar + cache-bust | `node scripts/rename-media.cjs` + incrementar `?v=N` | media.json |
| 5. Rebuild + upload + push | (pasos 6-7 y 15-16 de arriba) | Todo |

> Audio NO se afecta por cambios de glosario (las definiciones no están en el audio).

---

### Si cambias... las referencias (`i18n/{lang}/references.json`)

| Paso | Afecta |
|------|--------|
| 1. Build HTML | Links de referencia en web |
| 2. PDFs (solo capítulos que usan `{ref:}`) | Superíndices + sección Sources |
| 3. PDF libro completo | Sección Sources per-chapter |
| 4. Renombrar + cache-bust + rebuild + push | Todo |

> Solo ch01-ch03 usan `{ref:}` actualmente. Audio NO se afecta.

---

### Si cambias... provenance (`i18n/provenance/chNN_provenance.json`)

| Paso | Afecta |
|------|--------|
| 1. PDF individual | `node scripts/build-pdf.cjs NN` — sección "Ra Material Sources" |
| 2. PDF libro completo | `node scripts/build-pdf.cjs complete` |
| 3. Renombrar + cache-bust + upload + push | static.eluno.org |

> HTML y audio NO se afectan por cambios de provenance (solo aparece en PDF).

---

### Si cambias... media.json (`i18n/{lang}/media.json`)

Solo rebuild HTML + push. PDFs se despliegan con el sitio, audiobooks están en static.eluno.org.

```bash
node scripts/build-v2.cjs && npm run sass:build
git add i18n/*/media.json && git commit && git push origin main
```

---

### Si cambias... estilos (SCSS/CSS)

```bash
npm run sass:build
# Si afecta PDF, también regenerar PDFs
git add ... && git commit && git push origin main
```

---

## Scripts y ubicaciones

### Contenido

| Archivo | Descripción |
|---------|-------------|
| `i18n/{en,es,pt}/chapters/NN.json` | Capítulos (16 por idioma) |
| `i18n/{en,es,pt}/glossary.json` | Glosario (~100 términos) |
| `i18n/{en,es,pt}/references.json` | Referencias cruzadas (Wikipedia, etc.) |
| `i18n/provenance/chNN_provenance.json` | Mapas de fuentes Ra (16 archivos) |
| `i18n/{en,es,pt}/media.json` | URLs de PDF y audio con cache-bust |
| `i18n/{en,es,pt}/ui.json` | Strings de interfaz |

### Scripts de build

| Script | Input | Output |
|--------|-------|--------|
| `scripts/build-v2.cjs` | chapters, glossary, ui, media JSON | `dist/*.html` |
| `scripts/build-pdf.cjs` | chapters, glossary, references, provenance | `dist/pdf/{lang}/chNN.pdf` |
| `scripts/rename-media.cjs` | `dist/pdf/`, `audiobook/final/` | SEO-named copies + media.json |
| `scripts/update-mp3-tags.cjs` | `audiobook/final/` | ID3 tags en MP3s |

### Scripts de audiobook

| Script | Input | Output |
|--------|-------|--------|
| `scripts/audiobook/extract-text.cjs` | chapters JSON | `audiobook/text/{lang}/chNN.txt` |
| `scripts/audiobook/generate-edge.cjs` | TTS text files | `audiobook/audio/{lang}/chNN.mp3` |
| `scripts/audiobook/assemble-chapters.cjs` | raw MP3 + outro | `audiobook/final/{lang}/{seo-name}.mp3` |

### Deploy

| Destino | Método | Contenido |
|---------|--------|-----------|
| eluno.org | `git push origin main` → Cloudflare Pages | HTML, CSS, JS, PDF |
| static.eluno.org | Manual upload | MP3 audiobooks |

---

## Formato de archivos generados

### PDF — Estructura de cada capítulo

```
[Contenido del capítulo]
  - Términos del glosario con superíndice numérico (1, 2, 3...)
  - Referencias cruzadas con superíndice de letra (ᵃ, ᵇ, ᶜ...)

───────────────────
Glossary / Glosario / Glossário
  1. Término: definición...
  2. Término: definición...

───────────────────
Sources / Fuentes / Fontes

  Cross-References / Referencias Cruzadas:
  ᵃ Título — Resumen
     https://full-url-visible.com

  Ra Material Sources / Fuentes del Material Ra:
  § Título de sección
    Paragraph 1-2 → Session 13.5 — https://www.lawofone.info/s/13#5
    Paragraph 3 → Session 13.6 — https://www.lawofone.info/s/13#6
```

### PDF libro completo — Numeración por capítulo

En el libro completo, el glosario usa numeración `capítulo.nota`:
- Capítulo 1: 1.1, 1.2, 1.3...
- Capítulo 2: 2.1, 2.2, 2.3...

Cada capítulo tiene su propia sección de glosario y fuentes al final.

### Audio — Estructura

```
[Capítulo individual]
  contenido + 2s silencio + outro (atribución L/L Research)

[Libro completo]
  tagline intro + 3s silencio + capítulo 1 + capítulo 2 + ... + capítulo 16
```

---

## Credenciales y hosting

| Variable | Uso |
|----------|-----|
| `UPLOAD_HOST` | IP del servidor de media |
| `UPLOAD_PORT` | Puerto SSH (65002) |
| `UPLOAD_USER` | Usuario SSH |
| `UPLOAD_PASS` | Contraseña SSH |
| `UPLOAD_DIR` | Ruta remota (`/home/.../static.eluno.org/public_html`) |

Todas en `.env` (no en git).

---

## Checklist rápida: "Modifiqué un capítulo, ahora qué?"

```
□ Rebuild HTML:       node scripts/build-v2.cjs && npm run sass:build
□ PDF individual:     node scripts/build-pdf.cjs NN
□ PDF libro completo: node scripts/build-pdf.cjs complete
□ Renombrar PDFs:     node scripts/rename-media.cjs
□ Cache-bust PDFs:    incrementar ?v=N en media.json (PDF URLs)
□ Rebuild HTML:       node scripts/build-v2.cjs && npm run sass:build
□ Upload PDFs:        rsync a static.eluno.org
□ Audio (si aplica):  extract-text → generate-edge → assemble → tag
□ Audio completo:     assemble-chapters complete
□ Upload audio:       rsync a static.eluno.org
□ Cache-bust audio:   incrementar ?v=N en media.json (audio URLs)
□ Rebuild final:      node scripts/build-v2.cjs && npm run sass:build
□ Commit + push:      git push origin main
```

---

*Referencia: pipeline de escritura completo en `docs/writing/CHAPTER_PIPELINE.md`*
*Referencia: estado del audiobook en `docs/audiobook/STATUS.md`*
*Referencia: arquitectura técnica en `docs/tech/ARCHITECTURE.md`*
