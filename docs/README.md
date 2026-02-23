# Documentación — El Uno (eluno.org)

## Estructura

```
docs/
├── project/                    # Estado y planificación
│   ├── PROJECT_STATUS.md       # Estado actual del proyecto
│   ├── ROADMAP.md              # Roadmap de desarrollo
│   ├── TODO.md                 # Tareas técnicas pendientes
│   ├── CONTRIBUTING.md         # Guía para colaboradores
│   └── UPDATE_PIPELINE.md      # Procedimiento de actualización
│
├── tech/                       # Arquitectura y deploy
│   ├── ARCHITECTURE.md         # Arquitectura técnica
│   ├── DEPLOY.md               # Guía de deployment
│   └── DEVELOPMENT.md          # Desarrollo local
│
├── writing/                    # Referencia de contenido
│   ├── CHAPTER_PIPELINE.md     # Pipeline: investigación → deploy
│   ├── WRITING_PROTOCOL.md     # Protocolo de escritura (voz, estilo)
│   └── BOOK_STRUCTURE_16_CHAPTERS.md  # Estructura del libro (16 capítulos)
│
├── audiobook/                  # Generación de audiolibros
│   └── STATUS.md               # Estado del audiobook
│
├── legal/                      # Atribuciones y créditos
│   └── CREDITS_ATTRIBUTION.md  # Créditos L/L Research
│
└── private/                    # (gitignored) Archivos históricos
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
