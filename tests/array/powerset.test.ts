import { describe, expect, it } from 'bun:test';
import { arrayPowerset } from '../../src/array/index.js';

describe('arrayPowerset', () => {
	/***
	 * Helper function to check if the result contains all the expected output
	 */
	const expectContainEqual = <T>(expectedOutput: T[][], result: T[][]) => {
		for (const subset of expectedOutput) {
			expect(result).toContainEqual(subset);
		}

		expect(result.length).toBe(expectedOutput.length);
	};

	it('should return the arrayPowerset of an array with ignoreEmpty set to true by default', () => {
		const inputArray = [1, 2, 3];
		const expectedOutput = [[1], [2], [3], [1, 2], [1, 3], [2, 3], [1, 2, 3]];
		const result = arrayPowerset(inputArray);

		expectContainEqual(expectedOutput, result);
	});

	it('should return the arrayPowerset of an array with ignoreEmpty set to true', () => {
		const inputArray = ['a', 'b'];
		const expectedOutput = [['a'], ['b'], ['a', 'b']];
		const result = arrayPowerset(inputArray);

		expectContainEqual(expectedOutput, result);
	});

	it('should return the arrayPowerset of an array with ignoreEmpty set to false', () => {
		const inputArray = [true, false];
		const expectedOutput = [[], [true], [false], [true, false]];
		const result = arrayPowerset(inputArray, false);

		expectContainEqual(expectedOutput, result);
	});

	it('should return an empty array if the input array is empty and ignoreEmpty is set to true', () => {
		const inputArray: number[] = [];
		const expectedOutput: number[][] = [];
		const result = arrayPowerset(inputArray);

		expectContainEqual(expectedOutput, result);
	});

	it('should return an array containing only an empty array if the input array is empty and ignoreEmpty is set to false', () => {
		const inputArray: number[] = [];
		const expectedOutput: number[][] = [[]];
		const result = arrayPowerset(inputArray, false);

		expectContainEqual(expectedOutput, result);
	});

	it('should return a single subset for a single-element array with ignoreEmpty set to true', () => {
		const inputArray = [42];
		const expectedOutput = [[42]];
		const result = arrayPowerset(inputArray);

		expectContainEqual(expectedOutput, result);
	});

	it('should return two subsets for a single-element array with ignoreEmpty set to false', () => {
		const inputArray = [42];
		const expectedOutput = [[], [42]];
		const result = arrayPowerset(inputArray, false);

		expectContainEqual(expectedOutput, result);
	});

	it('should produce duplicate subsets for arrays with duplicate elements', () => {
		const inputArray = [1, 1];
		const expectedOutput = [[1], [1], [1, 1]];
		const result = arrayPowerset(inputArray);

		expectContainEqual(expectedOutput, result);
	});
});
