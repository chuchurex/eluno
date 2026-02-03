# Quick Start: Replicate This Book

> **Time to start**: ~30 minutes
> **Prerequisites**: Claude Pro account with Projects access

This guide will help you replicate the writing methodology of "The One" for your own project.

---

## 📚 Step 1: Download Source PDFs (5 minutes)

Download all five PDFs from these direct links:

### Primary Sources (Required)
1. [The Ra Contact - Volume 1](https://assets.llresearch.org/books/the_ra_contact_volume_1.pdf) (Ra sessions 1-56)
2. [The Ra Contact - Volume 2](https://assets.llresearch.org/books/the_ra_contact_volume_2.pdf) (Ra sessions 57-106)

### Context Sources (Recommended)
3. [L/L Research Archive - Volume 9](https://assets.llresearch.org/books/ll_research_archive_volume_09.pdf) (Q'uo)
4. [L/L Research Archive - Volume 10](https://assets.llresearch.org/books/ll_research_archive_volume_10.pdf) (Q'uo)
5. [L/L Research Archive - Volume 11](https://assets.llresearch.org/books/ll_research_archive_volume_11.pdf) (Q'uo)

**Total size**: ~20-35 MB

See [`SOURCES.md`](./SOURCES.md) for more details about each source.

---

## 🤖 Step 2: Create Claude Project (5 minutes)

1. Go to [claude.ai/projects](https://claude.ai/projects)
2. Click **"Create Project"**
3. Name it: `The One - Replication` (or your preferred name)
4. Click **"Add content"** → **"Upload files"**
5. Upload all 5 PDFs
6. Wait for processing to complete (1-2 minutes per file)

### Verify Upload
In the chat, ask:
```
Can you confirm you have access to The Ra Contact Volumes 1-2
and L/L Research Archive Volumes 9-11?
```

Claude should confirm it can access all five documents.

---

## ⚙️ Step 3: Set Up System Prompt (10 minutes)

1. In your Claude Project, click **"Project Settings"** (gear icon)
2. Scroll to **"Custom Instructions"**
3. Open [`AI_WRITING_PROMPT.md`](./AI_WRITING_PROMPT.md) from this repository
4. Copy **the entire contents** of the system prompt section (starts at line 49)
5. Paste into Custom Instructions
6. Click **"Save"**

**What this does**: Configures Claude with the voice, style, and rules for writing.

---

## 📄 Step 4: Upload Context Files (5 minutes)

Upload these files to the chat (drag and drop):

### Required
- [`WRITING_PROTOCOL_V3.md`](../docs/WRITING_PROTOCOL_V3.md) — Writing protocol (424 lines)
- [`BOOK_STRUCTURE_16_CHAPTERS.md`](../docs/BOOK_STRUCTURE_16_CHAPTERS.md) — Book structure (16 chapters)

### Recommended
- [`METHODOLOGY.md`](./METHODOLOGY.md) — Editorial decisions and lessons learned

**Spanish backups:**
- 🇪🇸 Spanish documentation preserved in [`backups/spanish-docs/`](../backups/spanish-docs/) for reference

**Note**: These files provide additional context beyond the system prompt.

---

## ✍️ Step 5: Start Writing Your First Chapter (5 minutes to start)

### Example: Chapter 1

Copy and paste this prompt into the chat:

```
I need to write Chapter 1: Cosmology and Genesis.

Please search the Ra Contact PDFs for all relevant sessions covering:
- The Infinite and the awakening of consciousness
- The first paradox: from One to Many
- The architecture of creation (Logos, sub-Logos)
- Light as foundation of the material world
- Densities as the octave of creation
- Fractal structure of reality
- The nature of illusion
- The mystery that remains

Create a thematic index with session references for internal use only.
```

### What Happens Next

Claude will:
1. Search both Ra Contact volumes
2. Extract relevant passages
3. Create a thematic index (internal tool)
4. Ask if you want to proceed with outline or draft

### Continue the Workflow

Follow the [Chapter Writing Workflow](./AI_WRITING_PROMPT.md#chapter-writing-workflow) in the main prompt document:

1. **Research Phase** → Create thematic index
2. **Outline Phase** → Structure the chapter
3. **Writing Phase** → Draft sections
4. **Review Phase** → Check against quality standards
5. **Translation Phase** → Translate to other languages (if needed)

---

## 📋 Chapter Writing Checklist

For each section you write, verify:

- [ ] Faithful paraphrase of Ra source (NOT Q'uo)
- [ ] "We/you" voice maintained consistently
- [ ] "Approximately" used where Ra would use it
- [ ] Mysteries acknowledged without resolving them
- [ ] Science integrated without forcing
- [ ] Session logistics omitted
- [ ] Narrative flow maintained
- [ ] Author origin neutrality maintained
- [ ] Practical guidance respects free will
- [ ] Closing varies from "mystery remains" pattern
- [ ] FREE of any source mention or attribution

See full checklist in [`AI_WRITING_PROMPT.md`](./AI_WRITING_PROMPT.md#section-checklist).

---

## 🎯 Expected Output Format

Chapters are output in JSON format:

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

### Markup Syntax
- `{term:keyword}` — Links to glossary
- `{ref:category:id}` — Links to external reference
- `· · ·` — Visual separator

---

## 🔧 Tips for Success

### Voice Consistency
- **Always** use "we/our/us" (first-person plural)
- **Never** mention Ra, Q'uo, channeling, or sessions
- **Maintain** author origin neutrality (don't reveal non-human source)

### Source Usage
- **Ra Contact**: Paraphrase faithfully (never quote directly)
- **Q'uo Material**: Use for understanding only (NEVER in final text)
- **Cross-traditional**: Use for enrichment (Kabbalah, Vedanta, Buddhism)

### Quality Control
- Read [`METHODOLOGY.md`](./METHODOLOGY.md) for common pitfalls
- Use the section checklist before finalizing
- Test that paradoxes remain intact (don't resolve them)

---

## 🚀 Next Steps

### After Your First Chapter
1. Review against the [Quality Standards](./AI_WRITING_PROMPT.md#quality-standards)
2. Share with a test reader
3. Iterate based on feedback
4. Move to Chapter 2

### Adapting for Your Project
This methodology can be adapted for other source materials:
- Replace Ra/Q'uo PDFs with your source texts
- Modify the voice guidelines in the system prompt
- Adjust terminology table for your domain
- Keep the quality checklist framework

---

## 📚 Additional Resources

### In This Repository
- [`AI_WRITING_PROMPT.md`](./AI_WRITING_PROMPT.md) — Complete system prompt
- [`METHODOLOGY.md`](./METHODOLOGY.md) — Editorial decisions and lessons learned
- [`SOURCES.md`](./SOURCES.md) — Detailed source material information
- [`docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md) — Technical implementation

### External
- [L/L Research Website](https://www.llresearch.org) — Original source material
- [Claude Projects Documentation](https://support.anthropic.com/en/collections/4078534-projects) — How to use Claude Projects

---

## ❓ Troubleshooting

### "Claude isn't following the voice guidelines"
- Re-paste the system prompt in Custom Instructions
- Remind Claude in the chat: "Remember to maintain the we/you voice"
- Check that PROTOCOLO_ESCRITURA_V3.md is uploaded

### "It's quoting Ra directly"
- Stop and correct immediately: "Please paraphrase instead of quoting"
- Review the [Source Attribution Policy](./AI_WRITING_PROMPT.md#sources-and-attribution)

### "The output doesn't match the JSON format"
- Provide an example from `i18n/en/chapters/01.json` in this repo
- Ask: "Please format as JSON following this structure"

### "I need help understanding Ra's concepts"
- Read the Q'uo volumes (they explain Ra's teachings)
- Ask Claude: "Help me understand [concept] from Ra's perspective"
- Use Q'uo for clarity, but don't let it into the final text

---

## 🤝 Contributing

If you use this methodology and improve it:
1. Open an issue or PR on GitHub
2. Share your learnings
3. Help us refine the process

---

## 📝 License

This methodology is open source. The Ra Material source content is © L/L Research.

---

*Ready to start? Go to [Step 1](#-step-1-download-source-pdfs-5-minutes) and begin your journey.*

---

*Last updated: January 13, 2026*
