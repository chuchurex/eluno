# Law of One - Próximos Pasos (Roadmap)

Este archivo sirve como guía para cualquier agente o desarrollador que continúe con el proyecto. Contiene las mejoras de eficiencia y nuevas funcionalidades planeadas.

---

## 🔴 Alta Prioridad

### Dependencias del Monorepo
- [ ] **Hoistear dependencias comunes al package.json raíz**
  - Mover `sass`, `concurrently`, `live-server`, `dotenv`, `basic-ftp`, `puppeteer`, `@anthropic-ai/sdk` al root
  - Los paquetes individuales (todo, sanacion, jesus) solo deben tener scripts, no dependencias duplicadas
  - Beneficio: Menos node_modules, builds más rápidos, mantenimiento centralizado

### SEO y Visibilidad
- [ ] **Configurar `robots` meta tag dinámicamente**
  - Actualmente hardcodeado como `noindex, nofollow` en `build.js:451`
  - Crear variable `NODE_ENV` o `INDEXABLE=true` en .env
  - Si producción: `index, follow` | Si desarrollo: `noindex, nofollow`

### Configuración Externalizada
- [ ] **Mover Google Analytics ID a variable de entorno**
  - Actualmente hardcodeado: `G-9LDPDW8V6E` en `build.js:454`
  - Crear `GA_ID` en .env y condicionar su inclusión

---

## 🟡 Media Prioridad

### Modularización del Build System
- [ ] **Refactorizar `build.js` (1037 líneas) en módulos**
  ```
  packages/core/scripts/
  ├── build.js              → Orquestador (~100 líneas)
  └── lib/
      ├── config.js         → Configuración y .env
      ├── json-loader.js    → Carga de contenido i18n
      ├── html-generator.js → Generación de HTML
      ├── text-processor.js → Markup ({term:}, {ref:}, **bold**)
      ├── media-toolbar.js  → Barra de medios (audio/PDF/YouTube)
      └── assets.js         → Copia de fonts, headers, redirects
  ```

### Performance y CSP
- [ ] **Extraer JavaScript inline a archivo externo**
  - `generateScripts()` devuelve ~90 líneas de JS en cada página
  - Crear `packages/core/js/main.js`
  - Minificar durante build (opcional: terser)
  - Cargar con `<script src="/js/main.js" defer>`
  - Beneficios: Caching del navegador, mejor CSP, debugging más fácil

### Calidad de Código
- [ ] **Agregar ESLint + Prettier al proyecto**
  ```json
  {
    "devDependencies": {
      "eslint": "^8.x",
      "prettier": "^3.x"
    },
    "scripts": {
      "lint": "eslint packages/*/scripts/**/*.js",
      "format": "prettier --write packages/**/*.{js,scss,json}"
    }
  }
  ```

### QA Mejorado
- [ ] **Expandir `qa-verify.sh` con más verificaciones**
  - Verificar headers HTTP (CSP, X-Frame-Options, CORS)
  - Verificar que hreflang tags sean correctos
  - Alertar si assets exceden tamaño (ej: MP3 > 50MB)
  - Generar reporte JSON para CI/CD
  - Verificar broken links internos entre capítulos

### Documentación
- [ ] **Actualizar `docs/tech/ARCHITECTURE.md`**
  - La estructura muestra `src/scss/` pero el código real está en `packages/core/scss/`
  - Sincronizar diagramas con estructura actual del monorepo

---

## 🟢 Baja Prioridad (Futuro)

### TypeScript Migration
- [ ] **Migrar scripts a TypeScript gradualmente**
  - Empezar por `lib/config.ts` con interfaces claras
  - Agregar `tsconfig.json` para scripts
  - Beneficio: Type safety, mejor autocompletado, menos bugs

### Testing
- [ ] **Agregar tests unitarios para funciones críticas**
  - `processText()` - conversión de markup
  - `generateSection()` - generación de HTML
  - `loadJSON()` - carga robusta de archivos
  - Framework sugerido: Jest o Vitest

### SEO Avanzado
- [ ] **Generar `sitemap.xml` automáticamente durante build**
  - Listar todas las URLs de capítulos y páginas
  - Incluir lastmod basado en fecha de archivo JSON
  - Agregar a robots.txt: `Sitemap: https://eluno.org/sitemap.xml`

### PWA (Progressive Web App)
- [ ] **Implementar lectura offline**
  - Crear `manifest.json` con iconos y colores del tema
  - Service Worker para cachear capítulos visitados
  - Especialmente útil para libros largos

### Búsqueda
- [ ] **Agregar búsqueda de texto client-side**
  - Generar índice pre-computado durante build
  - Usar lunr.js o similar (ligero, sin servidor)
  - Buscar en títulos, contenido y glosario

---

## 🎙️ Generacion de Audiolibros

- [ ] **Migrar TTS de Fish Audio (pago) a Chatterbox (gratuito)**
  - Analisis completo, comparativa y plan de implementacion en [`docs/project/TTS_MIGRATION.md`](TTS_MIGRATION.md)
  - ~100+ archivos de audio pendientes en 3 idiomas (ES, EN, PT)
  - Solucion recomendada: Chatterbox TTS Multilingual (MIT, 23 idiomas)

---

## 🏁 Paridad de Idiomas (Original)

- [ ] **Generación de PDFs completos (EN/PT):** Replicar `node scripts/build-pdf.js complete` para idiomas restantes.
- [ ] **Barras de Medios en Portadas (EN/PT):** Asegurar acceso al PDF completo y audiolibro.
- [ ] **Sincronización de Medios:** Completar subida de activos a Hostinger.

---

## 🛠️ Mejoras de Arquitectura (Original)

- [ ] **Optimización de Puppeteer:** Reutilizar instancia del navegador en `build-pdf.js` durante generación masiva.
- [ ] **Limpieza de Hardcoding:** Mover URLs de YouTube y redes sociales a `i18n/xx/ui.json`.

---

## 📈 Tareas Menores

- [ ] Investigar incorporación de silencios en audiolibro completo entre capítulos.
- [ ] Revisar que Dark Mode respete `prefers-color-scheme` del sistema como fallback inicial.

---

## Flujo de Trabajo Colaborativo

Para abordar estas mejoras de forma organizada:

1. **Crear rama feature**: `git checkout -b feature/nombre-mejora`
2. **Implementar cambios**: Commits atómicos y descriptivos
3. **Push a GitHub**: `git push -u origin feature/nombre-mejora`
4. **Crear Pull Request**: Describir cambios y vincular a este TODO
5. **Code Review**: Revisar antes de merge a `main`
6. **Merge y Deploy**: Automático via Cloudflare Pages

---

*Ultima actualización: 2026-02-03*
*Análisis realizado por: Claude Code*
