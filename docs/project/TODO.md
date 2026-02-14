# Tareas Pendientes — El Uno

> Actualizado: Febrero 14, 2026

---

## Contenido (prioridad alta)

- [ ] **Escribir capítulos 3-16 en v3** — Pipeline completo por capítulo
- [ ] **Test live de translate-chapter.js** — Solo se probó en dry-run, falta test con API real
- [ ] **Test end-to-end de `/write:publish`** — Probar pipeline completo en capítulo nuevo

---

## Build y Deploy

- [ ] **Evaluar convergencia de builds** — `build-v2.cjs` (v3) vs `eluno-build` (v1) generan URLs diferentes. Decidir si unificar o mantener separados.
- [ ] **SEO: robots meta tag** — Actualmente sin `noindex`. Configurar dinámicamente cuando sea necesario.
- [ ] **Generar sitemap.xml** — Automáticamente durante build para capítulos habilitados.

---

## Calidad de código

- [x] **ESLint + Prettier** — Configurado con husky + lint-staged
- [ ] **Tests unitarios** — Para `processText()`, `validate-alignment`, `integrate-chapter`
- [ ] **Extraer JS inline** — `build-v2.cjs` genera ~90 líneas de JS inline por página

---

## Audiobook

- [ ] **Generar audiobooks EN/PT** — Pipeline existe para ES, falta ejecutar para otros idiomas
- [ ] **Evaluar Chatterbox TTS** — Alternativa gratuita a Fish Audio

---

## Infraestructura

- [ ] **Limpiar capítulos legacy** — Los archivos 03-16.json en i18n/ son v1/v2. Decidir: mantener como están (no se buildan) o mover a archivo.
- [ ] **Organizar operador/** — Definir estructura estándar para workspace de escritura antes de trackearlo.

---

*Historial: versión v1 de este archivo archivada en `docs/private/archive-v1/TODO_v1.md`*
