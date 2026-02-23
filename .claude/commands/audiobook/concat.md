# Concatenar Audiolibro Completo

Concatena todos los capítulos MP3 individuales en un audiolibro completo.

## Argumentos
$ARGUMENTS = idioma (es, en, pt)

## Instrucciones

1. Verifica que existan todos los capítulos MP3 en `audiobook/audio/$ARGUMENTS/`
2. Lista los archivos encontrados y confirma el orden
3. Ejecuta la concatenación:
   ```bash
   node scripts/audiobook/concat.cjs $ARGUMENTS
   ```
4. Verifica el archivo resultante:
   - Nombre esperado según idioma:
     - es: `el-uno-audiolibro-completo.mp3`
     - en: `the-one-complete-audiobook.mp3`
     - pt: `o-um-audiolivro-completo.mp3`
   - Muestra duración total y tamaño del archivo

## Ejemplo de uso
`/audiobook:concat es` - Crea el audiolibro completo en español
