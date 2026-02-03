# Flujo de Trabajo Colaborativo con Claude Code

> **Propósito**: Documentar el proceso para trabajar de forma colaborativa entre un humano y Claude Code usando ramas feature y Pull Requests.

---

## Objetivo del Ejercicio

Practicar un flujo de desarrollo profesional donde:
1. Claude Code implementa mejoras en una **rama separada**
2. Los cambios se suben a GitHub como **Pull Request**
3. El humano revisa, comenta y aprueba (o solicita cambios)
4. Se hace **merge** a la rama principal

Este flujo simula cómo trabajan equipos de desarrollo reales.

---

## Mejoras Candidatas (del TODO.md)

### Nivel 1: Fácil (5-10 min)

| ID | Mejora | Archivo(s) | Descripción |
|----|--------|------------|-------------|
| E1 | Externalizar GA_ID | `build.js`, `.env.example` | Mover Google Analytics ID hardcodeado a variable de entorno |
| E2 | Robots meta dinámico | `build.js`, `.env.example` | Configurar `noindex` vs `index` según entorno |

### Nivel 2: Medio (15-30 min)

| ID | Mejora | Archivo(s) | Descripción |
|----|--------|------------|-------------|
| M1 | Agregar ESLint | `package.json`, `.eslintrc.js` | Configurar linter para calidad de código |
| M2 | Agregar Prettier | `package.json`, `.prettierrc` | Configurar formatter automático |
| M3 | Extraer JS a archivo | `build.js`, `core/js/main.js` | Sacar JavaScript inline de las páginas |

### Nivel 3: Complejo (1+ hora)

| ID | Mejora | Archivo(s) | Descripción |
|----|--------|------------|-------------|
| C1 | Modularizar build.js | `scripts/lib/*.js` | Separar en módulos config, loader, generator |
| C2 | Hoistear dependencias | `package.json` (raíz y paquetes) | Centralizar dependencias en monorepo |

---

## Flujo Paso a Paso

### Fase 1: Preparación

```bash
# 1. Asegurarse de estar en main actualizado
git checkout main
git pull origin main

# 2. Verificar que no hay cambios pendientes
git status
```

### Fase 2: Crear Rama Feature

```bash
# Nombrar rama según convención: tipo/descripcion-corta
git checkout -b feature/externalize-ga-id

# Tipos de rama:
# - feature/  → Nueva funcionalidad
# - fix/      → Corrección de bug
# - refactor/ → Mejora de código sin cambiar funcionalidad
# - docs/     → Solo documentación
# - chore/    → Configuración, dependencias
```

### Fase 3: Claude Code Implementa

Claude Code realiza los cambios necesarios:
1. Edita archivos según la mejora elegida
2. Prueba que el build funcione: `npm run build`
3. Hace commits atómicos con mensajes descriptivos

```bash
# Ejemplo de commit
git add packages/core/scripts/build.js .env.example
git commit -m "feat: externalize Google Analytics ID to GA_ID env variable

- Add GA_ID to .env.example with documentation
- Conditionally include GA script only when GA_ID is set
- Remove hardcoded tracking ID from build.js

Closes #XX (si hay issue relacionado)"
```

### Fase 4: Push a GitHub

```bash
# Push de la rama feature
git push -u origin feature/externalize-ga-id
```

### Fase 5: Crear Pull Request

Usando GitHub CLI (`gh`):

```bash
gh pr create \
  --title "feat: externalize Google Analytics ID to environment variable" \
  --body "$(cat <<'EOF'
## Summary
- Moves hardcoded Google Analytics ID to `.env` configuration
- Makes tracking optional and configurable per environment

## Changes
- `packages/core/scripts/build.js`: Conditional GA script inclusion
- `.env.example`: Added `GA_ID` variable with documentation

## Test Plan
- [ ] Run `npm run build` - should complete without errors
- [ ] Check generated HTML with `GA_ID` set - should include GA script
- [ ] Check generated HTML without `GA_ID` - should NOT include GA script

## Related
- Addresses item in `docs/project/TODO.md` (Alta Prioridad > Configuración Externalizada)
EOF
)"
```

### Fase 6: Review del Humano

El humano revisa el PR en GitHub:

1. **Ver cambios**: Revisar el diff de archivos modificados
2. **Comentar**: Dejar comentarios en líneas específicas si hay dudas
3. **Aprobar o solicitar cambios**:
   - ✅ "Approve" si todo está bien
   - 🔄 "Request changes" si necesita ajustes

### Fase 7: Responder a Feedback (si aplica)

Si el humano solicita cambios:

```bash
# Hacer los ajustes necesarios
git add .
git commit -m "fix: address PR feedback - improve error message"
git push
```

El PR se actualiza automáticamente.

### Fase 8: Merge

Una vez aprobado, el humano hace merge desde GitHub:
- **Squash and merge**: Combina todos los commits en uno (recomendado para features pequeñas)
- **Create a merge commit**: Preserva historial completo
- **Rebase and merge**: Historial lineal

### Fase 9: Limpieza

```bash
# Volver a main
git checkout main
git pull origin main

# Eliminar rama local (opcional)
git branch -d feature/externalize-ga-id

# Eliminar rama remota (opcional, GitHub puede hacerlo automáticamente)
git push origin --delete feature/externalize-ga-id
```

---

## Comandos Útiles

### Ver estado del repositorio
```bash
git status                    # Estado actual
git log --oneline -10         # Últimos 10 commits
git branch -a                 # Todas las ramas
```

### Gestión de PRs con GitHub CLI
```bash
gh pr list                    # Listar PRs abiertos
gh pr view                    # Ver PR actual
gh pr checks                  # Ver estado de CI/CD
gh pr merge                   # Hacer merge (si tienes permisos)
```

### Si algo sale mal
```bash
git checkout main             # Volver a main
git branch -D feature/xxx     # Forzar eliminación de rama local
git stash                     # Guardar cambios temporalmente
git stash pop                 # Recuperar cambios guardados
```

---

## Plantilla de PR

```markdown
## Summary
[1-3 bullet points describing what this PR does]

## Motivation
[Why is this change needed? Link to TODO item or issue]

## Changes
- `file1.js`: [what changed]
- `file2.js`: [what changed]

## Test Plan
- [ ] Step 1 to verify
- [ ] Step 2 to verify

## Screenshots (if UI changes)
[Before/After images]

## Checklist
- [ ] Code follows project style guidelines
- [ ] Changes have been tested locally
- [ ] Documentation updated (if needed)
- [ ] No hardcoded values introduced
```

---

## Ejemplo Completo: Externalizar GA_ID

### 1. Crear rama
```bash
git checkout -b feature/externalize-ga-id
```

### 2. Cambios a realizar

**`.env.example`** - Agregar:
```bash
# Google Analytics (optional - leave empty to disable tracking)
GA_ID=
```

**`packages/core/scripts/build.js`** - Modificar línea ~453:
```javascript
// Antes (hardcoded):
<script async src="https://www.googletagmanager.com/gtag/js?id=G-9LDPDW8V6E"></script>

// Después (configurable):
const GA_ID = process.env.GA_ID || '';

// En generateHead(), solo incluir si GA_ID existe:
${GA_ID ? `
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA_ID}');
    </script>
` : '<!-- Analytics disabled -->'}
```

### 3. Probar
```bash
npm run build  # Debe completar sin errores
```

### 4. Commit y push
```bash
git add .
git commit -m "feat: externalize Google Analytics ID to GA_ID env variable"
git push -u origin feature/externalize-ga-id
```

### 5. Crear PR
```bash
gh pr create --title "feat: externalize GA_ID" --body "..."
```

---

## Siguiente Sesión

Cuando estés listo para practicar este flujo:

1. **Dime**: "Vamos a hacer el ejercicio de PR"
2. **Elige una mejora** del listado (E1, E2, M1, etc.)
3. **Claude Code implementa** en rama feature
4. **Tú revisas** el PR en GitHub
5. **Hacemos merge** juntos

---

*Documento creado: 2026-01-22*
*Para uso con: Claude Code + GitHub*
