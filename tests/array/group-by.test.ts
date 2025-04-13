import { describe, expect, it } from 'bun:test';
import { arrGroupBy, ArrGroupByKeyFn } from '../../src/array/group-by.js';

describe('arrGroupBy', () => {
  interface Person {
    name: string;
    age: number;
  }

  const people: Person[] = [
    { name: 'Alice', age: 30 },
    { name: 'Bob', age: 25 },
    { name: 'Charlie', age: 30 },
    { name: 'David', age: 25 },
  ];

  it('should group objects by age', () => {
    const groupedByAge = arrGroupBy(people, (person) => person.age);
    expect(groupedByAge).toEqual({
      25: [
        { name: 'Bob', age: 25 },
        { name: 'David', age: 25 },
      ],
      30: [
        { name: 'Alice', age: 30 },
        { name: 'Charlie', age: 30 },
      ],
    });
  });

  it('should group objects by name length', () => {
    const groupedByNameLength = arrGroupBy(people, (person) => person.name.length);
    expect(groupedByNameLength).toEqual({
      5: [
        { name: 'Alice', age: 30 },
        { name: 'David', age: 25 },
      ],
      3: [{ name: 'Bob', age: 25 }],
      7: [{ name: 'Charlie', age: 30 }],
    });
  });

  it('should return an empty object for an empty input array', () => {
    const emptyArray: Person[] = [];
    const result = arrGroupBy(emptyArray, (person) => person.age);
    expect(result).toEqual({});
  });

  it('should handle custom key functions', () => {
    const customKeyFunc: ArrGroupByKeyFn<Person> = (person) => person.name[0];
    const result = arrGroupBy(people, customKeyFunc);
    expect(result).toEqual({
      A: [{ name: 'Alice', age: 30 }],
      B: [{ name: 'Bob', age: 25 }],
      C: [{ name: 'Charlie', age: 30 }],
      D: [{ name: 'David', age: 25 }],
    });
  });
});
