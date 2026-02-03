# Migrar generacion de audiolibros a TTS open-source gratuito

Estado: **pendiente**
Fecha de analisis: 2026-02-03

---

## Contexto

Actualmente el proyecto usa **Fish Audio API** (de pago) para generar audiolibros.
Los scripts existentes estan en `packages/core/scripts/fish-audio-tts.js`.
Se necesita generar audio en 3 idiomas (ES, EN, PT) para multiples libros.

---

## Audio pendiente de generar

| Paquete | Capitulos | ES | EN | PT | Notas |
|---|---|---|---|---|---|
| dormidos | 24 | pendiente | pendiente | pendiente | Sin audio alguno |
| jesus | 11 | hecho | pendiente | pendiente | Solo ES generado |
| todo | 11 | hecho | pendiente | pendiente | Solo ES generado |
| sanacion | 11 | pendiente | hecho | - | Solo EN generado |
| doctrinas | 15 | parcial (10/15) | - | - | Faltan caps 13-15 |

**Estimacion:** ~100+ archivos de audio por generar en total.

---

## Solucion recomendada: Chatterbox TTS Multilingual

### Por que Chatterbox

- **MIT License** - sin restricciones comerciales
- **23 idiomas** incluyendo ES, PT y EN de forma nativa
- **Calidad superior** - 63.75% preferencia vs ElevenLabs en tests ciegos
- **Voice cloning** con solo 5 segundos de audio (cross-language transfer)
- **Control de emociones** - util para narracion expresiva
- **Apple Silicon (MPS)** - compatible con Mac
- **Ecosistema maduro** - forks dedicados para audiobooks

### Modelo recomendado

**Chatterbox-Turbo** (350M params) - version eficiente para hardware limitado.
Para narracion larga usar el fork [Chatterbox-TTS-Server](https://github.com/devnen/Chatterbox-TTS-Server)
que hace chunking automatico y concatenacion.

### Requisitos de hardware

- Minimo: GPU con ~8GB VRAM (o Apple Silicon via MPS)
- Recomendado: 16GB VRAM para mejor throughput
- Funciona en CPU como fallback (mas lento)

### Instalacion

```bash
pip install chatterbox-tts
```

---

## Alternativas evaluadas

| Modelo | ES/PT/EN | Calidad | GPU min | Licencia | Notas |
|---|---|---|---|---|---|
| **Chatterbox Multilingual** | los 3 | excelente | ~8GB | MIT | Recomendado |
| **Qwen3-TTS** (ene 2026) | los 3 | excelente | ~8GB | Apache 2.0 | Alternativa solida |
| **XTTS-v2** (Coqui) | los 3 | buena | ~6GB | No-comercial | Descartado por licencia |
| **FishAudio S1-mini** | 2 confirmados | buena | ~8GB | Open-source | PT no confirmado |
| **Higgs Audio V2** | probablemente | excelente | ~12GB | Apache 2.0 | Modelo grande |

---

## Plan de implementacion

### Fase 1: Prueba de concepto
- [ ] Instalar chatterbox-tts en entorno local
- [ ] Generar un capitulo de prueba en ES (dormidos cap 1)
- [ ] Evaluar calidad de audio vs Fish Audio actual
- [ ] Probar voice cloning con muestra de referencia

### Fase 2: Adaptar pipeline
- [ ] Crear `packages/core/scripts/chatterbox-tts.js` (o `.py`)
- [ ] Adaptar `build-audiobook.js` para usar Chatterbox en vez de Fish Audio
- [ ] Implementar chunking para capitulos largos
- [ ] Probar generacion en los 3 idiomas (ES, EN, PT)

### Fase 3: Generacion masiva
- [ ] Generar todos los audios de dormidos (24 caps x 3 idiomas)
- [ ] Generar audios faltantes de jesus (EN, PT)
- [ ] Generar audios faltantes de todo (EN, PT)
- [ ] Generar audios faltantes de sanacion (ES)
- [ ] Completar caps faltantes de doctrinas (13-15)

### Fase 4: QA y finalizacion
- [ ] Comparar calidad entre idiomas
- [ ] Normalizar volumen entre capitulos
- [ ] Generar compilaciones completas por libro
- [ ] Actualizar manifests de audiobook

---

## Links de referencia

- [Chatterbox GitHub](https://github.com/resemble-ai/chatterbox)
- [Chatterbox-TTS-Server (audiobook chunking)](https://github.com/devnen/Chatterbox-TTS-Server)
- [Chatterbox-Audiobook fork](https://github.com/psdwizzard/chatterbox-Audiobook)
- [Chatterbox-TTS-Extended](https://github.com/petermg/Chatterbox-TTS-Extended)
- [Chatterbox en HuggingFace](https://huggingface.co/ResembleAI/chatterbox)
- [Qwen3-TTS Guide](https://dev.to/czmilo/qwen3-tts-the-complete-2026-guide-to-open-source-voice-cloning-and-ai-speech-generation-1in6)
- [Comparativa TTS Open-Source 2026](https://www.bentoml.com/blog/exploring-the-world-of-open-source-text-to-speech-models)

---

*Analisis realizado por: Claude Code (Opus 4.5) - 2026-02-03*
