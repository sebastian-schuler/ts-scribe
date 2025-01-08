/**
 * Remove all undefined values from an object recursively. Arrays are also cleaned.
 * @param obj - Object to clean
 * @returns Cleaned object
 */
export const pruneObject = <T extends object>(obj: T): T => {
  // Iterate if object is an array
  if (Array.isArray(obj)) {
    return obj.map((value) => pruneObject(value)).filter((value) => value !== undefined) as T;
  }

  // Keep property if not an object
  if (typeof obj !== 'object' || obj === null || obj instanceof Date) {
    return obj;
  }

  // Recursively clean object
  const result = {} as T;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = pruneObject(obj[key]!);
      if (value !== undefined) {
        result[key] = value;
      }
    }
  }

  return result;
};
