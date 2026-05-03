---
name: eluno-ra-canon
description: Use this skill whenever the user wants to write, rewrite, refine, audit, or QA chapters or sections of any book in the El Uno family (eluno.org and sibling books) that draws from the Ra Material (The Law of One). Triggers include explicit mentions of "El Uno", "The One", "Material Ra", "Ra Contact", "Ley del Uno", "Law of One", "escribir capítulo", "reescribir capítulo", "revisar capítulo", "QA del libro", "auditoría editorial", "consultar sesión Ra" (e.g., "sesión 27.5"), "validar capítulo", or markup like "{term:", "{ref:", "{src:". Also trigger when the user asks to refine prose for the books, check fidelity to Ra source, detect prohibited attributions (Ra, Q'uo, Don Elkins, Carla Rueckert, Jim McCarty), or design a new sub-book in the El Uno family. The skill carries the project's voice rules, source hierarchy, prohibited terms, the chunked Ra corpus indexable by session, and the validators. It is the canonical brain of the writing pipeline. Do NOT use for unrelated writing tasks — this skill is specific to the Ra-derived editorial project.
---

# El Uno — Ra Canon Skill

Este skill es el cerebro editorial del proyecto **El Uno** (eluno.org) y sus libros hermanos
(Todo, Jesús, Sanación, Doctrinas, Dormidos). Codifica:

- La **voz** del libro (primera persona plural sapiencial, neutralidad sobre origen).
- La **jerarquía de fuentes** (Ra única voz, Q'uo solo contexto, ciencia y filosofía como enriquecimiento).
- Las **reglas duras** (términos prohibidos, atribuciones prohibidas, formato de marcado `{term:}` `{ref:}` `{src:}`).
- El **corpus Ra chunkeado** por sesión (106 sesiones, indexable por `(N.M)`).
- Los **validadores** automáticos.
- Las **plantillas** para escribir capítulos nuevos, revisar editorialmente, y hacer QA.

## Cuándo activarse

Activate este skill cuando el usuario:

- Pida escribir o reescribir un capítulo o sección de un libro de la familia El Uno.
- Quiera revisar editorialmente prosa existente del proyecto.
- Necesite consultar el material original Ra por número de sesión/pregunta (ej. "qué dice 27.5").
- Pida QA de lectura sobre un capítulo (detectar referencias fantasma, voz inconsistente, atribuciones prohibidas).
- Vaya a iniciar un sub-libro nuevo derivado de Ra.
- Mencione marcado `{term:X}`, `{ref:cat:id}` o `{src:N.M}` en cualquier contexto.

NO actives este skill para tareas de escritura no relacionadas con el proyecto.

## Flujo recomendado al activarse

1. **Lee primero las reglas duras** (siempre, en este orden):
   - `reglas/voz-y-perspectiva.md` — voz "nosotros" sapiencial, neutralidad de origen.
   - `reglas/jerarquia-fuentes.md` — Ra única voz, Q'uo silencio, ciencia/filosofía como enriquecimiento.
   - `reglas/terminos-prohibidos.json` — vocabulario que NO debe aparecer (dimension → density, chakra → ray, etc.).
   - `reglas/atribuciones-prohibidas.json` — nombres y entidades que jamás aparecen en el texto final.

2. **Identifica el libro de destino.** Cada libro tiene su perfil que define audiencia, voz específica y permisos editoriales:

   | Libro | Audiencia | Permiso editorial |
   |---|---|---|
   | El Uno | el mensaje Ra con mínima distorsión | 0% — fidelidad estricta |
   | Todo | ateos + católicos | bajo — adaptación de tono |
   | Jesús | protestantes (cristología) | medio — Evangelios canónicos |
   | Sanación | sanadores espirituales (práctica) | medio-alto — Q'uo con voz |
   | Doctrinas | cristianos institucionales (deconstructivo) | medio — cita doctrinas para cuestionarlas |
   | Dormidos | buscadores con marco Gurdjieff | alto — diálogo entre cosmologías |

   Si no es claro qué libro, **pregunta** antes de escribir.

3. **Para consultar el material original Ra**, usa el corpus chunkeado dentro del propio skill (`corpus/` es un symlink al corpus en el repo):

   ```bash
   # Resolver el path del skill (independiente del cwd)
   SKILL_DIR=$(dirname "$(readlink -f .claude/skills/eluno-ra-canon/SKILL.md 2>/dev/null || echo ~/.claude/skills/eluno-ra-canon/SKILL.md)")

   # Una sesión completa
   cat "$SKILL_DIR/corpus/sessions/session-027.md"

   # Una pregunta específica (ej. 27.5)
   awk '/^## \(27\.5\)/,/^## \(27\.6\)/' "$SKILL_DIR/corpus/sessions/session-027.md"
   ```

   El índice temático que mapea conceptos a sesiones está en el repo principal en `writing/reference/ra-thematic-index.md` (no dentro del skill por ahora).

3.5. **Para consultar Q'uo (capa 1, solo cuando el libro lo permite — ver jerarquia-fuentes.md):**

   ```bash
   SKILL_DIR=$(dirname "$(readlink -f .claude/skills/eluno-ra-canon/SKILL.md 2>/dev/null || echo ~/.claude/skills/eluno-ra-canon/SKILL.md)")

   # Buscar sesiones por concepto (Q'uo no tiene mapa temático todavía)
   grep -l "polarity" "$SKILL_DIR/corpus-quo/sessions/"*.md | head -5

   # Sesión específica por fecha
   cat "$SKILL_DIR/corpus-quo/sessions/quo-2002-06-14.md"

   # Filtrar por año
   ls "$SKILL_DIR/corpus-quo/sessions/quo-1990-"*.md
   ```

   **Recordatorio**: Q'uo aparece en el texto SOLO en libros donde está explícitamente permitido. Para El Uno, Todo, Jesús, Doctrinas, Dormidos: Q'uo es **contexto silencioso del operador**, no fuente que se cita. Solo en Sanación Q'uo puede aparecer parafraseado. Ver `reglas/jerarquia-fuentes.md`.

4. **Para escribir o revisar**, usa las plantillas en `plantillas/`:
   - `plantillas/nuevo-capitulo.md` — capítulo desde cero.
   - `plantillas/revision-editorial.md` — refinar capítulo existente sin perder marcado.
   - `plantillas/qa-lectura.md` — QA de capítulo recién escrito.

5. **Antes de cerrar cualquier output**, valida con los scripts:

   ```bash
   node .claude/skills/eluno-ra-canon/scripts/validate-chapter.mjs <ruta-al-json>
   node .claude/skills/eluno-ra-canon/scripts/audit-cross-chapter.mjs <directorio-de-capitulos>
   ```

## Principios irrenunciables

Estos son los principios que NO se relajan en ningún libro de la familia, ni siquiera en los más adaptados:

1. **Ra es la única voz canónica.** Todas las ideas trazan a una sesión Ra (o a una pregunta específica vía marcado `{src:N.M}`). Lo que solo aparece en Q'uo no entra al texto excepto en libros donde explícitamente se permite (Sanación).

2. **Ra nunca se nombra.** Tampoco Q'uo, Don Elkins, Carla Rueckert, Jim McCarty, "channeled", "channeling", "L/L Research", "social memory complex" como autocaracterización del narrador.

3. **El inglés es la lengua canónica.** Toda escritura nueva o reescritura se hace en EN primero, traducción a ES/PT después. Nunca al revés. La sintaxis algo arcaica del Ra original es parte del transporte fiel y no debe modernizarse.

4. **El marcado se respeta.** `{term:X}` `{ref:cat:id}` `{src:N.M}` son sintácticamente sagrados. Nunca se rompen al editar prosa. Si dudas, ejecuta el validador antes de devolver el output.

5. **No se inventa contenido sin ancla en Ra.** Si una idea no se rastrea a una sesión Ra concreta, se marca como `{TODO: ancla en Ra}` o se elimina.

## Cuando dudes, pregunta

El skill es asistente del operador, no su reemplazo. El operador (usuario) es el autor. Decisiones que requieren confirmación:

- A qué libro de la familia pertenece la pieza.
- Qué nivel de adaptación se permite (¿se relaja la regla de Q'uo?).
- Cuál es la audiencia específica del output.
- Si hay conflicto entre fuentes, cuál tiene prioridad.

## Estado del corpus

- **Ra Vol 1-2** (sesiones 1–106): accesible vía `corpus/sessions/` (symlink relativo al corpus real en `writing/sources/ra/`). 106 archivos, indexable por `## (N.M)`.
- **Q'uo (capa 1)** — sesiones donde Q'uo aparece como canalizador (1986–2008): accesible vía `corpus-quo/sessions/` (symlink a `writing/sources/quo/`). 562 archivos en formato `quo-YYYY-MM-DD.md`. Extraídos de los volúmenes 8-18 del archivo L/L Research.
- **Otros canalizados Confederation (capa 2)** — Hatonn, Latwii, Oxal, Aaron, Nona, Monka, Laitos: pendientes. Procesarán los volúmenes 1-18 completos cuando se aborden los sub-libros que los requieran.

## Modos de instalación

Este skill puede vivir en dos sitios simultáneamente:

1. **Por proyecto:** `<repo-eluno>/.claude/skills/eluno-ra-canon/` — versionado con git. Disponible al usar Claude Code o Cowork con el repo `eluno` abierto.
2. **A nivel usuario:** `~/.claude/skills/eluno-ra-canon/` — symlink al de proyecto. Disponible desde cualquier carpeta.

El symlink interno `corpus/` apunta de vuelta al corpus real en `writing/sources/ra/` del repo. Si el repo se mueve, los symlinks rompen — rehacer con el script `install.sh`.

## Ver también

- `README.md` (en este mismo directorio) — guía de uso humana, pensada para el operador.
- `writing/protocol/writing-protocol.md` (raíz del repo) — protocolo extenso de escritura (468 líneas, fuente de verdad).
- `writing/protocol/qa-protocol.md` — QA detallado.
- `writing/reference/ra-thematic-index.md` — mapa Ra → temas de los 16 capítulos.
- `DESIGN.md` (raíz del repo) — sistema de diseño visual.
