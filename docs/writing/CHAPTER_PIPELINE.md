# CHAPTER PIPELINE — De investigación a deploy

> Guía paso a paso para producir un capítulo completo de El Uno.
> Generalizada a partir del pipeline ejecutado para Ch01 y Ch02.

---

## Visión general

```
FASE 1: Preparación
  operador/chXX_manifest.json           ← Manifiesto del capítulo (manual)

FASE 2: Investigación (Claude Desktop — archivos grandes)
  /research:ra XX                       ← operador/chXX_research_ra.md
  /research:quo XX                      ← operador/chXX_research_quo.md

FASE 3: Escritura (Claude Code — slash commands)
  /write:step1 XX                       ← operador/output/chXX/chXX_draft_first.md
  /write:step2 XX                       ← operador/output/chXX/chXX_draft_second.md

FASE 4: QA + Ensamblaje
  /write:qa XX                          ← operador/output/chXX/chXX_EN.json
                                          operador/output/chXX/chXX_qa_report.md

FASE 5: Glosario + Proveniencia
  /write:glossary XX                    ← operador/output/chXX/chXX_glossary.json
                                          operador/output/chXX/chXX_provenance.json

FASE 6: Integración
  Copiar EN.json → i18n/en/chapters/XX.json
  Integrar glossary → i18n/en/glossary.json

FASE 7: Traducción (agentes paralelos)
  EN → ES → i18n/es/chapters/XX.json + glossary
  EN → PT → i18n/pt/chapters/XX.json + glossary

FASE 8: Build + Deploy
  npm run sass:build && npx eluno-build
  git push → Cloudflare Pages
```

---

## Estructura de archivos

### Input (preparados por el operador)

```
operador/
├── chXX_manifest.json          # Spec del capítulo: secciones, ángulos, word target
├── chXX_research_ra.md         # Citas Ra extraídas (Fase 2)
└── chXX_research_quo.md        # Contexto Q'uo extraído (Fase 2)
```

### Knowledge files (protocolos estables)

```
/Users/chuchurex/Sites/local/_operador/
├── desktop/
│   ├── 02_WRITING_PROTOCOL.md      # Protocolo de escritura
│   ├── 04_PROMPT_BOOK_IDENTITY.md  # Identidad del libro
│   ├── 05_SOURCES.md               # Jerarquía de fuentes
│   ├── 06_QA_READING_PROTOCOL.md   # Protocolo QA (9 categorías)
│   └── references.json             # Claves válidas para {ref:}
├── para el N/
│   └── PROMPT_CHXX.md              # Spec específica del capítulo
└── anteriores/
    └── PROMPT_BASE.md              # Instrucciones estables + reglas {src:}
```

### Output (generados por el pipeline)

```
operador/output/chXX/
├── chXX_draft_first.md         # Draft con marcas {src:} (Fase 3)
├── chXX_draft_second.md        # Draft con marcas {src:} (Fase 3)
├── chXX_qa_report.md           # Reporte QA (Fase 4)
├── chXX_EN.json                # Capítulo limpio (Fase 4)
├── chXX_glossary.json          # Términos nuevos (Fase 5)
└── chXX_provenance.json        # Mapa de fuentes (Fase 5)
```

### Destino final (proyecto)

```
i18n/
├── en/
│   ├── chapters/XX.json        # Capítulo EN
│   └── glossary.json           # Glosario acumulado
├── es/
│   ├── chapters/XX.json        # Capítulo ES
│   └── glossary.json           # Glosario acumulado
└── pt/
    ├── chapters/XX.json        # Capítulo PT
    └── glossary.json           # Glosario acumulado
```

---

## Fases en detalle

### Fase 1: Manifiesto

El operador crea `operador/chXX_manifest.json` con:

```json
{
  "chapter": "chXX",
  "title": "...",
  "word_target": "4000-5000",
  "sections": [
    {
      "id": "chXX-section-id",
      "title": "...",
      "angle": "descripción del enfoque",
      "tone": "descriptivo|personal|filosófico|puente"
    }
  ],
  "writing_split": {
    "conv_write_1": ["chXX-sec1", "chXX-sec2", "chXX-sec3", "chXX-sec4"],
    "conv_write_2": ["chXX-sec5", "chXX-sec6", "chXX-sec7"]
  },
  "differentiation": {
    "never_repeat": ["...conceptos del capítulo anterior..."],
    "may_reference": ["...conceptos que se pueden tocar brevemente..."]
  },
  "closure_type": "A|B|C|D"
}
```

### Fase 2: Investigación

Se ejecuta en **Claude Desktop** (proyectos con archivos grandes):

1. **Research Ra**: Cargar los volúmenes de Ra + PROMPT_CHXX + RA_THEMATIC_INDEX.
   Extraer citas textuales organizadas por sección del capítulo.
   Output: `operador/chXX_research_ra.md`

2. **Research Q'uo**: Cargar volúmenes Q'uo + research_ra (para contexto).
   Extraer pasajes que iluminen los temas de Ra.
   Output: `operador/chXX_research_quo.md`

> Q'uo nunca aparece en el texto final. Es comprensión para el escritor.

### Fase 3: Escritura

Se ejecuta en **Claude Code** con slash commands:

```bash
/write:step1 XX    # Primera mitad (secciones del conv_write_1)
/write:step2 XX    # Segunda mitad (secciones del conv_write_2)
```

Cada step:
- Lee todos los knowledge files en orden
- Escribe prosa con marcas `{term:}`, `{ref:}`, `{src:}`
- Respeta diferenciación con capítulo anterior
- Genera metadata al final (conteo de palabras, marcas [PENDING])

### Fase 4: QA + Ensamblaje

```bash
/write:qa XX
```

Ejecuta las 9 categorías del protocolo QA:

| Cat | Verificación |
|-----|-------------|
| A | Referencias fantasma — cada `{ref:}` existe en references.json |
| B | Nombres propios — la prosa tiene sentido si reemplazas `{ref:}` |
| C | `{term:}` duplicado — cada keyword marcado SOLO UNA VEZ |
| D | Contenido repetido entre secciones |
| E | Voz y otredad — sin "your scientists" ni origen no-humano |
| F | Coherencia narrativa — transiciones, flujo, cierre |
| G | Oraciones < 20 palabras, párrafos 3-4 oraciones |
| H | Terminología — density, distortion, catalyst (no alternativas) |
| I | Atribuciones — ni Ra, ni Q'uo, ni fuentes en el texto |

Genera:
- `chXX_qa_report.md` con veredicto (PASA / PASA CON CORRECCIONES / NO PASA)
- `chXX_EN.json` limpio (sin `{src:}`, con `{term:}` y `{ref:}`)

### Fase 5: Glosario + Proveniencia

```bash
/write:glossary XX
```

- **Glossary**: Extrae `{term:}` del JSON, compara contra glosario existente, genera definiciones para términos NUEVOS.
- **Provenance**: Mapea `{src:}` de los drafts a párrafos del JSON final. Genera URLs `lawofone.info/s/{session}#{question}`.

### Fase 6: Integración

Manual o por instrucción al agente:

```bash
# Copiar capítulo
cp operador/output/chXX/chXX_EN.json i18n/en/chapters/XX.json

# Integrar glosario (merge manual de nuevos términos en glossary.json)
```

### Fase 7: Traducción

Se lanzan agentes paralelos (modelo Sonnet para costo/velocidad):

```
EN → ES: i18n/es/chapters/XX.json + i18n/es/glossary.json
EN → PT: i18n/pt/chapters/XX.json + i18n/pt/glossary.json
```

Reglas de traducción:
- Prosa natural, no literal
- Terminología estricta:
  - density → densidad (ES) / densidade (PT)
  - distortion → distorsión / distorção
  - catalyst → catalizador / catalisador
  - Logoi → "los Logos" (ES/PT)
- Marcas `{term:}` y `{ref:}` se mantienen idénticas (mismos keywords)
- No agregar ni quitar `{term:}` — solo traducir el texto circundante

**Validación post-traducción**: Verificar que EN/ES/PT tienen:
- Mismo número de secciones y párrafos
- Mismos `{term:}` keywords (cantidad y valores)
- Mismos `{ref:}` (cantidad y valores)
- Cero `{src:}` residuales

### Fase 8: Build + Deploy

```bash
node scripts/build-v2.cjs && npm run sass:build   # Genera dist/
git add [archivos] && git commit                   # Commit
git push origin main                               # Trigger Cloudflare Pages deploy
```

### Fase 9: PDF (post-deploy)

```bash
node scripts/build-pdf.cjs XX                     # PDF individual (3 idiomas)
node scripts/build-pdf.cjs complete                # PDF libro completo (3 idiomas)
node scripts/rename-media.cjs                      # SEO names + actualizar media.json
# Incrementar ?v=N en media.json para cache-bust
# rsync PDFs a static.eluno.org
# Rebuild HTML + commit + push
```

El PDF incluye: glosario al final del capítulo + fuentes (referencias cruzadas con URLs + provenance Ra Material). En el libro completo, el glosario usa numeración `capítulo.nota` (1.1, 1.2, 2.1...).

### Fase 10: Audiobook (post-deploy)

```bash
node scripts/audiobook/extract-text.cjs XX {lang}         # Texto TTS
node scripts/audiobook/generate-edge.cjs XX {lang}         # Generar MP3
node scripts/audiobook/assemble-chapters.cjs XX {lang}     # Ensamblar con outro
node scripts/audiobook/assemble-chapters.cjs complete {lang} # Libro completo
node scripts/update-mp3-tags.cjs {lang}                    # ID3 tags
# rsync audio a static.eluno.org
# Incrementar ?v=N en media.json para cache-bust
# Rebuild HTML + commit + push
```

> Pipeline completo de actualización documentado en `docs/project/UPDATE_PIPELINE.md`

---

## Slash commands disponibles

| Comando | Fase | Descripción |
|---------|------|-------------|
| `/write:step1 XX` | 3 | Escribe primera mitad del capítulo |
| `/write:step2 XX` | 3 | Escribe segunda mitad del capítulo |
| `/write:qa XX` | 4 | QA de lectura + ensamblaje JSON |
| `/write:glossary XX` | 5 | Genera glosario y provenance |

> XX = número de capítulo con zero-pad (01, 02, 03...)

---

## Sistema de marcas

### `{term:keyword}`
- Marca primera mención de un término del glosario
- Cada keyword se marca **una sola vez** en todo el capítulo
- Keywords de capítulos anteriores NO se re-marcan
- Ejemplos: `{term:original-thought}`, `{term:mind-body-spirit-complex}`

### `{ref:category:id}`
- Referencia cruzada validada contra `references.json`
- Ejemplos: `{ref:phil:upanishads}`, `{ref:science:quantum-observer}`
- El build las convierte en enlaces con tooltip

### `{src:XX.YY}` (solo en drafts)
- Metadata de proveniencia, nunca en el JSON final
- `{src:13.5}` → Ra Contact sesión 13, pregunta 5
- `{src:synthesis}` → Síntesis del autor
- `{src:external}` → Fuente externa (filosofía, ciencia)
- Se eliminan en Fase 4 (QA) y se mapean en Fase 5 (provenance)

---

## Errores conocidos y lecciones

### Traducción: `{term:}` fantasma
Los agentes de traducción a veces agregan `{term:}` para palabras que ya fueron
marcadas en capítulos anteriores. La validación post-traducción los detecta.
**Solución**: Verificar que el conteo de `{term:}` en ES/PT coincida con EN.

### Build: separators sin text
Los content items `{"type": "separator"}` en capítulos 7-9 causaban crash en
`@eluno/core` build.js porque `processText()` esperaba un campo `text`.
**Solución**: Fix aplicado en eluno-core (commit `b87529c`).

### QA: repetición cross-sección
Cuando dos secciones usan las mismas fuentes Ra (ej: 82.10), los drafts pueden
contener frases casi idénticas. La categoría D del QA las detecta.
**Solución**: Reescribir la segunda ocurrencia con ángulo diferente.

---

## Checklist del operador

```
□ Fase 1: Manifiesto creado (operador/chXX_manifest.json)
□ Fase 2: Research Ra completado (operador/chXX_research_ra.md)
□ Fase 2: Research Q'uo completado (operador/chXX_research_quo.md)
□ Fase 3: /write:step1 XX → draft_first.md
□ Fase 3: /write:step2 XX → draft_second.md
□ Fase 3: Sin marcas [PENDING] en drafts
□ Fase 4: /write:qa XX → EN.json + qa_report (veredicto PASA)
□ Fase 5: /write:glossary XX → glossary.json + provenance.json
□ Fase 6: EN.json copiado a i18n/en/chapters/
□ Fase 6: Glosario integrado en i18n/en/glossary.json
□ Fase 7: Traducción ES completada y validada
□ Fase 7: Traducción PT completada y validada
□ Fase 8: Build exitoso + commit + push → deploy Cloudflare
□ Fase 9: PDFs generados (individual + libro completo) + renombrados + subidos
□ Fase 10: Audio generado (individual + libro completo) + taggeado + subido
□ Final: media.json con cache-bust actualizado + rebuild + push
```
