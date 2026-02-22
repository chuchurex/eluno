# Tareas Pendientes — El Uno

> Actualizado: Febrero 22, 2026

---

## Contenido (prioridad alta)

- [x] **Escribir capítulos 3-16 en v3** — Completado (Feb 16)
- [ ] **Test live de translate-chapter.js** — Solo se probó en dry-run, falta test con API real
- [ ] **Test end-to-end de `/write:publish`** — Probar pipeline completo en capítulo nuevo

---

## Build y Deploy

- [ ] **Evaluar convergencia de builds** — `build-v2.cjs` (v3) vs `eluno-build` (v1) generan URLs diferentes. Decidir si unificar o mantener separados.
- [x] **SEO: robots meta tag** — En todas las páginas (Feb 21)
- [x] **Generar sitemap.xml** — 54 URLs con hreflang (Feb 21)
- [x] **Fix artículos duplicados en glossary terms** — HTML, PDF y TTS (Feb 22)

---

## Calidad de código

- [x] **ESLint + Prettier** — Configurado con husky + lint-staged
- [ ] **Tests unitarios** — Para `processText()`, `validate-alignment`, `integrate-chapter`
- [ ] **Extraer JS inline** — `build-v2.cjs` genera ~90 líneas de JS inline por página

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

- [ ] **Limpiar capítulos legacy** — Los archivos 03-16.json en i18n/ son v1/v2. Decidir si mantener o archivar.
- [ ] **Organizar operador/** — Definir estructura estándar para workspace de escritura.
- [ ] **Sincronizar branch v3** — `v3` divergió de `main` después de la promoción. Evaluar merge o deprecar.

---

## Futuro (sin compromiso de fecha)

- [ ] **PWA para lectura offline**
- [ ] **Búsqueda client-side**
- [ ] **Idiomas adicionales** (FR, DE, IT)
- [ ] **Libro físico** (print-on-demand)
- [ ] **Accesibilidad WCAG 2.1 AA**

---

*Historial: versión v1 de este archivo archivada en `docs/private/archive-v1/TODO_v1.md`*
