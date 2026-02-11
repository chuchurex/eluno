# GUÍA: Generar los 16 Prompts de Capítulo

> Este documento explica la arquitectura del sistema y cómo generar cada PROMPT_CHXX.md.

---

## ARQUITECTURA DEL SISTEMA

```
PROMPT_PREFLIGHT.md          ← Ejecutar 1 vez al inicio de sesión
PROMPT_BASE.md               ← Instrucciones estables (se referencia, no se copia)
PROMPT_INDEX_BUILDER.md      ← Ejecutar 1 vez para crear el índice temático
RA_THEMATIC_INDEX.md         ← Generado por INDEX_BUILDER (reutilizable)
PROMPT_CH01.md               ← Específico Cap 1
PROMPT_CH02.md               ← Específico Cap 2
...
PROMPT_CH16.md               ← Específico Cap 16
PROMPT_TRANSLATE.md          ← Traducción EN→ES/PT (separado, otro agente o API)
```

### Flujo de trabajo por capítulo:

```
ESCRITURA (agente principal — Opus):
1. PREFLIGHT (si es nueva sesión)
2. Pegar PROMPT_BASE.md + PROMPT_CHXX.md al agente
3. El agente ejecuta todo y entrega 3 JSONs (EN + glossary + provenance)
4. Revisar → pedir correcciones → iterar
5. Siguiente capítulo

TRADUCCIÓN (agente secundario o API — Sonnet):
6. Pegar PROMPT_TRANSLATE.md + chXX_EN.json
7. Recibir chXX_ES.json y/o chXX_PT.json
8. Revisar → iterar si es necesario
```

### Future-proofing:

Cuando un nuevo agente esté disponible:
1. Revisar PROMPT_BASE.md por si necesita ajustes al nuevo modelo
2. Los PROMPT_CHXX.md no cambian (son contenido, no instrucciones de formato)
3. Re-ejecutar cada capítulo con el nuevo agente
4. El RA_THEMATIC_INDEX.md puede regenerarse si el nuevo agente lo hace mejor

---

## TEMPLATE PARA CADA PROMPT_CHXX.md

Cada prompt de capítulo tiene exactamente 5 secciones. Copia este template y rellena:

```markdown
# PROMPT: Capítulo XX — "Título EN"

> **Prerrequisitos:** Ejecutar PROMPT_PREFLIGHT.md primero.
> **Instrucciones base:** Seguir PROMPT_BASE.md.

---

## CAPÍTULO

| Campo | Valor |
|-------|-------|
| Número | XX |
| Título EN | ... |
| Título ES | ... |
| Parte | ... |
| Cierre | Type X (ver 02_WRITING_PROTOCOL.md § VI) |
| Target | ~X,XXX-X,XXX palabras EN |
| Secciones | X-X párrafos cada una |

---

## CONTENIDO ASIGNADO

[Copiar de 03_BOOK_STRUCTURE_16_CHAPTERS.md]

---

## SESIONES DE RA RELEVANTES

[Tabla de sesiones — copiar de RA_THEMATIC_INDEX.md si ya existe]

| Tema | Sesiones clave | Notas |
|------|---------------|-------|
| ... | ... | ... |

---

## VERSIÓN 1 — QUÉ SUPERAR

[Análisis de la v1 existente. Si no hay v1, omitir esta sección.]

---

## RELACIÓN CON CAPÍTULOS ADYACENTES

[Qué profundiza el capítulo anterior y el siguiente.
Qué debe hacer ESTE capítulo en consecuencia.]

---

## EJECUTAR

Lee PROMPT_BASE.md → investiga → escribe → entrega:
1. `chXX_EN.json`
2. `chXX_glossary.json`
3. `chXX_provenance.json`

Traducción ES/PT: ejecutar por separado con `PROMPT_TRANSLATE.md`.
```

---

## DATOS POR CAPÍTULO

Referencia rápida para rellenar los prompts:

### Tipos de cierre (de 02_WRITING_PROTOCOL.md § VI):

| Capítulo | Tipo | Descripción |
|----------|------|-------------|
| 1 | A — Mystery | "Everything begins and ends in mystery" |
| 2 | D — Bridge | Puente al siguiente tema |
| 3 | B — Journey | Invitación al viaje |
| 4 | D — Bridge | Puente al siguiente tema |
| 5 | F — Recognition | Reconocimiento del lector |
| 6 | C — Love/Presence | Afirmación de presencia/amor |
| 7 | E — Action | Llamado suave a la acción |
| 8 | B — Journey | Invitación al viaje |
| 9 | D — Bridge | Puente al siguiente tema |
| 10 | E — Action | Llamado suave a la acción |
| 11 | D — Bridge | Puente al siguiente tema |
| 12 | C — Love/Presence | Afirmación de presencia/amor |
| 13 | F — Recognition | Reconocimiento del lector |
| 14 | E — Action | Llamado suave a la acción |
| 15 | F — Recognition | Reconocimiento del lector |
| 16 | A — Mystery | "Everything begins and ends in mystery" |

### Target de palabras por parte:

| Parte | Capítulos | Palabras/capítulo | Justificación |
|-------|-----------|-------------------|---------------|
| I (Fundamentos) | 1-3 | 4,000-5,000 | Base metafísica densa |
| II (Historia) | 4-7 | 5,000-7,000 | Narrativa extensa |
| III (Presente) | 8-9 | 4,000-5,000 | Conceptos profundos |
| IV (Mecanismos) | 10-13 | 4,000-6,000 | Detalle práctico creciente |
| V (Práctica) | 14-16 | 3,500-5,000 | Aplicación directa |

### Relaciones entre capítulos:

| Capítulo | Introduce (sin agotar) | Profundiza lo de... |
|----------|----------------------|-------------------|
| 1 | Marco completo de la creación | — (es el primero) |
| 2 | Creador, distorsiones, propósito | Ch1 (distorsiones, Logos) |
| 3 | Cada densidad en detalle | Ch1 (overview densidades) |
| 4 | Historia terrestre | Ch3 (ciclos de densidad) |
| 5 | Polaridad y dos caminos | Ch3 (la elección en 3ra) |
| 6 | Errantes | Ch5 (Confederación) |
| 7 | Cosecha | Ch5 (polarización), Ch3 (ciclos) |
| 8 | El velo del olvido | Ch4 (introducción contextual) |
| 9 | Muerte y entre-vidas | Ch8 (el velo) |
| 10 | Centros de energía en detalle | Ch3 (rayos asociados a densidades) |
| 11 | Catalizador y experiencia | Ch10 (bloqueos) |
| 12 | Yo Superior y guía | Ch10 (rayo índigo) |
| 13 | Libre albedrío y Ley de Confusión | Ch2 (Free Will), Ch5 (no intervención) |
| 14 | Camino del buscador | Todo lo anterior |
| 15 | Equilibrio y sanación | Ch10 (centros), Ch11 (catalizador) |
| 16 | El misterio permanece | Síntesis de todo |

---

## EJEMPLO: CÓMO SE VE UN PROMPT DE CAPÍTULO DIFERENTE

Ver `PROMPT_CH01.md` como ejemplo completo del formato. Para Ch2, la sección "Versión 1 — Qué superar" analizaría el `02.json` existente y su equivalente EN, y la tabla de sesiones vendría del RA_THEMATIC_INDEX.md.

---

*Guía v2.0 — Febrero 2026*
