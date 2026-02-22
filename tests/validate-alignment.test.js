import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { extractMarks, META } from '../scripts/validate-alignment.js';

// ─────────────────────────────────────────────────────────────
// extractMarks
// ─────────────────────────────────────────────────────────────

describe('extractMarks', () => {
  it('counts {term:keyword} marks correctly', () => {
    const chapter = {
      sections: [
        { content: [{ type: 'paragraph', text: 'The {term:the-infinite} is {term:consciousness}.' }] }
      ]
    };
    const marks = extractMarks(chapter, /\{term:[^}]+\}/g);
    assert.equal(marks.length, 2);
    assert.ok(marks.includes('{term:the-infinite}'));
    assert.ok(marks.includes('{term:consciousness}'));
  });

  it('counts {ref:cat:id} marks correctly', () => {
    const chapter = {
      sections: [
        { content: [{ text: 'See {ref:phys:photon} and {ref:phil:plato-cave}.' }] }
      ]
    };
    const marks = extractMarks(chapter, /\{ref:[^}]+\}/g);
    assert.equal(marks.length, 2);
  });

  it('returns empty array for text without marks', () => {
    const chapter = { sections: [{ content: [{ text: 'No marks here.' }] }] };
    const marks = extractMarks(chapter, /\{term:[^}]+\}/g);
    assert.equal(marks.length, 0);
  });

  it('finds marks across multiple sections and blocks', () => {
    const chapter = {
      title: 'Test',
      sections: [
        { content: [{ text: '{term:first}' }, { text: '{term:second}' }] },
        { content: [{ text: '{term:third}' }] }
      ]
    };
    const marks = extractMarks(chapter, /\{term:[^}]+\}/g);
    assert.equal(marks.length, 3);
  });

  it('returns sorted results', () => {
    const chapter = {
      sections: [{ content: [{ text: '{term:zen} {term:alpha} {term:moon}' }] }]
    };
    const marks = extractMarks(chapter, /\{term:[^}]+\}/g);
    assert.deepEqual(marks, ['{term:alpha}', '{term:moon}', '{term:zen}']);
  });
});

// ─────────────────────────────────────────────────────────────
// META structure
// ─────────────────────────────────────────────────────────────

describe('META', () => {
  it('has entries for ES and PT', () => {
    assert.ok(META.es);
    assert.ok(META.pt);
  });

  it('ES has all 16 chapter titles', () => {
    for (let i = 1; i <= 16; i++) {
      assert.ok(META.es.titles[i], `Missing ES title for chapter ${i}`);
    }
  });

  it('PT has all 16 chapter titles', () => {
    for (let i = 1; i <= 16; i++) {
      assert.ok(META.pt.titles[i], `Missing PT title for chapter ${i}`);
    }
  });

  it('ES has all 16 numberText entries', () => {
    for (let i = 1; i <= 16; i++) {
      assert.ok(META.es.numberText[i], `Missing ES numberText for chapter ${i}`);
    }
  });

  it('ES forbids "consciencia" and "Logoi"', () => {
    assert.ok(META.es.forbidden.includes('consciencia'));
    assert.ok(META.es.forbidden.includes('Logoi'));
  });

  it('PT forbids "Logoi"', () => {
    assert.ok(META.pt.forbidden.includes('Logoi'));
  });
});
