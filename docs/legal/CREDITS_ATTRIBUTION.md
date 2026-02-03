# Credits & Attribution Guidelines

> **Purpose**: Define the exact credits and attribution text for all media formats (PDF, MP3) to comply with L/L Research requirements.

---

## Source Material Attribution

### Original Work
- **Title**: The Ra Material (The Law of One)
- **Copyright**: © L/L Research
- **Authors**: Don Elkins, Carla L. Rueckert, Jim McCarty
- **Website**: https://www.llresearch.org
- **Authorization**: Received January 10, 2026

### Derivative Work
- **Title (EN)**: The One
- **Title (ES)**: El Uno
- **Title (PT)**: O Um
- **Author/Interpreter**: eluno.org (Carlos Martínez)
- **Website**: https://eluno.org

---

## PDF Credits

### Footer Note (Every Page)
Small text at bottom of each page:

**English:**
```
Based on The Ra Material © L/L Research | llresearch.org | Interpretation: eluno.org
```

**Spanish:**
```
Basado en el Material Ra © L/L Research | llresearch.org | Interpretación: eluno.org
```

**Portuguese:**
```
Baseado no Material Ra © L/L Research | llresearch.org | Interpretação: eluno.org
```

### Credits Page (Complete Book PDF)
Include as last page before glossary:

**English:**
```
─────────────────────────────────────────

CREDITS & ATTRIBUTION

This work is an interpretation of The Ra Material (The Law of One),
originally received by Don Elkins, Carla L. Rueckert, and Jim McCarty
between 1981-1984.

Original Material: © L/L Research
Available free at: llresearch.org

This interpretation was created by Carlos Martínez (eluno.org)
with AI assistance (Claude by Anthropic).

This is a study aid only. For authoritative understanding,
always consult the original Ra Material sessions.

─────────────────────────────────────────
```

**Spanish:**
```
─────────────────────────────────────────

CRÉDITOS Y ATRIBUCIÓN

Este trabajo es una interpretación del Material Ra (La Ley del Uno),
originalmente recibido por Don Elkins, Carla L. Rueckert y Jim McCarty
entre 1981-1984.

Material Original: © L/L Research
Disponible gratis en: llresearch.org

Esta interpretación fue creada por Carlos Martínez (eluno.org)
con asistencia de IA (Claude de Anthropic).

Esta es solo una herramienta de estudio. Para una comprensión
autorizada, consulte siempre las sesiones originales del Material Ra.

─────────────────────────────────────────
```

---

## MP3 Audio Credits (ID3 Tags)

### Individual Chapter Files

| Tag | English | Spanish | Portuguese |
|-----|---------|---------|------------|
| **Title** | The One - Ch.X: [Chapter Title] | El Uno - Cap.X: [Título] | O Um - Cap.X: [Título] |
| **Artist** | eluno.org | eluno.org | eluno.org |
| **Album** | The One | El Uno | O Um |
| **Album Artist** | eluno.org | eluno.org | eluno.org |
| **Year** | 2025 | 2025 | 2025 |
| **Genre** | Audiobook / Spirituality | Audiolibro / Espiritualidad | Audiolivro / Espiritualidade |
| **Track** | X/16 | X/16 | X/16 |
| **Comment** | Based on The Ra Material © L/L Research. Original: llresearch.org | Basado en el Material Ra © L/L Research. Original: llresearch.org | Baseado no Material Ra © L/L Research. Original: llresearch.org |
| **Copyright** | © L/L Research (source) / eluno.org (interpretation) | © L/L Research (fuente) / eluno.org (interpretación) | © L/L Research (fonte) / eluno.org (interpretação) |
| **URL** | https://eluno.org | https://eluno.org/es | https://eluno.org/pt |

### Complete Audiobook File

| Tag | Spanish (Primary) |
|-----|-------------------|
| **Title** | El Uno - Audiolibro Completo |
| **Artist** | eluno.org |
| **Album** | El Uno |
| **Album Artist** | eluno.org |
| **Year** | 2025 |
| **Genre** | Audiolibro / Espiritualidad |
| **Comment** | Interpretación del Material Ra (La Ley del Uno) © L/L Research. Material original disponible gratis en llresearch.org. Interpretación: eluno.org |
| **Copyright** | Material original © L/L Research / Interpretación © eluno.org |
| **URL** | https://eluno.org/es |

---

## File Naming Convention

### PDF Files
```
/pdf/en/ch01.pdf          → The One - Chapter 1
/pdf/es/ch01.pdf          → El Uno - Capítulo 1
/pdf/pt/ch01.pdf          → O Um - Capítulo 1
/pdf/en/complete-book.pdf → The One (Complete)
/pdf/es/complete-book.pdf → El Uno (Completo)
/pdf/pt/complete-book.pdf → O Um (Completo)
```

### Audio Files
```
/audiobook/audio/es/01-cosmologia-y-genesis.mp3
/audiobook/audio/es/el-uno-audiolibro-completo.mp3
```

---

## Implementation Checklist

### PDF Updates
- [ ] Add footer credit line to `build-pdf.js` footer template
- [ ] Add credits page to complete book PDF
- [ ] Regenerate all PDFs with: `npm run build:pdf all`
- [ ] Regenerate complete books: `npm run build:pdf complete`

### MP3 Updates
- [ ] Install ID3 tagging tool (e.g., `id3v2` or `ffmpeg`)
- [ ] Create script to batch-update ID3 tags
- [ ] Apply tags to all chapter files
- [ ] Apply tags to complete audiobook file
- [ ] Re-upload to static.eluno.org

### Verification
- [ ] Check PDF footer renders correctly
- [ ] Check credits page appears in complete book
- [ ] Verify ID3 tags with audio player
- [ ] Test on mobile devices

---

## Legal Notes

1. **L/L Research Authorization**: This project received authorization from L/L Research on January 10, 2026 (documented in `ai/SOURCES.md`)

2. **Derivative Work**: This is explicitly a derivative/interpretive work, not the original Ra Material

3. **Free Access**: Always emphasize that the original material is free at llresearch.org

4. **Study Aid Disclaimer**: This is a supplementary tool, not a replacement for the original

---

*Last updated: January 2026*
*For questions about attribution, contact the project maintainer or L/L Research directly.*
