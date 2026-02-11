# PROMPT: Traducción de Capítulo (EN → ES / PT)

> Este prompt se ejecuta DESPUÉS de tener el `chXX_EN.json` aprobado.
> Puede ejecutarse con un agente diferente o vía API.

---

## TAREA

Traducir el capítulo del inglés al idioma indicado, produciendo un JSON con estructura idéntica al original.

---

## ENTRADA

- `chXX_EN.json` — El capítulo aprobado en inglés

---

## IDIOMA TARGET

Indicar uno:
- **ES** — Español
- **PT** — Portugués

---

## REGLAS DE TRADUCCIÓN

### Generales
- Prosa NATURAL en el idioma target. No traducción literal.
- Mantener la misma voz: primera persona plural, perspectiva sapiencial.
- Mantener el mismo tono: educativo, reverente al misterio, no devocional.
- Conservar todas las marcas `{term:keyword}` y `{ref:category:id}` intactas.
- Conservar la estructura JSON exacta (mismos ids de sección, mismo número de párrafos).

### Terminología obligatoria

| Inglés | Español | Portugués |
|--------|---------|-----------|
| density | densidad | densidade |
| distortion | distorsión | distorção |
| catalyst | catalizador | catalisador |
| harvest | cosecha | colheita |
| wanderer | errante | errante |
| ray | rayo | raio |
| Logos | Logos | Logos |
| Logos (plural) | los Logos | os Logos |
| free will | libre albedrío | livre arbítrio |
| intelligent infinity | Infinito Inteligente | Infinito Inteligente |
| intelligent energy | Energía Inteligente | Energia Inteligente |
| social memory complex | complejo de memoria social | complexo de memória social |
| the Choice | la Elección | a Escolha |
| polarization | polarización | polarização |
| the veil | el velo | o véu |
| sub-Logos | sub-Logos | sub-Logos |
| co-Creator | co-Creador | co-Criador |

### Términos que NO se traducen
- Logos, sub-Logos (se mantienen en todas las lenguas)
- Las marcas `{term:keyword}` mantienen el keyword en inglés

### Trampas de traducción EN → ES

| Inglés | ❌ Incorrecto | ✅ Correcto | Nota |
|--------|-------------|------------|------|
| invested (itself) | se invirtió | se volcó en, se vertió hacia, se entregó a | "Invertir" es ambiguo en español |
| Logoi | Logoi | los Logos | El plural latino no se comprende |
| consciousness | conciencia | consciencia / conciencia | Ambas son válidas, preferir "conciencia" |
| mind/body/spirit complex | complejo cuerpo/mente/espíritu | complejo mente/cuerpo/espíritu | Mantener el orden de Ra |
| the One | el Uno | el Uno | Siempre capitalizado |

### Trampas de traducción EN → PT

| Inglés | ❌ Incorrecto | ✅ Correcto | Nota |
|--------|-------------|------------|------|
| invested (itself) | investiu-se | entregou-se a, verteu-se em | Mismo problema que en español |
| Logoi | Logoi | os Logos | Mismo criterio |
| consciousness | consciência | consciência | En PT solo hay una forma |

---

## FORMATO DE SALIDA

Un archivo `chXX_ES.json` o `chXX_PT.json` con:

```json
{
  "id": "chX",
  "number": X,
  "numberText": "Capítulo Uno",
  "title": "Título en español",
  "sections": [
    {
      "id": "chX-section-id",
      "title": "Título de sección en español",
      "content": [
        {"type": "paragraph", "text": "Texto traducido con {term:keyword} intactos..."}
      ]
    }
  ]
}
```

### numberText por capítulo (ES):
Capítulo Uno, Capítulo Dos, Capítulo Tres, Capítulo Cuatro, Capítulo Cinco, Capítulo Seis, Capítulo Siete, Capítulo Ocho, Capítulo Nueve, Capítulo Diez, Capítulo Once, Capítulo Doce, Capítulo Trece, Capítulo Catorce, Capítulo Quince, Capítulo Dieciséis.

### numberText por capítulo (PT):
Capítulo Um, Capítulo Dois, Capítulo Três, Capítulo Quatro, Capítulo Cinco, Capítulo Seis, Capítulo Sete, Capítulo Oito, Capítulo Nove, Capítulo Dez, Capítulo Onze, Capítulo Doze, Capítulo Treze, Capítulo Catorze, Capítulo Quinze, Capítulo Dezesseis.

---

## VERIFICACIÓN

Después de traducir, verifica:
1. ¿Mismo número de secciones que el original?
2. ¿Mismos ids de sección?
3. ¿Mismo número de párrafos por sección?
4. ¿Todas las marcas `{term:}` y `{ref:}` presentes?
5. ¿Ninguna marca `{src:}` se coló? (no deben estar)
6. ¿JSON válido?

---

*PROMPT_TRANSLATE v2.0 — Febrero 2026*
