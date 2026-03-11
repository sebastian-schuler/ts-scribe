import { describe, expect, it } from 'bun:test';
import { slugify } from '../../src/index.js';

describe('slugify function', () => {
	describe('slugify', () => {
		it('should slugify a basic string', () => {
			expect(slugify('Hello World')).toBe('hello-world');
		});

		it('should normalize accented characters', () => {
			expect(slugify('Café Déjà Vu')).toBe('cafe-deja-vu');
		});

		it('should collapse multiple spaces', () => {
			expect(slugify('This   is   spaced')).toBe('this-is-spaced');
		});

		it('should handle empty string', () => {
			expect(slugify('')).toBe('');
		});

		it('should return string with only valid characters when strict', () => {
			expect(slugify('!@#Hello*&^World', { strict: true })).toBe('hello-world');
		});

		it('should allow special characters when not strict', () => {
			expect(slugify('Wow! Okay?', { strict: false })).toBe('wow!-okay?');
		});

		it('should collapse repeated replacement characters', () => {
			expect(slugify('one   two', { replacement: '_' })).toBe('one_two');
		});

		it('should trim leading/trailing replacement characters always', () => {
			expect(slugify('  trim me  ')).toBe('trim-me');
			expect(slugify('--already-slug--', { replacement: '-' })).toBe('already-slug');
		});
	});

	describe('slugify - lowercase option', () => {
		it('should lowercase if lowercase: true', () => {
			expect(slugify('HeLLo WoRLD', { lowercase: true })).toBe('hello-world');
		});

		it('should not lowercase if lowercase: false', () => {
			expect(slugify('HeLLo WoRLD', { lowercase: false })).toBe('HeLLo-WoRLD');
		});
	});

	describe('slugify - replacement option', () => {
		it('should use _ as replacement', () => {
			expect(slugify('space here', { replacement: '_' })).toBe('space_here');
		});

		it('should use + as replacement', () => {
			expect(slugify('plus sign', { replacement: '+' })).toBe('plus+sign');
		});

		it('should handle custom replacement and still trim', () => {
			expect(slugify('___slug___', { replacement: '_' })).toBe('slug');
		});
	});

	describe('slugify - remove option', () => {
		it('should remove characters by regex', () => {
			expect(slugify('Remove 1234', { remove: /\d/g })).toBe('remove');
		});

		it('should combine remove and strict correctly', () => {
			expect(
				slugify('Th!s is 50% cool', {
					remove: /[\d%]/g,
					strict: true,
				}),
			).toBe('th-s-is-cool');
		});
	});

	describe('slugify - mixed content', () => {
		it('should slugify Chinese characters (normalize only)', () => {
			expect(slugify('你好，世界')).toBe('');
		});

		it('should remove emojis', () => {
			expect(slugify('Cool 😎 stuff!', { strict: true })).toBe('cool-stuff');
		});

		it('should handle mixed languages with accents', () => {
			expect(
				slugify('Tôi là người Việt 🇻🇳', {
					lowercase: true,
				}),
			).toBe('toi-la-nguoi-viet');
		});

		it('should handle symbols, spaces, and accents together', () => {
			expect(
				slugify('São Paulo!!! & Co.  ', {
					lowercase: true,
					remove: /[&.]/g,
				}),
			).toBe('sao-paulo-co');
		});

		it('should handle string with only removable characters', () => {
			expect(
				slugify('$$$$', {
					remove: /\$/g,
				}),
			).toBe('');
		});
	});
});
