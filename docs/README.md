# 📚 Documentación del Proyecto eluno.org

## Estructura

```
docs/
├── writing/          # Cómo escribir contenido
│   ├── WRITING_PROTOCOL.md      # Protocolo de escritura (voz, estilo)
│   └── BOOK_STRUCTURE_16_CHAPTERS.md  # Estructura del libro original
│
├── tech/             # Arquitectura y deploy
│   ├── ARCHITECTURE.md          # Arquitectura técnica completa
│   ├── DEPLOY.md                # Guía de deployment
│   └── DEVELOPMENT.md           # Desarrollo local
│
├── audiobook/        # Generación de audiolibros
│   ├── AUDIOBOOK_GUIDE.md       # Guía de generación TTS
│   └── STATUS.md                # Estado del audiobook
│
├── video/            # Generación de videos YouTube
│   ├── YOUTUBE_VIDEO_GUIDE.md   # Guía completa FFmpeg + upload
│   └── upload_results.json      # IDs de 16 videos publicados
│
└── legal/            # Atribuciones y créditos
    └── CREDITS_ATTRIBUTION.md   # Créditos L/L Research
```

## Voces TTS (Fish Audio)

| Voz | ID |
|-----|-----|
| **Actual** | `f53102becdf94a51af6d64010bc658f2` |
| **Clon Chuchu** | `60f3d0bf60cd4f5e88d1116e22eb19a7` |

## Prompts por Libro

Cada libro tiene su `PROMPT.md` con propósito, voz y estructura:

| Libro | Prompt |
|-------|--------|
| Eluno (original) | `packages/eluno/PROMPT.md` |
| Todo | `packages/todo/PROMPT.md` |
| Jesús | `packages/jesus/PROMPT.md` |
| Sanación | `packages/sanacion/PROMPT.md` |
| Otra Mirada | `packages/otramirada/PROMPT.md` |

## Para Colaboradores

1. Lee `writing/WRITING_PROTOCOL.md` antes de escribir
2. Revisa `tech/ARCHITECTURE.md` para entender el sistema
3. Cada libro tiene su `PROMPT.md` — léelo primero

