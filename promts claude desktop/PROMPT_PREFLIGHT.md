# PROMPT: Validación Pre-Escritura (Preflight)

> Ejecuta este prompt ANTES de cualquier prompt de escritura de capítulo.
> Su único propósito es confirmar que todo está en orden para trabajar.

---

## INSTRUCCIÓN

Verifica la presencia y accesibilidad de todos los archivos listados abajo. Para cada uno:
1. Confirma que existe y es legible
2. Lee las primeras líneas para verificar que es el archivo correcto
3. Reporta: ✅ presente / ❌ ausente

### Archivos del proyecto (deben estar cargados):

| # | Archivo | Descripción |
|---|---------|-------------|
| 1 | `02_WRITING_PROTOCOL.md` | Protocolo de escritura |
| 2 | `03_BOOK_STRUCTURE_16_CHAPTERS.md` | Estructura del libro |
| 3 | `04_PROMPT_BOOK_IDENTITY.md` | Identidad del libro |
| 4 | `00_REWRITE_KIT.md` | Sistema de proveniencia {src:} |
| 5 | `05_SOURCES.md` | Lista de fuentes y jerarquía |

### Versiones v1 a superar:

| # | Archivo | Descripción |
|---|---------|-------------|
| 6 | `01.json` | Capítulo 1 v1 en español |
| 7 | `06_EXAMPLE_chapter_01_EN.json` | Capítulo 1 v1 en inglés |

### Fuentes primarias (.md):

| # | Archivo | Descripción |
|---|---------|-------------|
| 8 | `the_ra_contact_volume_1.md` | Ra Contact sesiones 1-56 |
| 9 | `the_ra_contact_volume_2.md` | Ra Contact sesiones 57-106 |

### Fuentes de contexto (.md):

| # | Archivo | Descripción |
|---|---------|-------------|
| 10 | `ll_research_archive_volume_09.md` | Q'uo Volume 9 |
| 11 | `ll_research_archive_volume_10.md` | Q'uo Volume 10 |
| 12 | `ll_research_archive_volume_11.md` | Q'uo Volume 11 |

---

## REGLA DE BLOQUEO

**Si falta CUALQUIER archivo de fuentes primarias (8-9), DETENTE.** Son la base de todo el trabajo.

Si faltan archivos de proyecto (1-7), reporta cuáles y DETENTE.

Los archivos de contexto (10-12) son recomendados pero no bloquean. Reporta si faltan.

---

## SALIDA ESPERADA

Una tabla con el estado de cada archivo. Si todo está ✅, indica: **"Preflight OK. Listo para ejecutar prompts de escritura."**
