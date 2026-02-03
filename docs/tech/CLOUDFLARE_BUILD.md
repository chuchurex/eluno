# Configuración de Build para Cloudflare Pages

## Diagnóstico de la Situación Actual

### Estado del Repositorio
- ✅ Todos los archivos fuente están correctamente en git
- ✅ `packages/core/` contiene scripts y estilos compartidos
- ✅ `packages/todo/`, `packages/jesus/`, `packages/sanacion/` contienen el código fuente
- ✅ El build local funciona correctamente
- ⚠️ Los directorios `dist/` NO están en git (están en `.gitignore`, que es correcto)

### Estructura del Proyecto
Este NO es un proyecto Astro. Es un generador de sitios estáticos personalizado que:
1. Usa SASS para compilar estilos desde `packages/core/scss/`
2. Usa un script Node.js personalizado (`packages/core/scripts/build.js`) que genera HTML desde JSON
3. Genera el output en `dist/`

## Variables de Entorno Requeridas

En el panel de Cloudflare Pages → Settings → Environment variables:

```
NODE_VERSION = 20
```

## Comandos de Build por Proyecto

### Proyecto: todo (eltodonuestro.org / todo.eluno.org)
**Framework preset:** Ninguno (None)

**Build command:**
```bash
cd packages/todo && npm install && npm run build
```

**Build output directory:**
```
packages/todo/dist
```

**Root directory:** (dejar en blanco o `/`)

---

### Proyecto: sanacion (lasanacion.org)
**Framework preset:** Ninguno (None)

**Build command:**
```bash
cd packages/sanacion && npm install && npm run build
```

**Build output directory:**
```
packages/sanacion/dist
```

**Root directory:** (dejar en blanco o `/`)

---

### Proyecto: jesus (eljesus.org)
**Framework preset:** Ninguno (None)

**Build command:**
```bash
cd packages/jesus && npm install && npm run build
```

**Build output directory:**
```
packages/jesus/dist
```

**Root directory:** (dejar en blanco o `/`)

---

## Notas Importantes

1. **NO uses "Astro" como framework preset** - estos NO son proyectos Astro. Selecciona "None" o "Static Site".

2. **npm install dentro del comando:** Incluimos `npm install` en cada comando de build para garantizar que las dependencias se instalen en Cloudflare Pages.

3. **Estructura limpia:** La raíz del repositorio ahora está limpia, con todos los archivos antiguos movidos a `old_root_files/`.

4. **Monorepo:** Los tres proyectos están organizados en `packages/`:
   - `packages/todo` - eltodonuestro.org / todo.eluno.org
   - `packages/sanacion` - lasanacion.org
   - `packages/jesus` - eljesus.org
   - `packages/core` - código compartido (scripts, estilos, fuentes)

5. **Dependencias compartidas:** Cada proyecto depende de `packages/core/` para:
   - Scripts de build (`packages/core/scripts/build.js`)
   - Estilos SASS (`packages/core/scss/`)
   - Fuentes (`packages/core/fonts/`)

6. **El archivo .env es local:** Cada proyecto tiene su propio `.env` que NO está en git (correcto). El build funciona sin él usando valores por defecto.

## Pasos para Configurar en Cloudflare

1. Ve a tu dashboard de Cloudflare Pages
2. Para cada proyecto (todo, sanacion, jesus):
   - Crea un nuevo proyecto o edita el existente
   - Configura el comando de build según la tabla arriba
   - Configura el directorio de salida (Build output directory)
   - Asegúrate de tener `NODE_VERSION=20` en las variables de entorno
   - Despliega

## Troubleshooting

### El sitio no carga / Error 404
**Causa más probable:** Framework preset incorrecto o Build output directory incorrecto

**Solución:**
1. Verifica que el Framework preset esté en "None" (NO "Astro")
2. Verifica que Build output directory sea exactamente: `packages/todo/dist` (o sanacion/jesus)
3. Verifica que el Root directory esté vacío o en `/`

### Error "command not found: sass" durante el build
**Causa:** Node.js versión incorrecta o dependencias no instaladas

**Solución:**
1. Verifica que `NODE_VERSION=20` esté configurado en Environment variables
2. Asegúrate de que el build command incluya `npm install` antes de `npm run build`

### Build exitoso pero el sitio muestra contenido vacío
**Causa:** El build generó los archivos en la ubicación incorrecta

**Solución:**
1. Revisa los logs del build en Cloudflare
2. Busca la línea "Build complete!" y verifica que los archivos se generaron en `dist/`
3. Verifica que Build output directory apunte a `packages/[proyecto]/dist`

### Error "Cannot find module '../core/scripts/build.js'"
**Causa:** El repositorio en Cloudflare no tiene todos los archivos

**Solución:**
1. Verifica que el último commit esté desplegado
2. Ejecuta `git push` para asegurarte de que todo esté en GitHub
3. Haz un re-deploy manual desde Cloudflare Pages

### El CSS no se carga
**Causa:** Archivos de fuentes o CSS no se copiaron correctamente

**Solución:**
1. Verifica en los logs del build que se ejecutó `sass:build` correctamente
2. Verifica que se copiaron las fuentes (debe decir "Copied 7 font files")
3. Verifica que `_headers` se generó correctamente

## Verificación Post-Deploy

Después de desplegar, verifica:
- [ ] El sitio carga correctamente
- [ ] Los assets (CSS, JS, imágenes) se cargan
- [ ] Las rutas funcionan correctamente (ch1, ch2, etc.)
- [ ] No hay errores 404 en la consola del navegador
- [ ] Los headers CORS están configurados (revisa Network tab en DevTools)

## Comandos de Diagnóstico Local

Para probar el build localmente antes de desplegar:

```bash
# Test todo project
cd packages/todo
rm -rf node_modules dist
npm install
npm run build
# El build debe completar sin errores y crear dist/

# Verificar contenido de dist/
ls -la dist/
# Debe contener: index.html, ch1/, ch2/, ..., css/, fonts/, es/
```
