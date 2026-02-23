# Actualizar Tags ID3 de MP3s

Actualiza las etiquetas ID3 (metadatos) de todos los archivos MP3 del audiolibro.

## Argumentos
$ARGUMENTS = idioma (es, en, pt)

## Instrucciones

1. Lee la estructura de capítulos desde `docs/writing/BOOK_STRUCTURE_16_CHAPTERS.md`
2. Ejecuta el script de etiquetado:
   ```bash
   node scripts/update-mp3-tags.cjs $ARGUMENTS
   ```
3. Los tags incluyen:
   - Titulo: "El Uno - Cap.XX: [Titulo del Capitulo]"
   - Artista: eluno.org
   - Album: El Uno / The One / O Um (segun idioma)
   - Ano: 2026
   - Genero: Audiolibro
   - Copyright: L/L Research + eluno.org
4. Muestra resumen de archivos actualizados

## Ejemplo de uso
`/audiobook:tag es` - Actualiza tags de todos los MP3s en español
