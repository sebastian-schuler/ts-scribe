/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'bun:test';
import { objectDeepFreeze } from '../../src/object/index.js';

describe('deepFreeze', () => {
  it('should freeze a simple object', () => {
    const obj = {
      a: 1,
      b: {
        c: 2,
      },
      d: [3, 4, 5],
    };

    const frozenObj = objectDeepFreeze(obj);

    // Check if the object itself is frozen
    expect(Object.isFrozen(frozenObj)).toBe(true);

    // Check if nested objects and arrays are frozen
    expect(Object.isFrozen(frozenObj.b)).toBe(true);
    expect(Object.isFrozen(frozenObj.d)).toBe(true);
  });

  it('should throw error when mutating frozen object', () => {
    const obj = {
      a: 1,
      b: {
        c: 2,
      },
    };

    const frozenObj = objectDeepFreeze(obj);

    // Attempt to mutate frozenObj
    expect(() => {
      (frozenObj as any).a = 10;
    }).toThrow();

    // Attempt to mutate nested property
    expect(() => {
      (frozenObj as any).b.c = 20;
    }).toThrow();
  });

  it('should handle arrays and nested arrays', () => {
    const obj = {
      a: [1, 2, 3],
      b: [{ c: 4 }, [5, 6, 7]],
    };

    const frozenObj = objectDeepFreeze(obj);

    // Check if arrays and nested arrays are frozen
    expect(Object.isFrozen(frozenObj.a)).toBe(true);
    expect(Object.isFrozen(frozenObj.b)).toBe(true);
    expect(Object.isFrozen(frozenObj.b[0])).toBe(true);
    expect(Object.isFrozen(frozenObj.b[1])).toBe(true);
  });

  it('should handle arrays', () => {
    const obj = [{ key: 4 }, { key: 1 }, { key: 2 }];
    const frozenObj = objectDeepFreeze(obj);
    expect(Object.isFrozen(frozenObj.at(0))).toBe(true);
  });
});
