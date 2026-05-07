import { describe, expect, it } from 'bun:test';
import { arrayChunk } from '../../src/array/index.js';

describe('arrayChunk', () => {
	it('should chunk the array into subarrays of specified size', () => {
		const inputArray = [1, 2, 3, 4, 5];
		const size = 2;
		const expectedOutput = [[1, 2], [3, 4], [5]];

		const result = arrayChunk(inputArray, size);
		expect(result).toEqual(expectedOutput);
	});

	it('should handle an empty array correctly', () => {
		const inputArray: number[] = [];
		const size = 2;
		const expectedOutput: number[][] = [];

		const result = arrayChunk(inputArray, size);
		expect(result).toEqual(expectedOutput);
	});

	it('should handle chunk size larger than array length', () => {
		const inputArray = [1, 2, 3];
		const size = 5;
		const expectedOutput = [[1, 2, 3]];

		const result = arrayChunk(inputArray, size);
		expect(result).toEqual(expectedOutput);
	});

	it('should handle chunk size equal to array length', () => {
		const inputArray = [1, 2, 3];
		const size = 3;
		const expectedOutput = [[1, 2, 3]];

		const result = arrayChunk(inputArray, size);
		expect(result).toEqual(expectedOutput);
	});

	it('should handle chunk size of 1', () => {
		const inputArray = [1, 2, 3];
		const size = 1;
		const expectedOutput = [[1], [2], [3]];

		const result = arrayChunk(inputArray, size);
		expect(result).toEqual(expectedOutput);
	});

	it('should throw a RangeError when size is 0', () => {
		expect(() => arrayChunk([1, 2, 3], 0)).toThrowError(RangeError);
	});

	it('should throw a RangeError when size is negative', () => {
		expect(() => arrayChunk([1, 2, 3], -1)).toThrowError(RangeError);
	});

	it('should throw a RangeError when size is not an integer', () => {
		expect(() => arrayChunk([1, 2, 3], 1.5)).toThrowError(RangeError);
	});

	it('should throw a RangeError when size is NaN', () => {
		expect(() => arrayChunk([1, 2, 3], Number.NaN)).toThrowError(RangeError);
	});

	it('should throw a RangeError when size is Infinity', () => {
		expect(() => arrayChunk([1, 2, 3], Number.POSITIVE_INFINITY)).toThrowError(RangeError);
	});
});
