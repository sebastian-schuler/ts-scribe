/* eslint-disable @typescript-eslint/no-explicit-any */
import { DeepReadonly } from '../types/common-types.js';

/**
 * Recursively freezes an object and its properties, making them immutable.
 * This function ensures that not only the object itself is frozen, but all nested objects and arrays are also frozen.
 * It also makes sure that any changes to the object's properties will result in an error (in strict mode).
 *
 * @param {T} obj - The object to deeply freeze.
 * @returns {DeepReadonly<T>} A deep-frozen version of the object, where all properties are recursively frozen.
 *
 * @template T - The type of the object to be frozen.
 *
 * @example
 * const obj = { a: { b: { c: 1 } } };
 * const frozenObj = objectDeepFreeze(obj);
 *
 * frozenObj.a.b.c = 2; // Error in strict mode: Cannot assign to read only property 'c'
 *
 * // Even nested properties are frozen
 * frozenObj.a = { b: { c: 3 } }; // Error in strict mode: Cannot assign to read only property 'a'
 */
export function objectDeepFreeze<T>(obj: T): DeepReadonly<T> {
  // Retrieve the property names defined on obj
  const propNames = Object.getOwnPropertyNames(obj);

  // Freeze properties before freezing self
  for (const propName of propNames) {
    const prop = (obj as any)[propName];

    // Freeze prop if it's an object
    if (typeof prop === 'object' && prop !== null) {
      objectDeepFreeze(prop);
    }
  }

  // Freeze self
  return Object.freeze(obj);
}
