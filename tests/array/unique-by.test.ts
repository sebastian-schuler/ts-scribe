import { uniqueBy } from '../../src/array';

describe('uniqueBy', () => {
  it('should return an array with unique objects based on the key returned by keyFunc', () => {
    const people = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
      { name: 'Charlie', age: 30 },
      { name: 'David', age: 25 },
    ];

    const uniqueByName = uniqueBy(people, (person) => person.name);

    expect(uniqueByName).toEqual([
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
      { name: 'Charlie', age: 30 },
      { name: 'David', age: 25 },
    ]);
  });

  it('should return an empty array if the input array is empty', () => {
    interface Person {
      name: string;
      age: number;
    }
    const emptyArray: Person[] = [];
    const uniqueEmptyArray = uniqueBy(emptyArray, (person) => person.name);

    expect(uniqueEmptyArray).toEqual([]);
  });

  it('should handle arrays with one element correctly', () => {
    const singleElementArray = [{ name: 'Alice', age: 30 }];
    const uniqueSingleElementArray = uniqueBy(singleElementArray, (person) => person.name);

    expect(uniqueSingleElementArray).toEqual([{ name: 'Alice', age: 30 }]);
  });

  it('should return the same array if all elements are unique', () => {
    const uniqueArray = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
      { name: 'Charlie', age: 35 },
    ];

    const uniqueArrayResult = uniqueBy(uniqueArray, (person) => person.name);

    expect(uniqueArrayResult).toEqual(uniqueArray);
  });

  it('should handle arrays with non-unique keys correctly', () => {
    const nonUniqueArray = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
      { name: 'Charlie', age: 30 },
      { name: 'David', age: 25 },
      { name: 'Alice', age: 30 },
    ];

    const nonUniqueArrayResult = uniqueBy(nonUniqueArray, (person) => person.name);

    expect(nonUniqueArrayResult).toEqual([
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
      { name: 'Charlie', age: 30 },
      { name: 'David', age: 25 },
    ]);
  });

  it('should handle arrays with only non-unique keys correctly', () => {
    const nonUniqueArray = [
      { name: 'Alice', age: 30 },
      { name: 'Alice', age: 30 },
      { name: 'Alice', age: 30 },
      { name: 'Alice', age: 30 },
      { name: 'Alice', age: 30 },
    ];

    const nonUniqueArrayResult = uniqueBy(nonUniqueArray, (person) => person.name);

    expect(nonUniqueArrayResult).toEqual([{ name: 'Alice', age: 30 }]);
  });

  it('should handle deeply nested arrays correctly', () => {
    const deeplyNestedArray = [
      { name: 'Alice', age: 30, address: { city: 'New York' } },
      { name: 'Bob', age: 10, address: { city: 'New York' } },
    ];

    const nonUniqueArrayResult = uniqueBy(deeplyNestedArray, (person) => person.address.city);

    expect(nonUniqueArrayResult).toEqual([{ name: 'Alice', age: 30, address: { city: 'New York' } }]);
  });
});
