import { intersection } from '../../src/array';
import { intersectionDeep } from '../../src/array/intersection';

describe('intersection', () => {
  it('should return the intersection of arrays', () => {
    const arr1 = [1, 2, 3, 4];
    const arr2 = [3, 4, 5, 6];
    const arr3 = [4, 5, 6, 7];

    expect(intersection(arr1, arr2, arr3)).toEqual([4]);
  });

  it('should return an empty array if there are no common elements', () => {
    const arr1 = [1, 2, 3];
    const arr2 = [4, 5, 6];
    const arr3 = [7, 8, 9];

    expect(intersection(arr1, arr2, arr3)).toEqual([]);
  });

  it('should return the same array if only one array is provided', () => {
    const arr1 = [1, 2, 3];

    expect(intersection(arr1)).toEqual(arr1);
  });

  it('should handle arrays with duplicate elements', () => {
    const arr1 = [1, 2, 2, 3, 4];
    const arr2 = [2, 3, 3, 4, 5];

    expect(intersection(arr1, arr2)).toEqual([2, 3, 4]);
  });
});

describe('arrIntersectionDeep', () => {
  it('should return the deep intersection of arrays', () => {
    const arr1 = [
      [1, 2],
      [3, 4],
      [5, 6],
    ];
    const arr2 = [
      [3, 4],
      [5, 6],
      [7, 8],
    ];
    const arr3 = [
      [5, 6],
      [7, 8],
      [9, 10],
    ];

    expect(intersectionDeep(arr1, arr2, arr3)).toEqual([[5, 6]]);
  });

  it('should return an empty array if there are no common elements', () => {
    const arr1 = [
      [1, 2],
      [3, 4],
    ];
    const arr2 = [
      [5, 6],
      [7, 8],
    ];

    expect(intersectionDeep(arr1, arr2)).toEqual([]);
  });

  it('should return the same array if only one array is provided', () => {
    const arr1 = [
      [1, 2],
      [3, 4],
    ];

    expect(intersectionDeep(arr1)).toEqual(arr1);
  });

  it('should handle arrays with duplicate elements', () => {
    const arr1 = [
      [1, 2],
      [2, 3],
      [3, 4],
    ];
    const arr2 = [
      [2, 3],
      [3, 4],
      [4, 5],
    ];

    expect(intersectionDeep(arr1, arr2)).toEqual([
      [2, 3],
      [3, 4],
    ]);
  });
});
