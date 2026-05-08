import { describe, expect, it } from 'bun:test';
import { isDefined } from '../../src/typeguards/index.js';

describe('isDefined', () => {
	it('should return true for defined values', () => {
		expect(isDefined('hello')).toBe(true);
		expect(isDefined(123)).toBe(true);
		expect(isDefined(0)).toBe(true);
		expect(isDefined('')).toBe(true);
		expect(isDefined([])).toBe(true);
		expect(isDefined({})).toBe(true);
		expect(isDefined(false)).toBe(true);
	});

	it('should return false for null or undefined values', () => {
		let value = 'hello' as string | null | undefined;

		// @ts-expect-error - value can be null or undefined, so this should cause a TypeScript error
		const t1 = value.toUpperCase();
		if(isDefined(value)) {
			const t = value.toUpperCase(); // This should not cause a TypeScript error since value is defined here
		}

		expect(isDefined(null)).toBe(false);
		expect(isDefined(undefined)).toBe(false);
	});

	it('should return false for NaN', () => {
		expect(isDefined(Number.NaN)).toBe(false);
	});
});
