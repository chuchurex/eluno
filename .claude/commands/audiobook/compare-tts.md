# Comparar Proveedores TTS

Genera el mismo texto con diferentes proveedores TTS para comparar calidad.

## Argumentos
$ARGUMENTS = [idioma] [texto o "chapter:N"]

## Instrucciones

1. Si $ARGUMENTS contiene "chapter:N", extrae el primer parrafo del capitulo N
2. Si no, usa el texto proporcionado directamente

3. Genera audio con cada proveedor disponible:
   - Edge TTS (gratuito, siempre disponible)
   - Fish Audio (si FISH_API_KEY esta configurada)

4. Guarda los archivos de prueba en:
   ```
   audiobook/voices/
   ├── edge-tts-test-[idioma].mp3
   └── fish-audio-test-[idioma].mp3
   ```

5. Muestra tabla comparativa:
   | Proveedor | Tamano | Duracion | Calidad estimada |

6. Pregunta al usuario cual prefiere para produccion

## Ejemplo de uso
`/audiobook:compare-tts es chapter:1` - Compara usando el cap. 1 en espanol
`/audiobook:compare-tts en "Hello, welcome to The One"` - Compara con texto especifico
