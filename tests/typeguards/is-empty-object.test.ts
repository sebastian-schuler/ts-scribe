import { describe, expect, it } from 'bun:test';
import { isEmptyObject } from '../../src/typeguards/index.js';

describe('isEmptyObject', () => {
	it('should return true for an empty object', () => {
		const object = {};
		expect(isEmptyObject(object)).toBe(true);
	});

	it('should return false for an object with properties', () => {
		const object = {
			a: 1,
			b: 'hello',
			c: [1, 2, 3],
			d: {
				nested: true,
			},
		};
		expect(isEmptyObject(object)).toBe(false);
	});

	it('should return true for an object with no enumerable properties', () => {
		const object = Object.create(null);
		expect(isEmptyObject(object)).toBe(true);
	});

	it('should return false for non-empty arrays and non-object values', () => {
		expect(isEmptyObject([])).toBe(false);
		expect(isEmptyObject([1, 2, 3])).toBe(false);
	});

	it('should return false for null and undefined', () => {
		expect(isEmptyObject(null)).toBe(false);
		expect(isEmptyObject(undefined)).toBe(false);
	});
});
