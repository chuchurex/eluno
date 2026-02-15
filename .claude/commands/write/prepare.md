# Preparar capítulo para escritura

Genera todos los prerequisitos de un capítulo: prompt, manifiesto y research files.

## Argumentos
$ARGUMENTS = número de capítulo (ej: 03, 05, 14)

## Rutas base

- **Protocol**: `writing/protocol/`
- **Reference**: `writing/reference/`
- **Sources**: `workspace/sources/`
- **Tools**: `writing/tools/`
- **Chapter dir**: `workspace/chapters/ch${CHAPTER}/`
- **Chapter prompt**: `writing/chapters/ch${CHAPTER}/prompt.md`
- **Capítulo anterior EN**: `i18n/en/chapters/${PREV_CHAPTER}.json`

## Instrucciones

### 1. Preparar contexto

1. Parsea $ARGUMENTS para obtener el número de capítulo (CHAPTER = con zero-pad, ej: "03")
2. Calcula PREV_CHAPTER (ej: si CHAPTER=03, PREV=02)
3. Crea `workspace/chapters/ch${CHAPTER}/` si no existe
4. Verifica que NO existan ya los archivos de salida (prompt.md, manifest.json, research-ra.md)
   - Si existen: pregunta al operador si quiere regenerar o saltar

### 2. Leer fuentes de datos

Lee TODOS estos archivos antes de generar nada:

1. `writing/reference/book-structure.md` — Contenido asignado a cada capítulo
2. `writing/reference/ra-thematic-index.md` — Sesiones Ra mapeadas por capítulo y tema
3. `writing/protocol/writing-protocol.md` — §VI (tipos de cierre) y §IX (estructura)
4. `writing/reference/manifest-template.json` — Estructura JSON del manifiesto
5. `i18n/en/chapters/${PREV}.json` — Capítulo anterior publicado (para diferenciación)
6. `writing/chapters/ch${PREV}/prompt.md` — Prompt del capítulo anterior (como patrón)
7. `workspace/chapters/ch${PREV}/qa-report.md` — Lecciones QA del capítulo anterior (si existe)

### 3. Generar `prompt.md`

Genera el spec del capítulo siguiendo EXACTAMENTE el patrón de los prompts de Ch01 y Ch02.

#### Estructura obligatoria:

```markdown
# PROMPT: Capítulo N — "Title"

> **Instrucciones base:** Seguir prompt-base.md

## CAPÍTULO
| Campo | Valor |
|-------|-------|
| Número | N |
| Título EN | [de book-structure.md] |
| Parte | [de book-structure.md] |
| Cierre | [de writing-protocol.md §VI — tabla de distribución] |
| Target | [de book-structure.md — target_words] |

## CAPÍTULOS ANTERIORES (leer antes de escribir)
- Leer: `i18n/en/chapters/${PREV}.json`
- Qué ya cubrió el capítulo anterior (resumir secciones y conceptos clave)
- Qué NO repetir (lista específica)
- Qué PUEDE profundizar este capítulo (lista específica)

## CONTENIDO ASIGNADO
[Extraído de book-structure.md para este capítulo — lista numerada de temas/secciones]

## SESIONES DE RA RELEVANTES
[Tabla extraída de ra-thematic-index.md para este capítulo]
| Tema | Sesiones clave | Notas |
|------|---------------|-------|
[Cada fila del índice temático para este capítulo]

## RELACIÓN CON CAPÍTULOS ADYACENTES
### ← Ch(N-1) ya estableció:
[Resumir qué conceptos ya fueron definidos]

### → Ch(N+1) profundizará:
[Resumir qué temas se desarrollarán después]

### Por tanto, Ch{N} debe:
[3-4 directrices estratégicas sobre el enfoque del capítulo]

## LECCIONES DEL QA
[Si existe qa-report del capítulo anterior, extraer patrones a evitar.
Si no existe, incluir las lecciones estándar de los prompts Ch01/Ch02:]
- Verificar {ref:} contra references.json antes de usar
- {term:} solo una vez por capítulo
- No repetir contenido entre secciones
- Evitar posesivos que marquen otredad ("your scientists" → "scientists")

## EJECUTAR
Lee prompt-base.md → lee documentos de referencia → investiga en fuentes → escribe → entrega
```

#### Reglas para generar el prompt:
- Toda la información viene de los archivos de referencia, NO de tu conocimiento
- Las sesiones Ra vienen del `ra-thematic-index.md` — no inventes sesiones
- El contenido asignado viene del `book-structure.md` — no agregues temas
- El tipo de cierre viene del `writing-protocol.md` §VI
- La diferenciación se infiere del capítulo anterior publicado

Guardar en: `writing/chapters/ch${CHAPTER}/prompt.md`

### 4. Generar `manifest.json`

Genera el manifiesto del capítulo con esta estructura exacta:

```json
{
  "chapter": N,
  "title": "[de book-structure.md]",
  "part": "[de book-structure.md]",
  "closure": "[de writing-protocol.md §VI]",
  "target_words": "[de book-structure.md]",
  "sections": [
    {
      "id": "chN-section-id",
      "title": "Section Title",
      "angle": "What this section argues or explores"
    }
  ],
  "writing_split": {
    "conv_write_1": ["first half of section IDs"],
    "conv_write_2": ["second half of section IDs"]
  },
  "ra_sessions": {
    "primary": ["sessions most central to this chapter"],
    "secondary": ["sessions that provide supporting context"],
    "tertiary": ["sessions with tangential relevance"]
  },
  "ra_section_mapping": {
    "chN-section-id": {
      "primary": ["sessions for this section"],
      "secondary": ["supporting sessions"],
      "notes": "Context for the writer"
    }
  },
  "quo_sessions": {
    "volume_10": {
      "search_terms": ["key terms from this chapter's themes"],
      "min_terms": 2,
      "max_results": 8
    },
    "volume_11": {
      "search_terms": ["key terms from this chapter's themes"],
      "min_terms": 2,
      "max_results": 8
    }
  },
  "differentiation": {
    "do_not_repeat": ["concepts already fully covered"],
    "can_reference_briefly": ["concepts that can be mentioned but not re-explained"],
    "previous_chapters_to_load": ["chNN_EN.json files to read"]
  }
}
```

#### Reglas para generar el manifiesto:
- `sections` → derivar de los temas en book-structure.md. Cada tema = una sección con id semántico
- `id` de sección: `ch{N}-kebab-case-name` (ej: `ch3-first-density`, `ch4-atlantis`)
- `writing_split` → dividir sections en dos mitades (primera mitad en conv_write_1, segunda en conv_write_2). Redondear hacia arriba si es impar.
- `ra_sessions` → extraer de ra-thematic-index.md. Las sesiones con nota de "tratamiento completo" o "definición" van a primary. Las otras a secondary.
- `ra_section_mapping` → mapear las sesiones de ra-thematic-index.md a las secciones correspondientes según tema
- `quo_sessions` → generar search_terms a partir de los temas del capítulo. Incluir volume_10 y volume_11.
- `differentiation` → basado en el capítulo anterior

Guardar en: `workspace/chapters/ch${CHAPTER}/manifest.json`

### 5. Generar research files

Ejecutar el script de extracción:

```bash
python3 writing/tools/extract-sources.py workspace/chapters/ch${CHAPTER}/manifest.json
```

Verificar:
- Exit code 0
- `research-ra.md` generado con sessions > 0
- `research-quo.md` generado
- Reportar missing sessions (debería ser 0)

### 6. Reportar al operador

Mostrar:

```
## Capítulo ${N}: ${TITLE} — preparado

### prompt.md
- Secciones de contenido: [lista]
- Tipo de cierre: [tipo]
- Target: [palabras]

### manifest.json
- Secciones: [N] (write_1: [N], write_2: [N])
- Sesiones Ra: [primary: N, secondary: N, tertiary: N]
- Q'uo search terms: [N]

### Research files
- research-ra.md: [bytes] ([N] sesiones extraídas, [N] missing)
- research-quo.md: [bytes] ([N] matches)

Fase 1 completa.
```

## Nota
Este comando ejecuta solo la Fase 1 del pipeline. Para el pipeline completo autónomo usa `/write:chapter N`.

## Ejemplo de uso
`/write:prepare 03` - Prepara el Capítulo 3 para escritura
