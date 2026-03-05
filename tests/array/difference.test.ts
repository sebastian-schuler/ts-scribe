import { describe, expect, it } from 'bun:test';
import { arrayDifference } from '../../src/array/index.js';

describe('arrayDifference', () => {
	it('should return elements that are present in the first array but not in the other arrays', () => {
		const array1 = [1, 2, 3, 4, 5];
		const array2 = [2, 4];
		const array3 = [4, 5];
		const expectedOutput = [1, 3];

		const result = arrayDifference(array1, array2, array3);
		expect(result).toEqual(expectedOutput);
	});

	it('should handle empty arrays correctly', () => {
		const array1: number[] = [];
		const array2: number[] = [];
		const expectedOutput: number[] = [];

		const result = arrayDifference(array1, array2);
		expect(result).toEqual(expectedOutput);
	});

	it('should handle one empty array correctly', () => {
		const array1: number[] = [];
		const expectedOutput: number[] = [];

		const result = arrayDifference(array1);
		expect(result).toEqual(expectedOutput);
	});

	it('should handle cases where the second array is empty', () => {
		const array1 = [1, 2, 3];
		const array2: number[] = [];
		const expectedOutput = [1, 2, 3];

		const result = arrayDifference(array1, array2);
		expect(result).toEqual(expectedOutput);
	});

	it('should handle cases where there are no differences between arrays', () => {
		const array1 = [1, 2, 3];
		const array2 = [1, 2, 3];
		const expectedOutput: number[] = [];

		const result = arrayDifference(array1, array2);
		expect(result).toEqual(expectedOutput);
	});

	it('should handle arrays with non-numeric elements', () => {
		const array1 = ['apple', 'banana', 'orange'];
		const array2 = ['banana', 'grape'];
		const array3 = ['banana'];
		const expectedOutput = ['apple', 'orange'];

		const result = arrayDifference(array1, array2, array3);
		expect(result).toEqual(expectedOutput);
	});

	it('should handle arrays with duplicate elements', () => {
		const array1 = [1, 1, 2, 2, 3, 3];
		const array2 = [1, 2];
		const array3 = [3, 4];
		const expectedOutput: number[] = [];

		const result = arrayDifference(array1, array2, array3);
		expect(result).toEqual(expectedOutput);
	});
});
