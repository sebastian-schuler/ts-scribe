import { describe, expect, it } from 'bun:test';
import { objectMask, type MaskObjectOptions } from '../../src/object/index.js';

describe('objectMask', () => {
  it('should mask properties by key list', () => {
    const obj = {
      name: 'John Doe',
      email: 'john@example.com',
      ssn: '123-45-6789',
    };

    const result = objectMask(obj, { keys: ['ssn', 'email'] });

    expect(result.name).toBe('John Doe');
    expect(result.ssn).not.toBe('123-45-6789');
    expect(result.email).not.toBe('john@example.com');
  });

  it('should use custom isSensitive predicate', () => {
    const obj = {
      username: 'john',
      password: 'secret123',
      apiKey: 'sk_live_xyz',
      token: 'abc123def456',
    };

    const result = objectMask(obj, {
      isSensitive: (key) =>
        key.toLowerCase().includes('password') || 
        key.toLowerCase().includes('key') || 
        key.toLowerCase().includes('token'),
    });

    expect(result.username).toBe('john');
    expect(result.password).not.toBe('secret123');
    expect(result.apiKey).not.toBe('sk_live_xyz');
    expect(result.token).not.toBe('abc123def456');
  });

  it('should handle deeply nested objects', () => {
    const obj = {
      user: {
        name: 'John',
        email: 'john@example.com',
        payment: {
          card: '4532-1234-5678-9012',
          cvv: '123',
        },
      },
    };

    const result = objectMask(obj, { keys: ['email', 'card', 'cvv'] });

    expect(result.user.name).toBe('John');
    expect(result.user.email).not.toBe('john@example.com');
    expect(result.user.payment.card).not.toBe('4532-1234-5678-9012');
    expect(result.user.payment.cvv).not.toBe('123');
  });

  it('should handle arrays of objects', () => {
    const obj = [
      { id: 1, email: 'user1@example.com', password: 'pass1' },
      { id: 2, email: 'user2@example.com', password: 'pass2' },
    ];

    const result = objectMask(obj, { keys: ['email', 'password'] });

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(1);
    expect(result[0].email).not.toBe('user1@example.com');
    expect(result[0].password).not.toBe('pass1');
    expect(result[1].id).toBe(2);
    expect(result[1].email).not.toBe('user2@example.com');
    expect(result[1].password).not.toBe('pass2');
  });

  it('should handle nested arrays', () => {
    const obj = {
      users: [
        { name: 'Alice', ssn: '111-11-1111' },
        { name: 'Bob', ssn: '222-22-2222' },
      ],
    };

    const result = objectMask(obj, { keys: ['ssn'] });

    expect(result.users[0].name).toBe('Alice');
    expect(result.users[0].ssn).not.toBe('111-11-1111');
    expect(result.users[1].name).toBe('Bob');
    expect(result.users[1].ssn).not.toBe('222-22-2222');
  });

  it('should use custom maskFn', () => {
    const obj = {
      email: 'john@example.com',
      ssn: '123-45-6789',
    };

    const result = objectMask(obj, {
      keys: ['email', 'ssn'],
      maskFn: (value, key) => {
        if (key === 'ssn') return `***-**-${String(value).slice(-4)}`;
        if (key === 'email') return String(value)[0] + '***@' + String(value).split('@')[1];
        return '***';
      },
    });

    expect(result.email).toBe('j***@example.com');
    expect(result.ssn).toBe('***-**-6789');
  });

  it('should skip descending into objects matching shouldSkip', () => {
    const obj = {
      user: { name: 'John', email: 'john@example.com' },
      geometry: {
        type: 'Feature',
        coordinates: [10, 20],
        secret: 'should-not-be-masked',
      },
    };

    const result = objectMask(obj, {
      keys: ['email', 'secret'],
      shouldSkip: (value, path) => {
        return typeof value === 'object' && value !== null && 'type' in value && value.type === 'Feature';
      },
    });

    expect(result.user.email).not.toBe('john@example.com');
    expect(result.geometry.secret).toBe('should-not-be-masked');
  });

  it('should handle circular references', () => {
    const obj: any = { name: 'John', email: 'john@example.com' };
    obj.self = obj;

    const result = objectMask(obj, { keys: ['email'] });

    expect(result.name).toBe('John');
    expect(result.email).not.toBe('john@example.com');
    expect(result.self).toBe(result); // Should reference itself
  });

  it('should respect maxDepth option', () => {
    const obj = {
      level1: {
        level2: {
          level3: {
            secret: 'should-not-mask-at-depth-3',
          },
        },
      },
    };

    const result = objectMask(obj, {
      keys: ['secret'],
      maxDepth: 2,
    });

    // At depth 3, we should not reach the secret key
    expect(result.level1.level2.level3.secret).toBe('should-not-mask-at-depth-3');
  });

  it('should use custom char for masking', () => {
    const obj = { password: 'secretpass' };

    const resultAsterisk = objectMask(obj, { keys: ['password'], char: '*' });
    const resultHash = objectMask(obj, { keys: ['password'], char: '#' });

    expect(resultAsterisk.password).toContain('*');
    expect(resultHash.password).toContain('#');
  });

  it('should handle null and undefined values', () => {
    const obj = {
      email: 'john@example.com',
      nullField: null,
      undefinedField: undefined,
      zeroField: 0,
      falseField: false,
    };

    const result = objectMask(obj, { keys: ['email'] });

    expect(result.email).not.toBe('john@example.com');
    expect(result.nullField).toBe(null);
    expect(result.undefinedField).toBe(undefined);
    expect(result.zeroField).toBe(0);
    expect(result.falseField).toBe(false);
  });

  it('should not mutate original object', () => {
    const original = {
      name: 'John',
      email: 'john@example.com',
    };

    const result = objectMask(original, { keys: ['email'] });

    expect(original.email).toBe('john@example.com');
    expect(result.email).not.toBe('john@example.com');
    expect(original).not.toBe(result);
  });

  it('should handle mixed data types in arrays', () => {
    const obj = {
      items: [
        { id: 1, email: 'user1@example.com' },
        'string-value',
        123,
        null,
        { id: 2, email: 'user2@example.com' },
      ],
    };

    const result = objectMask(obj, { keys: ['email'] });

    // @ts-expect-error - TypeScript will complain about mixed types, but we want to ensure it works at runtime
    expect(result.items[0].email).not.toBe('user1@example.com');
    expect(result.items[1]).toBe('string-value');
    expect(result.items[2]).toBe(123);
    expect(result.items[3]).toBe(null);
    // @ts-expect-error - TypeScript will complain about mixed types, but we want to ensure it works at runtime
    expect(result.items[4].email).not.toBe('user2@example.com');
  });

  it('should handle objects with both primitive and object values', () => {
    const obj = {
      name: 'John',
      age: 30,
      contactInfo: {
        email: 'john@example.com',
        phone: '555-1234',
      },
      tags: ['admin', 'user'],
    };

    const result = objectMask(obj, { keys: ['email', 'phone'] });

    expect(result.name).toBe('John');
    expect(result.age).toBe(30);
    expect(result.contactInfo.email).not.toBe('john@example.com');
    expect(result.contactInfo.phone).not.toBe('555-1234');
    expect(result.tags).toEqual(['admin', 'user']);
  });

  it('should combine keys and isSensitive predicates', () => {
    const obj = {
      email: 'john@example.com',
      password: 'secret123',
      name: 'John',
    };

    const result = objectMask(obj, {
      keys: ['email'],
      isSensitive: (key) => key === 'password',
    });

    expect(result.email).not.toBe('john@example.com');
    expect(result.password).not.toBe('secret123');
    expect(result.name).toBe('John');
  });

  it('should pass depth and path to isSensitive predicate', () => {
    const depths: number[] = [];
    const paths: string[] = [];

    const obj = {
      level1: {
        level2: {
          secret: 'value',
        },
      },
    };

    objectMask(obj, {
      isSensitive: (key, value, path, depth) => {
        if (key === 'secret') {
          depths.push(depth);
          paths.push(path);
          return true;
        }
        return false;
      },
    });

    expect(depths).toContain(2);
    expect(paths).toContain('level1.level2.secret');
  });

  it('should not mask when maskArrays is false', () => {
    const obj = {
      items: ['secret1', 'secret2', 'secret3'],
    };

    const result = objectMask(obj, {
      keys: ['items'],
      maskArrays: false,
    });

    expect(result.items).toEqual(['secret1', 'secret2', 'secret3']);
  });

  it('should handle GeoJSON-like structures with shouldSkip', () => {
    const obj = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [10, 20],
          },
          properties: {
            name: 'Location',
            apiKey: 'sk_xyz',
          },
        },
      ],
    };

    const result = objectMask(obj, {
      keys: ['apiKey'],
      shouldSkip: (value) => {
        return typeof value === 'object' && value !== null && 'type' in value && 'coordinates' in value;
      },
    });

    // The geometry object should be skipped, but properties should be processed
    expect(result.features[0].properties.apiKey).not.toBe('sk_xyz');
  });

  it('should handle empty objects and arrays', () => {
    const obj = {
      empty: {},
      emptyArray: [],
      nestedEmpty: {
        inner: {},
      },
    };

    const result = objectMask(obj, { keys: ['secret'] });

    expect(result.empty).toEqual({});
    expect(result.emptyArray).toEqual([]);
    expect(result.nestedEmpty.inner).toEqual({});
  });

  // ========== EDGE CASE TESTS ==========

  it('should mask entire GeoJSON geometries when detected by predicate', () => {
    const obj = {
      name: 'Location Data',
      apiKey: 'secret123',
      geometry: {
        type: 'Point',
        coordinates: [125.6, 10.1],
        properties: {
          sensitiveData: 'should-be-masked-with-geometry',
        },
      },
      anotherGeometry: {
        type: 'Polygon',
        coordinates: [
          [
            [100.0, 0.0],
            [101.0, 0.0],
            [101.0, 1.0],
            [100.0, 1.0],
            [100.0, 0.0],
          ],
        ],
      },
    };

    const isGeoJSONGeometry = (value: any) => {
      return (
        typeof value === 'object' &&
        value !== null &&
        'type' in value &&
        'coordinates' in value &&
        ['Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon'].includes(value.type)
      );
    };

    const result = objectMask(obj, {
      keys: ['apiKey'],
      isSensitive: (key, value) => isGeoJSONGeometry(value),
    });

    expect(result.name).toBe('Location Data');
    expect(result.apiKey).not.toBe('secret123');
    // Entire geometry objects should be masked, not descended into
    expect(typeof result.geometry).toBe('string');
    expect(result.geometry).toContain('*');
    expect(typeof result.anotherGeometry).toBe('string');
    expect(result.anotherGeometry).toContain('*');
  });

  it('should handle sparse arrays', () => {
    const sparse: any[] = [];
    sparse[0] = { email: 'user1@example.com' };
    sparse[5] = { email: 'user2@example.com' };
    sparse[10] = { email: 'user3@example.com' };

    const result = objectMask(sparse, { keys: ['email'] });

    expect(result.length).toBe(11);
    expect(result[0].email).not.toBe('user1@example.com');
    expect(result[1]).toBe(undefined);
    expect(result[2]).toBe(undefined);
    expect(result[5].email).not.toBe('user2@example.com');
    expect(result[10].email).not.toBe('user3@example.com');
  });

  it('should handle Date objects', () => {
    const date = new Date('2024-01-01');
    const obj = {
      name: 'John',
      createdAt: date,
      password: 'secret123',
    };

    const result = objectMask(obj, { keys: ['password'] });

    expect(result.name).toBe('John');
    expect(result.createdAt).toBe(date); // Date object preserved
    expect(result.password).not.toBe('secret123');
  });

  it('should handle RegExp objects', () => {
    const obj = {
      pattern: /test-pattern/gi,
      secret: 'sensitive',
    };

    const result = objectMask(obj, { keys: ['secret'] });

    expect(result.pattern).toBeInstanceOf(RegExp);
    expect(result.pattern.source).toBe('test-pattern');
    expect(result.secret).not.toBe('sensitive');
  });

  it('should handle Error objects', () => {
    const error = new Error('Test error message');
    const obj = {
      error: error,
      password: 'secret',
    };

    const result = objectMask(obj, { keys: ['password'] });

    expect(result.error).toBe(error); // Error object preserved
    expect(result.password).not.toBe('secret');
  });

  it('should handle functions as property values', () => {
    const fn = () => 'test';
    const obj = {
      callback: fn,
      password: 'secret',
    };

    const result = objectMask(obj, { keys: ['password'] });

    expect(result.callback).toBe(fn); // Function preserved
    expect(result.password).not.toBe('secret');
  });

  it('should handle number edge cases', () => {
    const obj = {
      nan: NaN,
      infinity: Infinity,
      negInfinity: -Infinity,
      negZero: -0,
      posZero: 0,
      password: 'secret',
    };

    const result = objectMask(obj, { keys: ['password'] });

    expect(result.nan).toBeNaN();
    expect(result.infinity).toBe(Infinity);
    expect(result.negInfinity).toBe(-Infinity);
    expect(Object.is(result.negZero, -0)).toBe(true);
    expect(result.posZero).toBe(0);
    expect(result.password).not.toBe('secret');
  });

  it('should handle BigInt values', () => {
    const obj = {
      bigNum: BigInt(9007199254740991),
      password: 'secret',
    };

    const result = objectMask(obj, { keys: ['password'] });

    expect(result.bigNum).toBe(BigInt(9007199254740991));
    expect(result.password).not.toBe('secret');
  });

  it('should handle empty strings vs null vs undefined', () => {
    const obj = {
      emptyString: '',
      nullValue: null,
      undefinedValue: undefined,
      password: 'secret',
    };

    const result = objectMask(obj, { keys: ['password'] });

    expect(result.emptyString).toBe('');
    expect(result.nullValue).toBe(null);
    expect(result.undefinedValue).toBe(undefined);
    expect(result.password).not.toBe('secret');
  });

  it('should handle very deep nesting beyond maxDepth', () => {
    // Create a very deeply nested object
    const createDeep = (depth: number): any => {
      if (depth === 0) return { secret: 'deep-secret' };
      return { nested: createDeep(depth - 1) };
    };

    const obj = createDeep(150);

    const result = objectMask(obj, {
      keys: ['secret'],
      maxDepth: 10,
    });

    // Navigate to depth 10 and check that we stop processing
    let current: any = result;
    for (let i = 0; i < 10; i++) {
      current = current.nested;
    }

    // At depth 10, the object should be returned as-is
    expect(current).toHaveProperty('nested');
  });

  it('should handle mixed circular references (A->B->A)', () => {
    const objA: any = { name: 'A', password: 'secretA' };
    const objB: any = { name: 'B', password: 'secretB', ref: objA };
    objA.ref = objB;

    const result = objectMask(objA, { keys: ['password'] });

    expect(result.name).toBe('A');
    expect(result.password).not.toBe('secretA');
    expect(result.ref.name).toBe('B');
    expect(result.ref.password).not.toBe('secretB');
    expect(result.ref.ref).toBe(result); // Circular reference preserved
  });

  it('should handle arrays with circular references', () => {
    const arr: any[] = [{ id: 1, password: 'secret1' }, { id: 2, password: 'secret2' }];
    arr.push(arr); // arr[2] points to arr itself

    const result = objectMask(arr, { keys: ['password'] });

    expect(result[0].password).not.toBe('secret1');
    expect(result[1].password).not.toBe('secret2');
    expect(result[2]).toBe(result); // Circular reference preserved
  });

  it('should handle objects with symbol properties', () => {
    const sym = Symbol('test');
    const obj: any = {
      normalProp: 'value',
      password: 'secret',
    };
    obj[sym] = 'symbol-value';

    const result = objectMask(obj, { keys: ['password'] });

    expect(result.normalProp).toBe('value');
    expect(result.password).not.toBe('secret');
    // Symbol properties are not enumerable by default and won't be copied
    expect(result[sym]).toBe(undefined);
  });

  it('should handle nested objects with multiple levels of sensitive data', () => {
    const obj = {
      level1: {
        data: 'safe1',
        password: 'secret1',
        level2: {
          data: 'safe2',
          apiKey: 'key123',
          level3: {
            data: 'safe3',
            token: 'token456',
            level4: {
              data: 'safe4',
              ssn: '123-45-6789',
            },
          },
        },
      },
    };

    const result = objectMask(obj, {
      keys: ['password', 'apiKey', 'token', 'ssn'],
    });

    expect(result.level1.data).toBe('safe1');
    expect(result.level1.password).not.toBe('secret1');
    expect(result.level1.level2.data).toBe('safe2');
    expect(result.level1.level2.apiKey).not.toBe('key123');
    expect(result.level1.level2.level3.data).toBe('safe3');
    expect(result.level1.level2.level3.token).not.toBe('token456');
    expect(result.level1.level2.level3.level4.data).toBe('safe4');
    expect(result.level1.level2.level3.level4.ssn).not.toBe('123-45-6789');
  });

  it('should handle arrays of arrays with sensitive data', () => {
    const obj = {
      matrix: [
        [
          { x: 1, password: 'p1' },
          { x: 2, password: 'p2' },
        ],
        [
          { x: 3, password: 'p3' },
          { x: 4, password: 'p4' },
        ],
      ],
    };

    const result = objectMask(obj, { keys: ['password'] });

    expect(result.matrix[0][0].x).toBe(1);
    expect(result.matrix[0][0].password).not.toBe('p1');
    expect(result.matrix[0][1].password).not.toBe('p2');
    expect(result.matrix[1][0].password).not.toBe('p3');
    expect(result.matrix[1][1].password).not.toBe('p4');
  });

  it('should handle objects where isSensitive checks value content', () => {
    const obj = {
      publicKey: 'pk_test_12345',
      secretKey: 'sk_live_67890',
      otherKey: 'other_98765',
    };

    const result = objectMask(obj, {
      isSensitive: (key, value) => {
        return typeof value === 'string' && value.startsWith('sk_');
      },
    });

    expect(result.publicKey).toBe('pk_test_12345');
    expect(result.secretKey).not.toBe('sk_live_67890');
    expect(result.otherKey).toBe('other_98765');
  });

  it('should handle complex GeoJSON FeatureCollection with sensitive properties', () => {
    const obj = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [125.6, 10.1],
          },
          properties: {
            name: 'Location A',
            apiKey: 'secret123',
            owner: {
              email: 'owner@example.com',
              userId: 'user123',
            },
          },
        },
      ],
    };

    const isGeoJSONGeometry = (value: any) =>
      typeof value === 'object' &&
      value !== null &&
      'type' in value &&
      'coordinates' in value;

    const result = objectMask(obj, {
      keys: ['apiKey', 'email'],
      isSensitive: (key, value) => key === 'geometry' && isGeoJSONGeometry(value),
    });

    expect(result.features[0].properties.name).toBe('Location A');
    expect(result.features[0].properties.apiKey).not.toBe('secret123');
    expect(result.features[0].properties.owner.email).not.toBe('owner@example.com');
    expect(result.features[0].properties.owner.userId).toBe('user123');
    // Geometry should be masked entirely
    expect(typeof result.features[0].geometry).toBe('string');
    expect(result.features[0].geometry).toContain('*');
  });

  it('should handle objects with only sensitive fields', () => {
    const obj = {
      password: 'secret1',
      token: 'secret2',
      apiKey: 'secret3',
    };

    const result = objectMask(obj, {
      keys: ['password', 'token', 'apiKey'],
    });

    expect(result.password).not.toBe('secret1');
    expect(result.token).not.toBe('secret2');
    expect(result.apiKey).not.toBe('secret3');
  });

  it('should preserve array order and indices', () => {
    const obj = {
      items: [
        { id: 0, secret: 's0' },
        { id: 1, secret: 's1' },
        { id: 2, secret: 's2' },
        { id: 3, secret: 's3' },
      ],
    };

    const result = objectMask(obj, { keys: ['secret'] });

    expect(result.items).toHaveLength(4);
    expect(result.items[0].id).toBe(0);
    expect(result.items[1].id).toBe(1);
    expect(result.items[2].id).toBe(2);
    expect(result.items[3].id).toBe(3);
    expect(result.items[0].secret).not.toBe('s0');
  });

  it('should handle paths correctly in deeply nested structures', () => {
    const capturedPaths: string[] = [];

    const obj = {
      a: {
        b: {
          c: {
            secret: 'value',
          },
        },
      },
    };

    objectMask(obj, {
      isSensitive: (key, value, path) => {
        if (key === 'secret') {
          capturedPaths.push(path);
          return true;
        }
        return false;
      },
    });

    expect(capturedPaths).toContain('a.b.c.secret');
  });

  it('should handle array paths correctly', () => {
    const capturedPaths: string[] = [];

    const obj = {
      users: [{ email: 'test1@example.com' }, { email: 'test2@example.com' }],
    };

    objectMask(obj, {
      isSensitive: (key, value, path) => {
        if (key === 'email') {
          capturedPaths.push(path);
          return true;
        }
        return false;
      },
    });

    expect(capturedPaths).toContain('users[0].email');
    expect(capturedPaths).toContain('users[1].email');
  });

  it('should handle objects with numeric string keys', () => {
    const obj = {
      '0': { password: 'secret0' },
      '1': { password: 'secret1' },
      normal: { password: 'secret2' },
    };

    const result = objectMask(obj, { keys: ['password'] });

    expect(result['0'].password).not.toBe('secret0');
    expect(result['1'].password).not.toBe('secret1');
    expect(result.normal.password).not.toBe('secret2');
  });

  it('should handle shouldSkip with depth parameter', () => {
    const obj = {
      level1: {
        skipMe: {
          type: 'SkipType',
          secret: 'should-not-mask',
        },
        level2: {
          skipMe: {
            type: 'SkipType',
            secret: 'should-not-mask-either',
          },
        },
      },
    };

    const result = objectMask(obj, {
      keys: ['secret'],
      shouldSkip: (value, path, depth) => {
        return typeof value === 'object' && value !== null && 'type' in value && value.type === 'SkipType';
      },
    });

    expect(result.level1.skipMe.secret).toBe('should-not-mask');
    expect(result.level1.level2.skipMe.secret).toBe('should-not-mask-either');
  });
});
