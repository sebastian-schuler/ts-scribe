import { DeepReadonly } from '../types/common-types.js';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Deeply freeze an object
 * @param obj
 * @returns
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
