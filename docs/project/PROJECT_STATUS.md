# Estado del Proyecto — El Uno

> **Actualizado:** Febrero 22, 2026
> **Producción:** https://eluno.org (rama `main`)
> **Repositorio:** https://github.com/chuchurex/eluno

---

## Sitio en producción

- **URL:** https://eluno.org
- **Rama:** `main`
- **Hosting:** Cloudflare Pages (auto-deploy al push)
- **Idiomas:** EN, ES, PT
- **Capítulos:** 16/16 publicados (reescritura v3 completa)
- **Build:** `node scripts/build-v2.cjs && npm run sass:build` → genera `dist/`
- **URLs:** `/{lang}/chapters/{slug}.html`

---

## Contenido

| Capítulo | Título EN | Estado |
|----------|-----------|--------|
| 1 | Cosmology and Genesis | Publicado (EN/ES/PT) |
| 2 | The Creator and Creation | Publicado (EN/ES/PT) |
| 3 | The Densities of Consciousness | Publicado (EN/ES/PT) |
| 4 | Earth's Spiritual History | Publicado (EN/ES/PT) |
| 5 | Polarity: The Two Paths | Publicado (EN/ES/PT) |
| 6 | Wanderers: Those Who Return | Publicado (EN/ES/PT) |
| 7 | The Harvest | Publicado (EN/ES/PT) |
| 8 | The Veil of Forgetting | Publicado (EN/ES/PT) |
| 9 | Death and the Journey Between Lives | Publicado (EN/ES/PT) |
| 10 | The Energy Centers | Publicado (EN/ES/PT) |
| 11 | Catalyst and Experience | Publicado (EN/ES/PT) |
| 12 | The Higher Self and Guidance | Publicado (EN/ES/PT) |
| 13 | Free Will and the Law of Confusion | Publicado (EN/ES/PT) |
| 14 | The Path of the Seeker | Publicado (EN/ES/PT) |
| 15 | Balancing and Healing | Publicado (EN/ES/PT) |
| 16 | The Mystery Remains | Publicado (EN/ES/PT) |

---

## Audiobook

| Idioma | Capítulos | Completo | Voz | Hosting |
|--------|-----------|----------|-----|---------|
| ES | 16/16 | el-uno-audiolibro-completo.mp3 | es-MX-JorgeNeural | static.eluno.org |
| EN | 16/16 | the-one-complete-audiobook.mp3 | en-US-GuyNeural | static.eluno.org |
| PT | 16/16 | o-um-audiolivro-completo.mp3 | pt-BR-AntonioNeural | static.eluno.org |

- **TTS:** Edge TTS (gratuito, Microsoft)
- **Formato:** MP3, ~128kbps
- **Assembly:** contenido + 2s silencio + outro (atribución L/L Research)
- **Libro completo:** tagline intro + 3s silencio + todos los capítulos
- **ID3 tags:** Título, artista, álbum, copyright L/L Research

---

## PDF

- 16 capítulos + libro completo por idioma (48 + 3 = 51 archivos)
- Hosting: static.eluno.org
- Generación: Puppeteer via `build-pdf.cjs`
- Glosario al final de cada capítulo (numeración chapter.N en libro completo)
- Fuentes: referencias cruzadas con URLs + provenance Ra Material por sección
- Cache-busting: `?v=2` en media.json

---

## Sistemas de build

| Archivo | Descripción | URLs generadas |
|---------|-------------|----------------|
| `scripts/build-v2.cjs` | Build principal | `/{lang}/chapters/{slug}.html` |
| `scripts/build-pdf.cjs` | Generación de PDFs (glosario + fuentes) | `dist/pdf/{lang}/{seo-name}.pdf` |
| `scripts/audiobook/extract-text.cjs` | Texto TTS desde JSON | `audiobook/text/{lang}/chNN.txt` |
| `scripts/audiobook/generate-edge.cjs` | Generación de audio | `audiobook/audio/{lang}/chNN.mp3` |
| `scripts/audiobook/assemble-chapters.cjs` | Assembly con outro | `audiobook/final/{lang}/{seo-name}.mp3` |
| `scripts/rename-media.cjs` | Renombrar a SEO names | Actualiza media.json |
| `scripts/update-mp3-tags.cjs` | ID3 tags | Metadatos en MP3s |

---

## Dependencias clave

- `@eluno/core` — SCSS, fonts (github:chuchurex/eluno-core)
- `@anthropic-ai/sdk` — Traducción automática
- `node-edge-tts` — Generación TTS
- `puppeteer` — Generación PDF
- `node-id3` — ID3 tags para MP3
