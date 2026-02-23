# Audiolibro - The Law of One

Sistema de generación de audiolibros para el Material de Ra.

## Estructura del Proyecto

```
audiobook/
├── content/           # Contenido en markdown
│   ├── en/           # Capítulos en inglés
│   │   └── chapter-01.md
│   └── es/           # Capítulos en español
│       └── chapter-01.md
├── audio/            # Archivos de audio generados
│   ├── en/           # Audio en inglés
│   └── es/           # Audio en español
├── scripts/          # Scripts de automatización
│   ├── translate-audiobook.js    # Traduce capítulos EN → ES
│   └── generate-audio.js         # Genera audio con Fish Audio API
└── README.md
```

## Configuración Inicial

### 1. Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con:

```bash
# Anthropic API (para traducción)
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Fish Audio API (para generación de audio)
FISH_AUDIO_API_KEY=xxxxx

# Voice IDs de Fish Audio (opcional)
FISH_VOICE_ID_EN=xxxxx  # ID de voz en inglés
FISH_VOICE_ID_ES=xxxxx  # ID de voz en español
```

### 2. Obtener API Keys

- **Anthropic API**: https://console.anthropic.com/
- **Fish Audio API**: https://fish.audio/

## Uso

### Paso 1: Traducir Capítulo

Traduce un capítulo de inglés a español usando Claude:

```bash
export ANTHROPIC_API_KEY=sk-ant-xxxxx
node audiobook/scripts/translate-audiobook.js 01
```

Esto:
- ✅ Lee `audiobook/content/en/chapter-01.md`
- ✅ Traduce usando Claude Sonnet 4 con glosario consistente
- ✅ Guarda en `audiobook/content/es/chapter-01.md`

### Paso 2: Generar Audio

Genera el audio en inglés:

```bash
export FISH_AUDIO_API_KEY=xxxxx
export FISH_VOICE_ID_EN=xxxxx
node audiobook/scripts/generate-audio.js 01 en
```

Genera el audio en español:

```bash
export FISH_AUDIO_API_KEY=xxxxx
export FISH_VOICE_ID_ES=xxxxx
node audiobook/scripts/generate-audio.js 01 es
```

Esto:
- ✅ Lee el markdown del capítulo
- ✅ Convierte a texto plano optimizado para narración
- ✅ Divide en chunks (4000 caracteres max)
- ✅ Genera audio para cada chunk usando Fish Audio
- ✅ Combina los chunks en un solo archivo MP3
- ✅ Guarda en `audiobook/audio/{lang}/chapter-01.mp3`

## Workflow Completo

Para procesar un nuevo capítulo:

```bash
# 1. Copiar el capítulo original a audiobook/content/en/
cp docs/AUDIOBOOK_CHAPTER_02_DEMO.md audiobook/content/en/chapter-02.md

# 2. Traducir al español
node audiobook/scripts/translate-audiobook.js 02

# 3. Generar audio en inglés
node audiobook/scripts/generate-audio.js 02 en

# 4. Generar audio en español
node audiobook/scripts/generate-audio.js 02 es
```

## Características

### Traducción (translate-audiobook.js)

- ✅ Usa Claude Sonnet 4 para alta calidad
- ✅ Mantiene glosario consistente del Material de Ra
- ✅ Optimizado para narración natural en audio
- ✅ Preserva estructura markdown exacta
- ✅ Verifica longitud y formato

### Generación de Audio (generate-audio.js)

- ✅ Convierte markdown a texto plano para narración
- ✅ Maneja títulos y separadores de forma natural
- ✅ Divide texto en chunks para API
- ✅ Rate limiting (1 segundo entre requests)
- ✅ Combina chunks en archivo final
- ✅ Formato MP3 de salida

## Glosario de Términos

El script de traducción mantiene consistencia con estos términos clave:

| English | Español |
|---------|---------|
| Harvest | Cosecha |
| Distortion | Distorsión |
| Catalyst | Catalizador |
| Density | Densidad |
| Service to Others | Servicio a Otros |
| Service to Self | Servicio a Sí Mismo |
| Free Will | Libre Albedrío |
| Intelligent Infinity | Infinito Inteligente |
| Logos | Logos |

*(Ver lista completa en `scripts/translate-audiobook.js`)*

## Próximos Pasos

1. Configurar API keys
2. Probar con capítulo 1
3. Revisar calidad de traducción
4. Revisar calidad de audio
5. Ajustar voice IDs si es necesario
6. Procesar capítulos restantes

## Notas Técnicas

- **Modelo de traducción**: Claude Sonnet 4 (claude-sonnet-4-20250514)
- **TTS API**: Fish Audio API v1
- **Formato de audio**: MP3
- **Max chunk size**: 4000 caracteres
- **Rate limiting**: 1 segundo entre chunks
