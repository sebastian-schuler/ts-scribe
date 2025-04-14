import { describe, expect, it } from 'bun:test';
import { strSlugify } from '../../src/index.js';

describe('strSlugify', () => {
  it('should slugify a basic string', () => {
    expect(strSlugify('Hello World')).toBe('Hello-World');
  });

  it('should normalize accented characters', () => {
    expect(strSlugify('Café Déjà Vu')).toBe('Cafe-Deja-Vu');
  });

  it('should collapse multiple spaces', () => {
    expect(strSlugify('This   is   spaced')).toBe('This-is-spaced');
  });

  it('should handle empty string', () => {
    expect(strSlugify('')).toBe('');
  });

  it('should return string with only valid characters when strict', () => {
    expect(strSlugify('!@#Hello*&^World', { strict: true })).toBe('Hello-World');
  });

  it('should allow special characters when not strict', () => {
    expect(strSlugify('Wow! Okay?', { strict: false })).toBe('Wow!-Okay?');
  });

  it('should collapse repeated replacement characters', () => {
    expect(strSlugify('one   two', { replacement: '_' })).toBe('one_two');
  });

  it('should trim leading/trailing replacement characters always', () => {
    expect(strSlugify('  trim me  ')).toBe('trim-me');
    expect(strSlugify('--already-slug--', { replacement: '-' })).toBe('already-slug');
  });
});

describe('strSlugify - lowercase option', () => {
  it('should lowercase if lowercase: true', () => {
    expect(strSlugify('HeLLo WoRLD', { lowercase: true })).toBe('hello-world');
  });

  it('should not lowercase if lowercase: false', () => {
    expect(strSlugify('HeLLo WoRLD', { lowercase: false })).toBe('HeLLo-WoRLD');
  });
});

describe('strSlugify - replacement option', () => {
  it('should use _ as replacement', () => {
    expect(strSlugify('space here', { replacement: '_' })).toBe('space_here');
  });

  it('should use + as replacement', () => {
    expect(strSlugify('plus sign', { replacement: '+' })).toBe('plus+sign');
  });

  it('should handle custom replacement and still trim', () => {
    expect(strSlugify('___slug___', { replacement: '_' })).toBe('slug');
  });
});

describe('strSlugify - remove option', () => {
  it('should remove characters by regex', () => {
    expect(strSlugify('Remove 1234', { remove: /\d/g })).toBe('Remove');
  });

  it('should combine remove and strict correctly', () => {
    expect(
      strSlugify('Th!s is 50% cool', {
        remove: /[0-9%]/g,
        strict: true,
      }),
    ).toBe('Th-s-is-cool');
  });
});

describe('strSlugify - mixed content', () => {
  it('should slugify Chinese characters (normalize only)', () => {
    expect(strSlugify('你好，世界')).toBe('');
  });

  it('should remove emojis', () => {
    expect(strSlugify('Cool 😎 stuff!', { strict: true })).toBe('Cool-stuff');
  });

  it('should handle mixed languages with accents', () => {
    expect(
      strSlugify('Tôi là người Việt 🇻🇳', {
        lowercase: true,
      }),
    ).toBe('toi-la-nguoi-viet');
  });

  it('should handle symbols, spaces, and accents together', () => {
    expect(
      strSlugify('São Paulo!!! & Co.  ', {
        lowercase: true,
        remove: /[&.]/g,
      }),
    ).toBe('sao-paulo-co');
  });

  it('should handle string with only removable characters', () => {
    expect(
      strSlugify('$$$$', {
        remove: /\$/g,
      }),
    ).toBe('');
  });
});
