# writing/ — Sistema de escritura

Sistema reproducible para escribir libros filosoficos a partir de fuentes primarias con asistencia de IA.

## Prerequisitos

- **Claude Code** (CLI) con acceso a un modelo capaz (Opus 4.5+)
- **Python 3** (para extract-sources.py)
- **Node.js** (para validate-chapter.cjs)
- **Volumenes fuente** en formato markdown (no incluidos en el repo por copyright)

## Setup rapido

```bash
# 1. Clonar el repo
git clone https://github.com/chuchurex/eluno.git
cd eluno

# 2. Instalar dependencias
npm install

# 3. Conseguir volumenes fuente y colocarlos
mkdir -p workspace/sources
# Copiar: the_ra_contact_volume_1.md, the_ra_contact_volume_2.md
# Copiar: ll_research_archive_volume_09.md, 10.md, 11.md

# 4. Preparar un capitulo
/write:prepare 03

# 5. Escribir
/write:step1 03
/write:step2 03
/write:qa 03
/write:glossary 03
/write:publish 03
```

## Pipeline

```
/write:prepare NN
   Lee: writing/reference/ + writing/protocol/
   Genera: writing/chapters/chNN/prompt.md
           workspace/chapters/chNN/manifest.json
           workspace/chapters/chNN/research-ra.md
           workspace/chapters/chNN/research-quo.md
        |
        v
/write:step1 NN
   Lee: writing/protocol/* + writing/chapters/chNN/prompt.md
        workspace/chapters/chNN/research-*.md
   Genera: workspace/chapters/chNN/draft-first.md
        |
        v
/write:step2 NN
   Lee: todo lo anterior + draft-first.md
   Genera: workspace/chapters/chNN/draft-second.md
        |
        v
/write:qa NN
   Lee: ambos drafts + writing/protocol/qa-protocol.md
   Genera: workspace/chapters/chNN/en.json
           workspace/chapters/chNN/qa-report.md
        |
        v
/write:glossary NN
   Lee: en.json + drafts (para {src:})
   Genera: workspace/chapters/chNN/glossary.json
           workspace/chapters/chNN/provenance.json
        |
        v
/write:publish NN
   Ejecuta: integrate-chapter.js → translate-chapter.js → build → deploy
   Resultado: capitulo publicado en 3 idiomas
```

## Estructura de archivos

### `writing/` (en git — publico)

```
writing/
├── protocol/                  # Reglas estables de escritura
│   ├── writing-protocol.md   # Protocolo completo (voz, estructura, terminologia)
│   ├── qa-protocol.md         # 9 categorias de verificacion
│   ├── book-identity.md       # Identidad y proposito del libro
│   ├── source-hierarchy.md    # Ra > Q'uo > externas
│   ├── prompt-base.md         # Instrucciones base + sistema {src:}
│   └── references.json        # Claves validas para {ref:category:id}
│
├── reference/                 # Datos de referencia del libro
│   ├── book-structure.md      # 16 capitulos con contenido asignado
│   ├── ra-thematic-index.md   # Sesiones Ra mapeadas por capitulo y tema
│   └── manifest-template.json # Template JSON para manifiestos
│
├── tools/                     # Scripts del pipeline
│   ├── extract-sources.py     # Extrae citas Ra/Q'uo segun manifiesto
│   └── validate-chapter.cjs   # Validacion programatica de capitulos
│
├── chapters/                  # Prompts por capitulo (ch01-ch16)
│   └── chNN/prompt.md         # Instrucciones especificas por capitulo
│
├── editorial/                 # Trabajo editorial post-escritura
│   └── revision-completa.md   # Notas de revision editorial completa
│
├── v1/                        # Benchmark de la version original
│   ├── README.md
│   ├── ai-writing-prompt.md
│   ├── methodology.md
│   └── sources.md
│
└── README.md                  # Este archivo
```

### `workspace/` (NO en git — por maquina)

```
workspace/
├── sources/                   # Volumenes fuente (copyright L/L Research)
│   ├── the_ra_contact_volume_1.md
│   ├── the_ra_contact_volume_2.md
│   └── ll_research_archive_volume_*.md
│
└── chapters/                  # Borradores y archivos de trabajo
    └── chNN/
        ├── manifest.json      # Manifiesto del capitulo
        ├── research-ra.md     # Citas Ra extraidas
        ├── research-quo.md    # Contexto Q'uo (nunca en texto final)
        ├── draft-first.md     # Primera mitad con marcas
        ├── draft-second.md    # Segunda mitad con marcas
        ├── qa-report.md       # Reporte QA
        ├── en.json            # Capitulo limpio
        ├── glossary.json      # Terminos nuevos
        └── provenance.json    # Mapa de fuentes Ra
```

## Sistema de markup

| Marca               | Proposito                  | En draft | En JSON final |
| ------------------- | -------------------------- | -------- | ------------- |
| `{src:XX.YY}`       | Trazabilidad a sesion Ra   | si       | NO (se quita) |
| `{term:keyword}`    | Primera mencion de termino | si       | si            |
| `{ref:category:id}` | Referencia cruzada         | si       | si            |

## Validacion programatica

```bash
node writing/tools/validate-chapter.cjs i18n/en/chapters/02.json
```

Verifica: schema JSON, {ref:} contra references.json, {term:} unicidad, terminologia prohibida, encoding, {src:} residuales.

## Benchmark v1

El directorio `writing/v1/` contiene la documentacion del metodo original (Claude Projects, sin pipeline). Sirve para:

1. Comparar calidad de prosa entre v1 y v3
2. Calibrar los protocolos si el pipeline produce resultados inferiores
3. Documentar la evolucion del sistema

## Adaptar a otro libro

Para usar este sistema en otro libro:

1. **Copiar** `writing/` a un nuevo repo
2. **Editar** `protocol/book-identity.md` — identidad del nuevo libro
3. **Editar** `protocol/source-hierarchy.md` — si las fuentes son diferentes
4. **Reemplazar** `reference/book-structure.md` — estructura del nuevo libro
5. **Reemplazar** `reference/ra-thematic-index.md` — indice tematico
6. **Editar** `protocol/references.json` — referencias validas para el nuevo libro
7. **Copiar** los slash commands de `.claude/commands/write/`
8. **Colocar** volumenes fuente en `workspace/sources/`
9. **Crear** `writing/v1/` con el benchmark de la version original del libro
