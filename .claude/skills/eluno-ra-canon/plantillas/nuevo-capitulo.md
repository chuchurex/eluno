# Plantilla: escribir capítulo nuevo

> Esta plantilla guía la generación de un capítulo nuevo desde cero para cualquier libro
> de la familia El Uno. Antes de empezar, el operador debe haber leído las reglas duras
> y haber decidido a qué libro pertenece la pieza.

## Contexto que el operador debe proveer

Antes de escribir, completar este bloque:

```yaml
libro: "El Uno"               # El Uno | Todo | Jesús | Sanación | Doctrinas | Dormidos
capitulo:
  numero: 17                  # número del capítulo
  titulo_en: "..."            # título en EN (canónico)
  titulo_es: "..."            # título en ES (traducción)
  titulo_pt: "..."            # título en PT (traducción)
  parte: "VI"                 # parte del libro (I-V para el plan original)
  audiencia: "..."            # heredar del libro o sobreescribir
target:
  palabras_en: "4000-5000"
  palabras_es: "3800-4800"    # ~5% menos que EN típicamente
  secciones: 5                # 5-8 párrafos por sección
  tipo_de_cierre: "B"         # A=Mystery (solo Ch1, Ch16), B=Practice, C=Question
sesiones_ra:
  obligatorias:
    - "13.5-13.7"             # citar pregunta o rango
    - "27.5"
  opcionales:
    - "82.4-82.10"
referencias_externas:
  permitidas:
    - "phil:spinoza"
    - "phys:holographic-principle"
  prohibidas:
    - "trad:chakra"           # razón: confunde vocabulario
```

## Flujo de escritura

### Fase 1: Investigación

1. Leer las sesiones Ra obligatorias en `corpus/sessions/session-NNN.md`.
   Para una pregunta específica:

   ```bash
   awk '/^## \(27\.5\)/,/^## \(27\.6\)/' corpus/sessions/session-027.md
   ```

2. Para cada sección planeada del capítulo, identificar las 2-4 preguntas Ra que la sostienen.
   Si una sección no tiene ancla en Ra, **rediseñar** la sección, no improvisar.

3. Si el libro permite Q'uo (solo Sanación), repetir el paso anterior para el corpus Q'uo.

### Fase 2: Estructura

Cada capítulo tiene:

- **Una entrada** que sitúa al lector en el tema (1 párrafo, no más).
- **5-8 secciones** con `id`, `title`, y 5-8 párrafos cada una.
- **Un cierre** del tipo declarado en el contexto (A, B o C).

Patrón JSON canónico (extracto):

```json
{
  "id": "ch17",
  "number": 17,
  "numberText": "Chapter Seventeen",
  "title": "...",
  "sections": [
    {
      "id": "ch17-opening",
      "title": "...",
      "content": [
        { "type": "paragraph", "text": "..." },
        ...
      ]
    },
    ...
  ]
}
```

### Fase 3: Prosa

Reglas operativas (heredadas de `reglas/voz-y-perspectiva.md`):

- Primera persona plural (we/us/our).
- El "we" habla **desde afuera** de la experiencia humana, mirando hacia ella.
- No nombrar a Ra, Q'uo, ni canalizadores. Nunca.
- Marcado:
  - `{term:slug-kebab-case}` para términos del glosario.
  - `{ref:cat:id}` para referencias externas (categorías: phys, astro, phil, trad, text, math).
  - `{src:N.M}` para anclar a una sesión Ra específica (va al provenience JSON, no al texto visible).
- No modernizar el inglés. La sintaxis algo formal del Ra original es parte del transporte.

### Fase 4: Cierre

Tres tipos de cierre, elegir uno por capítulo:

- **A — Mystery** (solo Ch1 y Ch16 originalmente): el capítulo termina apuntando al misterio que persiste. Ej: *"And so the question remains, as it must."*

- **B — Practice** (mayoría de capítulos): el capítulo termina aterrizando la idea en la experiencia del lector. Ej: *"You who read these words have already begun this work, whether you knew it or not."*

- **C — Question** (capítulos de transición): el capítulo termina con una pregunta que abre el siguiente. Ej: *"And what then of the choice itself? To this we now turn."*

Variar entre tipos a lo largo del libro. Evitar usar dos cierres tipo B consecutivos en el mismo libro (revisar `writing/protocol/writing-protocol.md` §VI para el catálogo completo de cierres).

### Fase 5: QA y validación

Antes de cerrar:

1. Ejecutar `qa-lectura.md` (plantilla aparte) sobre el texto generado.
2. Ejecutar el validador:

   ```bash
   node .claude/skills/eluno-ra-canon/scripts/validate-chapter.mjs <ruta-al-json>
   ```

3. Si hay warnings de términos prohibidos, revisar caso por caso (puede ser falso positivo metafórico legítimo).
4. Si hay errors, **resolver antes** de devolver al operador.
5. Generar el provenience JSON correspondiente: `i18n/provenance/chN_provenance.json`.

## Output esperado

Tres archivos:

- `i18n/en/chapters/NN.json` (canónico).
- `i18n/es/chapters/NN.json` (traducción, alineada estructuralmente con EN).
- `i18n/pt/chapters/NN.json` (traducción, alineada estructuralmente con EN).

Y:

- `i18n/provenance/chNN_provenance.json` (mapeo sección → sesiones Ra).

## Lo que NO hace esta plantilla

- **No traduce automáticamente.** Las traducciones EN→ES y EN→PT requieren juicio terminológico y se hacen con el script `npm run translate` o equivalente.
- **No genera glosario.** Si introduces términos `{term:X}` nuevos, agregarlos a `i18n/{en,es,pt}/glossary.json` antes de cerrar (ver lección de Sanación: el paso `/write:glossary` es eslabón débil del pipeline, no saltar).
- **No commita.** El operador decide cuándo el capítulo está listo para entrar al repo.

## Ejemplo mínimo: capítulo nuevo de un párrafo

Para validar el flujo sin escribir un capítulo entero, este patrón funciona:

```json
{
  "id": "ch17",
  "number": 17,
  "title": "Test Chapter",
  "sections": [
    {
      "id": "ch17-test",
      "title": "Opening",
      "content": [
        {
          "type": "paragraph",
          "text": "We who write these words speak from a perspective wider than the one in which you read them. The {term:infinite-creator} is not a being but a knowing—{src:13.5}."
        }
      ]
    }
  ]
}
```

Este JSON debería pasar el validador con 0 errors, 0 warnings.
