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

## Replicate this project

This isn't just a book — it's a reproducible pipeline. Anyone can fork this repo, modify the prompts, and generate their own version of the book (or an entirely different book using the same framework).

The pipeline uses [Claude Code](https://docs.anthropic.com/en/docs/claude-code) slash commands to automate 6 phases: research, writing (two halves), QA, glossary/provenance, and publication (translation + build + deploy).

**To get started:** see [ai/QUICK_START.md](ai/QUICK_START.md)

Requirements: Node.js 20+, Claude Code CLI, source PDFs, Anthropic API key (for translations).

## Tech stack

| Technology           | Role                                    |
| -------------------- | --------------------------------------- |
| Node.js              | Build system, scripts                   |
| SASS                 | Styles (via `@eluno/core`)              |
| Cloudflare Pages     | Hosting, auto-deploy on push to `main`  |
| Claude (Anthropic)   | Writing pipeline, automated translation |
| Edge TTS (Microsoft) | Audiobook generation                    |
| GitHub Actions       | CI (lint, format, tests, build)         |
| Husky + lint-staged  | Pre-commit hooks                        |

## Development

```bash
npm install
npm run dev          # SASS watch + live server at localhost:4025
npm run build        # Generate dist/
npm test             # Run tests
npm run validate     # Lint + format check + JSON validation
```

## Repository structure

```
eluno/
├── i18n/                  # Content: 16 chapters × 3 languages (JSON)
│   ├── {en,es,pt}/chapters/
│   ├── {en,es,pt}/glossary.json
│   └── provenance/        # Source maps linking sections to Ra Material
├── scripts/               # Build, translation, integration, validation
├── src/scss/              # Styles (imports @eluno/core)
├── writing/               # Writing pipeline
│   ├── protocol/          #   Stable rules: voice, QA, source hierarchy
│   ├── reference/         #   Book structure, thematic index
│   ├── chapters/          #   Per-chapter prompts (in git)
│   └── tools/             #   Pipeline scripts
├── ai/                    # AI methodology and replication guide
├── docs/                  # Technical, project, and audiobook docs
├── .claude/commands/      # Claude Code slash commands (the pipeline)
├── static/                # PDFs, favicons, Cloudflare headers
├── PROMPT.md              # Public writing prompt (transparency)
└── LICENSE                # AGPL-3.0
```

## Contributing

See [Contributing Guide](docs/project/CONTRIBUTING.md) for how to report bugs, propose changes, and submit pull requests.

## Documentation

| If you want to...                    | Start here                                                                   |
| ------------------------------------ | ---------------------------------------------------------------------------- |
| Replicate the book or build your own | [ai/QUICK_START.md](ai/QUICK_START.md)                                       |
| Understand the writing methodology   | [ai/METHODOLOGY.md](ai/METHODOLOGY.md)                                       |
| Read the writing protocol            | [writing/protocol/writing-protocol.md](writing/protocol/writing-protocol.md) |
| Understand the architecture          | [docs/tech/ARCHITECTURE.md](docs/tech/ARCHITECTURE.md)                       |
| Set up local development             | [docs/tech/DEVELOPMENT.md](docs/tech/DEVELOPMENT.md)                         |
| See project status                   | [docs/project/PROJECT_STATUS.md](docs/project/PROJECT_STATUS.md)             |

## License

AGPL-3.0 — see [LICENSE](LICENSE).

This license ensures that derivative works remain open source. If you fork this project and deploy your own version, your code must also be publicly available under the same terms. This is intentional: the project invites replication, and the license ensures all versions stay open.

Content is derived from the Ra Material by [L/L Research](https://www.llresearch.org/), used with attribution.
