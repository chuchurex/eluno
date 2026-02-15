# Escribir segunda mitad del capítulo

Escribe las secciones restantes de un capítulo de El Uno.

## Argumentos
$ARGUMENTS = número de capítulo (ej: 02, 03, 14)

## Rutas base

- **Chapter dir**: `workspace/chapters/ch${CHAPTER}/`
- **Manifiesto**: `workspace/chapters/ch${CHAPTER}/manifest.json`
- **Research Ra**: `workspace/chapters/ch${CHAPTER}/research-ra.md`
- **Research Q'uo**: `workspace/chapters/ch${CHAPTER}/research-quo.md`
- **Prompt del capítulo**: `writing/chapters/ch${CHAPTER}/prompt.md`
- **Draft primera mitad**: `workspace/chapters/ch${CHAPTER}/draft-first.md`

### Knowledge files (protocolos de escritura)

- `writing/protocol/book-identity.md`
- `writing/protocol/writing-protocol.md`
- `writing/protocol/prompt-base.md`
- `writing/protocol/source-hierarchy.md`
- `writing/protocol/references.json`

## Instrucciones

### 1. Preparar contexto

1. Parsea $ARGUMENTS para obtener el número de capítulo
2. Lee el manifiesto `workspace/chapters/ch${CHAPTER}/manifest.json`
3. Del manifiesto, extrae:
   - `sections` — lista completa
   - `writing_split.conv_write_2` — IDs de secciones para ESTE paso
   - Si no existe `writing_split`, usa la segunda mitad de `sections`
4. Verifica que existe `workspace/chapters/ch${CHAPTER}/draft-first.md`
   - Si NO existe: PARA. Indica al operador que debe ejecutar `/write:step1 ${CHAPTER}` primero.

### 2. Leer documentos (en este orden)

1. `writing/protocol/book-identity.md` — Identidad del libro
2. `writing/protocol/writing-protocol.md` — Protocolo de escritura
3. `writing/protocol/prompt-base.md` — Instrucciones estables + reglas {src:}
4. `writing/protocol/source-hierarchy.md` — Jerarquía de fuentes
5. `writing/chapters/ch${CHAPTER}/prompt.md` — Spec del capítulo
6. `writing/protocol/references.json` — Claves válidas para {ref:}
7. `workspace/chapters/ch${CHAPTER}/research-ra.md` — Citas Ra pre-extraídas
8. `workspace/chapters/ch${CHAPTER}/research-quo.md` — Contexto Q'uo (NUNCA en texto)
9. **`workspace/chapters/ch${CHAPTER}/draft-first.md`** — Secciones ya escritas (CRÍTICO para continuidad)

### 3. Asegurar continuidad

Lee la primera mitad completa. Verifica:
- Continuidad de voz y tono
- Qué términos ya fueron marcados con {term:} — NO re-marcar
- Progresión temática natural
- No repetir contenido ya cubierto

### 4. Escribir

Escribe SOLO las secciones asignadas a este paso (conv_write_2 del manifiesto, o segunda mitad).

#### Notas de tono por sección (consultar manifiesto y prompt del capítulo)

Cada sección tiene un `angle` definido en el manifiesto. Respétalo.
Presta especial atención a:
- Secciones marcadas como "corazón" del capítulo → mayor profundidad y belleza
- Secciones de tipo "bridge" → abrir, no cerrar; dejar al lector con ganas de continuar
- Secciones con tono "personal" → más cálidas, más directas al lector

#### Mismas reglas de escritura y sistema {src:} que step1

#### Citas no disponibles

Si necesitas citar una sesión de Ra que NO está en los research files, NUNCA la inventes.
Marca: `[PENDING: XX.YY — descripción de qué necesitas verificar]`

### 5. Guardar output

Guarda como: `workspace/chapters/ch${CHAPTER}/draft-second.md`

El archivo debe contener:
- Texto corrido de las secciones restantes con marcas
- Bloque de metadata al final:

```
---
## Metadata
- Secciones escritas: [lista de IDs]
- Términos {term:} NUEVOS: [solo los no usados en draft-first]
- Conteo de palabras por sección: [tabla]
- Total palabras esta mitad: XXXX
- Total acumulado (primera + segunda): XXXX
- Target del manifiesto: XXXX
- Marcas [PENDING]: [lista, si hay]
```

### 6. Reportar al operador

Muestra:
- Secciones completadas
- Conteo de palabras (esta mitad + acumulado + target)
- Cualquier marca [PENDING]
- Si el total acumulado está dentro del target del manifiesto
- Confirmación del archivo guardado

## Nota
Este comando ejecuta solo la Fase 3 del pipeline. Para el pipeline completo autónomo usa `/write:chapter N`.

## Ejemplo de uso
`/write:step2 02` - Escribe segunda mitad del Capítulo 2
