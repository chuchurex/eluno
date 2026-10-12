# Design System — The One (El Uno)

## Product Context
- **What this is:** A philosophical reinterpretation of the Ra Material (The Law of One) as accessible, modern prose. 16 chapters covering cosmology, consciousness, and spiritual evolution.
- **Who it's for:** Contemporary readers interested in philosophy, spirituality, and metaphysics who find the original Q&A format inaccessible.
- **Space/industry:** Philosophy, spirituality, online books. Peers: lawofone.info, L/L Research, Aeon, The Marginalian.
- **Project type:** Online book / editorial reading experience. Three languages (EN, ES, PT).

## Aesthetic Direction
- **Direction:** Editorial Minimal — "The Beautiful Book"
- **Decoration level:** Minimal — typography and whitespace do all the work
- **Mood:** Like opening a beautifully typeset book from an independent press. Quiet confidence. The text speaks for itself. Reading by a window at 3pm, not by candlelight in a temple.
- **Reference sites:** aeon.co (editorial clarity), themarginalian.org (literary depth)
- **Anti-patterns:** No mandalas, sacred geometry, cosmic gradients, nebula backgrounds, or mystical decoration. The content already carries metaphysical weight. Also no cream + terracotta + sans UI: that combination reads as Claude/Anthropic's brand, not as a book. No white app panels for the sidebars, no stacked cards, no tracked-uppercase labels.

## Typography
- **One family for everything:** Source Serif 4 (Google Fonts, variable, opsz 8-60, weights 300-800, roman + italic). Body, headings, navigation, side panel, labels and icon captions all use it. Mixing families read as anarchy.
- **Hierarchy comes only from size, weight and italic:**
  - Titles: weight 500, letter-spacing -0.015em
  - Section headings: weight 600, text color (not accent)
  - Secondary labels ("Capítulo uno", "Fuentes", current chapter above the side panel): italic, muted, normal case. No uppercase tracking.
  - Active nav item and glossary term title: weight 600
- **Loading:** Google Fonts CDN, one request (`lib/build/head.js`).
- **Scale (root 19px):**
  - Display XL: 4.5rem (homepage title)
  - Display: 3rem / 1.15 (chapter titles)
  - Section heading: 1.4rem / 1.3
  - Body: 1rem / 1.75 (this is a book)
  - Nav: 0.9rem
  - Side panel definition: 0.8rem / 1.55 (a margin note, it must not compete with the text)
  - Labels: 0.8-1rem italic
  - Icon captions (MP3/PDF): 0.68rem, weight 700, uppercase (acronyms only)

## Color
- **Approach:** Restrained. Cool white paper, near-black ink, one indigo accent ("A1"). Ink, not earth and not cosmos.
- **Light mode (default):**
  - Background: #fbfbf8 (cool white paper)
  - Surface: #ffffff
  - Text: #1a1c22 (near-black ink)
  - Text muted: #5b606b (metadata, secondary text; 6:1 on paper)
  - Accent: #2f3a9e (indigo, a touch toward violet; 9:1 on paper)
  - Accent hover: #222b7a
  - Border: #e3e4e8 / #cfd1d8
  - Selection: rgba(47, 58, 158, 0.14)
- **Dark mode (available, NOT default):**
  - Background: #14161b
  - Surface: #1b1e24
  - Text: #dfe1e6
  - Text muted: #9aa0ab
  - Accent: #a9b0f7 (lavender of the same hue)
  - Accent hover: #d6d2fb
  - Border: rgba(223, 225, 230, 0.12)
  - Selection: rgba(169, 176, 247, 0.2)
- **Where the accent goes:** links, glossary terms, drop cap, icons (MP3/PDF, theme toggle, section info), active states. Headings stay in text color.
- **Semantic colors:**
  - Success: #4c8d5c
  - Error: #b43c32

## Spacing
- **Base unit:** 8px
- **Density:** Comfortable — generous breathing room for a reading experience
- **Scale:** 2xs(2px) xs(4px) sm(8px) md(16px) lg(24px) xl(32px) 2xl(48px) 3xl(64px) 4xl(96px)
- **Reading column body:** line-height 1.75, paragraph spacing 1.5em

## Layout
- **Approach:** Reading column (chapters) + grid (homepage)
- **Chapter pages:** Single column, max-width 680px, centered. 15%+ viewport margins on desktop.
- **Homepage:** Centered hero + 4-column chapter grid (max-width 960px). 2-col tablet, 1-col mobile.
- **Grid:** CSS Grid, responsive breakpoints at 900px and 540px
- **Max content width:** 680px (reading), 960px (grid), 1200px (shell)
- **Border radius:** sm: 4px, md: 6px, lg: 8px, xl: 12px

## Navigation
- **Structure:** Desktop: left chapter nav and right side panel (current section, glossary definition, sources) sit on the page background, not on white panels. Tablet/mobile: a solid top bar holds the menu, theme and glossary buttons so text never scrolls under bare buttons.
- **Sources:** comma-separated session numbers; an external-link icon fades in on hover/focus in reserved space after the comma (nothing shifts).
- **Icons:** drawn SVG only (no unicode glyphs). Theme toggle is a moon/sun SVG in the accent color.
- **Chapter nav:** Previous/Next links at bottom of each chapter.
- **Progress:** 2px accent-colored bar at top of viewport showing reading progress.
- **Theme toggle:** Button in header to switch light/dark.

## Motion
- **Approach:** Minimal-functional
- **Easing:** enter(ease-out) exit(ease-in) move(ease-in-out)
- **Duration:** micro(50-100ms) short(150-200ms) medium(200-300ms)
- **Hover states:** Chapter cards lift 3px with deeper shadow. Links get underline slide-in.
- **Page transitions:** Instantaneous. No fade-ins, no parallax, no scroll-jacking.
- **Scroll progress:** Thin 2px bar, smooth width transition.

## Key Design Decisions

### Light mode as default
Every spiritual/philosophy site defaults to dark. El Uno inverts this. The book is about illumination. The design should feel like reading by natural light. Dark mode is available for preference, but the identity is warm and bright.

### Indigo accent, not terracotta
The first system used cream + terracotta. In practice it read as Claude/Anthropic's palette, so the site looked machine-made. Indigo on cool white reads as ink on paper from an independent press and belongs to no tech brand.

### Zero cosmic decoration
No mandalas, sacred geometry, nebula images, or mystical patterns. Only typography, whitespace, and one accent color. The writing carries the metaphysical weight. Adding cosmic visuals would be redundant.

### Drop cap on first paragraph
Each chapter opens with a Source Serif 4 drop cap in accent color. A nod to manuscript tradition without being heavy-handed.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-31 | Initial design system created | Complete redesign via /design-consultation. Moved from dark+gold+Cormorant to light+terracotta+Fraunces based on competitive research (5 sites) and independent Claude subagent review. |
| 2026-03-31 | Light mode as default | Departure from category norm (dark-first). Aligns with "accessible philosophy" positioning. |
| 2026-03-31 | Terracotta accent (#c45d35) | Unique in category. Earth tones vs cosmic tones to signal grounded philosophy. |
| 2026-03-31 | Fraunces + Source Serif 4 + JetBrains Mono | All free (Google Fonts). Fraunces for personality, Source Serif 4 for readability, JetBrains Mono for structure. |
| 2026-10-12 | Indigo A1 + Source Serif 4 everywhere | Cream + terracotta + sans read as Claude's brand. Compared 3 directions (ink blue, olive, black and white) and 3 violet-blue tones; chose A1 (#2f3a9e). One typeface for all text after the mixed families felt chaotic. Sidebars on page background, book-style contents list, no tracked caps, hover-only external icons on sources. |
