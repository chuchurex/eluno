# Generar Audiolibro

Genera el audiolibro para el idioma y capítulos especificados.

## Argumentos
$ARGUMENTS debe contener: [idioma] [capítulos]
- Idioma: es, en, pt
- Capítulos: all, 1-5, o número específico (ej: 3)

## Instrucciones

1. Verifica que existan los archivos de texto en `audiobook/text/$IDIOMA/`
2. Ejecuta el script de generación:
   ```bash
   node scripts/audiobook/generate-edge.cjs $ARGUMENTS
   ```
3. Monitorea el progreso y reporta cualquier error
4. Al finalizar, muestra estadísticas:
   - Número de capítulos generados
   - Tamaño total de archivos MP3
   - Tiempo aproximado de audio

## Ejemplo de uso
`/audiobook:generate es all` - Genera todos los capítulos en español
`/audiobook:generate en 1-5` - Genera capítulos 1 al 5 en inglés
