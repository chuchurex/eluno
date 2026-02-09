# Provenance Generation Guide

This guide explains how to create provenance files for chapters of "El Uno" (The One), linking each paragraph to its source material from the Law of One (Ra Material).

## What is Provenance?

Provenance files map each paragraph of a chapter to its original source sessions from lawofone.info. This allows readers to verify and explore the original Ra Material that inspired each section.

## Output Format

Each provenance file is a JSON file with this structure:

```json
{
  "chapter": "ch2",
  "title": "The Creator and Creation",
  "base_url": "https://www.lawofone.info/s/",
  "provenance": [
    {
      "section_id": "ch2-nature",
      "section_title": "The Two Faces of Infinity",
      "segments": [
        {
          "paragraphs": [1, 2],
          "sources": ["13.5", "13.6"],
          "urls": [
            "https://www.lawofone.info/s/13#5",
            "https://www.lawofone.info/s/13#6"
          ],
          "note": "Brief description of what these paragraphs cover"
        }
      ]
    }
  ]
}
```

### Field Descriptions

- **chapter**: Chapter ID (e.g., "ch2", "ch3", "ch4")
- **title**: English title of the chapter
- **base_url**: Always `https://www.lawofone.info/s/`
- **provenance**: Array of sections

Each **section** contains:
- **section_id**: Matches the `id` field in the chapter JSON
- **section_title**: Matches the `title` field in the chapter JSON
- **segments**: Array of paragraph groupings with their sources

Each **segment** contains:
- **paragraphs**: Array of 1-based paragraph numbers within the section
- **sources**: Array of Ra session references in format "session.question" (e.g., "13.5" = Session 13, Question 5)
- **urls**: Full URLs to lawofone.info (constructed from sources)
- **note**: Brief description of the content covered (for maintainability)

### Special Cases

For paragraphs that are:
- **Synthesis/Original content**: Use `"sources": ["synthesis"]` and `"urls": []`
- **External references only**: Still try to find the closest Ra source for the concept

---

## Chapters Needing Provenance

### Chapter 2: The Creator and Creation

**Sections to map:**

1. **ch2-nature** - "The Two Faces of Infinity" (7 paragraphs)
   - Topics: unpotentiated vs potentiated Infinite, Intelligent Infinity, Intelligent Energy, cosmic rhythm
   - Key Ra sessions: 13.5-13.9, 27.x, 28.x

2. **ch2-consciousness** - "Consciousness Before All Things" (8 paragraphs)
   - Topics: consciousness as substrate, hard problem, panpsychism parallels
   - Key Ra sessions: 1.x, 4.x, 13.x

3. **ch2-why** - "Why the Infinite Chose Limitation" (7 paragraphs)
   - Topics: being vs knowing, Free Will, Love, Light as distortions
   - Key Ra sessions: 13.12, 15.21-22, 27.13-14

4. **ch2-process** - "From Vibration to Form" (7 paragraphs)
   - Topics: vibration, photon, matter as condensed light, E=mc²
   - Key Ra sessions: 13.9, 27.x, 29.x, 40.x

5. **ch2-experiment** - "The Cosmic Experiment" (8 paragraphs)
   - Topics: Logoi without Free Will, veil experiment, Law of Confusion
   - Key Ra sessions: 78.x, 82.x, 83.x

6. **ch2-cocreator** - "You Who Create" (6 paragraphs)
   - Topics: you as sub-sub-sub-Logos, conscious creation
   - Key Ra sessions: 13.13, 13.16-17, 29.x

7. **ch2-purpose** - "The Infinite Knowing Itself Through You" (6 paragraphs)
   - Topics: purpose of creation, unique perspective, harvest
   - Key Ra sessions: 1.1, 4.20, 10.14, 52.x

8. **ch2-recognition** - "The Recognition" (5 paragraphs + quote + separator)
   - Topics: synthesis, you are the Creator
   - Key Ra sessions: synthesis of above

---

### Chapter 3: The Densities of Consciousness

**Sections to map:**

1. **ch3-nature** - "The Nature of Densities" (5 paragraphs)
   - Topics: densities as light concentration, rays, spiral light
   - Key Ra sessions: 13.x, 16.x, 28.x

2. **ch3-first** - "First Density: The Cycle of Being" (6 paragraphs)
   - Topics: fire/wind/earth/water, 2 billion years, red ray
   - Key Ra sessions: 13.21, 19.2, 27.x, 28.x

3. **ch3-second** - "Second Density: The Cycle of Growth" (5 paragraphs)
   - Topics: 4.6 billion years, striving, group consciousness
   - Key Ra sessions: 13.21, 19.2-4, 9.x

4. **ch3-awakening** - "The Awakening of Self-Awareness" (7 paragraphs)
   - Topics: spirit complex activation, investment, three paths
   - Key Ra sessions: 19.x, 20.x, 30.x

5. **ch3-third** - "Third Density: The Cycle of the Choice" (10 paragraphs)
   - Topics: veil, 75,000 years, the choice, 51%/95% thresholds
   - Key Ra sessions: 16.x, 17.x, 19.x, 78.x, 82.x

6. **ch3-fourth** - "Fourth Density: The Cycle of Love" (7 paragraphs)
   - Topics: transparency, social memory complex, 30 million years
   - Key Ra sessions: 16.x, 20.x, 36.x, 43.x

7. **ch3-fifth** - "Fifth Density: The Cycle of Wisdom" (4 paragraphs)
   - Topics: wisdom, solitude, 50 million years
   - Key Ra sessions: 16.x, 25.x, 33.x

8. **ch3-sixth** - "Sixth Density: The Cycle of Unity" (5 paragraphs)
   - Topics: love/wisdom balance, negative polarity switch, Higher Self
   - Key Ra sessions: 16.x, 36.x, 70.x

9. **ch3-seventh** - "Seventh Density: The Gateway" (4 paragraphs)
   - Topics: foreverness, spiritual gravity
   - Key Ra sessions: 16.x, 41.x

10. **ch3-octave** - "The Octave: Return and Renewal" (4 paragraphs)
    - Topics: eighth density, black holes, new octave
    - Key Ra sessions: 16.x, 28.x

11. **ch3-journey** - "The Journey Ahead" (4 paragraphs + quote)
    - Topics: synthesis, urgency of third density
    - Key Ra sessions: synthesis

---

### Chapter 4: Earth's Spiritual History

**Sections to map:**

1. **ch4-gathering** - "A Planet of Many Origins" (4 paragraphs)
   - Topics: Earth as crossroads, mixed origins
   - Key Ra sessions: 10.x, 20.x, 59.x

2. **ch4-maldek** - "Maldek: The Cosmic Warning" (7 paragraphs)
   - Topics: destruction 705,000 years ago, knot of fear, karmic alleviation
   - Key Ra sessions: 10.x, 21.x, 24.x, 30.x

3. **ch4-mars** - "Mars and the Transfer" (5 paragraphs)
   - Topics: Mars atmosphere, genetic transfer, 75,000 years ago
   - Key Ra sessions: 9.x, 20.x, 21.x

4. **ch4-quarantine** - "The Quarantine" (5 paragraphs)
   - Topics: Council of Saturn, vibratory barrier, windows
   - Key Ra sessions: 6.x, 7.x, 12.x, 16.x

5. **ch4-first-cycle** - "The First Cycle: Lemuria" (6 paragraphs)
   - Topics: 75,000-50,000 years ago, Deneb, no harvest
   - Key Ra sessions: 10.x, 20.x, 21.x

6. **ch4-second-cycle** - "The Second Cycle: Scattered Growth" (6 paragraphs)
   - Topics: 50,000-25,000 years ago, dispersed development
   - Key Ra sessions: 20.x, 21.x, 22.x

7. **ch4-atlantis** - "The Rise and Fall of Atlantis" (9 paragraphs)
   - Topics: technology, crystals, two catastrophes, 9,600 years ago
   - Key Ra sessions: 10.x, 22.x, 23.x, 24.x

8. **ch4-egypt** - "Egypt and the Pyramids" (8 paragraphs)
   - Topics: pyramids, Ra contact, Akhenaten, South America
   - Key Ra sessions: 1.x, 2.x, 3.x, 14.x, 23.x

9. **ch4-orion** - "The Battle of Influences" (7 paragraphs)
   - Topics: Yahweh, Orion group, genetic manipulation
   - Key Ra sessions: 16.x, 17.x, 18.x, 24.x

10. **ch4-present** - "The Present Moment" (6 paragraphs)
    - Topics: current harvest, dual-activated bodies, earth changes
    - Key Ra sessions: 6.x, 63.x, 65.x

11. **ch4-bridge** - "The Story Continues" (4 paragraphs + quote)
    - Topics: synthesis, polarity introduction
    - Key Ra sessions: synthesis

---

## How to Research

1. **Read the paragraph** in the chapter carefully
2. **Identify key concepts** (e.g., "intelligent infinity", "75,000 years", "veil")
3. **Search lawofone.info** for those concepts
4. **Find the most relevant Ra quotes** that support the paragraph
5. **Record session.question** format (e.g., 13.5 = Session 13, Question 5)
6. **Group consecutive paragraphs** that share the same sources
7. **Write a brief note** explaining what the segment covers

### Useful Search Terms by Topic

| Topic | Search Terms |
|-------|-------------|
| Intelligent Infinity | "intelligent infinity", "potentiated" |
| Densities | "first density", "second density", etc. |
| Veil | "veil", "forgetting", "pre-veil" |
| Harvest | "harvest", "graduation" |
| Maldek | "Maldek", "asteroid belt" |
| Mars | "Mars", "red planet" |
| Atlantis | "Atlantis", "Poseidia" |
| Pyramids | "pyramid", "Giza" |
| Orion | "Orion", "Yahweh" |
| Polarity | "service to others", "service to self", "51%" |

---

## Example: Completed Provenance (Ch1)

```json
{
  "chapter": "ch1",
  "title": "Cosmology and Genesis",
  "base_url": "https://www.lawofone.info/s/",
  "provenance": [
    {
      "section_id": "ch1-infinite",
      "section_title": "The Infinite and the Awakening of Consciousness",
      "segments": [
        {
          "paragraphs": [1, 2, 3, 4],
          "sources": ["13.5", "13.6", "13.7"],
          "note": "The Infinite, consciousness awakening, self-recognition"
        },
        {
          "paragraphs": [5, 6],
          "sources": ["13.7", "13.8", "13.9"],
          "note": "Intelligent Infinity, Logos as Love"
        }
      ]
    }
  ]
}
```

---

## Delivery

When complete, save each provenance file as:
- `ch02_provenance.json`
- `ch03_provenance.json`
- `ch04_provenance.json`

These files will be placed in: `i18n/provenance/`

---

## Chapter Content Reference

The full content of each chapter is provided below for reference during research.

### CHAPTER 2: The Creator and Creation

```json
{
  "id": "ch2",
  "number": 2,
  "title": "The Creator and Creation",
  "sections": [
    {
      "id": "ch2-nature",
      "title": "The Two Faces of Infinity",
      "paragraphs": 7
    },
    {
      "id": "ch2-consciousness",
      "title": "Consciousness Before All Things",
      "paragraphs": 8
    },
    {
      "id": "ch2-why",
      "title": "Why the Infinite Chose Limitation",
      "paragraphs": 7
    },
    {
      "id": "ch2-process",
      "title": "From Vibration to Form",
      "paragraphs": 7
    },
    {
      "id": "ch2-experiment",
      "title": "The Cosmic Experiment",
      "paragraphs": 8
    },
    {
      "id": "ch2-cocreator",
      "title": "You Who Create",
      "paragraphs": 6
    },
    {
      "id": "ch2-purpose",
      "title": "The Infinite Knowing Itself Through You",
      "paragraphs": 6
    },
    {
      "id": "ch2-recognition",
      "title": "The Recognition",
      "paragraphs": 5 (plus quote and separator)
    }
  ]
}
```

### CHAPTER 3: The Densities of Consciousness

```json
{
  "id": "ch3",
  "number": 3,
  "title": "The Densities of Consciousness",
  "sections": [
    {
      "id": "ch3-nature",
      "title": "The Nature of Densities",
      "paragraphs": 5
    },
    {
      "id": "ch3-first",
      "title": "First Density: The Cycle of Being",
      "paragraphs": 6
    },
    {
      "id": "ch3-second",
      "title": "Second Density: The Cycle of Growth",
      "paragraphs": 5
    },
    {
      "id": "ch3-awakening",
      "title": "The Awakening of Self-Awareness",
      "paragraphs": 7
    },
    {
      "id": "ch3-third",
      "title": "Third Density: The Cycle of the Choice",
      "paragraphs": 10
    },
    {
      "id": "ch3-fourth",
      "title": "Fourth Density: The Cycle of Love",
      "paragraphs": 7
    },
    {
      "id": "ch3-fifth",
      "title": "Fifth Density: The Cycle of Wisdom",
      "paragraphs": 4
    },
    {
      "id": "ch3-sixth",
      "title": "Sixth Density: The Cycle of Unity",
      "paragraphs": 5
    },
    {
      "id": "ch3-seventh",
      "title": "Seventh Density: The Gateway",
      "paragraphs": 4
    },
    {
      "id": "ch3-octave",
      "title": "The Octave: Return and Renewal",
      "paragraphs": 4
    },
    {
      "id": "ch3-journey",
      "title": "The Journey Ahead",
      "paragraphs": 4 (plus quote)
    }
  ]
}
```

### CHAPTER 4: Earth's Spiritual History

```json
{
  "id": "ch4",
  "number": 4,
  "title": "Earth's Spiritual History",
  "sections": [
    {
      "id": "ch4-gathering",
      "title": "A Planet of Many Origins",
      "paragraphs": 4
    },
    {
      "id": "ch4-maldek",
      "title": "Maldek: The Cosmic Warning",
      "paragraphs": 7
    },
    {
      "id": "ch4-mars",
      "title": "Mars and the Transfer",
      "paragraphs": 5
    },
    {
      "id": "ch4-quarantine",
      "title": "The Quarantine",
      "paragraphs": 5
    },
    {
      "id": "ch4-first-cycle",
      "title": "The First Cycle: Lemuria",
      "paragraphs": 6
    },
    {
      "id": "ch4-second-cycle",
      "title": "The Second Cycle: Scattered Growth",
      "paragraphs": 6
    },
    {
      "id": "ch4-atlantis",
      "title": "The Rise and Fall of Atlantis",
      "paragraphs": 9
    },
    {
      "id": "ch4-egypt",
      "title": "Egypt and the Pyramids",
      "paragraphs": 8
    },
    {
      "id": "ch4-orion",
      "title": "The Battle of Influences",
      "paragraphs": 7
    },
    {
      "id": "ch4-present",
      "title": "The Present Moment",
      "paragraphs": 6
    },
    {
      "id": "ch4-bridge",
      "title": "The Story Continues",
      "paragraphs": 4 (plus quote)
    }
  ]
}
```
