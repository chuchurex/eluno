# Escribir primera mitad del capítulo

Escribe las primeras secciones de un capítulo de El Uno.

## Argumentos
$ARGUMENTS = número de capítulo (ej: 02, 03, 14)

## Rutas base

- **Chapter dir**: `workspace/chapters/ch${CHAPTER}/`
- **Manifiesto**: `workspace/chapters/ch${CHAPTER}/manifest.json`
- **Research Ra**: `workspace/chapters/ch${CHAPTER}/research-ra.md`
- **Research Q'uo**: `workspace/chapters/ch${CHAPTER}/research-quo.md`
- **Prompt del capítulo**: `writing/chapters/ch${CHAPTER}/prompt.md`
- **Capítulo anterior**: `i18n/en/chapters/${PREV_CHAPTER}.json`

### Knowledge files (protocolos de escritura)

- `writing/protocol/book-identity.md`
- `writing/protocol/writing-protocol.md`
- `writing/protocol/prompt-base.md`
- `writing/protocol/source-hierarchy.md`
- `writing/protocol/references.json`

## Instrucciones

### 1. Preparar contexto

1. Parsea $ARGUMENTS para obtener el número de capítulo (CHAPTER = con zero-pad, ej: "02")
2. Verifica que existen los prerequisitos en `workspace/chapters/ch${CHAPTER}/`:
   - `manifest.json` — si no existe: PARA. Indica que debe ejecutar `/write:prepare ${CHAPTER}` primero.
   - `research-ra.md` — si no existe: PARA.
   - `prompt.md` — si no existe: PARA.
3. Lee el manifiesto `workspace/chapters/ch${CHAPTER}/manifest.json`
4. Del manifiesto, extrae:
   - `title` — título del capítulo
   - `sections` — lista completa de secciones con id, title, angle
   - `writing_split.conv_write_1` — IDs de secciones para ESTE paso
   - Si no existe `writing_split`, usa la primera mitad de `sections` (redondeando hacia arriba)

### 2. Leer documentos (en este orden)

Lee TODOS estos archivos antes de escribir una sola palabra:

1. `writing/protocol/book-identity.md` — Identidad del libro
2. `writing/protocol/writing-protocol.md` — Protocolo completo de escritura
3. `writing/protocol/prompt-base.md` — Instrucciones estables + reglas {src:}
4. `writing/protocol/source-hierarchy.md` — Jerarquía de fuentes
5. `writing/chapters/ch${CHAPTER}/prompt.md` — Spec del capítulo
6. `writing/protocol/references.json` — Claves válidas para {ref:}
7. Capítulo anterior EN (`i18n/en/chapters/${PREV}.json`) — para evitar redundancia
8. `workspace/chapters/ch${CHAPTER}/research-ra.md` — Citas Ra PRE-EXTRAÍDAS
9. `workspace/chapters/ch${CHAPTER}/research-quo.md` — Contexto Q'uo (NUNCA en texto)

### 3. Escribir

Escribe SOLO las secciones asignadas a este paso (conv_write_1 del manifiesto, o primera mitad).

#### Reglas de escritura

- Voz: primera persona plural, perspectiva sapiencial
- NUNCA mencionar a Ra, Q'uo, ni ninguna fuente
- Paráfrasis con integridad, nunca citas directas (ecos de frases memorables sí)
- Terminología estricta: density (no dimension), distortion (no change), catalyst (no challenge)
- Marcas `{term:keyword}` en primera mención de términos del glosario
- Marcas `{ref:category:id}` donde haya conexiones naturales — VALIDAR contra references.json
- Marcas `{src:XX.YY}` al final de cada párrafo (metadata de trabajo)
- Oraciones preferiblemente < 20 palabras, párrafos de 3-4 oraciones

#### Sistema {src:}

- `{src:13.5}` → https://www.lawofone.info/s/13#5
- Si el siguiente párrafo usa la MISMA fuente, no repitas
- Fuentes múltiples: `{src:13.5,15.21,27.6}`
- Rangos: `{src:13.5-13.9}`
- Síntesis: `{src:synthesis}` · Ciencia/filosofía: `{src:external}` o `{src:external+13.5}`

#### Citas no disponibles

Si necesitas citar una sesión de Ra que NO está en los research files, NUNCA la inventes.
Marca: `[PENDING: XX.YY — descripción de qué necesitas verificar]`
Estas marcas se resolverán después con acceso a los volúmenes completos.

#### Diferenciación con capítulo anterior

Consulta el manifiesto → `differentiation` y el prompt del capítulo para saber:
- Qué NO repetir del capítulo anterior
- Qué PUEDE referenciar brevemente

### 4. Guardar output

Guarda el texto como: `workspace/chapters/ch${CHAPTER}/draft-first.md`

El archivo debe contener:
- Texto corrido con títulos de sección
- TODAS las marcas ({term:}, {ref:}, {src:})
- NO JSON todavía

Al final del archivo, agrega un bloque de metadata:

```
---
## Metadata
- Secciones escritas: [lista de IDs]
- Términos {term:} usados: [lista de keywords]
- Conteo de palabras por sección: [tabla]
- Total palabras: XXXX
- Marcas [PENDING]: [lista, si hay]
```

### 5. Reportar al operador

Muestra:
- Secciones completadas
- Conteo de palabras por sección
- Cualquier marca [PENDING] que requiera verificación
- Confirmación del archivo guardado

## Nota
Este comando ejecuta solo la Fase 2 del pipeline. Para el pipeline completo autónomo usa `/write:chapter N`.

## Ejemplo de uso
`/write:step1 02` - Escribe primera mitad del Capítulo 2
