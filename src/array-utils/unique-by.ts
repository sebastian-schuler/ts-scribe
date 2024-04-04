export type KeyExtractor<T, K> = (item: T) => K;

export function uniqueBy<T, K>(array: T[], keyFunc: KeyExtractor<T, K>): T[] {
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
