# El Uno / The One — Transparent Distortion 000

> A philosophical reinterpretation of the Ra Material (The Law of One) for intellectually-oriented seekers.

## What is this?

This book presents the core cosmology and philosophy of the [Ra Material](https://www.llresearch.org/library/the-ra-contact-teaching-the-law-of-one) — channeled by L/L Research between 1981 and 1984 — in accessible, modern language. It is the philosophical foundation from which all other books in the eluno project are derived.

**Live site**: [eluno.org](https://eluno.org)

## The Transparent Distortion concept

This is book **000** — the philosophical core. It presents the teachings using the original Ra terminology (densities, distortions, harvest) without religious framing.

Other books in the [eluno-books](https://github.com/chuchurex/eluno-books) repository adapt this same content for audiences who would otherwise never engage with it:

```
000 (eluno) ─── The philosophical core ← YOU ARE HERE
 │
 ├── 010 (todo) ─── Agnostic simplification
 │
 ├── 020 (jesus) ─── Christian lens
 │    │
 │    └── 021 (sanacion) ─── Practical healing
 │
 └── 100 (doctrinas) ─── Theological doctrine
```

Each version removes trigger words that would activate psychological resistance in its target audience, while preserving the complete philosophical message. Nothing is added that isn't in the source. This is what we call a **transparent distortion** — documented, intentional, and traceable.

## What remains constant across all versions

1. Unity of consciousness at source
2. Apparent separation as sacred and necessary
3. Free will as fundamental principle
4. Love as the creative force
5. Every being is the Creator experiencing itself

## Structure

The book has 16 chapters organized in 5 parts:

| Part | Chapters | Theme                    |
| ---- | -------- | ------------------------ |
| I    | 1-3      | Metaphysical foundations |
| II   | 4-7      | Earth and its history    |
| III  | 8-9      | The veil and death       |
| IV   | 10-13    | Spiritual mechanics      |
| V    | 14-16    | Practice and closing     |

Available in English, Spanish, and Portuguese.

## Development

```bash
npm install
npm run dev          # http://127.0.0.1:3001
npm run build        # Generate dist/
```

## Repository structure

```
eluno/
├── i18n/
│   ├── en/chapters/   # 16 English chapters
│   ├── es/chapters/   # 16 Spanish chapters
│   └── pt/chapters/   # 16 Portuguese chapters
├── assets/covers/     # Chapter covers and OG images
├── docs/              # Technical and writing documentation
├── ai/                # AI methodology (replication guide)
├── PROMPT.md          # Writing prompt for this book
└── README.md
```

## Related repositories

- **[eluno-books](https://github.com/chuchurex/eluno-books)** — The other distortion branches (todo, jesus, sanacion, doctrinas, dormidos)
- **[eluno-core](https://github.com/chuchurex/eluno-core)** — Shared build tools, styles, and fonts

## Technical

- **Source**: [L/L Research - The Ra Contact](https://www.llresearch.org/library/the-ra-contact-teaching-the-law-of-one)
- **Generated with**: Claude (Anthropic) for text, Fish Audio for TTS audiobooks
- **Deployed via**: Cloudflare Pages
- **License**: AGPL-3.0
