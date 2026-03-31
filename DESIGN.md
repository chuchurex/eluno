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
- **Anti-patterns:** No mandalas, sacred geometry, cosmic gradients, nebula backgrounds, or mystical decoration. The content already carries metaphysical weight.

## Typography
- **Display/Hero:** Fraunces (Google Fonts, variable) — Old-style soft serif with personality. Variable optical sizing. Says "this was chosen on purpose." Not generic.
- **Body:** Source Serif 4 (Google Fonts, Adobe, variable) — Designed for long-form reading. Disappears into the background and lets you read.
- **UI/Labels:** JetBrains Mono — For chapter numbers, language toggle, metadata. Clean, legible, structural.
- **Data/Tables:** JetBrains Mono (supports tabular-nums natively)
- **Code:** JetBrains Mono
- **Loading:** Google Fonts CDN, variable fonts for performance. Preconnect to fonts.googleapis.com and fonts.gstatic.com.
- **Scale:**
  - Display XL: 72px / 1.08 (homepage title)
  - Display: 48px / 1.15 (chapter titles)
  - H2: 36px / 1.2
  - H3: 24px / 1.3
  - Body: 19px / 1.75 (larger than standard — this is a book)
  - Small: 15px / 1.6
  - Caption: 13px / 1.5
  - Mono UI: 12-14px / 1.6, letter-spacing 0.06-0.12em

## Color
- **Approach:** Restrained — warm neutrals + single earthy accent. Terracotta, not gold. Earth, not cosmos.
- **Light mode (default):**
  - Background: #f8f5f0 (warm cream, like unbleached paper)
  - Surface: #ffffff (cards, elevated elements)
  - Text: #2a2523 (warm dark brown)
  - Text muted: #8a7e76 (metadata, secondary text)
  - Accent: #c45d35 (terracotta/rust — earthy, confident)
  - Accent hover: #a84d2b
  - Border: #e5e0d8 (subtle sand)
  - Shadow: rgba(42, 37, 35, 0.08)
  - Selection: rgba(196, 93, 53, 0.15)
- **Dark mode (available, NOT default):**
  - Background: #191716 (warm near-black)
  - Surface: #242120 (elevated)
  - Text: #ddd8d2 (warm light gray)
  - Text muted: #8a817a
  - Accent: #e07950 (terracotta, lighter for contrast)
  - Accent hover: #ee8d66
  - Border: rgba(221, 216, 210, 0.12)
  - Shadow: rgba(0, 0, 0, 0.3)
  - Selection: rgba(224, 121, 80, 0.2)
- **Semantic colors:**
  - Success: #4c8d5c
  - Warning: #c45d35 (same as accent)
  - Error: #b43c32
  - Info: #4682b4

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
- **Structure:** Minimal fixed top bar. Left: site title ("The One" / "El Uno"). Right: language toggle (EN | ES | PT).
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

### Terracotta accent instead of gold
Nobody in the Law of One / spiritual category uses earth tones. Everyone goes gold, purple, or cosmic blue. Terracotta says "grounded" not "mystical." It anchors the philosophy in the tangible.

### Zero cosmic decoration
No mandalas, sacred geometry, nebula images, or mystical patterns. Only typography, whitespace, and one accent color. The writing carries the metaphysical weight. Adding cosmic visuals would be redundant.

### Drop cap on first paragraph
Each chapter opens with a Fraunces drop cap in accent color. A nod to manuscript tradition without being heavy-handed.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-31 | Initial design system created | Complete redesign via /design-consultation. Moved from dark+gold+Cormorant to light+terracotta+Fraunces based on competitive research (5 sites) and independent Claude subagent review. |
| 2026-03-31 | Light mode as default | Departure from category norm (dark-first). Aligns with "accessible philosophy" positioning. |
| 2026-03-31 | Terracotta accent (#c45d35) | Unique in category. Earth tones vs cosmic tones to signal grounded philosophy. |
| 2026-03-31 | Fraunces + Source Serif 4 + JetBrains Mono | All free (Google Fonts). Fraunces for personality, Source Serif 4 for readability, JetBrains Mono for structure. |
