import { describe, expect, it } from 'bun:test';
import { randomInt } from '../../src/random/index.js';

describe('randomInt', () => {
	it('should generate a random number within the specified range', () => {
		const min = 1;
		const max = 10;
		const result = randomInt(min, max);
		expect(result).toBeGreaterThanOrEqual(min);
		expect(result).toBeLessThanOrEqual(max);
	});

	it('should return NaN if min is greater than max', () => {
		const result = randomInt(10, 5);
		expect(result).toBeNaN();
	});

	it('should return the only possible value when min equals max', () => {
		const result = randomInt(7, 7);
		expect(result).toBe(7);
	});

	it('should return a number inclusive of both bounds', () => {
		const results = new Set(Array.from({ length: 100 }, () => randomInt(0, 1)));
		expect(results.has(0)).toBe(true);
		expect(results.has(1)).toBe(true);
	});

	it('should work with negative ranges', () => {
		const result = randomInt(-10, -1);
		expect(result).toBeGreaterThanOrEqual(-10);
		expect(result).toBeLessThanOrEqual(-1);
	});

	it('should work with ranges spanning negative and positive', () => {
		const result = randomInt(-5, 5);
		expect(result).toBeGreaterThanOrEqual(-5);
		expect(result).toBeLessThanOrEqual(5);
	});

	it('should always return an integer', () => {
		for (let i = 0; i < 50; i++) {
			expect(Number.isInteger(randomInt(0, 100))).toBe(true);
		}
	});
});
