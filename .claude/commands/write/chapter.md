# Escribir capítulo completo

Ejecuta las 6 fases del pipeline de escritura de forma autónoma, sin esperar confirmación del operador entre fases. Solo se detiene si hay un error, anomalía, o al llegar al commit/push final.

## Argumentos
$ARGUMENTS = número de capítulo (ej: 03, 04, 14)

## Variables (definir una vez)

- CHAPTER = $ARGUMENTS con zero-pad (ej: "03")
- PREV = capítulo anterior con zero-pad (ej: "02")
- N = número sin pad (ej: 3)

## Rutas (todas las fases)

### Protocolo y referencia (en git)
- `writing/protocol/book-identity.md`
- `writing/protocol/writing-protocol.md`
- `writing/protocol/prompt-base.md`
- `writing/protocol/source-hierarchy.md`
- `writing/protocol/qa-protocol.md`
- `writing/protocol/references.json`
- `writing/reference/book-structure.md`
- `writing/reference/ra-thematic-index.md`
- `writing/reference/manifest-template.json`

### Capítulo (workspace, no en git)
- `workspace/chapters/ch${CHAPTER}/manifest.json`
- `workspace/chapters/ch${CHAPTER}/research-ra.md`
- `workspace/chapters/ch${CHAPTER}/research-quo.md`
- `workspace/chapters/ch${CHAPTER}/draft-first.md`
- `workspace/chapters/ch${CHAPTER}/draft-second.md`
- `workspace/chapters/ch${CHAPTER}/en.json`
- `workspace/chapters/ch${CHAPTER}/glossary.json`
- `workspace/chapters/ch${CHAPTER}/provenance.json`
- `workspace/chapters/ch${CHAPTER}/qa-report.md`

### Prompt del capítulo (en git)
- `writing/chapters/ch${CHAPTER}/prompt.md`

### Referencia de formato
- `i18n/en/chapters/${PREV}.json`
- `i18n/en/glossary.json`

## Comportamiento autónomo

**REGLA PRINCIPAL:** Después de completar cada fase, reporta el resultado brevemente y avanza a la siguiente fase inmediatamente. NO esperes confirmación del operador.

**Se detiene SOLO si:**
1. Un script falla (exit code != 0)
2. Falta un archivo que debería existir
3. Los drafts contienen marcas `[PENDING:]` (fase 4)
4. QA da veredicto **NO PASA** (fase 4)
5. Llega al commit/push (fase 6) — pedir confirmación

**Si hay error recuperable:** intenta resolverlo. Si no puede, muestra el error y pregunta al operador.

---

## FASE 1: Preparar

Genera prompt, manifiesto y research files.

### 1.1 Verificar

- Crear `workspace/chapters/ch${CHAPTER}/` si no existe
- Si ya existen manifest.json, prompt.md, research-ra.md: **saltarlos** (no preguntar, no regenerar — si el operador quiere regenerar usa `/write:prepare`)

### 1.2 Leer fuentes

1. `writing/reference/book-structure.md`
2. `writing/reference/ra-thematic-index.md`
3. `writing/protocol/writing-protocol.md` — §VI (tipos de cierre)
4. `writing/reference/manifest-template.json`
5. `i18n/en/chapters/${PREV}.json`
6. `writing/chapters/ch${PREV}/prompt.md` (como patrón)
7. `workspace/chapters/ch${PREV}/qa-report.md` (si existe)

### 1.3 Generar `prompt.md`

Estructura obligatoria:

```markdown
# PROMPT: Capítulo N — "Title"

> **Instrucciones base:** Seguir prompt-base.md

## CAPÍTULO
| Campo | Valor |
|-------|-------|
| Número | N |
| Título EN | [de book-structure.md] |
| Parte | [de book-structure.md] |
| Cierre | [de writing-protocol.md §VI] |
| Target | [de book-structure.md] |

## CAPÍTULOS ANTERIORES (leer antes de escribir)
- Leer: `i18n/en/chapters/${PREV}.json`
- Qué ya cubrió, qué NO repetir, qué PUEDE profundizar

## CONTENIDO ASIGNADO
[De book-structure.md]

## SESIONES DE RA RELEVANTES
| Tema | Sesiones clave | Notas |
[De ra-thematic-index.md]

## RELACIÓN CON CAPÍTULOS ADYACENTES
← Ch(N-1) ya estableció | → Ch(N+1) profundizará | Por tanto Ch{N} debe

## LECCIONES DEL QA
[De qa-report anterior o lecciones estándar]

## EJECUTAR
```

Guardar en: `writing/chapters/ch${CHAPTER}/prompt.md`

Reglas:
- Información de archivos de referencia, NO de conocimiento propio
- Sesiones Ra del `ra-thematic-index.md` — no inventar
- Contenido del `book-structure.md` — no agregar temas
- Cierre del `writing-protocol.md` §VI

### 1.4 Generar `manifest.json`

Estructura:

```json
{
  "chapter": N,
  "title": "...",
  "part": "...",
  "closure": "...",
  "target_words": "...",
  "sections": [{ "id": "chN-id", "title": "...", "angle": "..." }],
  "writing_split": {
    "conv_write_1": ["primera mitad IDs"],
    "conv_write_2": ["segunda mitad IDs"]
  },
  "ra_sessions": { "primary": [], "secondary": [], "tertiary": [] },
  "ra_section_mapping": { "chN-id": { "primary": [], "secondary": [], "notes": "" } },
  "quo_sessions": { "volume_10": { "search_terms": [], "min_terms": 2, "max_results": 8 }, "volume_11": { "search_terms": [], "min_terms": 2, "max_results": 8 } },
  "differentiation": { "do_not_repeat": [], "can_reference_briefly": [], "previous_chapters_to_load": [] }
}
```

Reglas:
- `id` de sección: `ch{N}-kebab-case`
- `writing_split`: primera mitad en conv_write_1, segunda en conv_write_2
- `ra_sessions`: sesiones con "tratamiento completo" → primary
- `differentiation`: basado en capítulo anterior

Guardar en: `workspace/chapters/ch${CHAPTER}/manifest.json`

### 1.5 Generar research files

```bash
python3 writing/tools/extract-sources.py workspace/chapters/ch${CHAPTER}/manifest.json
```

Verificar exit code 0 y que research-ra.md tenga sesiones.

### 1.6 Reporte (breve, luego avanzar)

```
## Fase 1: Preparar — OK
- Secciones: [N] | Target: [palabras] | Cierre: [tipo]
- Research: [N] sesiones Ra, [N] matches Q'uo
```

**→ Avanzar a Fase 2**

---

## FASE 2: Escribir primera mitad

### 2.1 Leer documentos (en este orden)

1. `writing/protocol/book-identity.md`
2. `writing/protocol/writing-protocol.md`
3. `writing/protocol/prompt-base.md`
4. `writing/protocol/source-hierarchy.md`
5. `writing/chapters/ch${CHAPTER}/prompt.md`
6. `writing/protocol/references.json`
7. `i18n/en/chapters/${PREV}.json`
8. `workspace/chapters/ch${CHAPTER}/research-ra.md`
9. `workspace/chapters/ch${CHAPTER}/research-quo.md`

### 2.2 Escribir secciones de conv_write_1

Reglas de escritura:
- Voz: primera persona plural, perspectiva sapiencial
- NUNCA mencionar Ra, Q'uo, ni ninguna fuente
- Paráfrasis con integridad, ecos de frases memorables sí
- Terminología: density (no dimension), distortion (no change), catalyst (no challenge)
- `{term:keyword}` en primera mención de términos del glosario
- `{ref:category:id}` donde haya conexiones naturales — VALIDAR contra references.json
- `{src:XX.YY}` al final de cada párrafo
- Oraciones < 20 palabras, párrafos 3-4 oraciones

Sistema {src:}:
- `{src:13.5}` → session 13, question 5
- Misma fuente consecutiva: no repetir
- Múltiples: `{src:13.5,15.21}` | Rangos: `{src:13.5-13.9}`
- Síntesis: `{src:synthesis}` | Externo: `{src:external}`

Citas no disponibles: marcar `[PENDING: XX.YY — descripción]`, NUNCA inventar.

### 2.3 Guardar

`workspace/chapters/ch${CHAPTER}/draft-first.md` con texto + metadata al final.

### 2.4 Reporte (breve, luego avanzar)

```
## Fase 2: Primera mitad — OK
- Secciones: [lista] | Palabras: [N]
- [PENDING]: [lista o "ninguna"]
```

**→ Avanzar a Fase 3**

---

## FASE 3: Escribir segunda mitad

### 3.1 Leer documentos

Mismos que Fase 2, más:
- **`workspace/chapters/ch${CHAPTER}/draft-first.md`** — CRÍTICO para continuidad

### 3.2 Asegurar continuidad

- Continuidad de voz y tono
- Qué {term:} ya se usaron — NO re-marcar
- Progresión temática natural
- No repetir contenido ya cubierto

### 3.3 Escribir secciones de conv_write_2

Mismas reglas que Fase 2. Atención especial a:
- Secciones "corazón" → mayor profundidad
- Secciones "bridge" → abrir, no cerrar
- `angle` del manifiesto por sección

### 3.4 Guardar

`workspace/chapters/ch${CHAPTER}/draft-second.md` con texto + metadata.

### 3.5 Reporte (breve, luego avanzar)

```
## Fase 3: Segunda mitad — OK
- Secciones: [lista] | Palabras: [N]
- Acumulado: [N] / Target: [N]
- [PENDING]: [lista o "ninguna"]
```

**Si hay marcas [PENDING]:** DETENERSE. Listar las marcas. El operador debe resolverlas antes de continuar.

**→ Avanzar a Fase 4**

---

## FASE 4: QA y ensamblaje JSON

### 4.1 Verificar

- Ambos drafts existen
- NO hay marcas `[PENDING:]` — si las hay: DETENERSE

### 4.2 Ensamblar y leer

Unir ambos drafts. Leer el capítulo completo de corrido.

### 4.3 QA de lectura

Leer `writing/protocol/qa-protocol.md` y ejecutar 9 categorías:

| Cat | Verificación | Acción si falla |
|-----|-------------|-----------------|
| A | Referencias fantasma — {ref:} existe en references.json | Eliminar o corregir |
| B | Nombres propios — prosa con sentido sin {ref:} | Agregar nombre |
| C | {term:} duplicado — cada keyword UNA VEZ | Eliminar duplicados |
| D | Contenido repetido — no párrafos casi idénticos | Fusionar o eliminar |
| E | Voz y otredad — ni "your scientists" ni origen no-humano | Reescribir |
| F | Coherencia narrativa — transiciones, flujo, cierre | Ajustar |
| G | Oraciones/párrafos — oraciones < 20 palabras, párrafos 3-4 | Dividir |
| H | Terminología — density no dimension, etc. | Corregir |
| I | Atribuciones — no Ra, no Q'uo, no fuentes | Eliminar |

Veredicto:
- **PASA** o **PASA CON CORRECCIONES** → aplicar correcciones, continuar
- **NO PASA** → guardar reporte, DETENERSE, explicar al operador

### 4.4 Generar en.json

Formato del capítulo anterior como referencia. Reglas:
- **QUITAR** marcas `{src:}`
- **MANTENER** marcas `{term:}` y `{ref:}`

```json
{
  "id": "ch${N}", "number": N, "numberText": "Chapter ...", "title": "...",
  "sections": [{ "id": "...", "title": "...", "content": [{ "type": "paragraph", "text": "..." }] }]
}
```

### 4.5 Verificar encoding

Buscar mojibake: `â€"` → `—`, `â€™` → `'`, etc.

### 4.6 Ejecutar validador programático

```bash
node writing/tools/validate-chapter.cjs workspace/chapters/ch${CHAPTER}/en.json
```

### 4.7 Guardar

- `workspace/chapters/ch${CHAPTER}/en.json`
- `workspace/chapters/ch${CHAPTER}/qa-report.md`

### 4.8 Reporte (breve, luego avanzar)

```
## Fase 4: QA — [PASA/PASA CON CORRECCIONES]
- Correcciones: [resumen breve]
- Palabras: [N] | Secciones: [N] | Párrafos: [N]
- Validador: [PASS/FAIL]
```

**→ Avanzar a Fase 5**

---

## FASE 5: Glosario y provenance

### 5.1 Extraer términos

Leer en.json, extraer todos los `{term:keyword}`.
Comparar contra `i18n/en/glossary.json` — solo generar definiciones para términos NUEVOS.

Para cada término nuevo:
```json
{ "keyword": "...", "title": "...", "definition": "..." }
```

### 5.2 Generar provenance

Leer drafts (con marcas {src:}), mapear a párrafos del JSON final.

```json
{
  "chapter": "ch${N}", "title": "...",
  "base_url": "https://www.lawofone.info/s/",
  "provenance": [{
    "section_id": "...", "section_title": "...",
    "segments": [{
      "paragraphs": [1, 2], "sources": ["13.5"],
      "urls": ["https://www.lawofone.info/s/13#5"],
      "note": "..."
    }]
  }]
}
```

URLs: `{src:13.5}` → `https://www.lawofone.info/s/13#5`
`{src:synthesis}` y `{src:external}` → sin URL, solo nota.

### 5.3 Guardar

- `workspace/chapters/ch${CHAPTER}/glossary.json`
- `workspace/chapters/ch${CHAPTER}/provenance.json`

### 5.4 Reporte (breve, luego avanzar)

```
## Fase 5: Glosario — OK
- Términos nuevos: [N] ([lista])
- Términos existentes: [N]
- Provenance: [N] secciones, [N] fuentes únicas
```

**→ Avanzar a Fase 6**

---

## FASE 6: Publicar

### 6.1 Integrar

```bash
node scripts/integrate-chapter.js ${CHAPTER} --force
```

### 6.2 Traducir

```bash
node scripts/translate-chapter.js ${CHAPTER} --lang es
```

### 6.3 Validar alineación

```bash
node scripts/validate-alignment.js ${CHAPTER}
```

Si falla: mostrar issues, preguntar al operador.

### 6.4 Agregar capítulo al build

Verificar que el número del capítulo esté en `enabledChapters` de `scripts/build-v2.cjs`. Si no está, agregarlo.

### 6.5 Build

```bash
npm run build
```

### 6.6 Resumen final

Mostrar:
- `git diff --stat`
- Conteo de palabras por idioma
- Términos nuevos de glosario
- Resultado de validación

### 6.7 Pedir confirmación (ÚNICA pausa obligatoria)

Preguntar al operador: **"Commit y push?"**

Si SÍ:
```bash
git add i18n/en/chapters/${CHAPTER}.json i18n/es/chapters/${CHAPTER}.json i18n/en/glossary.json i18n/es/glossary.json i18n/provenance/ch${CHAPTER}_provenance.json scripts/build-v2.cjs
```

Commit:
```
content(ch${CHAPTER}): add Chapter ${N} — ${TITLE} (EN/ES)

Integrated EN chapter, translated to ES via Anthropic API.
```

Push:
```bash
git push origin $(git branch --show-current)
```

Si NO: "Cambios en disco. Revisa con `git diff`."

---

## Ejemplo de uso

`/write:chapter 04` — Prepara, escribe, QA, glosario y publica el Capítulo 4 de forma autónoma.

## Comandos individuales (para re-ejecutar fases específicas)

Si una fase falla y necesitas re-ejecutarla después de corregir el problema:
- `/write:prepare N` — Solo Fase 1
- `/write:step1 N` — Solo Fase 2
- `/write:step2 N` — Solo Fase 3
- `/write:qa N` — Solo Fase 4
- `/write:glossary N` — Solo Fase 5
- `/write:publish N` — Solo Fase 6
