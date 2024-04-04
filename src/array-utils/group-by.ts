/**
 * Type for a function that returns a key from an object.
 */
export type GroupByKeyFn<T> = (item: T) => string | number;

/**
 * Groups an array of objects by a key.
 * @param array - The array of objects to group
 * @param keyFunc - The function that returns the key to group by
 * @returns An object with the keys as the group by key and the values as the grouped objects
 */
export function groupBy<T>(array: T[], keyFunc: GroupByKeyFn<T>): Record<string | number, T[]> {
  return array.reduce((result: Record<string | number, T[]>, currentValue: T) => {
    const key = keyFunc(currentValue);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(currentValue);
    return result;
  }, {});
}
