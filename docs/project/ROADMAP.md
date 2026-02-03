# Project Roadmap — The One (eluno.org)

> **Purpose**: This document outlines the planned features and improvements for the project.
>
> **Status**: Active development — Spanish version live, multilingual expansion in progress

---

## 🎯 Current Status (v1.0)

**✅ Completed Features:**

- [x] Complete 16-chapter book in Spanish (ES)
- [x] Full English (EN) translation
- [x] Full Portuguese (PT) translation
- [x] Responsive web design (mobile, tablet, desktop)
- [x] Glossary system with 136+ terms (ES/EN/PT)
- [x] Reference system citing Ra Material sources
- [x] PDF generation per chapter
- [x] Spanish audiobook (Fish Audio TTS)
- [x] Hybrid deployment (Cloudflare + Hostinger)
- [x] AI methodology documentation (full replicability)

**🌐 Live URLs:**
- Production: https://eluno.org
- GitHub: https://github.com/chuchurex/eluno.org

---

## 🚀 Planned Features

### Phase 1: Multilingual Audiobook Expansion (Q1-Q2 2026)

**Priority: HIGH**

#### English Audiobook
- [ ] Voice selection and testing (Fish Audio or Cartesia.ai)
- [ ] Generate English TTS audio for all 16 chapters
- [ ] Audio post-processing (normalization, silence removal)
- [ ] Publish to static server (Hostinger)
- [ ] Add English audiobook player to website
- [ ] Test streaming performance across devices

**Estimated effort**: 2-3 weeks

#### Portuguese Audiobook
- [ ] Voice selection and testing (Fish Audio or Cartesia.ai)
- [ ] Generate Portuguese TTS audio for all 16 chapters
- [ ] Audio post-processing (normalization, silence removal)
- [ ] Publish to static server (Hostinger)
- [ ] Add Portuguese audiobook player to website
- [ ] Test streaming performance across devices

**Estimated effort**: 2-3 weeks

**Technical considerations:**
- Use existing pipeline from Spanish audiobook generation
- Scripts available in `scripts/build-audiobook.js`
- Target format: MP3 at 128kbps for optimal streaming
- Host on Hostinger at `static.lawofone.cl/audiobook/`

---

### Phase 2: Content Quality & Accessibility (Q2 2026)

**Priority: MEDIUM**

#### Content Improvements
- [ ] Spanish audiobook voice improvements (explore better TTS options)
- [ ] Proofreading pass for EN/PT translations
- [ ] Fact-check all references against Ra Material source
- [ ] Expand glossary with additional terms from later chapters

#### Accessibility Enhancements
- [ ] WCAG 2.1 AA compliance audit
- [ ] Screen reader optimization
- [ ] Keyboard navigation improvements
- [ ] High contrast mode
- [ ] Font size controls

---

### Phase 3: Technical Enhancements (Q3 2026)

**Priority: MEDIUM**

#### Performance Optimizations
- [ ] Image optimization (WebP format)
- [ ] Lazy loading for chapter content
- [ ] Service worker for offline reading
- [ ] CDN optimization for static assets

#### SEO & Discovery
- [ ] Structured data (Schema.org) for chapters
- [ ] Open Graph tags optimization
- [ ] Sitemap generation
- [ ] RSS feed for chapters

#### Developer Experience
- [ ] Add automated testing (unit + e2e)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Automated deployment previews
- [ ] Better error logging

---

### Phase 4: Community Features (Q4 2026)

**Priority: LOW**

#### Reader Engagement
- [ ] Chapter discussion system (comment integration?)
- [ ] Highlight and note-taking (local storage)
- [ ] Reading progress tracking
- [ ] Bookmark system

#### Contributor Tools
- [ ] Contributor guidelines (see CONTRIBUTING.md)
- [ ] Translation workflow documentation
- [ ] Content editing guide
- [ ] Glossary term submission process

---

## 📊 Metrics & Success Criteria

### Content Quality
- All references verified against Ra Material source
- Zero doctrinal deviations from source material
- Professional TTS quality for all languages

### Technical Performance
- Lighthouse score 90+ (Performance, Accessibility, Best Practices, SEO)
- Page load time < 2s on 3G connection
- Zero critical accessibility violations (WCAG 2.1 AA)

### User Experience
- Mobile-first responsive design
- Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- Audiobook streaming without buffering issues

---

## 🔮 Future Considerations (Beyond 2026)

**Not committed, pending community feedback:**

- Physical book publication (print-on-demand?)
- Mobile app (React Native or PWA?)
- API for programmatic access to content
- Integration with Ra Material study tools
- Additional language translations (FR, DE, IT?)
- Video/animation explanations for complex concepts
- Interactive diagrams for cosmology chapters

---

## 🛠 Technical Debt & Maintenance

### Ongoing
- Keep dependencies updated (npm audit)
- Monitor CDN costs and performance
- Review and update documentation
- Address security vulnerabilities promptly

### Refactoring Candidates
- Build script consolidation (too many scripts/)
- PDF generation optimization (Puppeteer is slow)
- Better error handling in TTS scripts
- Unified configuration system

---

## 🤝 How to Contribute

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:
- Reporting bugs
- Suggesting features
- Submitting pull requests
- Content quality standards

**Priority areas for contributors:**
1. **Audiobook**: Help with EN/PT voice selection and testing
2. **Accessibility**: WCAG compliance improvements
3. **Translations**: Proofreading EN/PT content
4. **Documentation**: Clarifying setup instructions

---

## 📅 Release Schedule

### v1.1 (Target: March 2026)
- English audiobook complete
- Portuguese audiobook complete
- Accessibility improvements

### v1.2 (Target: June 2026)
- Content quality pass (proofreading, fact-checking)
- SEO optimizations
- Performance improvements

### v2.0 (Target: December 2026)
- Community features (discussions, bookmarks)
- Offline reading (PWA)
- Contributor workflow tools

---

## 📞 Questions or Suggestions?

- Open a GitHub issue with the `roadmap` or `feature-request` label
- Check existing issues to avoid duplicates
- Provide use cases and rationale for new features

---

**Last updated**: January 13, 2026
**Maintained by**: chuchurex
**License**: See LICENSE file
