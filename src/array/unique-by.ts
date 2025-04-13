type KeyExtractor<T, K> = (item: T) => K;

/**
 * Returns a new array with only the unique elements based on a key extracted from each element.
 * 
 * The function uses the provided key extractor function to determine uniqueness of each element.
 * If an element's key has been encountered before, it will be excluded from the result.
 * 
 * @param {T[]} array - The array to filter for unique elements.
 * @param {KeyExtractor<T, K>} keyFunc - A function that extracts the key from each element to determine uniqueness.
 * @returns {T[]} A new array with only the unique elements based on the key.
 * 
 * @example
 * const arr = [
 *   { id: 1, name: 'Alice' },
 *   { id: 2, name: 'Bob' },
 *   { id: 1, name: 'Alice' }
 * ];
 * 
 * const uniqueArr = arrUniqueBy(arr, item => item.id);
 * console.log(uniqueArr); 
 * // Output: [
 * //   { id: 1, name: 'Alice' },
 * //   { id: 2, name: 'Bob' }
 * // ]
 */
export function arrUniqueBy<T, K>(array: T[], keyFunc: KeyExtractor<T, K>): T[] {
  const uniqueKeys = new Set();
  return array.filter((item) => {
    const key = keyFunc(item);
    if (!uniqueKeys.has(key)) {
      uniqueKeys.add(key);
      return true;
    }
    return false;
  });
}
