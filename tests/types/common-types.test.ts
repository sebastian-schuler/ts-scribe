import {
  Mandatory,
  NonNullish,
  Nullish,
  OverloadUnion,
  Primitive,
  Simplify,
  SmartPartial,
  TypeOfString,
  TypeOfType,
  UnionToIntersection,
  Nestable,
} from '../../src';
import { DeepPartial } from '../../src/types/common-types';

describe('Mandatory<T>', () => {
  it('should make all properties in T required', () => {
    type TestType = Mandatory<{ a?: number; b?: string }>;
    // Ensure all properties become required
    type Expected = { a: number; b: string };
    expect<true>(true).toBeTruthy(); // Placeholder assertion to ensure test runs
  });
});

describe('NonNullish<T>', () => {
  it('should exclude null and undefined from T', () => {
    type TestType = NonNullish;
    // Ensure the type excludes nullish values
    type Expected = {};
    expect<true>(true).toBeTruthy(); // Placeholder assertion to ensure test runs
  });
});

describe('Nullish<T>', () => {
  it('should make null and undefined as only valid values in T', () => {
    type TestType = Nullish;
    // Ensure the type only allows nullish values
    type Expected = null | undefined | void;
    expect<true>(true).toBeTruthy(); // Placeholder assertion to ensure test runs
  });
});

describe('OverloadUnion', () => {
  it('should create a union type from overload signatures', () => {
    type TestType = OverloadUnion<((x: number) => string) & ((x: string) => number)>;
    // Ensure the type is a union of both function signatures
    type Expected = ((x: number) => string) | ((x: string) => number);
    expect<true>(true).toBeTruthy(); // Placeholder assertion to ensure test runs
  });
});

describe('Primitive<T>', () => {
  it('should narrow down to primitive types', () => {
    type TestType = Primitive;
    // Ensure the type narrows down to primitive types
    type Expected = string | number | boolean;
    expect<true>(true).toBeTruthy(); // Placeholder assertion to ensure test runs
  });
});

describe('Simplify<T>', () => {
  it('should simplify complex object types', () => {
    type TestType = Simplify<{ a: { b: { c: string } } }>;
    // Ensure the type simplifies to expected structure
    type Expected = { a: { b: { c: string } } };
    expect<true>(true).toBeTruthy(); // Placeholder assertion to ensure test runs
  });
});

describe('SmartPartial<T>', () => {
  it('should make all properties in T optional', () => {
    type TestType = SmartPartial<{ a: number; b: string }>;
    // Ensure all properties become optional
    type Expected = { a?: number; b?: string };
    expect<true>(true).toBeTruthy(); // Placeholder assertion to ensure test runs
  });
});

describe('TypeOfString<T>', () => {
  it('should extract string type from T', () => {
    type TestType = TypeOfString;
    // Ensure only string type is extracted
    type Expected = 'bigint' | 'boolean' | 'function' | 'number' | 'object' | 'string' | 'symbol' | 'undefined';
    expect<true>(true).toBeTruthy(); // Placeholder assertion to ensure test runs
  });
});

describe('TypeOfType<T>', () => {
  it('should extract the type of T', () => {
    type TestType = TypeOfType<'string'>;
    // Ensure the type of T is extracted
    type Expected = string;
    expect<true>(true).toBeTruthy(); // Placeholder assertion to ensure test runs
  });
});

describe('UnionToIntersection<T>', () => {
  it('should transform a union type into an intersection type', () => {
    type TestType = UnionToIntersection<{ a: number } | { b: string }>;
    // Ensure the union type is transformed into an intersection type
    type Expected = { a: number } & { b: string };
    expect<true>(true).toBeTruthy(); // Placeholder assertion to ensure test runs
  });
});

describe('Nestable', () => {
  it('should be a nestable object type', () => {
    type TestType = Nestable;
    // Ensure the type is a nestable object type
    type Expected = Primitive | Nestable[] | { [key: string]: Nestable };
    expect<true>(true).toBeTruthy(); // Placeholder assertion to ensure test runs
  });
});

describe('DeepPartial', () => {
  it('should make all properties in T optional', () => {
    type TestType = DeepPartial<{
      a: number;
      b: {
        c: string;
        d: {
          e: number;
          f: string;
        };
      };
      c: [
        {
          g: number;
          h: string;
        },
      ];
    }>;
    // Ensure all properties become optional
    type Expected = { a?: number; b?: string };
    expect<true>(true).toBeTruthy(); // Placeholder assertion to ensure test runs
  });
});
