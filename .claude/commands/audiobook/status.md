# Estado del Audiolibro

Muestra el estado completo de generacion de audiolibros para todos los idiomas.

## Instrucciones

1. Para cada idioma (es, en, pt), verifica:
   - Archivos de texto en `audiobook/text/[idioma]/`
   - Archivos MP3 generados en `audiobook/audio/[idioma]/`
   - Audiolibro completo concatenado

2. Muestra tabla de estado:

```
| Idioma | Texto | MP3s | Completo | Duracion Total |
|--------|-------|------|----------|----------------|
| ES     | 16/16 | 16/16| ✅       | ~8h 30m        |
| EN     | 16/16 | 16/16| ✅       | ~8h 30m        |
| PT     | 16/16 | 16/16| ✅       | ~8h 30m        |
```

3. Lista capitulos faltantes si hay alguno

4. Muestra recomendacion de siguiente paso:
   - Si faltan textos: "Ejecuta `npm run audio:extract`"
   - Si faltan MP3s: "Ejecuta `/audiobook:generate [idioma] all`"
   - Si falta concatenar: "Ejecuta `/audiobook:concat [idioma]`"

## Ejemplo de uso
`/audiobook:status` - Muestra estado completo
