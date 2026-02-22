# Comandos Personalizados - Proyecto UNO

Esta carpeta contiene comandos slash personalizados para Claude Code.
Los comandos se invocan escribiendo `/categoria:comando` en el chat.

## Estructura

```
.claude/commands/
├── audiobook/           # Comandos de generación de audio
│   ├── generate.md      # /audiobook:generate [idioma] [caps]
│   ├── concat.md        # /audiobook:concat [idioma]
│   ├── tag.md           # /audiobook:tag [idioma]
│   ├── compare-tts.md   # /audiobook:compare-tts [idioma] [texto]
│   └── status.md        # /audiobook:status
│
├── project/             # Comandos de gestión del proyecto
│   ├── roadmap.md       # /project:roadmap
│   ├── todo.md          # /project:todo [add|done] [tarea]
│   └── context.md       # /project:context
│
├── write/               # Pipeline de escritura de capítulos
│   ├── chapter.md       # /write:chapter [NN] — Pipeline completo autónomo
│   ├── prepare.md       # /write:prepare [NN] — Preparar capítulo
│   ├── step1.md         # /write:step1 [NN] — Primera mitad
│   ├── step2.md         # /write:step2 [NN] — Segunda mitad
│   ├── qa.md            # /write:qa [NN] — QA + JSON
│   ├── glossary.md      # /write:glossary [NN] — Glosario + Provenance
│   └── publish.md       # /write:publish [NN] — Integrar, traducir, build, deploy
│
├── sanity/              # Comandos para Sanity CMS
│   ├── query.md         # /sanity:query [groq|atajo]
│   └── schema.md        # /sanity:schema [tipo]
│
└── README.md            # Este archivo
```

## Comandos Disponibles

### Audiobook

| Comando                  | Descripción                 | Ejemplo                               |
| ------------------------ | --------------------------- | ------------------------------------- |
| `/audiobook:generate`    | Genera MP3s con TTS         | `/audiobook:generate es all`          |
| `/audiobook:concat`      | Une capítulos en audiolibro | `/audiobook:concat en`                |
| `/audiobook:tag`         | Actualiza metadatos ID3     | `/audiobook:tag es`                   |
| `/audiobook:compare-tts` | Compara Fish vs xDeeVid     | `/audiobook:compare-tts es chapter:1` |
| `/audiobook:status`      | Estado de generación        | `/audiobook:status`                   |

### Project

| Comando            | Descripción               | Ejemplo                         |
| ------------------ | ------------------------- | ------------------------------- |
| `/project:roadmap` | Ver progreso del roadmap  | `/project:roadmap`              |
| `/project:todo`    | Gestionar tareas          | `/project:todo add Nueva tarea` |
| `/project:context` | Cargar contexto de sesión | `/project:context`              |

### Write (Pipeline de escritura)

| Comando           | Descripción                          | Ejemplo              |
| ----------------- | ------------------------------------ | -------------------- |
| `/write:chapter`  | Pipeline completo autónomo (6 fases) | `/write:chapter 03`  |
| `/write:prepare`  | Prepara prompt, manifest, research   | `/write:prepare 03`  |
| `/write:step1`    | Escribe primera mitad del capítulo   | `/write:step1 03`    |
| `/write:step2`    | Escribe segunda mitad del capítulo   | `/write:step2 03`    |
| `/write:qa`       | QA de lectura + genera JSON          | `/write:qa 03`       |
| `/write:glossary` | Genera glosario + provenance         | `/write:glossary 03` |
| `/write:publish`  | Integrar, traducir, build, deploy    | `/write:publish 03`  |

**Pipeline completo:** `prepare` → `step1` → `step2` → `qa` → `glossary` → `publish`

**Prerrequisito:** Tener volúmenes fuente en `workspace/sources/` (ver `writing/README.md`).

**Output:** Prompts en `writing/chapters/chNN/`, borradores en `workspace/chapters/chNN/`, capítulos finales en `i18n/{en,es,pt}/chapters/NN.json`.

### Sanity

| Comando          | Descripción         | Ejemplo                  |
| ---------------- | ------------------- | ------------------------ |
| `/sanity:query`  | Ejecutar query GROQ | `/sanity:query drafts`   |
| `/sanity:schema` | Ver schema          | `/sanity:schema chapter` |

## Cómo Funcionan

1. **Ubicación**: Los archivos `.md` en esta carpeta son detectados automáticamente por Claude Code
2. **Invocación**: Escribe `/categoria:comando argumentos` en el chat
3. **Argumentos**: Usa `$ARGUMENTS` en el archivo .md para capturar lo que escribas después del comando
4. **Versionado**: Esta carpeta está en Git, así que los comandos se comparten con el equipo

## Agregar Nuevos Comandos

1. Crea un archivo `.md` en la subcarpeta apropiada
2. El nombre del archivo será el nombre del comando
3. Escribe instrucciones claras en lenguaje natural
4. Usa `$ARGUMENTS` para capturar parámetros del usuario

### Plantilla básica:

```markdown
# Nombre del Comando

Descripción breve de lo que hace.

## Argumentos

$ARGUMENTS = descripción de qué esperar

## Instrucciones

1. Paso uno
2. Paso dos
3. ...

## Ejemplo de uso

`/categoria:comando arg1 arg2`
```

## Notas

- Los comandos son prompts guardados que Claude ejecuta
- Puedes usar Markdown completo en las instrucciones
- Claude tiene acceso a todas sus herramientas (Bash, Read, Write, etc.)
- Los comandos de proyecto (`.claude/commands/`) tienen prioridad sobre los globales (`~/.claude/commands/`)
