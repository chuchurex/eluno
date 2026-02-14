# PROMPT BASE: Instrucciones Estables para Escritura de CapÃ­tulos

> Este archivo contiene las instrucciones que NO cambian entre capÃ­tulos.
> Se incluye por referencia en cada PROMPT_CHXX.md.
> VersiÃ³n: 2.0 â€” Febrero 2026

---

## CONTEXTO DEL PROYECTO

**"El Uno" (eluno.org)** â€” ReinterpretaciÃ³n filosÃ³fica del Material Ra (Ley del Uno, 1981-1984) como prosa narrativa accesible. 16 capÃ­tulos, 5 partes, 3 idiomas (EN/ES/PT). Autorizado por L/L Research, 10 Enero 2026.

Los capÃ­tulos existentes (01-16.json) son la versiÃ³n 1, escrita sin verificaciÃ³n directa contra las sesiones de Ra. Cada capÃ­tulo serÃ¡ reescrito a v2 con calidad superior y trazabilidad a las fuentes originales.

---

## DOCUMENTOS DE REFERENCIA

Estos archivos contienen las reglas detalladas. **LÃ©elos ANTES de escribir.**

| Archivo | QuÃ© contiene | Secciones crÃ­ticas |
|---------|-------------|-------------------|
| `02_WRITING_PROTOCOL.md` | Voz, tono, fuentes, estructura, cierres, terminologÃ­a | Secciones I, II, IV, VI, VII, VIII, IX, X |
| `04_PROMPT_BOOK_IDENTITY.md` | Identidad del libro | Todo |
| `03_BOOK_STRUCTURE_16_CHAPTERS.md` | Los 16 capÃ­tulos y sus contenidos | CapÃ­tulo en curso + adyacentes |
| `00_REWRITE_KIT.md` | Sistema de proveniencia {src:} | SecciÃ³n "El sistema de proveniencia" |
| `05_SOURCES.md` | JerarquÃ­a de fuentes | Todo |

**Regla:** Si hay conflicto entre este prompt y los documentos de referencia, los documentos de referencia prevalecen.

---

## FUENTES Y CÃ“MO USARLAS

### Archivos de fuentes primarias

Los textos de Ra y Q'uo estÃ¡n disponibles como archivos `.md` en el proyecto. Son archivos de texto plano, buscables directamente.

| Archivo | Contenido | Uso |
|---------|-----------|-----|
| `the_ra_contact_volume_1.md` | Ra sesiones 1-56 | **FUENTE PRIMARIA.** Ãšnica autoridad para el texto. |
| `the_ra_contact_volume_2.md` | Ra sesiones 57-106 | **FUENTE PRIMARIA.** Ãšnica autoridad para el texto. |
| `ll_research_archive_volume_09.md` | Q'uo Vol 9 | Contexto y tono. NUNCA en texto final. |
| `ll_research_archive_volume_10.md` | Q'uo Vol 10 | Contexto y tono. NUNCA en texto final. |
| `ll_research_archive_volume_11.md` | Q'uo Vol 11 | Contexto y tono. NUNCA en texto final. |

### CÃ³mo buscar en los .md

Los archivos siguen el formato:
```
**XX.YY** QUESTIONER [pregunta]
R A I am Ra. [respuesta]
```

Donde XX = sesiÃ³n, YY = pregunta. Busca por nÃºmero de sesiÃ³n (ej: "**13.5**") para localizar pasajes especÃ­ficos.

### Reglas de uso (detalle completo en 02_WRITING_PROTOCOL.md Â§ II)

- **Ra:** Parafrasear con integridad. NUNCA citar textualmente. Se permite ecoar frases memorables sin atribuciÃ³n.
- **Q'uo:** Leer para entender matices y tono. NUNCA aparece en el texto final.
- **Ciencia/filosofÃ­a:** Integrar donde sea natural. NUNCA contradecir a Ra. NUNCA forzar conexiones.
- **Ninguna fuente se menciona jamÃ¡s en el texto final.**

---

## OMISIÃ“N DE PROCEDENCIA EXTRATERRESTRE

### El contexto

Este libro escribe las enseÃ±anzas de Ra desde su voz. Eso se hace explÃ­cito cuando el mensaje mira a la Tierra desde fuera o comunica algo que excede el alcance humano ordinario. Pero NO es necesario hacerlo explÃ­cito en cada tema que se presenta.

El propÃ³sito del libro, ademÃ¡s de presentar la informaciÃ³n, es ayudar a que las personas puedan *recibirla*. No es fÃ¡cil recibir informaciÃ³n sobre el sentido de la vida proveniente de fuentes extraterrestres. En la Tierra, la protecciÃ³n mÃ¡s efectiva contra el tema UFO fue etiquetarlo de ridÃ­culo en la opiniÃ³n pÃºblica. Esto genera intrÃ­nsecamente un rechazo â€”incluso inconscienteâ€” en cualquier ser humano hacia cualquier mensaje con esa procedencia.

### La regla

No modificamos el mensaje. Somos fieles a la palabra de Ra. Pero cuando la procedencia extraterrestre de la voz narradora puede omitirse SIN alterar la validez, pureza y verdad del mensaje, se omite.

- âŒ "lo que vuestros cientÃ­ficos han descubierto..." (marca otredad innecesaria)
- âœ… "lo que los cientÃ­ficos han descubierto..." (mismo mensaje, sin barrera)

Este libro serÃ¡ leÃ­do en la Tierra. Decir "los cientÃ­ficos" en lugar de "vuestros cientÃ­ficos" no altera en nada la enseÃ±anza. Pero elimina una barrera que podrÃ­a impedir que el lector la reciba.

### CuÃ¡ndo SÃ hacer explÃ­cita la perspectiva externa

- Cuando el mensaje REQUIERE mirar la Tierra desde fuera
- Cuando se comunica informaciÃ³n que excede el alcance humano ordinario
- Cuando la perspectiva "nosotros/ustedes" ES el mensaje (por ejemplo, al hablar de la ConfederaciÃ³n observando la cosecha de la Tierra)

---

## SISTEMA DE PROVENIENCIA {src:}

Detalle completo en `00_REWRITE_KIT.md`. Resumen operativo:

### Mapeo
`{src:13.5}` â†’ `https://www.lawofone.info/s/13#5`

### Reglas durante la escritura
1. Coloca `{src:XX.YY}` al final de cada pÃ¡rrafo.
2. Si el siguiente pÃ¡rrafo usa la MISMA fuente, no repitas.
3. Cuando cambie la fuente, coloca la nueva marca.
4. Fuentes mÃºltiples: `{src:13.5,15.21,27.6}`
5. Rangos consecutivos: `{src:13.5-13.9}`
6. SÃ­ntesis general: `{src:synthesis}`
7. Ciencia/filosofÃ­a: `{src:external}` o `{src:external+13.5}`

Las marcas `{src:}` son metadata de trabajo. Se eliminan del JSON final publicable.

---

## MARCAS DE TRACKING

| Marca | Uso | Â¿Va en JSON final? |
|-------|-----|---------------------|
| `{term:keyword}` | Primera menciÃ³n significativa de tÃ©rmino del glosario | âœ… SÃ­ |
| `{ref:category:id}` | ConexiÃ³n natural con ciencia/filosofÃ­a/tradiciones | âœ… SÃ­ |
| `{src:XX.YY}` | Proveniencia â†’ lawofone.info | âŒ Solo metadata |

---

## NOTAS DE TRADUCCIÃ“N (EN â†’ ES)

### "Logoi" â†’ espaÃ±ol: usar "los Logos"

En inglÃ©s, "Logoi" es aceptable como plural de Logos â€” Don Elkins lo usÃ³ y la comunidad anglÃ³fona lo reconoce. Pero en espaÃ±ol, la palabra "Logos" apenas es comprendida en su significado espiritual. El plural latino "Logoi" agrega una barrera completamente innecesaria. Usar "Logoi" en espaÃ±ol serÃ­a priorizar la fidelidad filolÃ³gica sobre la comprensiÃ³n del lector, lo cual contradice el propÃ³sito del libro.

**Regla:** En espaÃ±ol (y portuguÃ©s), el plural de Logos es **"Logos"** invariable: "los Logos", "cada uno de los Logos". NUNCA "Logoi".

### Otras equivalencias de traducciÃ³n

| InglÃ©s | EspaÃ±ol correcto | EspaÃ±ol incorrecto | Nota |
|--------|-----------------|-------------------|------|
| invested (itself) | se volcÃ³ en, se vertiÃ³ hacia, se entregÃ³ a | se invirtiÃ³ | "Invertir" en espaÃ±ol es ambiguo: Â¿dinero o dar vuelta? El sentido es que el Infinito vertiÃ³ todo su ser hacia la exploraciÃ³n. |
| Logoi (plural) | los Logos (invariable) | Logoi | Ver arriba |
| density | densidad | dimensiÃ³n | Nunca "dimensiÃ³n" |
| distortion | distorsiÃ³n | cambio, alteraciÃ³n | El tÃ©rmino tiene significado tÃ©cnico especÃ­fico |
| catalyst | catalizador | desafÃ­o, problema | Mantener el tÃ©rmino Ra |
| harvest | cosecha | juicio, rapto | Evitar connotaciones religiosas |
| wanderer | errante | starseed | "Starseed" solo en nota explicativa |
| ray | rayo | chakra | "Chakra" solo en primera explicaciÃ³n |

---

## MODO DE EJECUCIÃ“N

El prompt de cada capÃ­tulo (PROMPT_CHXX.md) define el contenido especÃ­fico. Este prompt base define CÃ“MO trabajar. La secuencia es:

### Fase 1 â€” InvestigaciÃ³n (silenciosa)
- Lee los documentos de referencia
- Busca en los .md de Ra TODAS las sesiones relevantes indicadas en el prompt del capÃ­tulo
- Busca sesiones adicionales que sean relevantes
- Lee Q'uo para contexto y tono
- Identifica quÃ© dice Ra que la v1 no cubre

### Fase 2 â€” Escritura EN
- Escribe el capÃ­tulo completo en inglÃ©s
- Incluye todas las marcas ({term:}, {ref:}, {src:})
- Sigue estrictamente `02_WRITING_PROTOCOL.md`

### Fase 3 â€” Entregables JSON
Genera los 3 archivos finales:

#### A) `chXX_EN.json` â€” CapÃ­tulo en inglÃ©s
```json
{
  "id": "chX",
  "number": X,
  "numberText": "Chapter ...",
  "title": "...",
  "sections": [
    {
      "id": "chX-section-id",
      "title": "...",
      "content": [
        {"type": "paragraph", "text": "..."}
      ]
    }
  ]
}
```
- SIN marcas {src:}
- CON marcas {term:} y {ref:}
- Estructura idÃ©ntica a `ch01_EN.json`

#### B) `chXX_glossary.json` â€” Glosario del capÃ­tulo
```json
[
  {
    "keyword": "infinite",
    "title": "The Infinite",
    "definition": "..."
  }
]
```
Cada definiciÃ³n debe leerse independientemente del capÃ­tulo.

#### C) `chXX_provenance.json` â€” Mapa de proveniencia
```json
{
  "chapter": "chX",
  "title": "...",
  "base_url": "https://www.lawofone.info/s/",
  "provenance": [
    {
      "section_id": "chX-section-id",
      "section_title": "...",
      "segments": [
        {
          "paragraphs": [1, 2, 3],
          "sources": ["13.5", "13.6"],
          "urls": [
            "https://www.lawofone.info/s/13#5",
            "https://www.lawofone.info/s/13#6"
          ],
          "note": "DescripciÃ³n breve del concepto"
        }
      ]
    }
  ]
}
```

**Nota:** La traducción a ES/PT se ejecuta con Sonnet en Claude Code (Prompts 9–10.5 del `00_REWRITE_KIT.md`).

---

## TARGET DE CALIDAD (calibrar por capÃ­tulo)

- Cada afirmaciÃ³n rastreable a una sesiÃ³n especÃ­fica de Ra
- Ciencia/filosofÃ­a integrada donde sea natural, no forzada
- La prosa debe ser bella sin ser pretenciosa
- Oraciones preferiblemente <20 palabras
- PÃ¡rrafos de 3-4 oraciones
- Variar entre pÃ¡rrafos cortos (Ã©nfasis) y largos (explicaciÃ³n)
- Transiciones naturales ("Therefore...", "Yet...", no "In conclusion...")

---

## PUBLICACIÃ“N DE FUENTES

Este sistema de prompts se publicarÃ¡ junto al libro como parte de la documentaciÃ³n del proyecto. Las fuentes originales y sus enlaces:

| Fuente | Origen | URL |
|--------|--------|-----|
| Ra Contact Vol 1 | L/L Research | https://assets.llresearch.org/books/the_ra_contact_volume_1.pdf |
| Ra Contact Vol 2 | L/L Research | https://assets.llresearch.org/books/the_ra_contact_volume_2.pdf |
| Q'uo Vol 9 | L/L Research | https://assets.llresearch.org/books/ll_research_archive_volume_09.pdf |
| Q'uo Vol 10 | L/L Research | https://assets.llresearch.org/books/ll_research_archive_volume_10.pdf |
| Q'uo Vol 11 | L/L Research | https://assets.llresearch.org/books/ll_research_archive_volume_11.pdf |
| lawofone.info | Tobey Wheelock | https://www.lawofone.info |

---

*PROMPT_BASE v2.0 â€” Febrero 2026*
