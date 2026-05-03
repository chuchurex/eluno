# Plantilla: revisión editorial de capítulo existente

> Esta plantilla guía la pasada estilística sobre un capítulo ya escrito. Es directamente
> la lección aprendida de la rama `wip/editorial-pass-2026-04` que se descartó: lo que
> falló allí fue tratar la prosa como texto plano y romper el marcado al editar.
> Esta plantilla evita ese error.

## Cuándo usar

- El capítulo ya existe y pasa los validadores.
- El operador quiere refinar prosa: ritmo, repetición, frases redundantes, "muletillas" cross-chapter.
- **NO** se usa para reescribir contenido. Para rescribir, usar `nuevo-capitulo.md`.
- **NO** se usa para "modernizar" el inglés. La sintaxis Ra-original es parte del transporte fiel.

## Qué se permite cambiar

✅ **Permitido:**

- Reordenar oraciones dentro de un párrafo.
- Reemplazar palabras por sinónimos del mismo registro.
- Acortar oraciones largas si la idea se preserva.
- Eliminar muletillas detectadas por el auditor (`the entity` repetido, `consider...` al inicio, etc.).
- Mejorar transiciones entre párrafos.

❌ **Prohibido:**

- Romper marcado: `{term:X}`, `{ref:cat:id}`, `{src:N.M}` se preservan **exactamente**.
- Eliminar contenido (un párrafo entero, una oración con información única).
- Modernizar la voz al estilo periodístico contemporáneo.
- Mover contenido entre secciones (eso es reestructuración, no revisión editorial).
- Cambiar el cierre del capítulo (eso afecta arco del libro).
- Editar solo en ES/PT sin tocar EN. **El inglés es canónico**, las traducciones lo siguen.

## Flujo

### Fase 1: Pasada de auditoría previa

Antes de tocar prosa, correr el auditor cross-chapter para tener mapa de problemas:

```bash
node scripts/editorial-pass.js --out report.md
```

Eso produce reporte con:

- Muletillas (frases repetidas más de lo recomendado).
- Duplicaciones cross-chapter (frases idénticas entre capítulos).
- Cierres repetidos.
- Hotspots de "the entity".
- Cobertura de glosario.

Leer el reporte. Identificar las correcciones más urgentes. **Priorizar errores estructurales sobre estilísticos.**

### Fase 2: Edición párrafo a párrafo

Para cada párrafo a modificar:

1. Leer el párrafo completo en EN, ES y PT (los tres a la vez, en paralelo).
2. Identificar el cambio mínimo que resuelve el problema.
3. Aplicar el cambio en EN primero.
4. Replicar el cambio equivalente en ES y PT (manteniendo alineación 1:1 párrafo).
5. **Verificar marcado preservado**:
   - Mismos `{term:X}` antes y después.
   - Mismos `{ref:cat:id}` antes y después.
   - Mismas marcas `{src:N.M}` (si están en el provenience).

### Fase 3: Validación

Tras cada bloque de cambios:

```bash
# Por archivo
node .claude/skills/eluno-ra-canon/scripts/validate-chapter.mjs i18n/en/chapters/NN.json
node .claude/skills/eluno-ra-canon/scripts/validate-chapter.mjs i18n/es/chapters/NN.json
node .claude/skills/eluno-ra-canon/scripts/validate-chapter.mjs i18n/pt/chapters/NN.json

# Alineación
node scripts/validate-alignment.js NN
```

Si la alineación falla (count de `{term:}` o `{ref:}` distinto entre idiomas), **revertir** el cambio y reintentar más cuidadosamente.

### Fase 4: Diff diagnostic

Antes de cerrar, generar diff y revisarlo manualmente:

```bash
git diff i18n/{en,es,pt}/chapters/NN.json
```

Mirar el diff buscando:

- Palabras clave perdidas (Logos, density, Creator, etc.). **Caso documentado**: la rama wip descartada perdió 3 ocurrencias de "Logos" en es/02 al modernizar prosa. No vuelvas a hacerlo.
- Marcado roto: `{term:foo}` que se convirtió en `{foo}` o `term:foo`.
- Cambios en frases que tenían `{src:}` asociado en provenience (eso requiere verificar el provenience también).

## Anti-patrones documentados

Estos son cambios que parecen mejoras pero degradan el libro. **No los hagas:**

| Anti-patrón | Por qué es malo |
|---|---|
| `absolutamente trascendente` → `completamente trascendente` | "Absolutamente" tiene fuerza filosófica que "completamente" no tiene en este contexto. Cambio plano. |
| `engañosa` → `induce a error` | Más burocrático, menos directo. Quita peso a la oración. |
| `trazarse` → `trazarse en mapas` | Añade metáfora innecesaria. La voz Ra es directa, no decorativa. |
| `el Logos es el único corazón` → `el es el único corazón` | Caso real de la rama wip descartada: el "Logos" se perdió como palabra. Revisar **siempre** que las palabras clave del libro sigan presentes después de editar. |
| Acortar todas las oraciones largas | El ritmo Ra alterna oraciones largas y cortas. Achicar todo al estilo periodístico mata la voz. |

## Output esperado

- Cambios aplicados a los 3 idiomas en paralelo.
- Validador y alignment pasan.
- Diff revisado, sin pérdidas de palabras clave.
- Si hubo cambios en provenience, también actualizado.

## Lo que NO hace esta plantilla

- No corre el auditor cross-chapter por sí misma. Eso es trabajo separado del operador.
- No genera traducciones nuevas. Solo refina las existentes.
- No agrega marcado nuevo (eso pertenece a `nuevo-capitulo.md`).

## Lección final

> Una pasada editorial que no mejora demostradamente la prosa **debe descartarse**.
> Si después de aplicar cambios el capítulo no se siente claramente mejor que antes,
> revertir es mejor que mergear "para no perder el trabajo".
