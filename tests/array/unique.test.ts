import { describe, expect, it } from 'bun:test';
import { uniqueArray } from '../../src/array/index.js';

describe('uniqueArray', () => {
	it('should remove duplicate numbers from an array', () => {
		const inputArray = [1, 2, 2, 3, 3, 3, 4];
		const expectedOutput = [1, 2, 3, 4];

		const result = uniqueArray(inputArray);
		expect(result).toEqual(expectedOutput);
	});

	it('should remove duplicate strings from an array', () => {
		const inputArray = ['a', 'b', 'a', 'c', 'b'];
		const expectedOutput = ['a', 'b', 'c'];

		const result = uniqueArray(inputArray);
		expect(result).toEqual(expectedOutput);
	});

	it('should handle an empty array correctly', () => {
		const inputArray: number[] = [];
		const expectedOutput: number[] = [];

		const result = uniqueArray(inputArray);
		expect(result).toEqual(expectedOutput);
	});

	it('should handle an array with no duplicates', () => {
		const inputArray = [1, 2, 3, 4, 5];
		const expectedOutput = [1, 2, 3, 4, 5];

		const result = uniqueArray(inputArray);
		expect(result).toEqual(expectedOutput);
	});

	it('should handle an array with all duplicate values', () => {
		const inputArray = [5, 5, 5, 5, 5];
		const expectedOutput = [5];

		const result = uniqueArray(inputArray);
		expect(result).toEqual(expectedOutput);
	});

	it('should handle booleans correctly', () => {
		const inputArray = [true, false, true, false, true];
		const expectedOutput = [true, false];

		const result = uniqueArray(inputArray);
		expect(result).toEqual(expectedOutput);
	});

	it('should handle null and undefined values', () => {
		const inputArray = [null, undefined, null, undefined, null];
		const expectedOutput = [null, undefined];

		// @ts-expect-error - Testing handling of null and undefined
		const result = uniqueArray(inputArray);
		// @ts-expect-error - Testing handling of null and undefined
		expect(result).toEqual(expectedOutput);
	});

	it('should preserve order of first occurrence', () => {
		const inputArray = [3, 1, 2, 3, 1, 4];
		const expectedOutput = [3, 1, 2, 4];

		const result = uniqueArray(inputArray);
		expect(result).toEqual(expectedOutput);
	});

	it('should handle arrays with single element', () => {
		const inputArray = [42];
		const expectedOutput = [42];

		const result = uniqueArray(inputArray);
		expect(result).toEqual(expectedOutput);
	});

	it('should handle bigint values', () => {
		const inputArray = [1n, 2n, 1n, 3n, 2n];
		const expectedOutput = [1n, 2n, 3n];

		const result = uniqueArray(inputArray);
		expect(result).toEqual(expectedOutput);
	});
});
