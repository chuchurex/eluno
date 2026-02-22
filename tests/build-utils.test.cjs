const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { parseTerms, parseRefs, slugify, cleanTextForMeta } = require('../scripts/build-v2.cjs');

// ─────────────────────────────────────────────────────────────
// parseTerms
// ─────────────────────────────────────────────────────────────

describe('parseTerms', () => {
  const glossary = {
    'the-infinite': { title: 'The Infinite', content: ['The boundless unity...'] },
    'el-infinito': { title: 'El Infinito', content: ['La unidad sin límites...'] },
    'os-centros': { title: 'Os Centros de Energia', content: ['Os sete centros...'] },
    'mind-body-spirit-complex': { title: 'Mind/Body/Spirit Complex', content: ['The unified being...'] },
    'original-thought': { title: 'Original Thought (Concept)', content: ['The primal thought...'] },
    'o-veu': { title: 'O Véu do Esquecimento', content: ['O véu...'] },
    'a-morte': { title: 'A Morte', content: ['A transição...'] },
  };

  it('replaces {term:keyword} with HTML span', () => {
    const result = parseTerms('This is {term:the-infinite} in context.', glossary);
    assert.ok(result.includes('<span class="term" data-term="the-infinite">The Infinite</span>'));
  });

  it('uses glossary title as display text', () => {
    const result = parseTerms('{term:mind-body-spirit-complex}', glossary);
    assert.ok(result.includes('Mind/Body/Spirit Complex'));
  });

  it('returns original text if keyword not in glossary', () => {
    const result = parseTerms('{term:nonexistent}', glossary);
    assert.equal(result, '{term:nonexistent}');
  });

  it('strips parenthetical descriptions from title', () => {
    const result = parseTerms('{term:original-thought}', glossary);
    assert.ok(result.includes('>Original Thought</span>'));
    assert.ok(!result.includes('(Concept)'));
  });

  it('dedup article ES: "del {term:el-infinito}" removes redundant El', () => {
    const result = parseTerms('del {term:el-infinito}', glossary);
    // Should be "del <span>Infinito</span>" not "del <span>El Infinito</span>"
    assert.ok(result.includes('del <span'));
    assert.ok(!result.includes('>El Infinito<'));
    assert.ok(result.includes('>Infinito<'));
  });

  it('dedup same article: "el {term:el-infinito}" collapses to "El Infinito"', () => {
    const result = parseTerms('el {term:el-infinito}', glossary);
    // "el" matches first word "El" → returns just the span with full title
    assert.ok(result.includes('>El Infinito<'));
    // Should NOT have "el El Infinito"
    assert.ok(!result.includes('el <span'));
  });

  it('Portuguese contraction: "do {term:os-centros}" → "dos Centros de Energia"', () => {
    const result = parseTerms('do {term:os-centros}', glossary);
    assert.ok(result.includes('dos <span'));
    assert.ok(result.includes('>Centros de Energia<'));
  });

  it('Portuguese contraction: "da {term:a-morte}" → "da Morte"', () => {
    const result = parseTerms('da {term:a-morte}', glossary);
    assert.ok(result.includes('da <span'));
    assert.ok(result.includes('>Morte<'));
  });

  it('handles multiple terms in one text', () => {
    const result = parseTerms(
      'The {term:the-infinite} and {term:mind-body-spirit-complex} are related.',
      glossary
    );
    assert.ok(result.includes('data-term="the-infinite"'));
    assert.ok(result.includes('data-term="mind-body-spirit-complex"'));
  });

  it('preserves text without terms', () => {
    const result = parseTerms('Just normal text here.', glossary);
    assert.equal(result, 'Just normal text here.');
  });
});

// ─────────────────────────────────────────────────────────────
// parseRefs
// ─────────────────────────────────────────────────────────────

describe('parseRefs', () => {
  it('replaces {ref:cat:id} with span element', () => {
    const result = parseRefs('See {ref:phys:photon} for details.', {});
    assert.ok(result.includes('<span class="ref" data-ref="phys:photon"></span>'));
  });

  it('preserves surrounding text', () => {
    const result = parseRefs('Before {ref:phil:plato-cave} after.', {});
    assert.ok(result.startsWith('Before '));
    assert.ok(result.endsWith(' after.'));
  });

  it('handles multiple refs', () => {
    const result = parseRefs('{ref:phys:photon} and {ref:phil:plato-cave}', {});
    assert.ok(result.includes('data-ref="phys:photon"'));
    assert.ok(result.includes('data-ref="phil:plato-cave"'));
  });

  it('leaves text without refs unchanged', () => {
    const result = parseRefs('No refs here.', {});
    assert.equal(result, 'No refs here.');
  });
});

// ─────────────────────────────────────────────────────────────
// slugify
// ─────────────────────────────────────────────────────────────

describe('slugify', () => {
  it('converts to lowercase with hyphens', () => {
    assert.equal(slugify('Cosmology and Genesis'), 'cosmology-and-genesis');
  });

  it('removes accents', () => {
    assert.equal(slugify('Cosmología y Génesis'), 'cosmologia-y-genesis');
  });

  it('removes special characters', () => {
    assert.equal(slugify('Polarity — The Two Paths'), 'polarity-the-two-paths');
  });

  it('trims hyphens from start/end', () => {
    assert.equal(slugify('—Hello World—'), 'hello-world');
  });

  it('collapses multiple special chars to single hyphen', () => {
    assert.equal(slugify('Free Will & the Law'), 'free-will-the-law');
  });
});

// ─────────────────────────────────────────────────────────────
// cleanTextForMeta
// ─────────────────────────────────────────────────────────────

describe('cleanTextForMeta', () => {
  const glossary = {
    'the-infinite': { title: 'The Infinite', content: ['...'] },
    'el-infinito': { title: 'El Infinito', content: ['...'] },
  };

  it('resolves terms to plain text (no HTML)', () => {
    const result = cleanTextForMeta('This is {term:the-infinite}.', glossary);
    assert.equal(result, 'This is The Infinite.');
    assert.ok(!result.includes('<span'));
  });

  it('removes {ref:} markers', () => {
    const result = cleanTextForMeta('See {ref:phys:photon} here.', glossary);
    assert.equal(result, 'See here.');
  });

  it('applies article dedup for ES', () => {
    const result = cleanTextForMeta('del {term:el-infinito}', glossary);
    assert.equal(result, 'del Infinito');
  });
});
