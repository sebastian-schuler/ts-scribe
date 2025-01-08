/**
 * Flatten an object to a single level object with dot notation keys.
 * @param obj - Object to flatten
 * @param prefix - Prefix for the keys (optional)
 * @returns Flattened object
 */
export const flattenObject = <T>(obj: Record<string, any>, prefix = ''): Record<string, T> => {
  return Object.keys(obj).reduce(
    (acc, key) => {
      const value = obj[key];

      // Only append the dot if the prefix is not empty and does not already end with a dot
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (typeof item === 'object' && item !== null) {
            Object.assign(acc, flattenObject(item, `${newKey}.${index}`));
          } else {
            acc[`${newKey}.${index}`] = item;
          }
        });
      } else if (value && typeof value === 'object') {
        Object.assign(acc, flattenObject(value, newKey));
      } else {
        acc[newKey] = value;
      }

      return acc;
    },
    {} as Record<string, T>,
  );
};
