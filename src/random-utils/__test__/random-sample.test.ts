import { randomSample } from '../random-sample';

describe('randomSample', () => {
  // Test case for getting a single random sample
  it('should return a single random sample from the array', () => {
    const arr = [1, 2, 3, 4, 5];
    const sample = randomSample(arr);
    expect(sample).toHaveLength(1);
    expect(arr).toContain(sample[0]);
  });

  // Test case for getting multiple random samples
  it('should return an array of the specified size containing random samples from the array', () => {
    const arr = [1, 2, 3, 4, 5];
    const size = 3;
    const sample = randomSample(arr, size);
    expect(sample).toHaveLength(size);
    sample.forEach((item) => {
      expect(arr).toContain(item);
    });
  });

  // Test case for handling an empty array
  it('should return an empty array when given an empty array', () => {
    const arr: number[] = [];
    const sample = randomSample(arr);
    expect(sample).toHaveLength(0);
  });

  // Test case for handling a larger size than the array length
  it('should return the entire array when the sample size is larger than the array length', () => {
    const arr = [1, 2, 3, 4, 5];
    const size = 10;
    const sample = randomSample(arr, size);
    expect(sample).toHaveLength(arr.length);
    expect(sample.sort()).toEqual(arr.sort());
  });
});
