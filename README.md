# The One (El Uno)

> A philosophical reinterpretation of the Ra Material (The Law of One) as accessible, modern prose.

## What is this?

The [Ra Material](https://www.llresearch.org/library/the-ra-contact-teaching-the-law-of-one) — channeled by L/L Research between 1981 and 1984 — contains a profound cosmology and philosophy, but its Q&A format and dense language make it difficult to approach. This book rewrites that content as narrative prose organized by theme, preserving the original concepts while making them accessible to contemporary readers.

16 chapters cover the full scope: from the nature of the Infinite Creator and the densities of consciousness, through Earth's spiritual history and the mechanics of spiritual evolution, to practical guidance for seekers.

Available in English, Spanish, and Portuguese.

**Read it at [eluno.org](https://eluno.org)**

## Structure

| Part | Chapters | Theme                    |
| ---- | -------- | ------------------------ |
| I    | 1-3      | Metaphysical foundations |
| II   | 4-7      | Earth and its history    |
| III  | 8-9      | The veil and death       |
| IV   | 10-13    | Spiritual mechanics      |
| V    | 14-16    | Practice and closing     |

## Development

```bash
npm install
npm run dev          # http://127.0.0.1:3001
npm run build        # Generate dist/
```

## Repository structure

```
eluno/
├── i18n/                  # Content (JSON)
│   ├── en/chapters/       #   16 English chapters
│   ├── es/chapters/       #   16 Spanish chapters
│   ├── pt/chapters/       #   16 Portuguese chapters
│   └── */glossary.json    #   Glossary per language
├── scripts/               # Build, translation, PDF generation
├── src/scss/              # Styles (SASS)
├── writing/               # Writing pipeline (protocols, prompts, tools)
├── static/pdf/            # Pre-built PDFs (EN/ES/PT)
├── docs/                  # Technical and project documentation
├── ai/                    # AI methodology (replication guide)
├── .claude/commands/      # Claude Code slash commands
├── PROMPT.md              # Writing prompt for this book
└── LICENSE                # AGPL-3.0
```

## Technical

- **Source**: [L/L Research - The Ra Contact](https://www.llresearch.org/library/the-ra-contact-teaching-the-law-of-one)
- **Written with**: Claude (Anthropic) — see [ai/](ai/) for full methodology
- **Audiobook**: Edge TTS (Microsoft) — see [docs/audiobook/](docs/audiobook/)
- **Deployed via**: Cloudflare Pages
- **License**: AGPL-3.0
