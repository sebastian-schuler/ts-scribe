import { describe, expect, it } from 'bun:test';
import { arrayIntersection, arrayIntersectionDeep } from '../../src/array/index.js';

describe('arrayIntersection', () => {
	it('should return the arrayIntersection of arrays', () => {
		const array1 = [1, 2, 3, 4];
		const array2 = [3, 4, 5, 6];
		const array3 = [4, 5, 6, 7];

		expect(arrayIntersection(array1, array2, array3)).toEqual([4]);
	});

	it('should return an empty array if there are no common elements', () => {
		const array1 = [1, 2, 3];
		const array2 = [4, 5, 6];
		const array3 = [7, 8, 9];

		expect(arrayIntersection(array1, array2, array3)).toEqual([]);
	});

	it('should return the same array if only one array is provided', () => {
		const array1 = [1, 2, 3];

		expect(arrayIntersection(array1)).toEqual(array1);
	});

	it('should handle arrays with duplicate elements', () => {
		const array1 = [1, 2, 2, 3, 4];
		const array2 = [2, 3, 3, 4, 5];

		expect(arrayIntersection(array1, array2)).toEqual([2, 3, 4]);
	});
});

describe('arrayIntersectionDeep', () => {
	it('should return the deep arrayIntersection of arrays', () => {
		const array1 = [
			[1, 2],
			[3, 4],
			[5, 6],
		];
		const array2 = [
			[3, 4],
			[5, 6],
			[7, 8],
		];
		const array3 = [
			[5, 6],
			[7, 8],
			[9, 10],
		];

		expect(arrayIntersectionDeep(array1, array2, array3)).toEqual([[5, 6]]);
	});

	it('should return an empty array if there are no common elements', () => {
		const array1 = [
			[1, 2],
			[3, 4],
		];
		const array2 = [
			[5, 6],
			[7, 8],
		];

		expect(arrayIntersectionDeep(array1, array2)).toEqual([]);
	});

	it('should return the same array if only one array is provided', () => {
		const array1 = [
			[1, 2],
			[3, 4],
		];

		expect(arrayIntersectionDeep(array1)).toEqual(array1);
	});

	it('should handle arrays with duplicate elements', () => {
		const array1 = [
			[1, 2],
			[2, 3],
			[3, 4],
		];
		const array2 = [
			[2, 3],
			[3, 4],
			[4, 5],
		];

		expect(arrayIntersectionDeep(array1, array2)).toEqual([
			[2, 3],
			[3, 4],
		]);
	});
});
