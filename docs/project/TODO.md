# Tareas Pendientes — El Uno

> Actualizado: Febrero 22, 2026

---

## Contenido (prioridad alta)

- [x] **Escribir capítulos 3-16 en v3** — Completado (Feb 16)
- [x] **Test live de translate-chapter.js** — Pipeline funciona, falta crédito Anthropic. Mejorado error handling (Feb 22)
- [x] **Test end-to-end de `/write:publish`** — Todos los scripts funcionan. Fix v3 detection en update-project-docs.js (Feb 22)

---

## Build y Deploy

- [x] **Evaluar convergencia de builds** — `build-v2.cjs` es el único build activo. Eliminado `build-auto.cjs` legacy. `@eluno/core` se mantiene solo por fonts/SCSS (Feb 22)
- [x] **SEO: robots meta tag** — En todas las páginas (Feb 21)
- [x] **Generar sitemap.xml** — 54 URLs con hreflang (Feb 21)
- [x] **Fix artículos duplicados en glossary terms** — HTML, PDF y TTS (Feb 22)

---

## Calidad de código

- [x] **ESLint + Prettier** — Configurado con husky + lint-staged
- [x] **Tests unitarios** — 43 tests con `node:test`: parseTerms, parseRefs, slugify, extractMarks, mergeGlossaryTerms, META (Feb 22)
- [x] **Extraer JS inline** — Extraído a `dist/js/eluno.js` (157 líneas) y `dist/js/theme.js` (26 líneas). Solo GA queda inline (Feb 22)

---

## Audiobook

- [x] **Generar audiobooks ES/EN/PT** — 16 capítulos + libro completo por idioma, Edge TTS (Feb 22)
- [x] **ID3 tags con atribución L/L Research** — En los 51 archivos MP3 (Feb 22)
- [x] **Assembly con outro** — Cada capítulo tiene outro con atribución L/L Research (Feb 22)
- [x] **Fix pronunciación llresearch.org** — "L. L. Research punto org" (Feb 22)
- [x] **Fix artículos duplicados en TTS** — "el El Infinito" → "El Infinito" (Feb 22)
- [ ] **Evaluar voz profesional** — Considerar upgrade a voz pagada cuando haya presupuesto

---

## Infraestructura

- [x] **Limpiar archivos legacy** — Eliminados glossary_chapter4_additions.json y .bak. Todos los capítulos son v3 (Feb 22)
- [x] **Organizar operador/** — Estructura ya estandarizada: `writing/` (público, prompts+protocolos) + `workspace/` (privado, drafts+sources). Eliminadas refs legacy a `operador/` en README de comandos. Documentación actualizada (Feb 22)
- [x] **Limpiar branches obsoletas** — Eliminados v3, v2, audiobook, feat/writing-automation. Quedan main + alpha (Feb 22)

---

## Futuro (sin compromiso de fecha)

- [ ] **PWA para lectura offline**
- [ ] **Búsqueda client-side**
- [ ] **Idiomas adicionales** (FR, DE, IT)
- [ ] **Libro físico** (print-on-demand)
- [x] **Accesibilidad WCAG 2.1 AA** — Skip link, H3→H2 heading hierarchy, :focus-visible en todos los interactivos, aria-expanded en toggles, overlay keyboard-accessible, SVGs aria-hidden, lang selector aria-labels, focus management + Escape key, prefers-reduced-motion, font-size relativo (Feb 22)

---

*Historial: versión v1 de este archivo archivada en `docs/private/archive-v1/TODO_v1.md`*
