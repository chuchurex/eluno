# Estado del Proyecto — El Uno

> **Actualizado:** Febrero 16, 2026
> **Producción v1:** https://eluno.org (rama `main`)
> **Producción v3:** https://v3.eluno.org (rama `v3`)
> **Repositorio:** https://github.com/chuchurex/eluno

---

## Sitio en producción

### v3 (desarrollo activo)
- **URL:** https://v3.eluno.org
- **Rama:** `v3`
- **Hosting:** Cloudflare Pages (proyecto: `eluno`)
- **Idiomas:** EN, ES, PT
- **Capítulos publicados:** 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 (reescritos v3)
- **Build:** `node scripts/build-v2.cjs` → genera `dist/` con URLs slug-based

### v1 (producción estable)
- **URL:** https://eluno.org
- **Rama:** `main`
- **Capítulos:** 16 (versión original completa)
- **Build:** `@eluno/core` (`npx eluno-build`)

---

## Contenido v3

| Capítulo | Título EN | Estado | Fecha |
|----------|-----------|--------|-------|
| 1 | Cosmology and Genesis | Publicado (EN/ES/PT) | 2026-02-14 |
| 2 | The Creator and Creation | Publicado (EN/ES/PT) | 2026-02-14 |
| 3 | The Densities of Consciousness | Publicado (EN/ES/PT) | 2026-02-14 |
| 4 | Earth's Spiritual History | Publicado (EN/ES/PT) | 2026-02-15 |
| 5 | Polarity: The Two Paths | Publicado (EN/ES/PT) | 2026-02-15 |
| 6 | Wanderers: Those Who Return | Publicado (EN/ES/PT) | 2026-02-15 |
| 7 | The Harvest | Publicado (EN/ES/PT) | 2026-02-15 |
| 8 | The Veil of Forgetting | Publicado (EN/ES/PT) | 2026-02-15 |
| 9 | Death and the Journey Between Lives | Publicado (EN/ES/PT) | 2026-02-15 |
| 10 | The Energy Centers | Publicado (EN/ES/PT) | 2026-02-15 |
| 11 | Catalyst and Experience | Publicado (EN/ES/PT) | 2026-02-15 |
| 12 | The Higher Self and Guidance | Publicado (EN/ES/PT) | 2026-02-15 |
| 13 | Free Will and the Law of Confusion | Publicado (EN/ES/PT) | 2026-02-15 |
| 14 | The Path of the Seeker | Publicado (EN/ES/PT) | 2026-02-15 |
| 15 | Balancing and Healing | Publicado (EN/ES/PT) | 2026-02-16 |
| 16 | The Mystery Remains | Publicado (EN/ES/PT) | 2026-02-16 |


---

## Sistemas de build

| Sistema | Archivo | Usado en | URLs generadas |
|---------|---------|----------|----------------|
| **build-v2.cjs** | `scripts/build-v2.cjs` | v3 (`v3` branch) | `/{lang}/chapters/{slug}.html` |
| **eluno-build** | `@eluno/core` | v1 (`main` branch) | `/{slug}/` |

`build-v2.cjs` tiene `enabledChapters` que controla qué capítulos se publican. Actualmente: `[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]`.

---

## Scripts de automatización

| Script | Fase | Descripción |
|--------|------|-------------|
| `integrate-chapter.js` | 6 | Copia EN, merge glossary, copia provenance |
| `translate-chapter.js` | 7 | Traducción EN→ES/PT via Anthropic API |
| `validate-alignment.js` | — | Validación cross-idioma (10 checks) |

---

## Dependencias clave

- `@eluno/core` — Build tools, SCSS, fonts (github:chuchurex/eluno-core)
- `@anthropic-ai/sdk` — Traducción automática (fase 7)
- `dotenv` — Variables de entorno (.env)
