# QA y ensamblaje JSON del capítulo

Ensambla los drafts, ejecuta QA de lectura, y genera el JSON final del capítulo.

## Argumentos
$ARGUMENTS = número de capítulo (ej: 02, 03, 14)

## Rutas

- **Chapter dir**: `workspace/chapters/ch${CHAPTER}/`
- **Draft primera mitad**: `workspace/chapters/ch${CHAPTER}/draft-first.md`
- **Draft segunda mitad**: `workspace/chapters/ch${CHAPTER}/draft-second.md`
- **Manifiesto**: `workspace/chapters/ch${CHAPTER}/manifest.json`
- **QA Protocol**: `writing/protocol/qa-protocol.md`
- **References**: `writing/protocol/references.json`
- **Capítulo anterior (formato ref)**: `i18n/en/chapters/${PREV}.json`

## Instrucciones

### 1. Verificar prerrequisitos

1. Parsea $ARGUMENTS para obtener el número de capítulo
2. Verifica que existen AMBOS drafts:
   - `workspace/chapters/ch${CHAPTER}/draft-first.md`
   - `workspace/chapters/ch${CHAPTER}/draft-second.md`
3. Si falta alguno: PARA. Indica qué paso falta ejecutar.
4. Verifica que NO existan marcas `[PENDING:]` en los drafts.
   - Si las hay: PARA. Lista las marcas pendientes. El operador debe resolverlas primero.

### 2. Ensamblar

Lee ambos drafts y únelos en un texto continuo.
Lee el capítulo completo de corrido para verificar coherencia entre las dos mitades.

### 3. QA de lectura

Lee `writing/protocol/qa-protocol.md` y ejecuta las 9 categorías:

| Cat | Verificación | Acción si falla |
|-----|-------------|-----------------|
| A | **Referencias fantasma** — cada {ref:category:id} existe en references.json | Eliminar o corregir |
| B | **Nombres propios** — la prosa tiene sentido si reemplazas {ref:} por [enlace] | Agregar nombre al texto |
| C | **{term:} duplicado** — cada keyword marcado SOLO UNA VEZ en todo el capítulo | Eliminar duplicados |
| D | **Contenido repetido** — no hay párrafos casi idénticos entre secciones | Fusionar o eliminar |
| E | **Voz y otredad** — ni "your scientists" ni origen no-humano innecesario | Reescribir frases |
| F | **Coherencia narrativa** — transiciones, flujo, cierre correcto | Ajustar transiciones |
| G | **Oraciones/párrafos** — oraciones < 20 palabras, párrafos 3-4 oraciones | Dividir lo que exceda |
| H | **Terminología** — density (no dimension), distortion (no change), etc. | Corregir términos |
| I | **Atribuciones** — no Ra, no Q'uo, no fuentes en el texto | Eliminar menciones |

### 4. Producir reporte QA

Genera un reporte con veredicto:

- **PASA** — listo para JSON
- **PASA CON CORRECCIONES** — lista de cambios aplicados
- **NO PASA** — requiere intervención del operador (explicar qué y por qué)

Si el veredicto es PASA o PASA CON CORRECCIONES, aplica las correcciones y continúa.
Si es NO PASA, guarda el reporte y PARA.

### 5. Generar en.json

Lee el capítulo anterior (`i18n/en/chapters/${PREV}.json`) como referencia de formato.

Reglas del JSON:
- **QUITAR** todas las marcas `{src:}` del texto
- **MANTENER** las marcas `{term:}` y `{ref:}`
- Estructura exacta:

```json
{
  "id": "ch${N}",
  "number": ${N},
  "numberText": "Chapter ...",
  "title": "...",
  "sections": [
    {
      "id": "ch${N}-section-id",
      "title": "...",
      "content": [
        { "type": "paragraph", "text": "..." }
      ]
    }
  ]
}
```

### 6. Verificar encoding

Buscar y corregir mojibake ANTES de guardar:
- `â€"` → `—` (em dash)
- `â€™` → `'` (curly apostrophe)
- `â€œ` / `â€` → `"` / `"` (curly quotes)
- `Ã¡` → `á`, `Ã©` → `é`, etc. (acentos rotos)

Usar solo ASCII + caracteres Unicode limpios. En caso de duda, usar comillas rectas y guiones simples.

### 7. Guardar outputs

1. `workspace/chapters/ch${CHAPTER}/en.json` — El capítulo limpio
2. `workspace/chapters/ch${CHAPTER}/qa-report.md` — El reporte QA

### 8. Reportar al operador

Muestra:
- Reporte QA resumido (categorías con issues + correcciones aplicadas)
- Conteo final de palabras
- Número de secciones y párrafos
- Confirmación de archivos guardados
- Si hay {src:} residuales (debería ser 0)

## Nota
Este comando ejecuta solo la Fase 4 del pipeline. Para el pipeline completo autónomo usa `/write:chapter N`.

## Ejemplo de uso
`/write:qa 02` - QA y JSON del Capítulo 2
