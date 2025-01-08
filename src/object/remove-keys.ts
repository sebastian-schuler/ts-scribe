export function removeKeys<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  // Create a shallow copy of the object to avoid mutating the original object
  const newObj = { ...obj };

  // Loop through the provided keys and delete them from the new object
  for (const key of keys) {
    delete newObj[key];
  }

  return newObj;
}
