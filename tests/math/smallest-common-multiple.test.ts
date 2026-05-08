import { describe, expect, it } from 'bun:test';
import { smallestCommonMultiple } from '../../src/math/index.js';

describe('smallestCommonMultiple', () => {
	it('it should calculate the greatest common divisor of any amount of numbers', () => {
		expect(smallestCommonMultiple(12, 15, 75)).toBe(300);
		expect(smallestCommonMultiple(5, 100)).toBe(100);
		expect(smallestCommonMultiple(100)).toBe(100);
		expect(smallestCommonMultiple(3, 77, 2, 9, 7, 123)).toBe(56_826);
		expect(smallestCommonMultiple(0)).toBe(0);
	});

	it('should return 0 for SCM(0, 0)', () => {
		expect(smallestCommonMultiple(0, 0)).toBe(0);
	});

	it('should return 0 for SCM with a leading zero', () => {
		expect(smallestCommonMultiple(0, 5)).toBe(0);
		expect(smallestCommonMultiple(0, 10, 20)).toBe(0);
	});

	it('should return the other number for SCM(n, 0)', () => {
		expect(smallestCommonMultiple(5, 0)).toBe(0);
	});

	it('should throw for empty input', () => {
		// eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
		expect(() => (smallestCommonMultiple as any)()).toThrowError(TypeError);
	});
});
