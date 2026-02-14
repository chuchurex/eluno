# Documentación — El Uno (eluno.org)

## Estructura

```
docs/
├── writing/                    # Pipeline de escritura
│   ├── CHAPTER_PIPELINE.md     # Pipeline completo: investigación → deploy (8 fases)
│   ├── WRITING_PROTOCOL.md     # Protocolo de escritura (voz, estilo)
│   └── BOOK_STRUCTURE_16_CHAPTERS.md  # Estructura del libro (16 capítulos)
│
├── project/                    # Estado y planificación
│   ├── PROJECT_STATUS.md       # Estado actual del proyecto
│   ├── ROADMAP.md              # Roadmap de desarrollo
│   ├── TODO.md                 # Tareas técnicas pendientes
│   └── CONTRIBUTING.md         # Guía para colaboradores
│
├── tech/                       # Arquitectura y deploy
│   ├── ARCHITECTURE.md         # Arquitectura técnica v3
│   ├── DEPLOY.md               # Guía de deployment
│   └── DEVELOPMENT.md          # Desarrollo local
│
├── audiobook/                  # Generación de audiolibros
│   ├── AUDIOBOOK_GUIDE.md      # Guía de generación TTS
│   └── STATUS.md               # Estado del audiobook
│
├── legal/                      # Atribuciones y créditos
│   └── CREDITS_ATTRIBUTION.md  # Créditos L/L Research
│
└── private/                    # (gitignored) Archivos históricos
    └── archive-v1/             # Docs de la versión 1 del proyecto
```

## Slash Commands disponibles

### Pipeline de escritura (`/write:*`)
| Comando | Fase | Descripción |
|---------|------|-------------|
| `/write:step1 XX` | 3a | Escribir primera mitad del capítulo |
| `/write:step2 XX` | 3b | Escribir segunda mitad |
| `/write:qa XX` | 4 | QA + generar JSON limpio |
| `/write:glossary XX` | 5 | Generar glosario + provenance |
| `/write:publish XX` | 6-8 | Integrar, traducir, build, deploy |

### Proyecto (`/project:*`)
| Comando | Descripción |
|---------|-------------|
| `/project:context` | Cargar contexto para nueva sesión |
| `/project:todo` | Gestionar tareas pendientes |
| `/project:roadmap` | Ver roadmap de desarrollo |

### Audiobook (`/audiobook:*`)
| Comando | Descripción |
|---------|-------------|
| `/audiobook:generate` | Generar MP3s con TTS |
| `/audiobook:concat` | Concatenar capítulos |
| `/audiobook:tag` | Actualizar tags ID3 |
| `/audiobook:status` | Estado de generación |
