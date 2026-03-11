import { describe, expect, it } from 'bun:test';
import { isNumber } from '../../src/typeguards/index.js';

describe('isNumber', () => {
	it('should return true if the value is a number or parseable as a number', () => {
		expect(isNumber(13)).toBe(true);
		expect(isNumber('13')).toBe(true);
		expect(isNumber(Number.NaN)).toBe(false);
		expect(isNumber('dasdasd')).toBe(false);
		expect(isNumber({})).toBe(false);
		expect(isNumber([])).toBe(false);
		expect(isNumber(undefined)).toBe(false);
		expect(isNumber(null)).toBe(false);
		expect(isNumber(true)).toBe(false);
		expect(isNumber(false)).toBe(false);
		expect(isNumber(Infinity)).toBe(false);
	});

	it('should return true for zero and negative numbers', () => {
		expect(isNumber(0)).toBe(true);
		expect(isNumber(-1)).toBe(true);
		expect(isNumber(-0)).toBe(true);
	});

	it('should return true for floats', () => {
		expect(isNumber(3.14)).toBe(true);
		expect(isNumber(-3.14)).toBe(true);
	});

	it('should return true for numeric strings including floats and negatives', () => {
		expect(isNumber('0')).toBe(true);
		expect(isNumber('-1')).toBe(true);
		expect(isNumber('3.14')).toBe(true);
		expect(isNumber('-3.14')).toBe(true);
	});

	it('should return false for empty and whitespace-only strings', () => {
		expect(isNumber('')).toBe(false);
		expect(isNumber('   ')).toBe(false);
	});

	it('should return false for non-finite string representations', () => {
		expect(isNumber('Infinity')).toBe(false);
		expect(isNumber('-Infinity')).toBe(false);
		expect(isNumber('NaN')).toBe(false);
	});

	it('should return true for strings with leading/trailing whitespace around a number', () => {
		// parseFloat trims leading whitespace
		expect(isNumber(' 42 ')).toBe(true);
	});

	it('should return true for strings with a numeric prefix (parseFloat behaviour)', () => {
		// parseFloat('42abc') === 42 — this is intentional parseFloat behaviour
		expect(isNumber('42abc')).toBe(true);
	});

	it('should return false for BigInt values', () => {
		expect(isNumber(BigInt(1))).toBe(false);
	});

	it('should return true for large safe integers', () => {
		expect(isNumber(Number.MAX_SAFE_INTEGER)).toBe(true);
		expect(isNumber(Number.MIN_SAFE_INTEGER)).toBe(true);
	});
});
