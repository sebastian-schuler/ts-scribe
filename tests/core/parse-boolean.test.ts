import { describe, expect, it } from 'bun:test';
import { parseBoolean } from '../../src/core/index.js';

describe('parseBoolean function', () => {
	it('should return true when value is "true"', () => {
		expect(parseBoolean('true')).toBe(true);
	});

	it('should return false when value is "false"', () => {
		expect(parseBoolean('false')).toBe(false);
	});

	it('should return true when value is true (boolean)', () => {
		expect(parseBoolean(true)).toBe(true);
	});

	it('should return false when value is false (boolean)', () => {
		expect(parseBoolean(false)).toBe(false);
	});

	it('should return false when value is null', () => {
		expect(parseBoolean(null)).toBe(false);
	});

	it('should return false when value is undefined', () => {
		expect(parseBoolean(undefined)).toBe(false);
	});

	it('should return false when value is an empty string', () => {
		expect(parseBoolean('')).toBe(false);
	});

	it('should return default value when value is null and default value is provided', () => {
		expect(parseBoolean(null, true)).toBe(true);
	});

	it('should return default value when value is undefined and default value is provided', () => {
		expect(parseBoolean(undefined, true)).toBe(true);
	});

	it('should return default value when value is an empty string and default value is provided', () => {
		expect(parseBoolean('', true)).toBe(true);
	});

	it('should return default value when value is an unsupported type and default value is provided', () => {
		expect(parseBoolean(123, true)).toBe(true);
	});

	it('should return true for numeric value 1', () => {
		expect(parseBoolean(1)).toBe(true);
	});

	it('should return false for numeric value 0', () => {
		expect(parseBoolean(0)).toBe(false);
	});

	it('should return default value for numeric value 2 (not 0 or 1)', () => {
		expect(parseBoolean(2)).toBe(false);
		expect(parseBoolean(2, true)).toBe(true);
	});

	it('should return default value for negative numeric values', () => {
		expect(parseBoolean(-1)).toBe(false);
		expect(parseBoolean(-1, true)).toBe(true);
	});

	it('should return default value for NaN', () => {
		expect(parseBoolean(Number.NaN)).toBe(false);
		expect(parseBoolean(Number.NaN, true)).toBe(true);
	});
});
