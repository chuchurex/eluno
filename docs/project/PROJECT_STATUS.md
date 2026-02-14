# Estado del Proyecto — El Uno

> **Actualizado:** Febrero 14, 2026
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
- **Capítulos publicados:** 1, 2 (reescritos desde cero)
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
| 1 | Cosmology and Genesis | Publicado (EN/ES/PT) | Ene 2026 |
| 2 | The Creator and Creation | Publicado (EN/ES/PT) | Feb 2026 |
| 3-16 | — | Pendientes de reescritura v3 | — |

Los archivos `i18n/*/chapters/03-16.json` contienen versiones legacy (v1/v2) que no están habilitados en `build-v2.cjs`.

---

## Sistemas de build

| Sistema | Archivo | Usado en | URLs generadas |
|---------|---------|----------|----------------|
| **build-v2.cjs** | `scripts/build-v2.cjs` | v3 (`v3` branch) | `/{lang}/chapters/{slug}.html` |
| **eluno-build** | `@eluno/core` | v1 (`main` branch) | `/{slug}/` |

`build-v2.cjs` tiene `enabledChapters` que controla qué capítulos se publican. Actualmente: `[1, 2]`.

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
