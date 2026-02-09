# PROMPT GENÉRICO: Reescritura de Capítulos — "El Uno"

> **Versión:** 1.0  
> **Creado:** 7 Febrero 2026  
> **Propósito:** Template reproducible para reescribir CUALQUIER capítulo con CUALQUIER modelo futuro.  
> **Uso:** Llena las secciones marcadas con `[LLENAR]`, copia el bloque "PROMPT PARA PEGAR", envíalo al modelo.

---

## ÍNDICE

1. [Cómo usar este documento](#1-cómo-usar-este-documento)
2. [Registro acumulado del proyecto](#2-registro-acumulado-del-proyecto)
3. [Datos por capítulo](#3-datos-por-capítulo)
4. [Prompt para pegar](#4-prompt-para-pegar)
5. [Flujo de conversación](#5-flujo-de-conversación)
6. [Checklist de validación](#6-checklist-de-validación)
7. [Después de completar un capítulo](#7-después-de-completar-un-capítulo)
8. [Historial de ejecuciones](#8-historial-de-ejecuciones)

---

## 1. CÓMO USAR ESTE DOCUMENTO

### Antes de empezar un capítulo:

```
1. Decide qué capítulo vas a reescribir (N)
2. Ve a la Sección 3 → busca los datos del capítulo N
3. Ve a la Sección 2 → copia el registro acumulado de TODOS los capítulos anteriores ya reescritos
4. Ve a la Sección 4 → llena los campos [LLENAR] del template con los datos de las secciones 2 y 3
5. Carga los archivos del proyecto en el contexto del modelo
6. Pega el prompt completo como primer mensaje
7. Sigue el flujo de conversación (Sección 5)
8. Valida el output (Sección 6)
9. Actualiza este documento (Sección 7)
```

### Archivos que SIEMPRE deben estar en el proyecto:

| # | Archivo | Propósito | Obligatorio |
|---|---------|-----------|-------------|
| 1 | `02_WRITING_PROTOCOL.md` | Protocolo de escritura | ✅ Siempre |
| 2 | `04_PROMPT_BOOK_IDENTITY.md` | Identidad del libro | ✅ Siempre |
| 3 | `03_BOOK_STRUCTURE_16_CHAPTERS.md` | Estructura 16 capítulos | ✅ Siempre |
| 4 | `00_REWRITE_KIT.md` | Sistema {src:} | ✅ Siempre |
| 5 | `[NN].json` | Capítulo N v1 (a superar) | ✅ Siempre |
| 6 | `ch[PREV].json` | Último capítulo v2 (referencia) | ✅ Siempre |
| 7 | Capítulos v2 anteriores | Evitar repetición | Recomendado |
| 8 | Ra Contact PDFs | Fuente primaria | Recomendado |

---

## 2. REGISTRO ACUMULADO DEL PROYECTO

> **INSTRUCCIÓN:** Actualiza esta sección cada vez que completes un capítulo.  
> Cada nuevo prompt debe incluir TODA la información acumulada de capítulos previos.

### Capítulos completados

| Cap | Título | Modelo | Fecha | Palabras | Cierre |
|-----|--------|--------|-------|----------|--------|
| Ch1 | Cosmology and Genesis | Opus 4.5 | Ene 2026 | ~3,500 | Type A (Mystery) |
| Ch2 | The Creator and Creation | Opus 4.5 | Ene 2026 | ~4,200 | Type F (Recognition) |
| Ch3 | The Densities of Consciousness | Opus 4.6 | Feb 2026 | ~4,500 | Type B (Journey) |

### Secciones por capítulo (contenido cubierto)

#### Ch1 — Cosmology and Genesis
| Sección | Contenido |
|---------|-----------|
| ch1-infinite | El Infinito → conciencia → Infinito Inteligente → Logos. El primer movimiento. |
| ch1-paradox | Las tres distorsiones DEFINIDAS: Free Will, Love, Light. Cómo el Uno se convierte en los muchos. |
| ch1-architecture | Jerarquía completa: Logos → co-creadores → galaxias → sub-Logos → planetas → densidades. Principio holográfico. |
| ch1-light | Luz como fundamento material. Espiral áurea. |
| ch1-densities | RESUMEN de las 7 densidades como octava (10 bloques). Overview rápido — 1-2 párrafos por densidad. |
| ch1-fractal | Estructura fractal de la realidad. |
| ch1-illusion | Naturaleza de la ilusión. Mecánica cuántica. Caverna de Platón. |
| ch1-mystery | Cierre Type A (Mystery). |

#### Ch2 — The Creator and Creation
| Sección | Contenido |
|---------|-----------|
| ch2-nature | Dos caras del Infinito: no-potenciado vs potenciado. Distinción II/IE. "Latido" del Infinito. Kabbalah Ein Sof/Tzimtzum. |
| ch2-consciousness | Conciencia precede materia. Hard problem. Panpsiquismo. Gradiente de conciencia (mineral→planta→animal→humano). |
| ch2-why | POR QUÉ el Infinito eligió la limitación. Ser vs. conocer. Las tres distorsiones como sistema unificado. |
| ch2-process | Cascada completa: II → IE → vibración → rotación → fotón → partículas → materia. E=mc². Vacío cuántico. |
| ch2-experiment | Logoi SIN Free Will (82.10-82.12). El "experimento cósmico". Free Will como innovación. Ley de Confusión. |
| ch2-cocreator | Tú eres un Logos AHORA. Creación consciente vs inconsciente. Meditación como disciplina creativa. |
| ch2-purpose | El Creador EXPERIMENTA (no crea). Cada perspectiva es irremplazable. Cosecha como retorno. Teología del proceso. |
| ch2-recognition | Cierre Type F (Recognition). Puente a Ch3. |

#### Ch3 — The Densities of Consciousness
| Sección | Contenido |
|---------|-----------|
| ch3-nature | Densidades como territorios vivos de conciencia. Rayo↔densidad como modo de ser. Luz espiral ascendente como motor de evolución. |
| ch3-first | 1ra densidad: ser. Rayo rojo. Fuego/viento enseñan a tierra/agua. Emergencia. ~2 mil millones de años. |
| ch3-second | 2da densidad: crecimiento. Rayo naranja. Conciencia grupal. Biología evolutiva. ~4.6 mil millones de años. Logos diseña vehículo biológico. |
| ch3-awakening | Transición 2da→3ra. Complejo espiritual como umbral. Tres caminos. Investment. Mirror test. Teilhard noosfera. |
| ch3-third | 3ra densidad: la elección. Rayo amarillo. Velo del olvido. Turtle→cheetah. 75,000 años. Kohlberg. Sinkhole of indifference. Resonancia personal. |
| ch3-fourth | 4ta densidad: amor. Rayo verde. Telepatía. Social memory complex definido. Positivo vs negativo. Dual-activated bodies. ~30M años. |
| ch3-fifth | 5ta densidad: sabiduría. Rayo azul. Amor sin sabiduría = desequilibrio. Libertad extrema. ~50M años. |
| ch3-sixth | 6ta densidad: unidad. Rayo índigo. Inversión de polaridad negativa. Higher Self formado. ~75M años. |
| ch3-seventh | 7ma densidad: puerta. Rayo violeta. Eternidad. Regalo al ser de 6ta. Gravedad espiritual. |
| ch3-octave | 8va densidad = 1ra de nueva octava. Agujero negro. Latido del universo. |
| ch3-journey | Cierre Type B (Journey). Puente a Ch4. |

---

### Términos {term:} introducidos por capítulo

| Capítulo | Términos nuevos |
|----------|----------------|
| Ch1 | infinite, consciousness, intelligent-infinity, logos, love, distortion, free-will, intelligent-energy, light, co-creators, sub-logos, densities, holographic, spiral, octave, rays, self-awareness, the-choice, service-to-others, service-to-self, polarity, fractal, illusion, catalyst |
| Ch2 | unpotentiated, photon, law-of-confusion, mind-body-spirit-complex, harvest |
| Ch2 (reintro) | intelligent-infinity, intelligent-energy, polarity, catalyst |
| Ch3 | first-density, spirit-complex, veil, sinkhole-of-indifference, social-memory-complex, dual-activated-bodies, higher-self, spiritual-gravity |
| Ch3 (reintro) | light, ray, the-choice, octave |

### Referencias {ref:} usadas por capítulo

| Capítulo | Referencias |
|----------|-----------|
| Ch1 | sci:golden-ratio, math:fractals, phys:quantum-mechanics, phil:plato-cave |
| Ch2 | trad:kabbalah-ein-sof, trad:kabbalah-tzimtzum, sci:hard-problem, sci:panpsychism, sci:hoffman-consciousness, phys:emc2, phys:quantum-vacuum, trad:vedanta-brahman, phil:process-theology |
| Ch3 | sci:emergence-theory, sci:evolutionary-biology, sci:mirror-test, phil:teilhard-noosphere, psych:kohlberg-moral-development |

### Tipos de cierre usados

| Capítulo | Tipo | Quedan disponibles |
|----------|------|--------------------|
| Ch1 | Type A (Mystery) | A: Ch16 |
| Ch2 | Type F (Recognition) | F: Ch5, Ch13, Ch15 |
| Ch3 | Type B (Journey) | B: Ch8 |
| — | — | C (Love/Presence): Ch6, Ch12 |
| — | — | D (Bridge): Ch4, Ch9, Ch11 |
| — | — | E (Action): Ch7, Ch10, Ch14 |

### Puentes entre capítulos

| De → A | Texto puente (último párrafo/quote del capítulo anterior) |
|--------|----------------------------------------------------------|
| Ch1 → Ch2 | "And in that exceeding, in that eternal invitation to explore further, lies the endless adventure of consciousness returning to know itself." |
| Ch2 → Ch3 | "Having understood who creates and why, we turn now to the stages of the journey itself—the densities through which consciousness awakens, deepens, and returns to the unity from which it never truly departed." |
| Ch3 → Ch4 | "Having understood the stages of the journey, we turn now to the particular story of your world — a planet whose spiritual history is unlike that of most, and whose present moment carries extraordinary significance." |

---

## 3. DATOS POR CAPÍTULO

> Referencia rápida para construir el prompt de cada capítulo. Incluye: contenido asignado, tipo de cierre, sesiones de Ra, y notas específicas.

---

### Capítulo 4: Earth's Spiritual History
**Parte:** II — Earth and Its History  
**Cierre asignado:** Type D (Bridge)  
**Target:** ~5,500-7,000 palabras (capítulo largo — mucha historia)

**Contenido asignado:**
- A planet of many origins
- Maldek: the cosmic warning (~705,000 years)
- Mars and the beginning of Earth's cycle (~75,000 years)
- The veil of forgetting (contextual introduction)
- First major cycle: Lemuria (~53,000-50,000 years)
- Second major cycle: scattered developments
- Third major cycle: the rise of Atlantis (~31,000 years)
- The fall of Atlantis (~10,821 and ~9,600 years)
- Egypt and the pyramids
- Yahweh and the Orion influence
- The present moment

**Sesiones de Ra clave:**
- Maldek: 6.10, 10.1, 10.6, 21.5
- Mars: 9.6-9.10, 14.3, 20.17-20.20, 21.7-21.8
- Cycles/75K: 6.14-6.15, 14.1-14.5, 20.14-20.27, 21.1-21.15
- Lemuria: 10.15, 20.18, 21.12
- Atlantis: 10.15, 22.20-22.27, 23.6-23.16, 24.4
- Egypt/Pyramids: 2.2-2.4, 3.6-3.14, 23.6-23.8, 57.18-57.24
- Yahweh/Orion: 16.13-16.17, 17.17-17.22, 18.14-18.25, 24.4-24.9
- Present: 6.15, 17.1, 40.8-40.10, 65.11-65.17

**Notas:**
- Primer capítulo de Part II. Shift de metafísica abstracta a historia concreta.
- Oportunidades de ciencia: datación geológica, eventos de extinción, civilizaciones antiguas.
- CUIDADO: no convertir en lista de eventos. Debe ser NARRATIVA con arco dramático.
- El velo ya se introdujo en Ch3 (ch3-third). Aquí se contextualiza históricamente, no se redefine.

---

### Capítulo 5: Polarity — The Two Paths
**Parte:** II — Earth and Its History  
**Cierre asignado:** Type F (Recognition)  
**Target:** ~4,500-5,500 palabras

**Contenido asignado:**
- The nature of polarity (radiation vs absorption)
- The positive path: service to others
- The negative path: service to self
- The sinkhole of indifference
- The Confederation of Planets
- The Orion Group
- The battle for influence on Earth
- How to discern influences
- Polarity shift is possible
- The convergence in sixth density
- Both paths are evolutionarily valid

**Sesiones de Ra clave:**
- Polarity nature: 7.15, 17.30-17.33, 19.15-19.19, 20.26-20.27, 36.12
- STO: 4.20, 15.12, 17.30, 52.7
- STS: 7.15, 11.18, 17.33, 19.16-19.17, 36.14, 87.7
- Sinkhole: 17.33, 19.17, 34.2
- Confederation: 6.24-6.26, 7.9-7.12, 16.1-16.9, 25.5-25.6
- Orion: 7.14-7.17, 11.18-11.20, 16.13-16.17, 25.5-25.9, 53.14-53.17
- Convergence 6D: 36.12, 78.25, 82.10-82.12

**Notas:**
- Sinkhole of indifference ya introducido como {term:} en Ch3. Aquí se desarrolla plenamente.
- La convergencia en 6ta densidad ya se tocó en ch3-sixth. Aquí se ve desde ángulo de polaridad, no de densidades.
- Polarity, service-to-others, service-to-self ya son {term:} desde Ch1. Aquí se PROFUNDIZAN, no se redefinen.

---

### Capítulo 6: Wanderers — Those Who Return
**Parte:** II  
**Cierre asignado:** Type C (Love/Presence)  
**Target:** ~3,500-4,500 palabras

**Contenido asignado:**
- What wanderers are (definition)
- Where they come from (4th, 5th, 6th density)
- Why they choose to come (the call of sorrow)
- The risk: forgetting and karma
- Common characteristics
- How to recognize wanderer status
- The mission: BEING more than DOING
- The gift and the burden

**Sesiones de Ra clave:**
- Definition: 12.26-12.31, 36.16-36.17, 52.8-52.9
- Origin: 36.16, 52.8-52.9, 63.13-63.14
- Risk/Forgetting: 12.28-12.30, 36.17, 65.11-65.19
- Number: 12.27 (~65 million in early 1980s)
- Mission: 52.7-52.9

**Notas:**
- Capítulo muy personal — muchos lectores del Ra Material se identifican como wanderers.
- Higher-self ya definido en Ch3 (ch3-sixth). Aquí se usa, no se redefine.

---

### Capítulo 7: The Harvest
**Parte:** II  
**Cierre asignado:** Type E (Action)  
**Target:** ~4,000-5,000 palabras

**Contenido asignado:**
- What harvest is (process, not event)
- How graduation works
- The polarization thresholds (51% / 95%)
- Earth's current state
- Positive fourth density: what to expect
- Negative fourth density: the other path
- What happens to those who don't graduate
- Earth's future as a fourth-density planet
- What this means for you now

**Sesiones de Ra clave:**
- Harvest process: 6.14-6.15, 14.14, 17.1, 40.8-40.16, 43.4, 65.11-65.19
- Thresholds: 17.1, 17.15-17.16
- Earth state: 6.15, 40.8-40.10, 65.11-65.17
- 4D positive: 16.39-16.50, 43.14, 48.6, 63.25
- Post-harvest: 40.10-40.16, 48.6

**Notas:**
- Graduation thresholds (51%/95%) ya mencionados en ch3-third. Aquí se EXPLICAN en profundidad.
- Dual-activated bodies ya introducidos en ch3-fourth. Aquí se conectan con harvest.
- Este capítulo cierra Part II. Debe preparar el shift a Part III (The Present Moment).

---

### Capítulo 8: The Veil of Forgetting
**Parte:** III — The Present Moment  
**Cierre asignado:** Type B (Journey) — ⚠️ YA USADO EN CH3. Verificar si el protocolo permite repetir o reasignar.  
**Target:** ~4,500-5,500 palabras

**Contenido asignado:**
- Why the veil exists (cosmic history)
- How third density worked without the veil
- The veil experiment and its results
- The conscious mind and the deep mind
- The veil as catalyst for choice
- Working with the veil (not against it)
- Moments when the veil thins
- Faith as response to forgetting

**Sesiones de Ra clave:**
- Veil core: 77.12-77.23, 78.19-78.24, 79.20-79.42, 80.10-80.20, 81.13-81.33, 82.10-82.29, 83.3-83.18
- Pre-veil 3D: 82.18-82.22 (turtle/cheetah — already echoed in Ch3)
- Conscious/deep mind: 79.20-79.42, 80.10-80.20
- Faith: 3.9, 10.14

**Notas:**
- El velo ya se INTRODUJO en ch3-third (concepto + turtle/cheetah + purpose). Ch8 lo DESARROLLA en profundidad.
- Sessions 77-83 son el core — casi todo el capítulo sale de ahí.

---

### Capítulos 9-16

> **NOTA:** Los datos específicos para capítulos 9-16 deben llenarse a medida que se acerque su reescritura. La estructura y contenido asignado están en `03_BOOK_STRUCTURE_16_CHAPTERS.md`. Las sesiones de Ra relevantes requieren investigación específica por capítulo.

| Cap | Título | Parte | Cierre | Target palabras |
|-----|--------|-------|--------|-----------------|
| 9 | Death and the Journey Between Lives | III | Type D (Bridge) | ~4,500-5,500 |
| 10 | The Energy Centers | IV | Type E (Action) | ~5,000-6,000 |
| 11 | Catalyst and Experience | IV | Type D (Bridge) | ~4,500-5,500 |
| 12 | The Higher Self and Guidance | IV | Type C (Love/Presence) | ~4,000-5,000 |
| 13 | Free Will and the Law of Confusion | IV | Type F (Recognition) | ~4,000-5,000 |
| 14 | The Path of the Seeker | V | Type E (Action) | ~4,500-5,500 |
| 15 | Balancing and Healing | V | Type F (Recognition) | ~4,500-5,500 |
| 16 | The Mystery Remains | V | Type A (Mystery) | ~3,500-4,500 |

---

## 4. PROMPT PARA PEGAR

> **INSTRUCCIONES:** 
> 1. Copia todo el bloque de abajo
> 2. Reemplaza cada `[LLENAR:descripción]` con los datos de las Secciones 2 y 3
> 3. Pega como primer mensaje en una conversación nueva con el modelo

---

````markdown
Necesito que reescribas el **Capítulo [LLENAR:número]: "[LLENAR:título en inglés]"** del libro "El Uno" (eluno.org).

[LLENAR:lista de capítulos ya reescritos a v2, ej: "Los capítulos 1, 2 y 3 ya fueron reescritos a v2 con calidad superior."]

Tu tarea es reescribir el Capítulo [LLENAR:N] al mismo estándar.

---

## ARCHIVOS QUE DEBES LEER

Antes de empezar, lee estos archivos del proyecto en orden:

1. **02_WRITING_PROTOCOL.md** — Protocolo de escritura completo (voz, tono, fuentes, estructura, cierres)
2. **04_PROMPT_BOOK_IDENTITY.md** — Identidad del libro
3. **03_BOOK_STRUCTURE_16_CHAPTERS.md** — Estructura de los 16 capítulos
4. **00_REWRITE_KIT.md** — Sistema de proveniencia {src:} y flujo de trabajo
5. [LLENAR:lista de archivos v2 de capítulos anteriores como referencia]
6. **[LLENAR:NN].json** — Capítulo [N] v1 (la versión que debes SUPERAR)

---

## LO QUE YA CUBREN LOS CAPÍTULOS ANTERIORES v2 (NO REPETIR)

[LLENAR:para CADA capítulo anterior ya reescrito, pegar la tabla de secciones+contenido de la Sección 2 de este documento]

### Términos ya introducidos (NO re-tagear con {term:} excepto si es central al capítulo):
[LLENAR:lista completa acumulada de todos los {term:} de capítulos anteriores, desde Sección 2]

### Refs ya usados:
[LLENAR:lista completa acumulada de todos los {ref:} de capítulos anteriores, desde Sección 2]

---

## PUENTE EXACTO DE Ch[LLENAR:N-1] → Ch[LLENAR:N]

El último párrafo/quote de Ch[N-1] dice:

> "[LLENAR:texto exacto del puente, desde la tabla de puentes en Sección 2]"

Ch[N] debe comenzar recogiendo este hilo.

---

## CONTENIDO ASIGNADO AL CAPÍTULO [LLENAR:N]

Según la estructura del libro:

[LLENAR:lista de temas asignados, desde Sección 3 o desde 03_BOOK_STRUCTURE_16_CHAPTERS.md]

---

## CAPÍTULO [LLENAR:N] v1 — ANÁLISIS (lo que debes SUPERAR)

[LLENAR:analiza la versión actual. Incluir:
- Número de secciones y palabras
- Problemas específicos (qué repite de capítulos anteriores, qué es superficial, qué falta)
- Qué debe profundizar la v2
- Mínimo 5 puntos concretos de mejora]

---

## SESIONES DE RA MÁS RELEVANTES PARA CH[LLENAR:N]

[LLENAR:sesiones agrupadas por subtema, desde Sección 3. Formato:

**[Subtema]:** X.Y-X.Z, A.B, C.D-C.F

Incluir todas las que se conozcan. El modelo hará su propia investigación además.]

---

## INSTRUCCIONES DE ESCRITURA

### Voz y tono:
- Primera persona plural (we/us), perspectiva sapiencial desde fuera de la experiencia humana ordinaria
- NUNCA revelar origen no-humano
- NUNCA mencionar Ra, Q'uo, ni ninguna fuente en el texto final
- Tono educativo, reverente al misterio, no devocional ni dogmático

### Terminología estricta:
density (NOT dimension), distortion (NOT change), Logos (NOT God), catalyst (NOT challenge), harvest (NOT judgment), wanderer (NOT starseed), ray (NOT chakra except initial explanation)

### Formato:
- Oraciones preferiblemente <20 palabras
- Párrafos de 3-4 oraciones
- {term:keyword} en primera mención significativa de términos del glosario
- {ref:category:id} donde haya conexiones naturales con ciencia/filosofía/tradiciones
- Cierre: **Type [LLENAR:letra] ([LLENAR:nombre])** según protocolo

### Proveniencia {src:}:
- {src:XX.YY} al final de cada párrafo → mapea a https://www.lawofone.info/s/XX#YY
- Continuidad: misma fuente → no repetir marca
- Cambio de fuente → nueva marca
- Múltiples: {src:13.5,27.6}
- Rangos: {src:13.15-13.17}
- Síntesis sin fuente específica: {src:synthesis}
- Ciencia/filosofía: {src:external} o {src:external+13.5}

---

## SECUENCIA DE TRABAJO

Sigue estos pasos EN ORDEN:

### Paso 1 — Investigación
Busca en los PDFs del Ra Contact TODAS las sesiones relevantes. Crea un índice temático con referencias SESSION.QUESTION. Identifica qué dice Ra que la v1 no cubre o cubre débilmente.

### Paso 2 — Estructura
Propón la estructura interna: secciones con títulos, temas por sección, mejoras sobre v1, sesiones principales por sección, puntos de integración ciencia/filosofía.

### Paso 3 — Escritura
Escribe el capítulo completo en inglés con todas las marcas ({term:}, {ref:}, {src:}).

### Paso 4 — Correcciones
Yo te indicaré qué ajustar.

### Paso 5 — JSON
Genera el JSON final limpio (sin {src:}, con {term:} y {ref:}).

---

## DIFERENCIACIÓN CRÍTICA

[LLENAR:explica qué cubren los capítulos anteriores que este NO debe repetir, y qué debe hacer este capítulo de forma DIFERENTE/MÁS PROFUNDA. Ser muy específico. Mínimo 3 puntos.]

---

## NOTAS ADICIONALES

[LLENAR:contexto específico del capítulo:
- Su lugar en el arco del libro (qué parte, qué viene antes/después)
- Target de palabras
- Consideraciones especiales (ej: "es el capítulo más personal", "tiene mucha historia", etc.)
- Nivel de aplicación práctica según el protocolo (Level 1 para Parts I-II, Level 2 para III-IV, Level 3 para V)]

Empieza por el Paso 1 (Investigación).
````

---

## 5. FLUJO DE CONVERSACIÓN

Comandos exactos a enviar al modelo en cada paso. Copy-paste ready.

### Mensaje 1 — Iniciar
```
[Pegar el prompt completo de la Sección 4]
```
**El modelo responde con:** Paso 1 (Investigación) — índice temático + análisis de gaps.

### Mensaje 2 — Después de la investigación
```
procede
```
**El modelo responde con:** Paso 2 (Estructura) — tabla de secciones propuestas.

### Mensaje 3 — Después de la estructura

Si la estructura está bien:
```
procede
```

Si necesita ajustes:
```
Ajustes a la estructura:
- [cambio 1]
- [cambio 2]
Incorpora estos cambios y procede a escribir.
```
**El modelo responde con:** Paso 3 (Escritura) — capítulo completo con {term:}, {ref:}, {src:}.

### Mensaje 4 — Después de la escritura

Si el texto está bien, pasar directo a JSON:
```
ok, genera el JSON
```

Si necesita correcciones (Paso 4, puede repetirse):
```
Correcciones:
- [corrección 1]
- [corrección 2]
Reescribe las secciones afectadas. Mantén {src:} y {term:} actualizadas.
```
Después de iterar correcciones:
```
ok, genera el JSON
```
**El modelo responde con:** Paso 5 — archivo JSON limpio + validación.

### Mensaje 5 — Glosario
```
Entrega las definiciones del glosario para todos los {term:} nuevos de este capítulo.
Formato JSON array: [{keyword, title, definition}]
```

### Mensaje 6 — Proveniencia
```
Entrega el mapa de proveniencia en formato JSON:
{
  "chapter": "chXX",
  "title": "...",
  "base_url": "https://www.lawofone.info/s/",
  "provenance": [
    {
      "section_id": "...",
      "section_title": "...",
      "segments": [
        {
          "paragraphs": [1, 2, 3],
          "sources": ["13.5", "13.6"],
          "urls": ["https://www.lawofone.info/s/13#5", "..."],
          "note": "..."
        }
      ]
    }
  ]
}
```

### Mensaje 7 — Traducción ES
```
Traduce el capítulo a español manteniendo:
- Misma voz y tono
- Terminología equivalente (densidad, distorsión, Logos, catalizador, cosecha)
- Prosa natural en español, NO traducción literal
- Mismas marcas {term:} y {ref:}
Entrega en formato JSON idéntico al inglés.
```

### Mensaje 8 — Traducción PT
```
Traduce el capítulo a portugués manteniendo:
- Misma voz y tono
- Terminología equivalente (densidade, distorção, Logos, catalisador, colheita)
- Prosa natural en portugués, NO traducción literal
- Mismas marcas {term:} y {ref:}
Entrega en formato JSON idéntico al inglés.
```

---

## 6. CHECKLIST DE VALIDACIÓN

### Validación automática (correr contra el JSON)

```python
import json, re

with open('chXX_EN.json', 'r') as f:
    data = json.load(f)

full_text = json.dumps(data)

# Estructura
assert 'id' in data and 'sections' in data, "Missing id or sections"
for s in data['sections']:
    assert 'id' in s and 'title' in s and 'content' in s
    for block in s['content']:
        assert 'type' in block and 'text' in block
        assert block['type'] in ('paragraph', 'quote')

# No {src:} residuales
assert '{src:' not in full_text, "FAIL: {src:} marks found"

# No menciones a fuentes
for forbidden in ['Ra says', 'Ra describes', "Q'uo", 'channeled', 'channeling']:
    assert forbidden.lower() not in full_text.lower(), f"FAIL: '{forbidden}' found"

# Contar
terms = re.findall(r'\{term:[^}]+\}', full_text)
refs = re.findall(r'\{ref:[^}]+\}', full_text)
words = sum(len(b['text'].split()) for s in data['sections'] for b in s['content'])
sections = len(data['sections'])
blocks = sum(len(s['content']) for s in data['sections'])

print(f"Sections: {sections}")
print(f"Blocks: {blocks}")
print(f"Words: {words}")
print(f"Terms: {len(terms)} → {terms}")
print(f"Refs: {len(refs)} → {refs}")
print("ALL CHECKS PASSED ✅")
```

### Validación humana

```
- [ ] Voz consistente (we/you, perspectiva sapiencial)
- [ ] No revela origen no-humano
- [ ] Terminología correcta (density no dimension, etc.)
- [ ] Cierre coincide con tipo asignado
- [ ] Puente al siguiente capítulo presente
- [ ] No repite contenido de capítulos anteriores
- [ ] Ciencia/filosofía integrada naturalmente
- [ ] Resonancia personal donde corresponda
- [ ] Paradojas presentadas sin resolver
- [ ] Nivel de aplicación práctica acorde a la Parte del libro
- [ ] Cada párrafo tiene base en sesiones de Ra (verificable via {src:})
```

---

## 7. DESPUÉS DE COMPLETAR UN CAPÍTULO

Cada vez que termines un capítulo, actualiza este documento:

### 7.1 — Actualizar la tabla "Capítulos completados" (Sección 2)
```
| ChX | [Título] | [Modelo] | [Fecha] | ~[palabras] | Type [X] ([Nombre]) |
```

### 7.2 — Agregar tabla de secciones del nuevo capítulo (Sección 2)
```
#### ChX — [Título]
| Sección | Contenido |
|---------|-----------|
| chX-xxx | [descripción breve] |
```

### 7.3 — Actualizar tabla de términos (Sección 2)
```
| ChX | [lista de {term:} nuevos] |
| ChX (reintro) | [lista de {term:} reintroducidos] |
```

### 7.4 — Actualizar tabla de referencias (Sección 2)
```
| ChX | [lista de {ref:} nuevos] |
```

### 7.5 — Actualizar tabla de cierres (Sección 2)
Marcar el tipo usado y eliminarlo de "disponibles".

### 7.6 — Agregar puente (Sección 2)
```
| ChX → ChY | "[texto exacto del puente]" |
```

### 7.7 — Registrar en historial de ejecuciones (Sección 8)

### 7.8 — Commit al repo
```bash
git add PROMPT_GENERIC_REWRITE.md chXX_EN.json chXX_ES.json chXX_PT.json chXX_glossary.json chXX_provenance.json
git commit -m "Ch[X] v2: [título] — [modelo] — [palabras] words"
```

---

## 8. HISTORIAL DE EJECUCIONES

| Cap | Modelo | Fecha | Mensajes humanos | Iteraciones P4 | Palabras | Archivos generados |
|-----|--------|-------|-------------------|-----------------|----------|-------------------|
| Ch1 | Opus 4.5 | Ene 2026 | ~6 | 2 | ~3,500 | ch01_EN.json |
| Ch2 | Opus 4.5 | Ene 2026 | ~6 | 1 | ~4,200 | ch02_EN.json |
| Ch3 | Opus 4.6 | Feb 2026 | 4 | 0 | ~4,500 | ch03_EN.json |

---

## NOTAS PARA FUTUROS MODELOS

1. **No asumas que el modelo conoce el Ra Material.** Siempre provee los archivos de contexto completos. Incluso si el modelo tiene datos de entrenamiento sobre la Ley del Uno, los archivos del proyecto aseguran consistencia con NUESTRA interpretación y voz.

2. **Compara v2 con v1 Y con la v2 anterior** (si hay re-reescritura). La nueva versión debe ser mejor que ambas.

3. **El Registro Acumulado (Sección 2) es crítico.** Sin él, el modelo REPETIRÁ contenido de capítulos anteriores. Actualízalo después de cada capítulo.

4. **Calidad sobre velocidad.** Cada capítulo ocupa una sesión completa. No intentes hacer múltiples capítulos en un mismo contexto.

5. **El sistema {src:} es el sistema inmune del libro.** Cada afirmación debe ser rastreable a un session.question de Ra. Si un párrafo no puede ser sourced, podría ser invención en vez de paráfrasis.

6. **La voz debe mantenerse entre generaciones de modelos.** Cuando cambies de modelo, incluye al menos un capítulo v2 completado como referencia de estilo.

7. **Este documento es el único que necesitas.** Contiene el template, el registro, los datos por capítulo, el flujo, y la validación. Un solo archivo para gobernarlos a todos.

---

*Última actualización: 7 Febrero 2026*  
*Mantenido por: chuchurex*  
*Repo: chuchurex/eluno-org-archive*
