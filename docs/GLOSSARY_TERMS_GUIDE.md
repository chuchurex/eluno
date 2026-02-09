# Guía para Agregar Términos al Glossary

Este documento explica cómo generar y agregar nuevos términos al glossary de El Uno usando Claude Desktop.

## Contexto

El proyecto usa un sistema de términos con markup `{term:keyword}` en los capítulos. Cuando el build encuentra un término que no existe en el glossary, genera un warning. Los términos deben agregarse en los 3 idiomas (EN, ES, PT).

## Formato del Glossary

Cada idioma tiene su propio `glossary.json` en `i18n/{lang}/glossary.json`. El formato es:

```json
{
  "keyword": {
    "title": "Título Visible",
    "content": [
      "Primera línea de la definición.",
      "Segunda línea opcional con más contexto."
    ]
  }
}
```

### Reglas del keyword:
- Minúsculas
- Palabras separadas por guiones: `mind-body-spirit-complex`
- Sin acentos ni caracteres especiales
- Debe coincidir exactamente con el markup `{term:keyword}` en los capítulos

## Cómo Generar Nuevos Términos

### Paso 1: Identificar términos faltantes

Ejecutar en el proyecto:
```bash
npm run test:json 2>&1 | grep "Term not in glossary"
```

Esto muestra los términos faltantes, por ejemplo:
```
⚠️  i18n/en/chapters/02.json: Term not in glossary: {term:unpotentiated}
⚠️  i18n/en/chapters/03.json: Term not in glossary: {term:sinkhole-of-indifference}
```

### Paso 2: Crear el archivo de términos

Crear un archivo JSON con los nuevos términos. Nombre sugerido: `glossary_additions.json`

**Formato para Claude Desktop:**

```json
[
  {
    "keyword": "unpotentiated",
    "en": {
      "title": "Unpotentiated",
      "content": [
        "The state of infinite potential before any differentiation or manifestation has occurred.",
        "In the context of the One Infinite Creator, this refers to the primordial condition where all possibilities exist but none have been actualized."
      ]
    },
    "es": {
      "title": "No Potenciado",
      "content": [
        "El estado de potencial infinito antes de que haya ocurrido cualquier diferenciación o manifestación.",
        "En el contexto del Creador Infinito Uno, esto se refiere a la condición primordial donde todas las posibilidades existen pero ninguna ha sido actualizada."
      ]
    },
    "pt": {
      "title": "Não Potencializado",
      "content": [
        "O estado de potencial infinito antes de qualquer diferenciação ou manifestação ter ocorrido.",
        "No contexto do Criador Infinito Uno, isso se refere à condição primordial onde todas as possibilidades existem, mas nenhuma foi atualizada."
      ]
    }
  },
  {
    "keyword": "sinkhole-of-indifference",
    "en": {
      "title": "Sinkhole of Indifference",
      "content": [
        "The condition of an entity that has not chosen either polarity—neither service to others nor service to self.",
        "Such entities do not graduate from third density and must repeat the cycle. The term emphasizes that lack of choice is not neutrality but a kind of spiritual stagnation."
      ]
    },
    "es": {
      "title": "Sumidero de Indiferencia",
      "content": [
        "La condición de una entidad que no ha elegido ninguna polaridad—ni servicio a otros ni servicio a sí mismo.",
        "Tales entidades no gradúan de tercera densidad y deben repetir el ciclo. El término enfatiza que la falta de elección no es neutralidad sino un tipo de estancamiento espiritual."
      ]
    },
    "pt": {
      "title": "Sumidouro de Indiferença",
      "content": [
        "A condição de uma entidade que não escolheu nenhuma polaridade—nem serviço aos outros nem serviço a si mesmo.",
        "Tais entidades não se formam da terceira densidade e devem repetir o ciclo. O termo enfatiza que a falta de escolha não é neutralidade, mas um tipo de estagnação espiritual."
      ]
    }
  }
]
```

### Paso 3: Subir via inbox

1. Comprimir el archivo: `glossary_additions.zip`
2. Subir a `inbox/` del proyecto
3. Claude Code procesará y hará merge con los glossaries existentes

## Términos Actualmente Faltantes

Estos son los términos que generan warnings (para capítulos 1-5):

| Keyword | Capítulo | Descripción sugerida |
|---------|----------|---------------------|
| `unpotentiated` | ch02 | Estado previo a la manifestación |
| `mind-body-spirit-complex` | ch02 | Término técnico para un ser consciente |
| `ray` | ch03 | Vibración de luz / centro de energía |
| `first-density` | ch03 | Primera densidad de consciencia |
| `spirit-complex` | ch03 | El componente espiritual del ser |
| `sinkhole-of-indifference` | ch03, ch05 | No elegir ninguna polaridad |
| `dual-activated-bodies` | ch03, ch04 | Cuerpos que funcionan en 3ra y 4ta densidad |
| `spiritual-gravity` | ch03 | Atracción hacia el Creador |
| `council-of-saturn` | ch04 | Consejo guardián del sistema solar |
| `distortions` | ch04 | Modificaciones del Infinito original |

## Prompt para Claude Desktop

Usa este prompt para generar los términos:

---

**PROMPT:**

```
Necesito que generes definiciones para términos del glossary de El Uno (reescritura filosófica del Material Ra / Law of One).

## Contexto
- El libro es una síntesis accesible de los 5 volúmenes del Material Ra
- Las definiciones deben ser claras pero fieles a la cosmología de Ra
- Cada término necesita versiones en EN, ES, y PT
- El tono es filosófico, no new age

## Formato de salida
Genera un JSON con este formato exacto:

```json
[
  {
    "keyword": "term-in-lowercase-with-hyphens",
    "en": {
      "title": "English Title",
      "content": ["First paragraph.", "Second paragraph if needed."]
    },
    "es": {
      "title": "Título en Español",
      "content": ["Primer párrafo.", "Segundo párrafo si es necesario."]
    },
    "pt": {
      "title": "Título em Português",
      "content": ["Primeiro parágrafo.", "Segundo parágrafo se necessário."]
    }
  }
]
```

## Términos a definir:
1. unpotentiated
2. mind-body-spirit-complex
3. ray
4. first-density
5. spirit-complex
6. sinkhole-of-indifference
7. dual-activated-bodies
8. spiritual-gravity
9. council-of-saturn
10. distortions

## Referencias
Usa lawofone.info como fuente primaria para las definiciones.
```

---

## Ejemplo Completo de Workflow

1. **Claude Desktop** genera `glossary_additions.json` con los 10 términos
2. **Usuario** comprime a `glossary_additions.zip`
3. **Usuario** sube a `/inbox/` del proyecto
4. **Claude Code** ejecuta:
   ```
   - Extrae ZIP
   - Valida JSON
   - Hace merge con i18n/en/glossary.json
   - Hace merge con i18n/es/glossary.json
   - Hace merge con i18n/pt/glossary.json
   - Limpia inbox
   - Commit y push
   ```
5. **Cloudflare Pages** despliega automáticamente
6. **beta.eluno.org** muestra los nuevos términos con tooltips

## Validación

Después del merge, ejecutar:
```bash
npm run test:json
```

Los warnings de términos faltantes deberían desaparecer.
