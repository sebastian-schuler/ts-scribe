import { shuffleArray } from '../../src/array';

describe('shuffleArray', () => {
  it('should return an array with the same length after shuffling', () => {
    const inputArray = [1, 2, 3, 4, 5];
    const shuffledArray = shuffleArray(inputArray);

    expect(shuffledArray).toHaveLength(inputArray.length);
  });

  it('should return an array with the same elements after shuffling', () => {
    const inputArray = [1, 2, 3, 4, 5];
    const shuffledArray = shuffleArray(inputArray);

    // Sort both arrays and then compare
    inputArray.sort((a, b) => a - b);
    shuffledArray.sort((a, b) => a - b);

    expect(shuffledArray).toEqual(inputArray);
  });

  it('should handle empty arrays', () => {
    const inputArray: number[] = [];
    const shuffledArray = shuffleArray(inputArray);

    expect(shuffledArray).toEqual([]);
  });

  it('should handle arrays with one element', () => {
    const inputArray = [42];
    const shuffledArray = shuffleArray(inputArray);

    expect(shuffledArray).toEqual(inputArray);
  });

  it('should not modify the original array', () => {
    const inputArray = [1, 2, 3, 4, 5];
    const originalArray = [...inputArray];
    shuffleArray(inputArray);

    expect(inputArray).toEqual(originalArray);
  });

  it('should shuffle the array', () => {
    const inputArray = Array.from(Array(500).keys());
    const shuffled = shuffleArray(inputArray);
    const differenceFound = inputArray.some((v, i) => v !== shuffled.at(i));

    expect(differenceFound).toBe(true);
  });
});
