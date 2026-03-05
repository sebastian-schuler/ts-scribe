import { describe, expect, it } from 'bun:test';
import { randomSample } from '../../src/random/index.js';

describe('randomSample', () => {
	// Test case for getting a single random sample
	it('should return a single random sample from the array', () => {
		const array = [1, 2, 3, 4, 5];
		const sample = randomSample(array);
		expect(sample).toHaveLength(1);
		expect(array).toContain(sample[0]);
	});

	// Test case for getting multiple random samples
	it('should return an array of the specified size containing random samples from the array', () => {
		const array = [1, 2, 3, 4, 5];
		const size = 3;
		const sample = randomSample(array, size);
		expect(sample).toHaveLength(size);
		for (const item of sample) {
			expect(array).toContain(item);
		}
	});

	// Test case for handling an empty array
	it('should return an empty array when given an empty array', () => {
		const array: number[] = [];
		const sample = randomSample(array);
		expect(sample).toHaveLength(0);
	});

	// Test case for handling a larger size than the array length
	it('should return the entire array when the sample size is larger than the array length', () => {
		const array = [1, 2, 3, 4, 5];
		const size = 10;
		const sample = randomSample(array, size);
		expect(sample).toHaveLength(array.length);
		expect(sample.sort()).toEqual(array.sort());
	});
});
