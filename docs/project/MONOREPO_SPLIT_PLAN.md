# Plan: Separar monorepo en tres repos

> Fecha: 2026-02-03
> Estado: Pendiente de aprobacion

---

## Contexto

El monorepo actual (`chuchurex/eluno.org`) contiene eluno + 6 libros hermanos
+ core compartido. La meta es:

1. Separar eluno en su propio repo
2. Dejar los hermanos en un monorepo limpio
3. Extraer core como repo/paquete compartido (git dependency)

---

## Resultado final: 4 repos

| Repo | Contenido | Visibilidad |
|------|-----------|-------------|
| `chuchurex/eluno-org-archive` | Monorepo original (renombrado) | **Privado** |
| `chuchurex/eluno-core` | Scripts de build, SCSS, fonts — paquete npm via git | **Publico** |
| `chuchurex/eluno` | Solo el libro eluno + docs + ai | **Publico** |
| `chuchurex/eluno-books` | todo, jesus, sanacion, doctrinas, dormidos | **Publico** |

---

## Hallazgos de la auditoria

### Estado de scripts por ubicacion

| Ubicacion | Total | Portables | Rotos | Duplicados de core |
|-----------|-------|-----------|-------|--------------------|
| core/scripts/ | 26 | 18 | 8 | — (es el original) |
| eluno/scripts/ | 25 | 23 | 2 | 23 (todos) |
| jesus/scripts/ | 2 | 2 | 0 | 1 (build-pdf) |
| sanacion/scripts/ | 9 | 9 | 0 | 1 (build-pdf) |
| dormidos/scripts/ | 2 | 2 | 0 | 1 (build-revision) |
| doctrinas/scripts/ | 5 | 0 | 5 | 0 (son propios) |

### Problemas criticos encontrados

1. **packages/eluno/scripts/ es una copia completa de core/scripts/**
   Los 23 scripts de eluno son duplicados exactos de core. Deben eliminarse
   y usar core directamente.

2. **8 scripts de core usan `path.join(__dirname, '..')` en vez de `process.cwd()`**
   Esto hace que busquen `i18n/`, `dist/`, `audiobook/` dentro de core/ en vez
   del proyecto que los llama. De estos 8, ninguno esta referenciado en package.json
   de ningun libro — se ejecutan manualmente. El fix es cambiar a `process.cwd()`.

   Scripts afectados:
   - build-audiobook.js (155 lineas)
   - build-audiobook-tts.js (225 lineas)
   - build-md-podcast.js (150 lineas)
   - build-md-podcast-full.js (313 lineas)
   - build-md-podcast-parts.js (247 lineas)
   - build-md-podcast-plain.js (356 lineas)
   - concat-audiobook.js (70 lineas)
   - generate-all-audiobooks.js (377 lineas)
   - build-pdf-podcast.js (337 lineas)

3. **Los 5 scripts de doctrinas usan `process.cwd()` pero son propios**
   Doctrinas tiene su propio build.js (1453 lineas) que no usa core.
   Funcionan correctamente cuando se ejecutan desde el directorio del package.

4. **packages/eluno/scripts/deploy.js tiene password hardcodeado como fallback**
   Linea 17: `"domains/lawofone.chuchurex.cl/public_html/"` — dominio del desarrollador.
   Este archivo se elimina (se usa core/deploy.js que ya tiene SSH key support).

5. **embed-covers.sh tiene paths absolutos del desarrollador**
   `/Users/chuchurex/Sites/prod/eluno.org/video/dist/audio` — no portable.

### Dependencias externas de core

| Paquete | Uso | Requerido por |
|---------|-----|---------------|
| dotenv | Cargar .env | build.js, deploy.js, publish-media.js |
| sass | Compilar SCSS | Todos los proyectos (devDep) |
| puppeteer | Generar PDFs | build-pdf.js, build-pdf-podcast.js |
| @anthropic-ai/sdk | Traduccion AI | translate-to-pt.js |
| @msgpack/msgpack | TTS Fish Audio | fish-audio-tts.js |
| basic-ftp | Upload FTP | deploy.js (legacy) |
| node-id3 | Tags MP3 | update-mp3-tags.js (solo eluno) |

---

## Fase 0 — Limpiar el monorepo actual

Antes de separar, aplicar todas las correcciones en el monorepo:

### 0.1 Seguridad (ya hecho)

- [x] SSH keys en deploy.js y publish-media.js
- [x] StrictHostKeyChecking=accept-new
- [x] Fix workflow paths
- [x] Permissions-Policy header

### 0.2 Seguridad (pendiente)

- [ ] AGENTS.md: prohibir Co-Authored-By, limpiar footer de Claude Code
- [ ] Crear SECURITY.md con security@chuchurex.cl
- [ ] Agregar archivos de agentes AI al .gitignore

### 0.3 Fix de los 8 scripts rotos en core

Cambiar `path.join(__dirname, '..')` por `process.cwd()` en los 9 scripts
listados arriba. El patron es identico en todos:

```javascript
// ANTES (roto como npm package)
const I18N_DIR = path.join(__dirname, '..', 'i18n');
const DIST_DIR = path.join(__dirname, '..', 'dist');

// DESPUES (portable)
const PROJECT_ROOT = process.cwd();
const I18N_DIR = path.join(PROJECT_ROOT, 'i18n');
const DIST_DIR = path.join(PROJECT_ROOT, 'dist');
```

### 0.4 Eliminar duplicados de eluno/scripts/

Borrar los 23 scripts duplicados de `packages/eluno/scripts/` que son copias
de core. Mantener solo:
- `embed-covers.sh` (unico de eluno, pero hay que arreglar paths absolutos)

Actualizar eluno para usar core/scripts/ via package.json scripts como hacen
los demas libros.

### 0.5 Eliminar duplicados en libros hermanos

- `packages/jesus/scripts/build-pdf.js` -> usar `../core/scripts/build-pdf.js`
- `packages/sanacion/scripts/build-pdf.js` -> usar `../core/scripts/build-pdf.js`
- `packages/dormidos/scripts/build-revision.js` -> evaluar si es identico a core

Los scripts especificos de cada libro (sanacion/translate-reiki.js, etc.) se quedan.

---

## Fase 1 — Crear repo `chuchurex/eluno-core`

### Estructura

```
eluno-core/
├── scripts/
│   ├── build.js              # Generador HTML desde JSON (1044 lineas)
│   ├── build-pdf.js          # Generador PDF con Puppeteer
│   ├── deploy.js             # Deploy SSH con key auth
│   ├── publish-media.js      # Build + deploy media
│   ├── translate-chapter.js  # Traduccion de capitulos
│   ├── translate-to-pt.js    # Traduccion a portugues (Claude API)
│   ├── build-audiobook.js    # Exportar texto para TTS
│   ├── build-md-podcast*.js  # Generar markdown para podcast (4 variantes)
│   ├── concat-audiobook.js   # Concatenar MP3s
│   ├── generate-all-audiobooks.js  # Batch TTS
│   ├── fish-audio-tts.js     # Wrapper Fish Audio API
│   ├── purge-cloudflare.js   # Purgar cache CF
│   ├── setup-new-project.js  # Scaffold proyecto nuevo
│   └── ... (utilidades menores)
├── scss/                     # 7-1 architecture SCSS
│   ├── main.scss
│   ├── abstracts/
│   ├── base/
│   ├── components/
│   ├── layout/
│   ├── pages/
│   └── utilities/
├── fonts/                    # Web fonts (woff2)
│   ├── cormorant-garamond-400.woff2
│   ├── spectral-*.woff2
│   └── fonts.css
├── _headers.template         # Cloudflare Pages headers
├── package.json              # Declara dependencias, exports, bin
├── README.md
└── LICENSE
```

### package.json de eluno-core

```json
{
  "name": "@eluno/core",
  "version": "1.0.0",
  "description": "Shared build tools, styles, and fonts for eluno book projects",
  "license": "AGPL-3.0",
  "exports": {
    ".": "./scripts/build.js",
    "./scripts/*": "./scripts/*",
    "./scss/*": "./scss/*",
    "./fonts/*": "./fonts/*"
  },
  "dependencies": {
    "dotenv": "^17.2.3"
  },
  "optionalDependencies": {
    "puppeteer": "^24.34.0",
    "@anthropic-ai/sdk": "^0.71.2",
    "@msgpack/msgpack": "^3.1.3",
    "basic-ftp": "^5.0.5"
  },
  "peerDependencies": {
    "sass": "^1.97.0"
  }
}
```

Notas:
- `dotenv` es la unica dependencia requerida (todos los scripts la usan)
- `puppeteer`, `@anthropic-ai/sdk`, `@msgpack/msgpack` son opcionales
  (solo se necesitan si usas PDF, traduccion, o TTS)
- `sass` es peerDependency (cada proyecto lo instala para compilar SCSS)

### Como se consume

Los repos `eluno` y `eluno-books` lo instalan como git dependency:

```json
{
  "dependencies": {
    "@eluno/core": "github:chuchurex/eluno-core"
  }
}
```

Los scripts se llaman asi:

```json
{
  "scripts": {
    "build": "npm run sass:build && node node_modules/@eluno/core/scripts/build.js",
    "sass:build": "sass node_modules/@eluno/core/scss/main.scss:dist/css/main.css --style=compressed",
    "deploy": "node node_modules/@eluno/core/scripts/deploy.js",
    "build:pdf": "node node_modules/@eluno/core/scripts/build-pdf.js"
  }
}
```

O mas limpio con un bin entry en core:

```json
// En @eluno/core/package.json
{
  "bin": {
    "eluno-build": "./scripts/build.js",
    "eluno-deploy": "./scripts/deploy.js",
    "eluno-pdf": "./scripts/build-pdf.js"
  }
}

// En los proyectos que consumen
{
  "scripts": {
    "build": "npm run sass:build && eluno-build",
    "deploy": "eluno-deploy"
  }
}
```

### Cambio critico en los scripts: .env loading

Actualmente deploy.js busca el .env del monorepo con:
```javascript
const MONOREPO_ROOT = path.join(__dirname, '../../..');
require('dotenv').config({ path: path.join(MONOREPO_ROOT, '.env') });
```

Como npm package, esto ya no funciona. El fix:
```javascript
// Cargar .env del proyecto que llama al script
require('dotenv').config({ path: path.join(process.cwd(), '.env') });
```

Cada proyecto tendra su propio .env completo con todas las credenciales.

---

## Fase 2 — Crear repo `chuchurex/eluno`

### Estructura

```
eluno/
├── i18n/                    # Contenido multiidioma
│   ├── en/
│   ├── es/
│   └── pt/
├── audiobook/               # Contenido de audiobooks
├── scripts/                 # Solo scripts propios de eluno
│   └── embed-covers.sh     # (arreglar paths absolutos)
├── src/
├── dist/                    # (gitignored)
├── docs/                    # Documentacion del proyecto
│   ├── writing/
│   ├── tech/
│   ├── audiobook/
│   ├── video/
│   └── project/
├── ai/                      # Guias de AI para contenido
├── PROMPT.md                # Visible para contribuidores
├── SECURITY.md
├── README.md
├── LICENSE
├── .env.example
├── .gitignore               # Incluye seccion de agentes AI
└── package.json
```

### package.json de eluno

```json
{
  "name": "eluno",
  "version": "1.0.0",
  "private": true,
  "description": "El Uno — The Law of One in a philosophical lens",
  "license": "AGPL-3.0",
  "dependencies": {
    "@eluno/core": "github:chuchurex/eluno-core"
  },
  "devDependencies": {
    "live-server": "^1.2.2",
    "sass": "^1.97.3",
    "concurrently": "^8.2.2"
  },
  "scripts": {
    "build": "npm run sass:build && eluno-build",
    "sass:build": "sass node_modules/@eluno/core/scss/main.scss:dist/css/main.css --style=compressed",
    "sass:watch": "sass --watch node_modules/@eluno/core/scss/main.scss:dist/css/main.css",
    "dev": "concurrently \"npm run sass:watch\" \"live-server dist --port=3001\"",
    "deploy": "eluno-deploy",
    "build:pdf": "eluno-pdf"
  }
}
```

---

## Fase 3 — Crear repo `chuchurex/eluno-books`

### Estructura

```
eluno-books/
├── packages/
│   ├── todo/                # Cada libro con sus i18n, scripts propios, etc.
│   ├── jesus/
│   ├── sanacion/
│   ├── doctrinas/           # Tiene su propio build.js (no usa core)
│   ├── dormidos/
│   └── otramirada/
├── docs/
├── ai/
├── libros/                  # Landing page
├── SECURITY.md
├── README.md
├── LICENSE
├── .env.example
├── .gitignore
└── package.json             # Workspaces: packages/*
```

### package.json root de eluno-books

```json
{
  "name": "eluno-books",
  "private": true,
  "workspaces": ["packages/*"],
  "devDependencies": {
    "concurrently": "^8.2.0"
  },
  "scripts": {
    "dev:todo": "npm run dev -w @eluno/todo",
    "dev:jesus": "npm run dev -w @eluno/jesus",
    "dev:sanacion": "npm run dev -w @eluno/sanacion",
    "dev:doctrinas": "npm run dev -w @eluno/doctrinas",
    "build:all": "npm run build -w @eluno/todo && npm run build -w @eluno/jesus && npm run build -w @eluno/sanacion && npm run build -w @eluno/doctrinas"
  }
}
```

### Cada package (ej. todo) referencia core via npm

```json
{
  "name": "@eluno/todo",
  "dependencies": {
    "@eluno/core": "github:chuchurex/eluno-core"
  },
  "scripts": {
    "build": "npm run sass:build && eluno-build",
    "sass:build": "sass node_modules/@eluno/core/scss/main.scss:dist/css/main.css --style=compressed"
  }
}
```

### Nota sobre doctrinas

Doctrinas tiene su propio build.js y NO usa core/build.js. Sin embargo,
si usa core para SCSS y fonts. Su package.json seria:

```json
{
  "name": "@eluno/doctrinas",
  "dependencies": {
    "@eluno/core": "github:chuchurex/eluno-core"
  },
  "scripts": {
    "build": "npm run sass:build && node scripts/build.js && npm run build:revision",
    "sass:build": "sass node_modules/@eluno/core/scss/main.scss:dist/css/main.css --style=compressed"
  }
}
```

---

## Fase 4 — Archivar monorepo original

1. Renombrar `chuchurex/eluno.org` -> `chuchurex/eluno-org-archive` en GitHub
2. Marcarlo como privado
3. Agregar descripcion: "Archived monorepo. See chuchurex/eluno-core, chuchurex/eluno, and chuchurex/eluno-books"

---

## Fase 5 — Reconectar Cloudflare Pages

Los proyectos de Cloudflare Pages estan conectados al repo `chuchurex/eluno.org`.
Hay que reconectarlos:

- eluno.org -> `chuchurex/eluno` (build: `npm run build`, output: `dist/`)
- todo.eluno.org -> `chuchurex/eluno-books` (build: `npm run build -w @eluno/todo`, output: `packages/todo/dist/`)
- jesus.eluno.org -> idem con `-w @eluno/jesus`
- sanacion.eluno.org -> idem con `-w @eluno/sanacion`
- doctrinas.eluno.org -> idem con `-w @eluno/doctrinas`
- dormidos.eluno.org -> idem con `-w @eluno/dormidos`

---

## Fase 6 — Verificacion

### Build test

```bash
# En eluno/
npm install
npm run build
npm run dev

# En eluno-books/
npm install
npm run build:all
npm run dev:todo
npm run dev:jesus
npm run dev:sanacion
npm run dev:doctrinas
```

### Security checks

```bash
# No sshpass sin wrapper
grep -rn "sshpass" node_modules/@eluno/core/scripts/

# No StrictHostKeyChecking=no
grep -rn "StrictHostKeyChecking=no" .

# SECURITY.md existe
test -f SECURITY.md

# Archivos de agentes NO en el repo
git ls-files | grep -iE "CLAUDE\.md|AGENTS\.md|SECURITY_TASKS\.md"
```

---

## Orden de ejecucion

### Bloque 1: Preparacion (en el monorepo actual)

1. Fix 8 scripts rotos en core (cambiar __dirname por process.cwd)
2. Eliminar 23 scripts duplicados de eluno/scripts/
3. Eliminar scripts duplicados de jesus, sanacion, dormidos
4. AGENTS.md: opcion B (prohibir Co-Authored-By)
5. Crear SECURITY.md
6. Agregar agentes AI al .gitignore

### Bloque 2: Crear eluno-core

7. Crear repo `chuchurex/eluno-core` en GitHub
8. Agregar package.json con exports y bin
9. Adaptar scripts: .env loading desde process.cwd()
10. Push inicial
11. Verificar: `npm install github:chuchurex/eluno-core` funciona

### Bloque 3: Crear eluno

12. Crear repo `chuchurex/eluno` en GitHub
13. Copiar i18n, audiobook, docs, ai, PROMPT.md, etc.
14. Crear package.json con dependencia a @eluno/core
15. Push inicial
16. Verificar: `npm install && npm run build`

### Bloque 4: Crear eluno-books

17. Crear repo `chuchurex/eluno-books` en GitHub
18. Copiar packages (sin core, sin eluno), docs, ai
19. Actualizar package.json de cada libro
20. Push inicial
21. Verificar: `npm install && npm run build:all`

### Bloque 5: Transicion

22. Reconectar Cloudflare Pages a repos nuevos
23. Verificar que los sitios cargan correctamente
24. Archivar monorepo original como privado

---

## Riesgos y mitigaciones

| Riesgo | Impacto | Mitigacion |
|--------|---------|------------|
| Cloudflare Pages desconectado al renombrar | Sitios caidos | Reconectar ANTES de archivar |
| core como git dependency es lento en CI | Builds lentos | Cachear node_modules en GitHub Actions |
| Actualizar core requiere npm update en 2 repos | Mantenimiento | Documentar proceso, considerar dependabot |
| doctrinas build.js no usa core | Drift de features | Evaluar migracion futura a core build.js |
| Scripts de podcast/audiobook poco usados | Codigo muerto | Marcar como experimental en README |
| GitHub secrets no migrados | Deploys rotos | Copiar secrets antes de primer deploy |

---

## Beneficios de esta arquitectura

1. **Un solo source of truth para core**: cambios en SCSS, build, deploy se hacen
   en un solo lugar
2. **Repos limpios**: sin historial con secretos, sin duplicados
3. **Independencia**: eluno puede evolucionar sin afectar a los hermanos
4. **Contribuidores**: cada repo es autocontenido, facil de clonar y buildear
5. **Seguridad**: archivos de agentes AI en gitignore, SSH keys, CSP headers
