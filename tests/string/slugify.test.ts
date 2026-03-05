import { describe, expect, it } from 'bun:test';
import { slugifyString } from '../../src/index.js';

describe('slugifyString', () => {
	it('should slugify a basic string', () => {
		expect(slugifyString('Hello World')).toBe('Hello-World');
	});

	it('should normalize accented characters', () => {
		expect(slugifyString('Café Déjà Vu')).toBe('Cafe-Deja-Vu');
	});

	it('should collapse multiple spaces', () => {
		expect(slugifyString('This   is   spaced')).toBe('This-is-spaced');
	});

	it('should handle empty string', () => {
		expect(slugifyString('')).toBe('');
	});

	it('should return string with only valid characters when strict', () => {
		expect(slugifyString('!@#Hello*&^World', { strict: true })).toBe('Hello-World');
	});

	it('should allow special characters when not strict', () => {
		expect(slugifyString('Wow! Okay?', { strict: false })).toBe('Wow!-Okay?');
	});

	it('should collapse repeated replacement characters', () => {
		expect(slugifyString('one   two', { replacement: '_' })).toBe('one_two');
	});

	it('should trim leading/trailing replacement characters always', () => {
		expect(slugifyString('  trim me  ')).toBe('trim-me');
		expect(slugifyString('--already-slug--', { replacement: '-' })).toBe('already-slug');
	});
});

describe('slugifyString - lowercase option', () => {
	it('should lowercase if lowercase: true', () => {
		expect(slugifyString('HeLLo WoRLD', { lowercase: true })).toBe('hello-world');
	});

	it('should not lowercase if lowercase: false', () => {
		expect(slugifyString('HeLLo WoRLD', { lowercase: false })).toBe('HeLLo-WoRLD');
	});
});

describe('slugifyString - replacement option', () => {
	it('should use _ as replacement', () => {
		expect(slugifyString('space here', { replacement: '_' })).toBe('space_here');
	});

	it('should use + as replacement', () => {
		expect(slugifyString('plus sign', { replacement: '+' })).toBe('plus+sign');
	});

	it('should handle custom replacement and still trim', () => {
		expect(slugifyString('___slug___', { replacement: '_' })).toBe('slug');
	});
});

describe('slugifyString - remove option', () => {
	it('should remove characters by regex', () => {
		expect(slugifyString('Remove 1234', { remove: /\d/g })).toBe('Remove');
	});

	it('should combine remove and strict correctly', () => {
		expect(
			slugifyString('Th!s is 50% cool', {
				remove: /[\d%]/g,
				strict: true,
			}),
		).toBe('Th-s-is-cool');
	});
});

describe('slugifyString - mixed content', () => {
	it('should slugify Chinese characters (normalize only)', () => {
		expect(slugifyString('你好，世界')).toBe('');
	});

	it('should remove emojis', () => {
		expect(slugifyString('Cool 😎 stuff!', { strict: true })).toBe('Cool-stuff');
	});

	it('should handle mixed languages with accents', () => {
		expect(
			slugifyString('Tôi là người Việt 🇻🇳', {
				lowercase: true,
			}),
		).toBe('toi-la-nguoi-viet');
	});

	it('should handle symbols, spaces, and accents together', () => {
		expect(
			slugifyString('São Paulo!!! & Co.  ', {
				lowercase: true,
				remove: /[&.]/g,
			}),
		).toBe('sao-paulo-co');
	});

	it('should handle string with only removable characters', () => {
		expect(
			slugifyString('$$$$', {
				remove: /\$/g,
			}),
		).toBe('');
	});
});
