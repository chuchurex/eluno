# Jerarquía de fuentes

> Reglas accionables condensadas. Fuente extensa: `writing/protocol/source-hierarchy.md`.

## Regla de oro

> **Q'uo helps you understand Ra. Ra is the book's only voice.**

## Tabla de prioridades

| Prioridad | Fuente | Disponible en skill | Uso en texto final |
|---|---|---|---|
| 1 | **Ra Contact Vol 1-2** (sesiones 1–106) | ✅ `corpus/sessions/` (106 archivos) | ✅ Parafraseado, **nunca citado textualmente** |
| 2 | **Q'uo capa 1** (vol 8-18, 1986–2008) | ✅ `corpus-quo/sessions/` (562 archivos) | ❌ **Nunca aparece en el texto final** (excepto Sanación, ver abajo) |
| 3 | **Otros canalizados Confederation** (Hatonn, Latwii, Aaron, Oxal, Nona, Monka, Laitos) | ⏳ Capa 2, pendiente | ❌ No usar hasta capa 2 |
| 4 | **Tradiciones cruzadas** (Vedanta, Kabbalah, gnosticismo, hermetismo) | n/a (referencia externa) | ✅ Como enriquecimiento, vía marcado `{ref:trad:id}` |
| 5 | **Ciencia moderna** | n/a (referencia externa) | ✅ Cuando es naturalmente relevante, vía `{ref:phys:id}` o `{ref:astro:id}` |

## Uso del marcado por tipo

- `{src:N.M}` — ancla a una pregunta específica del Material Ra (ej. `{src:27.5}`).
  Va dentro del JSON de provenience, no en el texto visible.
- `{ref:cat:id}` — referencia a fuente externa por categoría.
  Categorías permitidas: `phys`, `astro`, `phil`, `trad`, `text`, `math`. Ver `writing/protocol/references.json`.
- `{term:slug}` — término del glosario propio del libro.
  Slug en kebab-case minúscula: `intelligent-infinity`, `mind-body-spirit-complex`. Nunca con espacios ni mayúsculas.

## Por qué Q'uo no aparece en El Uno (justificación operativa)

El proyecto opera dentro del marco interno del propio Material Ra:

- **Ra es 6ª densidad**, comunicó directamente en inglés a través de un instrumento entrenado, con mínima interpretación del canal.
- **Q'uo es un grupo confederado de 4ª-5ª densidad**, transmitido a través de una canalización con mayor distorsión por el filtro humano.
- Por lo tanto, dentro del marco del propio material, **Ra es la fuente con menor distorsión disponible**. Q'uo es contexto que ayuda a entender, no fuente directa que se cita.

Esto **no** es una afirmación sobre verdad metafísica. Es una decisión editorial coherente con el marco que el proyecto eligió respetar.

## Permisos por libro

Cada libro de la familia ajusta cuánto de esta regla se relaja:

| Libro | Q'uo permitido | Tradiciones cruzadas | Ciencia moderna |
|---|---|---|---|
| **El Uno** | No (silencio total) | Mínimo, solo cuando enriquece sin distraer | Mínimo |
| **Todo** | No | Más libre, para acercar a audiencia general | Más libre |
| **Jesús** | No (Q'uo tiene material cristológico pero se silencia) | Evangelios canónicos como ancla principal cristiana | Mínimo |
| **Sanación** | **Sí, con voz** — es el único libro donde Q'uo puede aparecer parafraseado | Tradiciones de sanación (no genéricas New Age) | Cuando la práctica lo requiere |
| **Doctrinas** | No | Doctrinas eclesiásticas como objeto de análisis (no autoridad) | Mínimo |
| **Dormidos** | No | **Gurdjieff/Ouspensky/Mouravieff con voz** vía ontología puente | Mínimo |

## Reglas anti-distorsión

1. **Si una idea no se rastrea a una sesión Ra concreta**, no entra al texto final. Se marca con `{TODO: ancla en Ra}` durante la escritura y se resuelve antes de cerrar.

2. **Si una idea solo aparece en Q'uo y no en Ra**, en libros que no lo permitan (todos excepto Sanación) **se descarta**, no se reescribe sin atribución.

3. **Si una sesión Ra está documentada como comprometida** (interferencia, instrumento enfermo, etc.), su material se usa con cautela y se cruza con sesiones limpias antes de incluir.

4. **Si una tradición externa ofrece una metáfora útil** (ej. el Atman vedanta, el Ein Sof kabbalístico, el Logos griego, el plenum de Spinoza), se cita con `{ref:trad:id}` o `{ref:phil:id}`, **nunca como fuente de doctrina**, solo como resonancia.

5. **No se mezclan vocabularios** entre tradiciones distintas en la misma frase. Ra dice "densidades", no "dimensiones". El libro habla de "densidades". Si se introduce un término externo, queda explícitamente como metáfora ajena, no como sinónimo.

## Lo que el lector nunca debe deducir

- Que el libro está canalizado.
- Que el narrador es no humano.
- Que existe un grupo histórico (L/L Research) detrás.
- Que hay competencia entre fuentes.
- Que el libro recomienda creer en algo.

Si una frase del texto delata cualquiera de las cinco cosas anteriores, está mal escrita y debe reescribirse.
