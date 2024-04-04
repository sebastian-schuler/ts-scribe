// /**
//  * Type for a function that returns a key from an object.
//  */
// export type UniqueByKeyFn<T> = (item: T) => string;

// /**
//  * Groups an array of objects by a key.
//  * @param array - The array of objects to group
//  * @param keyFunc - The function that returns the key to group by
//  * @returns An object with the keys as the group by key and the values as the grouped objects
//  */
// export function uniqueBy<T>(array: T[], keyFunc: UniqueByKeyFn<T>): T[] {
//   const arrayUniqueByKey = [...new Map(array.map((item) => [item[keyFunc(item)], item])).values()];
//   return arrayUniqueByKey;
// }

export type KeyExtractor<T> = (item: T) => any;

export function uniqueBy<T>(array: T[], keyFunc: KeyExtractor<T>): T[] {
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
