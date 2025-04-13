type KeyExtractor<T, K> = (item: T) => K;

/**
 * Returns an array of unique values from an array of objects based on a key.
 * @param array - The array of objects to filter
 * @param keyFunc - The function that returns the key to filter by
 * @returns An array of unique objects based on the key
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
