# TODO

## Auditoría de fidelidad Ra: anclas, índice temático y prosa (16 capítulos)

Origen: el 2026-10-07, al armar los mapas de fuentes del libro de centros energéticos
(`eluno-books/packages/centros/writing/reference/mapa-fuentes-*.md`), aparecieron anclas cruzadas
en el índice temático (sección Ch10). La revisión del cap. 10 confirmó que el problema no se queda
en el índice: el ancla equivocada a veces arrastró una afirmación equivocada a la prosa publicada.
El índice alimentó la escritura de los 16 capítulos, así que hay que auditarlos todos.

### Alcance medido (2026-10-07)

- 16 capítulos, 763 segmentos de provenance, 1056 anclas (420 únicas), 50 segmentos `synthesis`.
- Índice temático: 157 filas.
- Chequeo estructural: todas las anclas existen en el corpus; ningún párrafo fuera de rango; EN/ES/PT alineados.
  Pendientes estructurales: ch02 usa `section_id` `ch2-*` que no calzan con el JSON del capítulo;
  hay párrafos sin ancla en ch08 (5), ch09 (15) y ch11 (8).
- Inconsistencia interna ya detectada: ch10 (Blockages P5) dice que la meta del equilibrio es el
  "flujo sin impedimento"; ch15 (What Balance Means P2) lo dice bien según 42.2 ("becoming unswayed").

### Criterios de auditoría (por segmento)

Cada segmento se clasifica según cuatro criterios:
- **A. Ancla incorrecta**: el pasaje Ra no dice lo que el párrafo le atribuye (rayo, densidad o tema cruzado).
- **B. Prosa sin sostén**: el párrafo afirma algo que ninguna ancla sostiene, o que solo sostenía un ancla equivocada.
- **C. Prosa contra Ra**: el párrafo contradice a Ra (ej.: 42.2) o a otro capítulo.
- **D. Ancla faltante o mejor**: el párrafo es correcto, pero hay un ancla más precisa o falta una (ej.: cita literal de 34.16 anclada en 41.19).
- Gravedad: **alta** (C, o B con doctrina equivocada), **media** (B por generalización), **baja** (A y D sin efecto en la prosa).

### Fase 0. Herramienta (reutilizable)

- [x] `writing/tools/audit-provenance.cjs <NN|all> [--out] [--check]`: vuelca por segmento el párrafo EN y el texto Ra completo
  de cada ancla, y hace el chequeo estructural. Dumps en `workspace/audit/chNN-dump.md`.
- [ ] ch02: el provenance está obsoleto (describe 8 secciones de una versión anterior; el capítulo actual tiene otras 7). Hay que rehacerlo entero.
- [ ] Anclar los párrafos sueltos de ch08 (5), ch09 (15) y ch11 (8, todos son el P1 de apertura de cada sección).
- [ ] Ojo: el commit 4d03c56 (revisión editorial de 15 capítulos) es posterior a varios provenance; puede haber índices de párrafo corridos.
- [x] Script de parche por párrafo (EN/ES/PT): `scripts/patch-paragraphs.js`.
- [x] Corpus Ra: falsa alarma. 74.11 está completo ("One, know yourself. Two, accept yourself. Three, become the Creator."); las listas van en palabras, no numeradas.

### Fase 1. Capítulo 10 (hecho: commit a0ec460, 2026-10-08)

Prosa EN por reescribir:
- [x] Blockages P4-P5: reescribir según 42.2 y 42.9 (meta: no inmutarse; la represión opaca los centros
  y depolariza). Quitar "stagnates... centers above are starved". Dejarlo coherente con ch15.
- [x] Red P3: quitar "in second density red ray manifests as movement and survival" (41.14 lo dice del naranja).
- [x] Spectrum P6: quitar "each center... radiates" (15.12 y 54.31: la radiación empieza en el azul).
- [x] Indigo P3: acotar lo sacramental (32.6 habla del acto sexual; 49.6 lo pone en el último peldaño).
- [x] Indigo P5: anclar en 50.13 y 39.10; sacar "In green ray, thoughts are beings".
- [x] Indigo P7: "each visualization begins with some work within the indigo" (73.10), no "all work of the spirit".
- [x] Violet P6: quitar "not activated in ordinary experience".

Provenance:
- [x] Red P3: quitar 41.14, agregar 31.4.
- [x] Blue P8: cambiar 39.12 por 47.3-4 (47.4: "moving directly to the gateway indigo").
- [x] Indigo P5: cambiar 50.9 por 50.13 y 39.10.
- [x] Violet P4: +34.16. Yellow P3: +41.14. Blockages P8: +42.2.
- [x] Menores: Orange P3 +32.2; Green P7 +26.38; Blue P6 +26.38; Blue P7 +54.31; Indigo P4 +15.12; Violet P1 y P3 +39.10.

### Fase 2. Auditoría de los 15 capítulos restantes

- [ ] Correr la herramienta de la Fase 0 por capítulo y revisar cada segmento con los criterios A-D.
  Se puede repartir en paralelo (un agente de solo lectura por capítulo); el resultado de cada uno va a `workspace/audit/chNN.md`.
- [ ] Orden por riesgo: primero 11, 13, 14 y 15 (catalizador, equilibrio, libre albedrío y práctica comparten 42.x, 46.x y 49.x con el 10),
  después 3, 5, 7 y 12 (densidades, cosecha, polaridad, Yo Superior), y al final el resto.
- [ ] Verificar uno por uno, contra el corpus, los hallazgos de gravedad alta y media antes de aceptarlos (los agentes pueden equivocarse).
- [ ] Revisar la coherencia entre capítulos: la misma doctrina dicha distinto en dos capítulos (como pasa con 10 y 15).

### Estado Fase 2 (2026-10-07)

- [x] Auditoría de los 16 capítulos terminada: 31 hallazgos de gravedad alta (verificados), 190 de media y 284 de baja.
  Resumen y errores transversales en `workspace/audit/CONSOLIDADO.md`; detalle en `workspace/audit/chNN-findings.md`.
- [ ] Corregir capítulo por capítulo (decisión 1). Los errores transversales se corrigen con una sola formulación (tabla del consolidado).

### Fase 3. Índice temático completo

- [ ] De 35 frases entre comillas en el índice, 22 no existen textuales en Ra. Regla: sin comillas salvo cita literal verificada.

- [ ] Ch10: reescribir las filas de rayos y bloqueos con las tablas de `centros` (incluye lo del TODO original, más amarillo con 41.14 y 41.25
  y violeta con la "lectura" en 39.10/48.7/51.8/54.30 y "no se manipula" en 15.12).
- [ ] Las 157 filas, aunque no las use ningún capítulo: el índice es la base de los libros hermanos y de los que vengan.
  Usar también las correcciones de `centros/mapa-fuentes-11-14.md` (ej.: 47.8 no describe la cosecha; 85 no trata la sexualidad).

### Fase 4. Aplicar correcciones

Estado (2026-10-09): por decisión de Carlos se aplica todo en la rama `audit/fidelidad-ra`, un commit por capítulo,
sin aprobación previa por capítulo. Carlos revisa después escuchando los capítulos completos
(`workspace/audit/audio/capitulos/chNN-es.mp3`). Fuente de cada parche: `workspace/audit/patches/chNN-src.json`
(items con motivo, provenance, descartados y decisiones de los agentes); detalle legible en `workspace/audit/chNN-propuesta.md`.

Pendientes que salieron al aplicar:
- [ ] Glosario EN/ES/PT: `distortion`, `sub-logos` y `fractal` repiten afirmaciones que se quitaron del cap. 1 (prisma, "stars are sub-Logos").
- [ ] ES cap. 3 cuarta densidad P5 usa `{term:understanding}`, que no existe en el glosario.
- [ ] Índice temático cap. 8, fila 3: "cada función amplificada" pasa a "alterada en su cualidad" (83.3).
- [ ] Revisar las `decisiones` de cada `chNN-src.json` (criterio de los agentes sobre las dudas de la sección 4).

- [ ] Provenance: cambios mecánicos, por script, un capítulo a la vez.
- [ ] Prosa EN: borrador de los párrafos afectados, con aprobación de Carlos por capítulo antes de tocar el JSON.
- [ ] ES/PT: script de parche por párrafo (decisión 2); se escribe junto con la herramienta de la Fase 0.
- [ ] Un commit por capítulo: `fix(chNN): fidelidad Ra - ...`.

### Fase 5. Validación y publicación

- [x] `pnpm test`: el script pasó a `node --test tests/*.test.js` (Node 22 ya no acepta un directorio).
- [x] `pnpm run validate`, `pnpm test` (51/51), `pnpm run test:alignment` (3 avisos PT que ya estaban en main) y validador del skill (2026-10-12).
  Los avisos nuevos del validador son falsos positivos: "Law of One" como principio y "judgment" como facultad. `audit-cross-chapter.mjs` no existe en el skill.
- [x] `pnpm run build` y merge a main con push (deploy automático), 2026-10-12. Pendiente: verificar en eluno.org.
- [ ] Audiolibro: los capítulos con prosa cambiada quedan desactualizados en EN/ES/PT. Decidir si se regeneran solo esos capítulos.

### Fase 6. Prevención

- [ ] Patrón confirmado en caps. 10, 11 y 12: la prosa adopta la premisa del interrogador que Ra corrige (42.2, 70.14). El QA debe chequear que cada cita salga de la respuesta de Ra y no de la pregunta.

- [ ] Agregar a `/write:qa` un paso que pase cada ancla por la herramienta de la Fase 0 y exija verificar el pasaje leído, no el índice.
- [ ] Dejar en `writing/protocol/qa-protocol.md` la regla: el índice temático orienta, pero el ancla se valida siempre contra el corpus.
- [ ] (Plan aparte, después de cerrar El Uno) Revisar si `sanacion`, `todo`, `jesus`, `doctrinas` y `dormidos` copiaron anclas del índice (sus `manifest-template.json` lo referencian).

### Decisiones (Carlos, 2026-10-07)

1. **Aprobación por capítulo**: se audita uno, se presentan sus párrafos con el pasaje Ra al lado,
   Carlos aprueba, se aplica y se hace commit y deploy antes de pasar al siguiente.
2. **ES/PT con script de parche**: un script nuevo en `scripts/` reemplaza solo los párrafos indicados en EN/ES/PT
   y valida el marcado y la alineación. La traducción ES/PT la hacen subagentes (Sonnet 5.5) con la voz del libro, y la revisa Carlos.
   No se usa `translate-chapter.js` (requiere API key y apunta a Sonnet 4.5).
5. **Trabajo pesado con subagentes Sonnet 5.5** (sin API): la auditoría por capítulo (Fase 2) y las traducciones.
   Claude verifica contra el corpus los hallazgos altos y medios antes de presentarlos.
3. **Audiolibro al final, en bloque**: al cerrar la auditoría se regeneran solo los capítulos con prosa cambiada, en los 3 idiomas.
   Mientras tanto, llevar aquí la lista de capítulos afectados.
4. **Libros hermanos en un plan aparte**, después de cerrar El Uno y el índice corregido.

Capítulos con prosa cambiada (para regenerar el audio): todos (1-16). El texto de `audiobook/text/` ya está actualizado en la rama.
