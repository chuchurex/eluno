# eluno-ra-canon

Skill base del proyecto **El Uno** (eluno.org) y sus libros hermanos. Codifica la voz,
las reglas duras, el corpus Ra chunkeado y los validadores que sostienen el pipeline
de escritura.

## Estado del skill

- **Versión:** 1.0 — base con corpus Ra, sin Q'uo todavía.
- **Cubre:** El Uno, Todo (libros con regla "Ra única voz" estricta).
- **Pendiente:** capa Q'uo (Vol 9-11), corpus Q'uo chunkeado, ontología puente Gurdjieff↔Ra (para Dormidos), corpus Evangelios (para Jesús).

## Estructura

```
.claude/skills/eluno-ra-canon/
├── SKILL.md                          ← descripción + flujo top-level
├── README.md                         ← este archivo (guía humana)
├── reglas/
│   ├── voz-y-perspectiva.md          ← voz "nosotros" sapiencial, neutralidad de origen
│   ├── jerarquia-fuentes.md          ← Ra única voz, Q'uo silencio, ciencia como enriquecimiento
│   ├── terminos-prohibidos.json      ← dimension, chakra, starseed, etc. con severidad
│   └── atribuciones-prohibidas.json  ← Ra, Q'uo, Don Elkins, Carla Rueckert, etc.
├── plantillas/
│   ├── nuevo-capitulo.md             ← prompt para escribir capítulo desde cero
│   ├── revision-editorial.md         ← refinar capítulo existente sin romper marcado
│   └── qa-lectura.md                 ← QA post-escritura (9 categorías)
└── scripts/
    └── validate-chapter.mjs          ← validador ejecutable
```

## Activación

El skill se activa automáticamente cuando el usuario menciona:

- "El Uno", "The One", "Material Ra", "Ra Contact", "Ley del Uno", "Law of One".
- "escribir capítulo", "reescribir capítulo", "revisar capítulo", "QA del libro".
- "auditoría editorial", "consultar sesión Ra", "validar capítulo".
- Marcado: `{term:}`, `{ref:}`, `{src:}`.

Ver `SKILL.md` para la descripción completa de activación.

## Flujo de uso típico

### Escribir un capítulo nuevo

1. El usuario invoca: _"Escribe el capítulo 17 de El Uno sobre [tema]"_.
2. El skill se activa, lee las reglas duras y `plantillas/nuevo-capitulo.md`.
3. El skill pregunta al operador el contexto (libro, sesiones Ra de ancla, target).
4. El skill consulta `corpus/sessions/` (symlink al corpus real en `writing/sources/ra/sessions/`) para las sesiones requeridas.
5. El skill genera el JSON del capítulo en EN.
6. El skill ejecuta `validate-chapter.mjs` antes de devolver.
7. El operador revisa, traduce, integra.

### Revisar un capítulo existente

1. El usuario invoca: _"Refina la prosa del capítulo 5"_.
2. El skill activa, lee `plantillas/revision-editorial.md`.
3. El skill aplica cambios mínimos respetando el marcado.
4. El skill verifica con validator + alignment.
5. **Importante:** si la revisión no mejora demostrablemente la prosa, descartar.
   Esta lección viene de la rama `wip/editorial-pass-2026-04` que se descartó por
   romper marcado y eliminar palabras clave sin ganar calidad editorial.

### QA de capítulo

1. El usuario invoca: _"QA del capítulo 12"_.
2. El skill activa, lee `plantillas/qa-lectura.md`.
3. El skill ejecuta el validador automatizado.
4. El skill lee el capítulo aplicando las 9 categorías de QA humano.
5. El skill devuelve un reporte estructurado con veredicto.

## Scripts

### validate-chapter.mjs

Valida un JSON de capítulo contra todas las reglas duras.

```bash
# Validación humana
node .claude/skills/eluno-ra-canon/scripts/validate-chapter.mjs i18n/en/chapters/01.json

# Validación estructurada para LLM consumption
node .claude/skills/eluno-ra-canon/scripts/validate-chapter.mjs i18n/en/chapters/01.json --json

# Especificar idioma manualmente
node .claude/skills/eluno-ra-canon/scripts/validate-chapter.mjs <archivo> --lang es
```

Exit codes:

- `0` — pass (sin errores; warnings permitidos).
- `1` — fail (al menos un error).
- `2` — uso incorrecto.

## Corpus Ra

El corpus chunkeado vive en `writing/sources/ra/` del repo (gitignoreado por copyright) y se accede desde el skill vía el symlink `corpus/`:

- `corpus/index.json` — metadata por sesión (fecha, volumen, # preguntas).
- `corpus/sessions/session-NNN.md` — 106 archivos, uno por sesión, con front-matter YAML.

Cada archivo tiene cada Q&A como heading `## (N.M) <speaker>` para consulta directa.

**Para resolver el path del corpus desde scripts**, los scripts del skill usan `path.resolve(__dirname, '..', 'corpus', ...)` — es decir, relativo al propio script, no al cwd. Esto garantiza que funciona desde cualquier directorio.

## Referencias externas (en el repo principal)

- `writing/protocol/writing-protocol.md` — protocolo extenso (468 líneas).
- `writing/protocol/qa-protocol.md` — QA detallado (193 líneas).
- `writing/protocol/source-hierarchy.md` — jerarquía completa.
- `writing/reference/ra-thematic-index.md` — mapa Ra → 16 capítulos de El Uno.
- `writing/protocol/references.json` — registro central de `{ref:}` permitidas.
- `writing/tools/validate-chapter.cjs` — validador original (este skill lo extiende).
- `scripts/editorial-pass.js` — auditor cross-chapter.
- `scripts/validate-alignment.js` — validación EN↔ES↔PT.

## Filosofía operativa

> Ra es la fuente de menor distorsión que tenemos.
> El operador es el autor; el skill es asistente.
> Cuando dudes, pregunta antes de generar.

Tres principios:

1. **No inventar contenido sin ancla en Ra.** Si no se rastrea a una sesión, no entra al texto.
2. **No nombrar la fuente.** El lector debe poder leer el libro como filosofía sapiencial sin necesidad de aceptar su origen canalizado.
3. **El inglés es canónico.** Las traducciones a ES/PT se hacen después y se alinean estructuralmente.

## Roadmap

- **v1.1** — Cargar Q'uo Vol 9-11 chunkeado. Almacenado en `writing/sources/quo/` del repo, expuesto vía symlink `corpus-quo/` dentro del skill. Extender SKILL.md con reglas de jerarquía cruzada (cuándo Q'uo se permite, en qué libros).
- **v1.2** — Refinar regex de términos prohibidos para reducir falsos positivos
  (detectar usos cosmológicos vs metafóricos de "dimension", "challenge").
- **v1.3** — Plantilla específica por libro (`plantillas/libro-eluno.md`,
  `plantillas/libro-todo.md`, etc.) que herede de las plantillas base.
- **Futuro** — Ontología puente Gurdjieff↔Ra para Dormidos. Corpus Evangelios para Jesús.
  Soporte ES/PT en regex de términos prohibidos.

## Notas honestas

- Las reglas son estrictas, los falsos positivos son tradeoff aceptado por la primera versión.
- El corpus Ra tiene metadata mínima en v1; no incluye anotación de sesiones comprometidas
  por interferencia (mencionadas en el propio material). Pendiente para v1.1.
- Este skill no reemplaza el juicio editorial del operador. Lo asiste.
