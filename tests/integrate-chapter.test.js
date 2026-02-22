import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { sortObjectKeys, mergeGlossaryTerms } from '../scripts/integrate-chapter.js';

// ─────────────────────────────────────────────────────────────
// sortObjectKeys
// ─────────────────────────────────────────────────────────────

describe('sortObjectKeys', () => {
  it('sorts keys alphabetically', () => {
    const result = sortObjectKeys({ zebra: 1, alpha: 2, moon: 3 });
    assert.deepEqual(Object.keys(result), ['alpha', 'moon', 'zebra']);
  });

  it('preserves values', () => {
    const result = sortObjectKeys({ b: { title: 'B' }, a: { title: 'A' } });
    assert.equal(result.a.title, 'A');
    assert.equal(result.b.title, 'B');
  });

  it('handles empty object', () => {
    const result = sortObjectKeys({});
    assert.deepEqual(result, {});
  });
});

// ─────────────────────────────────────────────────────────────
// mergeGlossaryTerms
// ─────────────────────────────────────────────────────────────

describe('mergeGlossaryTerms', () => {
  it('converts array format to object format', () => {
    const newTerms = [
      { keyword: 'catalyst', title: 'Catalyst', definition: 'An experience that...' }
    ];
    const result = mergeGlossaryTerms(newTerms, {});
    assert.ok(result.glossary.catalyst);
    assert.equal(result.glossary.catalyst.title, 'Catalyst');
    assert.deepEqual(result.glossary.catalyst.content, ['An experience that...']);
  });

  it('handles definition as array', () => {
    const newTerms = [
      { keyword: 'density', title: 'Density', definition: ['A level of...', 'Each density has...'] }
    ];
    const result = mergeGlossaryTerms(newTerms, {});
    assert.deepEqual(result.glossary.density.content, ['A level of...', 'Each density has...']);
  });

  it('detects existing terms', () => {
    const existing = { catalyst: { title: 'Catalyst', content: ['Old definition'] } };
    const newTerms = [
      { keyword: 'catalyst', title: 'Catalyst', definition: 'New definition' },
      { keyword: 'density', title: 'Density', definition: 'A level of...' }
    ];
    const result = mergeGlossaryTerms(newTerms, existing);
    assert.equal(result.added, 1);
    assert.equal(result.existing, 1);
    // Existing entry should NOT be overwritten
    assert.deepEqual(result.glossary.catalyst.content, ['Old definition']);
  });

  it('skips terms without keyword', () => {
    const newTerms = [
      { title: 'No Keyword', definition: 'Missing keyword field' },
      { keyword: 'valid', title: 'Valid', definition: 'Has everything' }
    ];
    const result = mergeGlossaryTerms(newTerms, {});
    assert.equal(result.added, 1);
    assert.equal(result.skipped.length, 1);
    assert.ok(!result.glossary['undefined']);
  });

  it('skips terms without title', () => {
    const newTerms = [
      { keyword: 'no-title', definition: 'Missing title field' }
    ];
    const result = mergeGlossaryTerms(newTerms, {});
    assert.equal(result.added, 0);
    assert.equal(result.skipped.length, 1);
  });

  it('sorts keys alphabetically in output', () => {
    const newTerms = [
      { keyword: 'zen', title: 'Zen', definition: 'Z term' },
      { keyword: 'alpha', title: 'Alpha', definition: 'A term' },
      { keyword: 'moon', title: 'Moon', definition: 'M term' }
    ];
    const result = mergeGlossaryTerms(newTerms, {});
    assert.deepEqual(Object.keys(result.glossary), ['alpha', 'moon', 'zen']);
  });

  it('does not mutate the original glossary', () => {
    const original = { existing: { title: 'Existing', content: ['...'] } };
    const newTerms = [{ keyword: 'new-term', title: 'New', definition: 'Added' }];
    mergeGlossaryTerms(newTerms, original);
    assert.ok(!original['new-term']);
  });
});
