# Quick Start: Writing Pipeline

> **Prerequisites**: Node.js 20+, Claude Code CLI, source PDFs in `workspace/sources/`

The entire writing pipeline runs in Claude Code using slash commands. No Claude Projects, no manual copy-pasting.

---

## Setup

1. **Clone and install:**
   ```bash
   git clone https://github.com/chuchurex/eluno.git
   cd eluno
   npm install
   ```

2. **Place source PDFs** in `workspace/sources/` (gitignored):
   - The Ra Contact - Volume 1 & 2 (required)
   - L/L Research Archive - Volumes 9-11 (recommended, Q'uo context)

   See [`SOURCES.md`](./SOURCES.md) for download links.

3. **Set up environment:**
   ```bash
   cp .env.example .env
   # Add your ANTHROPIC_API_KEY for translations
   ```

---

## Writing a chapter

Run a single command to execute all 6 phases autonomously:

```
/write:chapter 04
```

This runs:

| Phase | Command | What it does |
|-------|---------|-------------|
| 1 | `/write:prepare` | Research sources, create manifest and prompt |
| 2 | `/write:step1` | Write first half of chapter |
| 3 | `/write:step2` | Write second half |
| 4 | `/write:qa` | QA validation + assemble final JSON |
| 5 | `/write:glossary` | Generate glossary terms + source provenance |
| 6 | `/write:publish` | Translate (ES/PT), build site, deploy |

Each phase can also be run individually to retry or fix issues.

---

## Key files

### Protocol (stable, in git)
- [`writing/protocol/writing-protocol.md`](../writing/protocol/writing-protocol.md) — Voice, style, rules
- [`writing/protocol/qa-protocol.md`](../writing/protocol/qa-protocol.md) — 9-category QA checklist
- [`writing/protocol/prompt-base.md`](../writing/protocol/prompt-base.md) — System instructions
- [`writing/protocol/source-hierarchy.md`](../writing/protocol/source-hierarchy.md) — Source authority rules
- [`writing/reference/book-structure.md`](../writing/reference/book-structure.md) — 16 chapters mapped to content

### Per-chapter (workspace, gitignored)
- `workspace/chapters/chNN/manifest.json` — Chapter plan and section outline
- `workspace/chapters/chNN/research-ra.md` — Ra Material research notes
- `workspace/chapters/chNN/draft-first.md` — First half draft
- `workspace/chapters/chNN/draft-second.md` — Second half draft

### Output (in git)
- `i18n/en/chapters/NN.json` — Final chapter (English)
- `i18n/es/chapters/NN.json` — Spanish translation
- `i18n/pt/chapters/NN.json` — Portuguese translation
- `i18n/en/glossary.json` — Glossary (merged per chapter)
- `i18n/provenance/chNN.json` — Source provenance map

---

## Output format

Chapters are JSON with markup:

```json
{
  "id": "ch1",
  "number": 1,
  "numberText": "Chapter One",
  "title": "Cosmology and Genesis",
  "sections": [
    {
      "id": "ch1-infinite",
      "title": "The Infinite and the Awakening of Consciousness",
      "content": [
        {
          "type": "paragraph",
          "text": "The first known thing in creation is the {term:infinite}..."
        }
      ]
    }
  ]
}
```

Markup: `{term:keyword}` for glossary links, `{ref:category:id}` for source references.

---

## Quality rules

- First-person plural voice ("we/our/us")
- Never mention Ra, Q'uo, channeling, or sessions in the text
- Ra Contact is the sole authority; Q'uo is for understanding only
- Every concept must trace back to the source material
- Paradoxes remain intact (don't resolve them)

See [`AI_WRITING_PROMPT.md`](./AI_WRITING_PROMPT.md) for complete guidelines and [`METHODOLOGY.md`](./METHODOLOGY.md) for editorial decisions.

---

*Last updated: February 23, 2026*
