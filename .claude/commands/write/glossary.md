# Generar glosario y proveniencia del capítulo

Genera los archivos de glosario y provenance a partir del JSON final y los drafts con marcas {src:}.

## Argumentos
$ARGUMENTS = número de capítulo (ej: 02, 03, 14)

## Rutas

- **Chapter dir**: `workspace/chapters/ch${CHAPTER}/`
- **JSON final**: `workspace/chapters/ch${CHAPTER}/en.json`
- **Draft primera mitad**: `workspace/chapters/ch${CHAPTER}/draft-first.md`
- **Draft segunda mitad**: `workspace/chapters/ch${CHAPTER}/draft-second.md`
- **Manifiesto**: `workspace/chapters/ch${CHAPTER}/manifest.json`
- **Prompt del capítulo**: `writing/chapters/ch${CHAPTER}/prompt.md`
- **Glosarios anteriores**: `i18n/en/glossary.json`

## Instrucciones

### 1. Verificar prerrequisitos

1. Parsea $ARGUMENTS para obtener el número de capítulo
2. Verifica que existe `workspace/chapters/ch${CHAPTER}/en.json`
   - Si NO existe: PARA. Indica que debe ejecutar `/write:qa ${CHAPTER}` primero.
3. Verifica que existen ambos drafts (necesarios para las marcas {src:})

### 2. Generar glossary.json

#### A) Extraer términos

Lee el JSON final y extrae todos los `{term:keyword}` del texto.

#### B) Identificar términos nuevos vs existentes

- Lee `i18n/en/glossary.json` — términos ya definidos en capítulos anteriores
- Lee el prompt del capítulo — sección de términos esperados (si existe)
- Un término es NUEVO si no aparece en el glosario existente

#### C) Generar definiciones

Para cada término NUEVO:
- `keyword`: el mismo de {term:keyword}
- `title`: nombre legible en inglés
- `definition`: explicación clara, accesible, fiel a las enseñanzas, SIN atribuciones a fuentes

```json
[
  {
    "keyword": "original-thought",
    "title": "The Original Thought",
    "definition": "..."
  }
]
```

Cada definición debe poder leerse independientemente del capítulo.

### 3. Generar provenance.json

#### A) Mapear {src:} a párrafos

Lee los drafts (que conservan las marcas {src:}) y mapea cada marca al párrafo correspondiente del JSON final.

#### B) Construir el mapa

```json
{
  "chapter": "ch${N}",
  "title": "...",
  "base_url": "https://www.lawofone.info/s/",
  "provenance": [
    {
      "section_id": "ch${N}-section-id",
      "section_title": "...",
      "segments": [
        {
          "paragraphs": [1, 2, 3],
          "sources": ["13.5", "13.6"],
          "urls": [
            "https://www.lawofone.info/s/13#5",
            "https://www.lawofone.info/s/13#6"
          ],
          "note": "Descripción breve del concepto cubierto"
        }
      ]
    }
  ]
}
```

Reglas de URLs:
- Formato: `https://www.lawofone.info/s/{session}#{question}`
- `{src:13.5}` → `https://www.lawofone.info/s/13#5`
- `{src:synthesis}` → no genera URL, solo nota
- `{src:external}` → no genera URL, marcar como fuente externa

### 4. Guardar outputs

1. `workspace/chapters/ch${CHAPTER}/glossary.json`
2. `workspace/chapters/ch${CHAPTER}/provenance.json`

### 5. Reportar al operador

Muestra:
- Términos nuevos generados (tabla: keyword → title)
- Términos ya existentes (mencionados pero no redefinidos)
- Estadísticas de provenance: secciones mapeadas, total de fuentes Ra citadas
- Confirmación de archivos guardados

### 6. Reportar

Muestra entregables y estadísticas.

## Nota
Este comando ejecuta solo la Fase 5 del pipeline. Para el pipeline completo autónomo usa `/write:chapter N`.

## Ejemplo de uso
`/write:glossary 02` - Genera glosario y provenance del Capítulo 2
