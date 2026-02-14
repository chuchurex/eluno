# v1 — Benchmark de la primera version

## Como se escribio v1

Los 16 capitulos originales de El Uno se escribieron con un metodo conversacional:

1. **Subir PDFs** a un Claude Project (Ra Contact Vol 1-2, Q'uo Archives Vol 9-11)
2. **Configurar el system prompt** con las instrucciones de `ai-writing-prompt.md`
3. **Escribir capitulo por capitulo** en conversacion libre con Claude
4. **Revisar manualmente** — sin QA formal, sin validacion programatica
5. **Traducir** — EN como base, ES y PT via API

## Que funciono

- Voz consistente en primera persona plural
- Terminologia preservada (density, distortion, catalyst, etc.)
- Estructura de capitulos coherente (apertura, desarrollo, cierre)
- Tono sapiencial sin ser dogmatico

## Que faltaba

- **Sin provenance**: no hay registro de que sesion Ra respalda cada parrafo
- **Sin QA formal**: no existian las 9 categorias de verificacion
- **Sin reproducibilidad**: el resultado dependia de la conversacion especifica
- **Sin markup**: la mayoria de capitulos no tiene `{term:}`, `{ref:}`, ni `{src:}`
- **Sin manifiesto**: no habia lista explicita de sesiones por seccion

## Por que se creo el pipeline v3

Para que cada afirmacion sea trazable a una sesion Ra especifica, para que el QA sea sistematico, y para que cualquier persona pueda clonar el repo y producir un resultado equivalente.

## Como usar este benchmark

Los capitulos publicados en `i18n/en/chapters/` (01-16.json) son el resultado v1. Cuando se reescriba un capitulo con el pipeline v3:

1. Leer el capitulo v1 antes de escribir
2. Escribir con el pipeline (prepare → step1 → step2 → qa → glossary)
3. Comparar: el v3 deberia ser igual o mejor en voz, y superior en trazabilidad
4. Si el v3 pierde calidad de prosa vs v1, ajustar los protocolos

## Archivos en este directorio

- `ai-writing-prompt.md` — El system prompt completo usado en v1
- `methodology.md` — Decisiones editoriales y lecciones aprendidas
- `sources.md` — Links a los PDFs fuente y jerarquia de fuentes
