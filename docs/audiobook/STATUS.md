# Estado del Audiobook — El Uno

> **Actualizado:** Febrero 22, 2026

## Completado

### Audio (3 idiomas x 17 archivos = 51 MP3s)

| Idioma | Capítulos | Libro completo | Voz |
|--------|-----------|----------------|-----|
| ES | 16/16 | el-uno-audiolibro-completo.mp3 | es-MX-JorgeNeural |
| EN | 16/16 | the-one-complete-audiobook.mp3 | en-US-GuyNeural |
| PT | 16/16 | o-um-audiolivro-completo.mp3 | pt-BR-AntonioNeural |

### Infraestructura
- Edge TTS (gratuito, Microsoft) via `node-edge-tts`
- Assembly: contenido + 2s silencio + outro (atribución L/L Research)
- Libro completo: tagline intro + 3s silencio + todos los capítulos
- ID3 tags: título, artista, álbum, copyright, L/L Research
- Hosting: static.eluno.org (Hostinger)
- Cache-busting: `?v=4` en media.json

### Correcciones aplicadas
- Pronunciación "L. L. Research punto/dot/ponto org"
- Artículos duplicados eliminados ("el El Infinito" → "El Infinito")
- Descripciones parentéticas eliminadas del TTS
- Duplicados al final eliminados ("Véu do Esquecimento do esquecimento")

## Pipeline

```
extract-text.cjs → generate-edge.cjs → rename-media.cjs → assemble-chapters.cjs → update-mp3-tags.cjs → rsync → media.json
```

1. Extraer texto de JSON a TTS-ready text (`audiobook/text/{lang}/`)
2. Generar MP3 con Edge TTS (`audiobook/audio/{lang}/`)
3. Renombrar a SEO names + actualizar media.json
4. Ensamblar con outro (`audiobook/final/{lang}/`)
5. Taggear ID3
6. Subir a static.eluno.org via rsync
7. Agregar cache-bust a media.json, rebuild, push
