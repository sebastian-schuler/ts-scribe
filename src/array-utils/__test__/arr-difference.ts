import { describe, expect, it } from '@jest/globals';
import { arrDifference } from '../arr-difference';

describe('arrDifference function', () => {
  it('should return elements that are present in the first array but not in the other arrays', () => {
    const arr1 = [1, 2, 3, 4, 5];
    const arr2 = [2, 4];
    const arr3 = [4, 5];
    const expectedOutput = [1, 3];

    const result = arrDifference(arr1, arr2, arr3);
    expect(result).toEqual(expectedOutput);
  });

  it('should handle empty arrays correctly', () => {
    const arr1: number[] = [];
    const arr2: number[] = [];
    const expectedOutput: number[] = [];

    const result = arrDifference(arr1, arr2);
    expect(result).toEqual(expectedOutput);
  });

  it('should handle one empty array correctly', () => {
    const arr1: number[] = [];
    const expectedOutput: number[] = [];

    const result = arrDifference(arr1);
    expect(result).toEqual(expectedOutput);
  });

  it('should handle cases where the second array is empty', () => {
    const arr1 = [1, 2, 3];
    const arr2: number[] = [];
    const expectedOutput = [1, 2, 3];

    const result = arrDifference(arr1, arr2);
    expect(result).toEqual(expectedOutput);
  });

  it('should handle cases where there are no differences between arrays', () => {
    const arr1 = [1, 2, 3];
    const arr2 = [1, 2, 3];
    const expectedOutput: number[] = [];

    const result = arrDifference(arr1, arr2);
    expect(result).toEqual(expectedOutput);
  });

  it('should handle arrays with non-numeric elements', () => {
    const arr1 = ['apple', 'banana', 'orange'];
    const arr2 = ['banana', 'grape'];
    const arr3 = ['banana'];
    const expectedOutput = ['apple', 'orange'];

    const result = arrDifference(arr1, arr2, arr3);
    expect(result).toEqual(expectedOutput);
  });

  it('should handle arrays with duplicate elements', () => {
    const arr1 = [1, 1, 2, 2, 3, 3];
    const arr2 = [1, 2];
    const arr3 = [3, 4];
    const expectedOutput: number[] = [];

    const result = arrDifference(arr1, arr2, arr3);
    expect(result).toEqual(expectedOutput);
  });
});
