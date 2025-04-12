import { describe, expect, it } from 'bun:test';
import { chunkArray } from '../../src/array/index.js';

describe('chunkArray', () => {
  it('should chunk the array into subarrays of specified size', () => {
    const inputArray = [1, 2, 3, 4, 5];
    const size = 2;
    const expectedOutput = [[1, 2], [3, 4], [5]];

    const result = chunkArray(inputArray, size);
    expect(result).toEqual(expectedOutput);
  });

  it('should handle an empty array correctly', () => {
    const inputArray: number[] = [];
    const size = 2;
    const expectedOutput: number[][] = [];

    const result = chunkArray(inputArray, size);
    expect(result).toEqual(expectedOutput);
  });

  it('should handle chunk size larger than array length', () => {
    const inputArray = [1, 2, 3];
    const size = 5;
    const expectedOutput = [[1, 2, 3]];

    const result = chunkArray(inputArray, size);
    expect(result).toEqual(expectedOutput);
  });

  it('should handle chunk size equal to array length', () => {
    const inputArray = [1, 2, 3];
    const size = 3;
    const expectedOutput = [[1, 2, 3]];

    const result = chunkArray(inputArray, size);
    expect(result).toEqual(expectedOutput);
  });

  it('should handle chunk size of 1', () => {
    const inputArray = [1, 2, 3];
    const size = 1;
    const expectedOutput = [[1], [2], [3]];

    const result = chunkArray(inputArray, size);
    expect(result).toEqual(expectedOutput);
  });
});
