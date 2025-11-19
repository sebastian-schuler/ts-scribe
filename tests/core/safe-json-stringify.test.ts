import { safeJsonStringify } from '../../src/index.js';
import { describe, expect, it } from 'bun:test';

// Helper: normalize whitespace for deep equality checks on pretty-printed JSON
function normalizeJSON(str: string): string {
  return str.replace(/\s+/g, ' ').trim();
}

describe('safeJsonStringify', () => {
  it('should serialize basic primitives correctly', () => {
    expect(safeJsonStringify(null)).toBe('null');
    expect(safeJsonStringify(true)).toBe('true');
    expect(safeJsonStringify(42)).toBe('42');
    expect(safeJsonStringify('hello')).toBe('"hello"');
    expect(safeJsonStringify(undefined)).toBeUndefined(); // matches JSON.stringify
    expect(safeJsonStringify(Symbol('id'))).toBeUndefined();
  });

  it('should serialize plain objects', () => {
    const obj = { a: 1, b: 'two', c: null };
    expect(safeJsonStringify(obj)).toBe('{"a":1,"b":"two","c":null}');
  });

  it('should handle arrays', () => {
    const arr = [1, 'two', { nested: true }];
    expect(safeJsonStringify(arr)).toBe('[1,"two",{"nested":true}]');
  });

  it('should replace circular references with "[Circular]"', () => {
    const obj: any = { name: 'Alice' };
    obj.self = obj;

    const result = safeJsonStringify(obj);
    expect(result).toBe('{"name":"Alice","self":"[Circular]"}');

    // Nested circular
    const a: any = {};
    const b: any = { a };
    a.b = b;
    expect(safeJsonStringify(a)).toBe('{"b":{"a":"[Circular]"}}');
  });

  it('should handle deep circular structures', () => {
    const root: any = { id: 1 };
    const child1: any = { id: 2, parent: root };
    const child2: any = { id: 3, sibling: child1 };
    root.child1 = child1;
    root.child2 = child2;
    child1.sibling = child2;

    const result = safeJsonStringify(root);
    // We only expect *direct* circulars to be "[Circular]"; deep refs are fine until cycle closes
    // But when child1.parent → root, and root is already in visited, it becomes "[Circular]"
    expect(JSON.parse(result)).toEqual({
      id: 1,
      child1: {
        id: 2,
        parent: '[Circular]',
        sibling: {
          id: 3,
          sibling: '[Circular]',
        },
      },
      child2: {
        id: 3,
        sibling: {
          id: 2,
          parent: '[Circular]',
          sibling: '[Circular]',
        },
      },
    });
  });

  it('should replace throwing getters with "[Throws: <message>]"', () => {
    const obj = {
      safe: 'ok',
    };
    Object.defineProperty(obj, 'throws', {
      get() {
        throw new Error('Forbidden');
      },
      enumerable: true,
    });

    const result = safeJsonStringify(obj);
    expect(result).toBe('{"safe":"ok","throws":"[Throws: Forbidden]"}');
  });

  it('should handle inherited throwing getters', () => {
    const proto = {};
    Object.defineProperty(proto, 'inherited', {
      get() {
        throw new TypeError('nope');
      },
      enumerable: true,
    });

    const obj = Object.create(proto);
    obj.own = 'yes';

    const result = safeJsonStringify(obj);
    expect(result).toBe('{"own":"yes","inherited":"[Throws: nope]"}');
  });

  it('should respect toJSON method', () => {
    class User {
      constructor(
        public id: number,
        public name: string,
      ) {}
      toJSON() {
        return { id: this.id, name: this.name.toUpperCase() };
      }
    }

    const user = new User(42, 'alice');
    expect(safeJsonStringify(user)).toBe('{"id":42,"name":"ALICE"}');
  });

  it('should replace throwing toJSON with "[Throws: ...]"', () => {
    class BadSerializer {
      data = 'ok';
      toJSON() {
        throw new Error('Serialization failed');
      }
    }

    const obj = new BadSerializer();
    const result = safeJsonStringify(obj);
    expect(result).toBe('"[Throws: Serialization failed]"');
  });

  it('should handle toJSON returning circular structure', () => {
    const circular: any = { id: 1 };
    circular.self = circular;

    const obj = {
      toJSON() {
        return circular;
      },
    };

    const result = safeJsonStringify(obj);
    expect(result).toBe('{"id":1,"self":"[Circular]"}');
  });

  it('should ignore symbol-keyed properties (like JSON.stringify)', () => {
    const sym = Symbol('secret');
    const obj = {
      public: 'visible',
      [sym]: 'hidden',
    };
    Object.defineProperty(obj, Symbol.iterator, {
      value: () => null,
      enumerable: true,
    });

    expect(safeJsonStringify(obj)).toBe('{"public":"visible"}');
  });

  it('should support replacer function', () => {
    const obj = { a: 1, b: 2, c: 3 };
    const replacer = (key: string, value: unknown) => (key === 'b' ? undefined : value);

    expect(safeJsonStringify(obj, replacer)).toBe('{"a":1,"c":3}');
  });

  it('should support replacer array', () => {
    const obj = { a: 1, b: 2, c: 3 };
    expect(safeJsonStringify(obj, ['a', 'c'])).toBe('{"a":1,"c":3}');
  });

  it('should support space indentation', () => {
    const obj = { a: 1, b: { c: 2 } };
    const expected = `{
 "a": 1,
 "b": {
  "c": 2
 }
}`;
    const result = safeJsonStringify(obj, null, 1);
    expect(normalizeJSON(result)).toBe(normalizeJSON(expected));
  });

  it('should handle null/undefined replacer and space', () => {
    const obj = { x: 1 };
    expect(safeJsonStringify(obj, null, 0)).toBe('{"x":1}');
    expect(safeJsonStringify(obj, undefined, undefined)).toBe('{"x":1}');
  });

  it('should not mutate original object', () => {
    const obj = { a: 1 };
    Object.defineProperty(obj, 'get', {
      get() {
        return 'safe';
      },
      enumerable: true,
    });

    const before = Object.getOwnPropertyDescriptors(obj);
    safeJsonStringify(obj);
    const after = Object.getOwnPropertyDescriptors(obj);

    expect(after).toEqual(before);
  });

  it('should handle Date (toJSON returns ISO string)', () => {
    const now = new Date('2025-01-01T00:00:00Z');
    expect(safeJsonStringify(now)).toBe('"2025-01-01T00:00:00.000Z"');
  });

  it('should handle RegExp (no toJSON, own props only)', () => {
    const re = /abc/g;
    // RegExp has no enumerable own props (lastIndex is not enumerable by default)
    expect(safeJsonStringify(re)).toBe('{}');
  });

  it('should handle Map/Set (treated as plain objects — empty)', () => {
    const map = new Map([['a', 1]]);
    const set = new Set([1, 2]);

    // Maps/Sets have no enumerable own properties → {}
    expect(safeJsonStringify(map)).toBe('{}');
    expect(safeJsonStringify(set)).toBe('{}');
  });

  it('should return undefined for function root values', () => {
    function fn() {}
    fn.prop = 'value';
    expect(safeJsonStringify(fn)).toBeUndefined();
  });

  it('should serialize function objects as empty objects when nested', () => {
    function fn() {}
    const obj = { func: fn };
    expect(safeJsonStringify(obj)).toBe('{}');
  });

  it('should handle deeply nested mixed structures', () => {
    const obj: any = {
      a: [1, 2, { b: Symbol('ignore'), c: () => {} }],
      d: new Date(0),
    };
    obj.circular = obj;

    const result = JSON.parse(safeJsonStringify(obj));
    expect(result).toEqual({
      a: [1, 2, {}],
      d: '1970-01-01T00:00:00.000Z',
      circular: '[Circular]',
    });
  });

  it('should convert undefined and functions in arrays to null', () => {
    expect(safeJsonStringify([undefined, () => {}, 42])).toBe('[null,null,42]');
  });

  it('should ignore non-enumerable throwing getters', () => {
    const obj = {};
    Object.defineProperty(obj, 'throws', {
      get() {
        throw new Error('ignored');
      },
      enumerable: false, // ← key difference
    });
    // @ts-expect-error test case
    obj.visible = 'ok';
    expect(safeJsonStringify(obj)).toBe('{"visible":"ok"}');
  });

  it('should handle Proxy-wrapped objects', () => {
    const target = { a: 1 };
    const proxy = new Proxy(target, {
      get(target, prop) {
        if (prop === 'trap') throw new Error('proxy trap');
        return target[prop as keyof typeof target];
      },
      ownKeys() {
        return ['a', 'trap'] as any;
      },
      getOwnPropertyDescriptor() {
        return { enumerable: true, configurable: true };
      },
    });

    expect(safeJsonStringify({ p: proxy })).toBe('{"p":{"a":1,"trap":"[Throws: proxy trap]"}}');
  });

  it('should handle Object.create(null)', () => {
    const obj = Object.create(null);
    obj.key = 'value';
    expect(safeJsonStringify(obj)).toBe('{"key":"value"}');
  });

  it('should not crash on deeply nested objects (stack safety)', () => {
    let obj: any = {};
    for (let i = 0; i < 1000; i++) {
      obj = { child: obj };
    }
    // Should not throw "Maximum call stack size exceeded"
    expect(() => safeJsonStringify(obj)).not.toThrow();
  });

  it('should handle non-Error throws (string, number, null)', () => {
    const obj = {
      str: {
        get str() {
          throw 'string error';
        },
      },
      num: {
        get num() {
          throw 42;
        },
      },
      nil: {
        get nil() {
          throw null;
        },
      },
    };
    const result = safeJsonStringify(obj);
    expect(result).toContain('"str":"[Throws: string error]"');
    expect(result).toContain('"num":"[Throws: 42]"');
    expect(result).toContain('"nil":"[Throws: null]"');
  });

  it('should allow replacer to modify placeholders', () => {
    const obj: any = {};
    obj.self = obj;
    const replacer = (key: string, value: unknown) => (value === '[Circular]' ? '[CYCLIC]' : value);

    expect(safeJsonStringify(obj, replacer)).toBe('{"self":"[CYCLIC]"}');
  });

  it('should handle empty structures', () => {
    expect(safeJsonStringify({})).toBe('{}');
    expect(safeJsonStringify([])).toBe('[]');
    expect(safeJsonStringify(Object.create(null))).toBe('{}');
  });
});
