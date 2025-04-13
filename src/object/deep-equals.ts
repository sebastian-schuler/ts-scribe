import { Nestable } from '../types/common-types.js';

type Reference = {
  [key: string]: Nestable;
};

/**
 * Deeply compares two nestable objects to determine if they are equal.
 * @param obj1 - The first object to compare.
 * @param obj2 - The second object to compare.
 * @param valueRefs - An array of references to the first object.
 * @param otherRefs - An array of references to the second object.
 * @returns `true` if the objects are equal, `false` otherwise.
 */
function deepEqualsRecursive(obj1: Nestable, obj2: Nestable, valueRefs?: Reference[], otherRefs?: Reference[]) {
  if (
    obj1 === null ||
    obj2 === null ||
    typeof obj1 !== 'object' ||
    typeof obj2 !== 'object' ||
    obj1 === undefined ||
    obj2 === undefined
  ) {
    return obj1 === obj2;
  }

  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) {
      return false;
    }

    for (let i = 0; i < obj1.length; i++) {
      if (!deepEqualsRecursive(obj1[i], obj2[i])) {
        return false;
      }
    }

    return true;
  } else if (Array.isArray(obj1) || Array.isArray(obj2)) {
    return false;
  }

  valueRefs = valueRefs || [];
  otherRefs = otherRefs || [];

  // Get the value type
  const type = Object.prototype.toString.call(obj1);

  // If the two objects are not the same type, return false
  if (type !== Object.prototype.toString.call(obj2)) return false;

  // If items are not an object, return false
  if ('[object Object]' !== type) return false;

  // We know that the items are objects, so let's check if we've seen this reference before.
  // If so, it's a circular reference so we know that the branches match. If both circular references
  // are in the same index of the list then they are equal.
  const valueRefIndex = valueRefs.indexOf(obj1);
  const otherRefIndex = otherRefs.indexOf(obj2);
  if (valueRefIndex == otherRefIndex && valueRefIndex >= 0) return true;
  // Add the references into the list
  valueRefs.push(obj1);
  otherRefs.push(obj2);

  // Compare the length of the length of the two items
  const valueLen = Object.keys(obj1).length;
  const otherLen = Object.keys(obj2).length;
  if (valueLen !== otherLen) return false;

  // Compare properties
  for (const key in obj1) {
    if (Object.prototype.hasOwnProperty.call(obj1, key)) {
      if (deepEqualsRecursive(obj1[key], obj2[key], valueRefs.slice(), otherRefs.slice()) === false) return false;
    }
  }

  // If nothing failed, return true
  return true;
}

/**
 * Deeply compares two nestable objects to determine if they are equal.
 * @param obj1 - The first object to compare.
 * @param obj2 - The second object to compare.
 * @returns `true` if the objects are equal, `false` otherwise.
 */
export function objectDeepEquals(obj1: Nestable, obj2: Nestable) {
  return deepEqualsRecursive(obj1, obj2);
}
