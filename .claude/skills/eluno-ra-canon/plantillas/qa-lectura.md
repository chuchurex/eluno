# Plantilla: QA de lectura

> QA condensado del protocolo en `writing/protocol/qa-protocol.md` (193 líneas).
> Esta versión cubre las 9 categorías críticas como checklist accionable.
> Se ejecuta sobre un capítulo recién escrito (post-`nuevo-capitulo.md`)
> y antes de integrar al repo.

## Modo de lectura

**No estás verificando fidelidad a Ra** (eso ya se hizo durante la escritura).
Estás leyendo el texto **como un lector que lo ve por primera vez**, buscando errores
de experiencia de lectura que el escritor no ve porque está inmerso en la creación.

## Categorías de QA

### A) Referencias fantasma (`{ref:cat:id}`)

Toda marca `{ref:category:id}` debe existir como clave en `writing/protocol/references.json`.

**Verificación:**

1. Extraer todas las marcas `{ref:...}` del capítulo.
2. Verificar que la categoría es válida: `phys`, `astro`, `phil`, `trad`, `text`, `math`.
3. Verificar que el id existe en `references.json`.

**Error típico:** escribir `{ref:phys:spiral-galaxies}` cuando la clave real es `astro:spiral-galaxies`.

### B) Nombres propios fantasma

Si introduces un nombre propio (filósofo, científico, libro, tradición), debe:

- O bien existir en `references.json` como entrada formal con su `{ref:trad:nombre}` o `{ref:phil:nombre}`.
- O bien presentarse como mención general que no requiere referencia (raro; preferir referencias).

**Error típico:** mencionar a "Spinoza" sin marcado, perdiendo trazabilidad. O peor: mencionar a "Carl Jung" sin que el libro haya decidido si Jung es referencia válida.

### C) Marcado `{term:}` duplicado o roto

- El primer uso de un término en el capítulo lleva `{term:slug}`.
- Usos sucesivos del mismo término en el mismo capítulo: NO repetir `{term:}` (visualmente cansa al lector).
- Variaciones flexivas (plural, género): la `s` del plural va FUERA del marcado: `{term:distortion}s`, no `{term:distortions}`.

**Error típico:** usar `{term:distortions}` cuando la entrada del glosario es `distortion` (sustantivo singular).

### D) Contenido repetido entre secciones

El cap debe avanzar, no rotar. Si dos secciones dicen "lo mismo con palabras distintas", **una de las dos sobra**.

**Indicadores:**

- El lector podría saltar de la sección 2 a la 4 sin perder nada de la 3.
- La misma idea aparece en frases casi idénticas en dos secciones distintas.
- El cierre de la sección 3 anticipa el contenido de la sección 4 sin transición.

### E) Voz y otredad

Verificar que el "we/you" se sostiene como voz exterior a la experiencia humana:

✅ "Your planet is unlike most worlds." → narrador habla a humanos desde fuera.
❌ "Our planet is unlike most worlds." → narrador se identifica como humano. Inconsistente.

✅ "We watch your harvest with great interest." → tercera persona narrativa estable.
❌ "Ra watches your harvest..." → atribución prohibida.

### F) Coherencia narrativa

- ¿Las ideas progresan en el orden lógico?
- ¿Las transiciones entre secciones son explícitas o el lector se pierde?
- ¿El cierre del capítulo conecta con la entrada o queda colgando?

### G) Oraciones y párrafos

- **Párrafos**: 5-8 oraciones cada uno (excepción: párrafo de cierre puede ser corto).
- **Oraciones**: variar longitud. Una secuencia de 5 oraciones largas seguidas cansa.
- **Una idea por párrafo**. Si un párrafo tiene 3 ideas, dividir.
- **Cero párrafos de una sola oración** salvo intención clara (cierre).

### H) Terminología

- ¿Se usa `density` consistentemente, no `dimension` ni `level`?
- ¿Se usa `catalyst` para experiencias formativas, no `challenge`?
- ¿Se usa `harvest` para el ciclo de elección, no `judgment` ni `rapture`?
- ¿Se usa `wanderer` para entidades que vienen a ayudar, no `starseed`?
- Excepción: cuando una palabra prohibida aparece en sentido metafórico legítimo
  (`spiritual dimension`, `the challenge of doing X`), evaluar caso por caso.

### I) Atribuciones prohibidas

Verificar que el texto NO contenga:

- Ra, Q'uo (como nombres del narrador o de la fuente).
- Don Elkins, Carla Rueckert, Jim McCarty.
- "channeled", "channeling", "channeled material", "the sessions", "the instrument".
- "L/L Research".
- "Law of One" como referencia al título del libro original (uso filosófico OK: "the law of one as principle").
- Patrones "We, those of [grupo]" o "We of [grupo]" — primera persona identificada con grupo.

## Formato del reporte de QA

```markdown
## QA de lectura — Capítulo [N]: [Título]

### BUGS (rompen rendering)
- [archivo, sección, línea]: [descripción]

### ISSUES NARRATIVOS (afectan experiencia de lectura)
- [archivo, sección]: [descripción]

### ISSUES DE PROTOCOLO (violan las reglas)
- [archivo, sección]: [descripción]

### OBSERVACIONES (mejoras opcionales)
- [archivo, sección]: [descripción]

### VEREDICTO
- [ ] ✅ Aprobado para integración
- [ ] ⚠️  Aprobado con correcciones menores aplicadas
- [ ] ❌ Requiere reescritura de [secciones]
```

## Validación automatizada complementaria

Antes del QA humano, correr:

```bash
node .claude/skills/eluno-ra-canon/scripts/validate-chapter.mjs i18n/en/chapters/NN.json --json
```

El output JSON cubre las categorías A, C parcial, H, I. El QA humano cubre B, D, E, F, G y los matices contextuales.

## Lo que el QA NO hace

- **No verifica fidelidad a Ra.** Eso se hizo durante escritura.
- **No reescribe.** Solo identifica. La reescritura es decisión separada.
- **No commitea.** El veredicto es input para que el operador decida.
