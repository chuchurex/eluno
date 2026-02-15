# Publicar capítulo: integrar, traducir, build, deploy

Orquesta las fases 6-8 del pipeline de escritura.

## Argumentos
$ARGUMENTS = número de capítulo (ej: 02, 03, 14)

## Prerrequisitos

1. Parsea $ARGUMENTS para obtener el número de capítulo (CHAPTER con zero-pad)
2. Verifica que existen TODOS estos archivos en `workspace/chapters/ch${CHAPTER}/`:
   - `en.json`
   - `glossary.json`
   - `provenance.json`
3. Si falta alguno: PARA. Indica qué paso del pipeline falta ejecutar.

## Instrucciones

### Paso 1: Integrar (Fase 6)

Ejecutar:
```bash
node scripts/integrate-chapter.js ${CHAPTER} --force
```

- Verificar exit code 0
- Mostrar resumen: archivos copiados, términos de glosario agregados

### Paso 2: Traducir (Fase 7)

Ejecutar:
```bash
node scripts/translate-chapter.js ${CHAPTER} --lang es
```

- Esto llama la API de Anthropic para traducir EN → ES
- PT se traduce por separado cuando todos los capítulos estén listos
- Mostrar progreso por idioma
- Reportar phantom terms auto-corregidos

### Paso 3: Validar alineación

Ejecutar:
```bash
node scripts/validate-alignment.js ${CHAPTER}
```

- Debe PASAR para EN y ES
- Si FALLA: mostrar issues y preguntar al operador si quiere continuar

### Paso 4: Build

Ejecutar:
```bash
npm run build
```

- Verificar exit code 0
- Si el build falla, mostrar el error y PARAR

### Paso 5: Resumen y confirmación

Mostrar:
- `git diff --stat` (archivos cambiados)
- Nuevos términos del glosario (EN/ES/PT)
- Conteo de palabras por idioma
- Resultado de validación

Preguntar al operador: "Commit y push?" (sí/no)

Si SÍ:
```bash
git add i18n/en/chapters/${CHAPTER}.json i18n/es/chapters/${CHAPTER}.json i18n/en/glossary.json i18n/es/glossary.json i18n/provenance/ch${CHAPTER}_provenance.json
```

Luego commit con este formato:
```
content(ch${CHAPTER}): add Chapter ${N} — ${TITLE} (EN/ES)

Integrated EN chapter, translated to ES via Anthropic API.
PT translation deferred to batch phase.
```

Luego push:
```bash
git push origin $(git branch --show-current)
```

Si NO: "Cambios en disco pero no commiteados. Revisa con git diff."

## Nota
Este comando ejecuta solo la Fase 6 del pipeline. Para el pipeline completo autónomo usa `/write:chapter N`.

## Ejemplo de uso
`/write:publish 02` — Integra, traduce, valida, hace build y despliega el Capítulo 2
